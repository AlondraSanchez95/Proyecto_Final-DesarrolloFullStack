const express = require('express');
const router = express.Router();
const productsController = require('../controllers/ProductsController');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/multer');

//Publico
router.get('/viewProducts', productsController.getAllProducts);

//Privado
router.post('/createProduct', auth, role(['admin']), upload.single('imagen'), productsController.createProduct);
router.put('/updateProduct/:id', auth, role(['admin']), upload.single('imagen'), productsController.updateProduct);
router.delete('/deleteProduct/:id', auth, role(['admin']), productsController.deleteProduct);

module.exports = router;