const multer = require('multer');
const path = require('path');
const fs = require('fs');

const MAX_SIZE = process.env.MAX_UPLOAD_SIZE_BYTES || 20971520; // 20MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// Create uploads and tmp directory if they don't exist
const uploadsDir = path.join(__dirname, '../../uploads');
const tmpDir = path.join(uploadsDir, 'tmp');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tmpDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: MAX_SIZE },
    fileFilter: fileFilter
});

module.exports = upload;
