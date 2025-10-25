const express = require('express');
const router = express.Router();
const User = require('../models/UserModel')


router.get('/', function (req, res, next) {
    res.render('login', {
        title: 'Login',
        user: req.session.user,
        err: undefined
    })

});

router.post('/', async function (req, res, next) {
    let user=undefined
    user = await User.fetchByUsername(req.body.user)
    let errormsg = 'Incorrect password'
    
    if(user && await user.checkPassword(req.body.password)){
            req.session.user = user
            res.redirect('/')
    }
    else{
        if(user.user_id === undefined){
            errormsg = 'Incorrect username or password'
        }
        res.render('login', {
            title: 'Login',
            user: req.session.user,
            err: errormsg
        })
    }
});


module.exports = router;