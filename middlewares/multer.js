const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();
const {CloudinaryStorage} = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'ProyectoFinal',
    params: {
        folder: 'ProyectoFinal',
        allowedFormats: ['jpg', 'png', 'jpeg'],
        public_id: (req,file) =>{
            const extension = path .extname(file.originalname).toLowerCase();
            const filename = path.basename(file.originalname, extension);
            return `${filename}-${Date.now()}`;
        }
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes'), false);
    }
};

const upload = multer({ storage, fileFilter , limits: { fileSize: 10 * 1024 * 1024 }});

module.exports = upload;