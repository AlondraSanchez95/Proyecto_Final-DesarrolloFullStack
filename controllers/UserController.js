const User = require('../database/user');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.getAllUsers = async (req,res,next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pagina = parseInt(page);
        const limite = parseInt(limit);
        const saltar = (pagina - 1) * limite;
        const [users, total] = await Promise.all([
            User.find()
                .select('-password')
                .skip(saltar)
                .limit(limite)
                .sort({ createdAt: -1 }),
            User.countDocuments()
        ]);
        const totalPaginas = Math.ceil(total / limite);
        res.status(200).json({
            info: {
                totalUsuarios: total,
                paginasTotales: totalPaginas,
                paginaActual: pagina,
                siguiente: pagina < totalPaginas ? pagina + 1 : null,
                anterior: pagina > 1 ? pagina - 1 : null
            },
            results: users
        });
    }catch(error){
        next(error);
        console.error(error);
    }
};

exports.createUser = async (req,res,next) => {
    console.log("1. Entrando a createUser");
    try{
        const {nombre, apellido, username, email, password, role} = req.body;
        const userExistente = await User.findOne({
            $or : [{email}, {username}]
        });
        if(userExistente){
            return res.status(400).json({message: 'Este correo ya esta registrado'});
        }
        const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
        const salt = await bcryptjs.genSalt(saltRounds);
        const passwordHashteado = await bcryptjs.hash(password, salt);
        const nuevoUser = new User({
            nombre,
            apellido,
            username,
            email,
            password : passwordHashteado,
            role: role || 'user'
        });
        await nuevoUser.save();
        res.status(201).json({message: 'Cuenta creada con exito'});
    } catch (error) {
        next(error);
        console.error(error); 
    }
};

exports.login = async (req,res,next) => {
    try{
        const {identifier,password} = req.body;
        const usuario = await User.findOne({
            $or:[
                {email: identifier},{username:identifier}
            ]
        });
        if(!usuario){
            return res.status(404).json({message: 'Este usuario/email no esta registrado'});
        }
        const passwordCorrecta = await bcryptjs.compare(password, usuario.password);
        if(!passwordCorrecta){
            return res.status(400).json({message: 'La contrasena es incorrecta, intenta otra vez'})
        }
        const Token = jwt.sign(
            {id: usuario._id, username: usuario.username,role: usuario.role},
            process.env.JWT_SECRET,
            {expiresIn : process.env.JWT_EXPIRES_IN}
        )
        res.status(200).json({
            message: 'Bienvenido',
            Token,
            usuario: {
                id: usuario._id,
                username: usuario.username,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                role: usuario.role
            }
        })
    } catch(error){
        next(error);
        console.error(error);
    }
};

exports.updateUser = async (req,res,next) => {
    try{
        const{id} = req.params;
        const{nombre, apellido, username, email,  role, password} = req.body;
        const datosaActualizar = {nombre,apellido,username,email, role};
        if(password){
            const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
            const salt = await bcryptjs.genSalt(saltRounds);
            datosaActualizar.password = await bcryptjs.hash(password, salt);
        }
        const userEditado = await User.findByIdAndUpdate(
            id, datosaActualizar, {new: true, runValidators: true}
        ).select('-password');
        if(!userEditado){
            return res.status(404).json({message: 'Usuario no encontrado'});
        }
        res.status(200).json({message: 'Perfil Actualizado', usuario: userEditado});
    } catch(error){
        if(error.code == 11000){
            return res.status(400).json({message: 'Ese email o username ya esta en uso'});
        }
        next(error);
        console.error(error);
    }
}

exports.deleteUser = async (req,res,next) => {
    try{
        const {id} = req.params;
        const userDelete = await User.findByIdAndDelete(id);
        if(!userDelete){
            return res.status(400).json({message: 'No se pudo borrar este perfil'});
        }
        res.status(200).json({message: 'Perfil Eliminado'});
    } catch(error){
        next(error);
        console.error(error);
    }
}

