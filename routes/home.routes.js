const express = require('express');
const router = express.Router();

router.get('/', async function (req, res, next) {
    res.render('home', {
        title: req.query.title || 'Web2 Lab1',
        user: req.oidc.user || null,
        qr: req.query.qr || null,
        err: req.query.err || null
    });
});


module.exports = router;