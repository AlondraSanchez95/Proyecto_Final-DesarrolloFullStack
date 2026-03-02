const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs : 15 * 60 * 1000,
    max: 100,
    message: 'Demasiadas peticiones de esta IP',
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/', apiLimiter);