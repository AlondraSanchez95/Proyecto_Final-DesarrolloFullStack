require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT || 3000;
const app = require('./index');
const mongoose = require('mongoose');
const mongo_uri = process.env.MONGO_URI;
const dns = require('node:dns/promises');
dns.setServers(['1.1.1.1','8.8.8.8']);
const connectDB = async () => {
    try{
        await mongoose.connect(mongo_uri);
        console.log('Conexión a MongoDB exitosa');
    } catch(error){
        console.error('Error al conectar a MongoDB', error.message);
        process.exit(1);
    }
};
if (process.env.NODE_ENV !== 'test') {
    connectDB();
    app.listen(PORT, () => {
        console.log(`Servidor activo en http://localhost:${PORT}`);
    });
}