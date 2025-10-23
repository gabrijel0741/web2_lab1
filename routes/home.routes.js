const express = require('express');
const router = express.Router();
const Quiz = require('../models/QuizModel');

router.get('/', async function (req, res, next) {
    let leaderboard = await Quiz.fetchLeaderboard();
    res.render('home', {
        title: 'Home',
        user: req.session.user,
        leaderboard: leaderboard
    });
});

module.exports = router;