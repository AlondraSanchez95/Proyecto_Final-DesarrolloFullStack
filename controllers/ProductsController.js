const Product = require('../database/product');
const Category = require('../database/Category');
const cloudinary = require('cloudinary').v2;

exports.getAllProducts = async (req,res,next) => {
    try{
        const {categoria} = req.query;
        let filtro = {};
        if(categoria){
            filtro.categoria = categoria
        }
        const products = await Product.find(filtro).populate('categoria')
        res.status(200).json(products);
    } catch(error){
        next(error);
        console.error(error);
    }
};

exports.createProduct = async (req,res,next) => {
    try{
        const {nombre, precio, descripcion, categoria, stock} = req.body;
        const categoryExist = Category.findById(categoria);
        if(!categoryExist){
            return res.status(404).json({message: 'Esa categoria no existe. Creala o eliga otra diferente'});
        };
        const imagenID = req.file ? req.file.filename : 'default.avif'
        const imagenURL = req.file ? req.file.path : 'https://res.cloudinary.com/dawgtatxl/image/upload/v1772235626/default_a4kcs2.avif';
        const nuevoProducto = new Product({
            nombre,
            precio,
            descripcion,
            stock,
            categoria,
            imagenUrl: imagenURL,
            cloudinaryId: imagenID
        });
        await nuevoProducto.save();
        res.status(201).json({message: 'Producto creado con exito', nuevoProducto});
    } catch(error){
        next(error);
        console.error(error);   
    }
};

exports.deleteProduct = async (req, res, next) => {
    try{
        const {id} = req.params;
        const productDelete = await Product.findByIdAndDelete(id);

        if(!productDelete){
            return res.status(404).json({message: 'El productp no existe'});
        }
        if(productDelete.imagenUrl && productDelete.cloudinaryId){
            await cloudinary.uploader.destroy(productDelete.cloudinaryId);
        }
        res.status(200).json({message: 'Producto eliminado correctamente'});
    } catch(error){
        next(error);
        console.error(error);
    }
};

exports.updateProduct = async (req,res,next) => {
    try{
        const {id} = req.params;
        const datosaActualizar = req.body;
        if (req.file) {
            datosaActualizar.imagenUrl = req.file.path;
            datosaActualizar.cloudinaryId = req.file.filename;
        }
        const productoActualizado = await Product.findByIdAndUpdate(id, datosaActualizar, {new:true});
        if(!productoActualizado){
            return res.status(404).json({message: 'Ese producto no existe'});
        }
        res.status(200).json({message: 'Producto editado con exito', productoActualizado});
    } catch(error){
        next(error);
        console.error(error);
    }
}