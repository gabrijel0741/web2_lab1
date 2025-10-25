const express = require('express');
const router = express.Router();

router.get('/', async function (req, res, next) {
    res.render('home', {
        title: 'Home',
        user: req.session.user
    });
});

module.exports = router;