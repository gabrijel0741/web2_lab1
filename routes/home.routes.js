const express = require('express');
const router = express.Router();

router.get('/', async function (req, res, next) {
    res.render('home', {
        title: 'Web2 Lab1',
        user: req.oidc.user || null,
        qr: null,
        err: null
    });
});


module.exports = router;