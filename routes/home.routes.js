const express = require('express');
const router = express.Router();

router.get('/', async function (req, res, next) {
    if (!req.oidc.isAuthenticated()) {
        res.redirect("/login");
    }
    res.render('home', {
        title: req.oidc.isAuthenticated(),
        user: req.oidc.user
    });
});

module.exports = router;