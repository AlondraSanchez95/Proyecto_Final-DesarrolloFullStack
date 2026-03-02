const Category = require('../database/Category');
const Product = require('../database/product');
const cloudinary = require('cloudinary').v2;

exports.getAllCategory = async (req,res, next) => {
    try{
        const categorys = await Category.find();
        res.status(200).json(categorys);
    } catch(error){
        console.error(error);
        next(error);
    }
};

exports.createCategory = async (req,res,next) => {
    try{
        const {nombre} = req.body;
        const imagenID = req.file ? req.file.filename : 'default.avif'
        const imagenURL = req.file ? req.file.path : 'https://res.cloudinary.com/dawgtatxl/image/upload/v1772235626/default_a4kcs2.avif';
        const nuevaCategoria = new Category({nombre, imagenUrl: imagenURL, imagenId: imagenID});
        await nuevaCategoria.save();
        res.status(201).json({message: 'Nueva Categoria Creada con exito', nuevaCategoria});
    } catch(error){
        if(error.code == 11000){
            return res.status(400).json({message: 'Esa Categoria ya existe'});
        }
        next(error);
        console.error(error);
    }
};

exports.deleteCategory = async (req,res,next) => {
    try{
        const {id} = req.params;
        const conteoProductos = await Product.countDocuments({categoria : id});
        if (conteoProductos > 0) {
            return res.status(400).json({message: 'No se puede borrar esta categoria, ya que cuenta con Productos asociados a ella'});
        }
        const categoryDelete = await Category.findByIdAndDelete(id);
        if(!categoryDelete){
            return res.status(404).json({message: 'Categoria no Encontrada'});
        }
        if(categoryDelete.imagenUrl && categoryDelete.cloudinaryId){
            await cloudinary.uploader.destroy(categoryDelete.cloudinaryId);
        }
        res.status(200).json({message: 'Categoria Eliminada'});
    } catch (error){
        next(error);
        console.error(error);
    }
};

exports.updateCategory = async (req,res,next) => {
    try{
        const{id} = req.params;
        const datosaActualizar = req.body;
        if (req.file) {
            datosaActualizar.imagenUrl = req.file.path;
            datosaActualizar.cloudinaryId = req.file.filename;
        }
        const categoriaActualizada = await Category.findByIdAndUpdate(id, datosaActualizar, {new:true});
        if(!categoriaActualizada){
            return res.status(404).json({message: 'Esta categoria no existe'});
        }
        res.status(200).json({message: 'Categoria Actualizada con exito'});
    } catch (error) {
        if(error.code == 11000){
            return res.status(400).json({message: 'Esa Categoria ya existe, intenta con otro nombre'});
        }
        next(error);
        console.error(error);
    }
}
