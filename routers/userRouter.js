const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');
const rateLimit = require('express-rate-limit');

const loginLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: 'Demasiados intentos de inicio de sesión'
});

//Publicas
router.post('/register', userController.createUser);
router.post('/login', loginLimit, userController.login);

//Privadas
router.get('/Users', auth, role(['admin']), userController.getAllUsers);
router.put('/updateUser/:id', auth, role(['admin']), userController.updateUser);
router.delete('/deleteUser/:id', auth, role(['admin']), userController.deleteUser);

module.exports = router;
