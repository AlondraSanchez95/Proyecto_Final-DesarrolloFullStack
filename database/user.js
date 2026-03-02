const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nombre:{
        type : String, 
        required: [true,'El nombre es obligatorio']
    },
    apellido:{
        type: String,
        required: [true,'El apellido es obligatorio']
    },
    username:{
        type: String,
        required: [true,'El nombre de usuario es obligatorio']
    },
    email:{
        type: String,
        required: [true,'El Email es obligatorio'],
        unique: true,
        lowercase: true
    },
    password:{
        type: String,
        required: [true,'La contraseña es obligatoria']
    },
    role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, {timestamps:true});

module.exports = mongoose.model('User', UserSchema);