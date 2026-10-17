
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDirectory = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const uniqueName =
            `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
            path.extname(file.originalname).toLowerCase();

        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'video/mp4',
        'video/webm',
        'video/quicktime'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        return cb(null, true);
    }

    cb(new Error('Only supported image and video files are allowed.'));
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024,
        files: 5
    }
});

const profilePictureUpload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) return cb(null, true);
        cb(new Error('Profile photos must be JPG, PNG, WEBP, or GIF images.'));
    },
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }
});

module.exports = upload;
module.exports.profilePicture = profilePictureUpload;

