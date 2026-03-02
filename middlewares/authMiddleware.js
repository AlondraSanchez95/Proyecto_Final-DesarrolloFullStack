const jwt = require('jsonwebtoken');

const auth = (req,res,next) => {
    const authHeader = req.header('Authorization');
    if(!authHeader ||!authHeader.startsWith('Bearer ')){
        return res.status(401).json({message: 'Acceso Denegado. No tienes un token valido'});
    }
    const token = authHeader.split(' ')[1];
    try{
        const cifrado = jwt.verify(token, process.env.JWT_SECRET);
        req.user = cifrado;
        next();
    } catch(error){
        res.status(401).json({message: 'Token invalido o expirado'})
    }
};

module.exports = auth;