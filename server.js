
require('dotenv').config();

const app = require('./app');
const connectDB = require('./Config/db');

const PORT = 3000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Scroll API is running on port ${PORT}`);
    });
};

startServer();
