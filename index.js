const express = require('express');
const app = express();
const cors = require('cors');
const multer = require('multer');
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.set('trust proxy', 1);
app.use(cors());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'))
app.use('/api/users', require('./routers/userRouter'));
app.use('/api/products', require('./routers/productsRouter'));
app.use('/api/category', require('./routers/categoryRouter'));
app.use((err, req, res, next) => {
    console.error('Log de errores: ', err.message);
    let status = err.status || 500;
    if(err.name === 'JsonWebTokenError'){
        status = 401;
        message = 'Token Invalido'
    };
    if(err.name === 'TokenExpiredError'){
        status = 401;
        message = 'El token esta expirado'
    };
    if(err instanceof multer.MulterError){
        return res.status(400).json({ message: err.message });
    };
    if(err.message === 'Solo se permiten imágenes'){
        return res.status(400).json({ message: err.message });
    }
    res.status(status).json({
        message: err.message,
        codigo: status
    });
});

module.exports = app;



