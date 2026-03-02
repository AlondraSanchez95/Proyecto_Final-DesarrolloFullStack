const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/CategorysController');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/multer');

// Pública
router.get('/viewCategorys', categoryController.getAllCategory);

// Privadas (admin)
router.post('/createCategory', auth, role(['admin']), upload.single('imagen'),categoryController.createCategory);
router.put('/updateCategory/:id', auth, role(['admin']), upload.single('imagen'),categoryController.updateCategory);
router.delete('/deleteCategory/:id', auth, role(['admin']), categoryController.deleteCategory);

module.exports = router