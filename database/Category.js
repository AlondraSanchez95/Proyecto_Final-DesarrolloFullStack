const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    nombre:{
        type: String,
        required: [true, 'El nombre es obligatorio'],
        unique: true
    },
    imagenUrl: {
        type: String
    },
    imagenId: {
        type: String
    }
}, {timestamps:true});

module.exports = mongoose.model('Category', CategorySchema);