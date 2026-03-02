const { text } = require('express');
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    nombre:{
        type: String,
        required: [true,'El nombre es obligatorio'],
        unique: true
    },
    precio:{
        type: Number,
        required: [true,'El precio es obligatorio']
    },
    descripcion:{
        type: String,
        required: [true, 'La descripcion es obligatoria']
    },
    categoria:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true,'La categoria es obligatoria']
    },
    stock: {
        type: Number,
        required: [true,'El stock es obligatorio'],
        default: 0
    },
    imagenUrl: { type: String },
    cloudinaryId: {type: String}
}, {timestamps:true});

module.exports = mongoose.model('Product', ProductSchema);