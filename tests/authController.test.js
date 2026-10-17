const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const { loginUser, registerUser } = require('../Controllers/authController');

function mockResponse() {
    return {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
}

test('registration normalizes account fields and returns a usable session', async () => {
    const oldSecret = process.env.JWT_SECRET;
    const oldFindOne = User.findOne;
    const oldCreate = User.create;
    process.env.JWT_SECRET = 'test-auth-secret';
    let createdDocument;

    User.findOne = async () => null;
    User.create = async (document) => {
        createdDocument = document;
        return { ...document, _id: 'user-123' };
    };

    try {
        const res = mockResponse();
        await registerUser({
            body: {
                username: '  scrollfan  ',
                email: '  USER@Example.com ',
                password: 'secret1',
                age: 24
            }
        }, res);

        assert.equal(res.statusCode, 201);
        assert.equal(createdDocument.username, 'scrollfan');
        assert.equal(createdDocument.email, 'user@example.com');
        assert.equal(await bcrypt.compare('secret1', createdDocument.password), true);
        assert.equal(res.body.user.id, 'user-123');
        assert.equal(res.body.user.password, undefined);
        assert.equal(jwt.verify(res.body.token, process.env.JWT_SECRET).userId, 'user-123');
    } finally {
        User.findOne = oldFindOne;
        User.create = oldCreate;
        if (oldSecret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = oldSecret;
    }
});

test('registration refuses to create an account when JWT signing is not configured', async () => {
    const oldSecret = process.env.JWT_SECRET;
    const oldConsoleError = console.error;
    const oldFindOne = User.findOne;
    let databaseLookups = 0;
    process.env.JWT_SECRET = '';
    console.error = () => {};
    User.findOne = async () => { databaseLookups += 1; return null; };

    try {
        const res = mockResponse();
        await registerUser({
            body: {
                username: 'scrollfan',
                email: 'user@example.com',
                password: 'secret1',
                age: 24
            }
        }, res);

        assert.equal(res.statusCode, 500);
        assert.equal(databaseLookups, 0);
    } finally {
        User.findOne = oldFindOne;
        console.error = oldConsoleError;
        if (oldSecret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = oldSecret;
    }
});

test('login normalizes email and returns a valid session', async () => {
    const oldSecret = process.env.JWT_SECRET;
    const oldFindOne = User.findOne;
    process.env.JWT_SECRET = 'test-auth-secret';
    const user = {
        _id: 'user-456',
        username: 'scrollfan',
        email: 'user@example.com',
        age: 24,
        password: await bcrypt.hash('secret1', 4)
    };
    let lookup;
    User.findOne = async (query) => { lookup = query; return user; };

    try {
        const res = mockResponse();
        await loginUser({ body: { email: ' USER@Example.com ', password: 'secret1' } }, res);

        assert.equal(res.statusCode, 200);
        assert.deepEqual(lookup, { email: 'user@example.com' });
        assert.equal(jwt.verify(res.body.token, process.env.JWT_SECRET).userId, 'user-456');
        assert.equal(res.body.user.username, 'scrollfan');
    } finally {
        User.findOne = oldFindOne;
        if (oldSecret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = oldSecret;
    }
});
