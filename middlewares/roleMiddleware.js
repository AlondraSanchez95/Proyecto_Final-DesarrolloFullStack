const checkRole = (roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            return res.status(403).json({message: 'No cuentas con permiso de Administrador'});
        }
        next();
    };
};

module.exports = checkRole;