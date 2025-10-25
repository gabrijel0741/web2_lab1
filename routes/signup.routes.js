const express = require('express');
const router = express.Router();
const User = require('../models/UserModel')


router.get('/', function (req, res, next) {
    res.render('signup', {
        title: 'Register a new user',
        user: req.session.user,
        err: undefined
    });
});

router.post('/', function (req, res, next) {

    (async () => {
        if (req.body.password1 !== req.body.password2) {
            res.render('Signup', {
                title: 'Register a new user',
                user: req.session.user,
                err: "Passwords do not match"
            });
            return;
        }

        let user = await User.fetchByUsername(req.body.username);

        if (user.id !== undefined) {
            res.render('Signup', {
                title: 'Register a new user',
                user: req.session.user,
                err: "Username already exists"
            });
            return;
        } 
        let encrPass = await User.hashPassword(req.body.password1);
        user = new User(req.body.username, req.body.firstName, req.body.lastName, encrPass);
        await user.persist();

        req.session.user = user
        res.redirect('/')
    })()

});

module.exports = router;