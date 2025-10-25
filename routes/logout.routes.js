const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
    req.session.user = undefined

    req.session.destroy((err) => {
        if (err) console.log(err)
    })

    res.redirect('/')
});

module.exports = router;