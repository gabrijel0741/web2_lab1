const express = require('express');
const router = express.Router();
const Ticket = require('../models/TicketModel')
const Round = require('../models/RoundModel');
const QRCode = require('qrcode');


router.get('/', async function (req, res, next) {
    res.render('home', {
        title: 'Web2 Lab1',
        user: req.oidc.user || null,
        qr: null,
        err: null
    });
});

router.post('/store-results', async function (req, res, next) {
    let numbers_split = req.body.numbers.split(',');

    let numbers = numbers_split.map(number => parseInt(number.trim()));
    //Provjere brojeva
    if (numbers.length < 6 || numbers.length > 10) {
        res.render('home', {
            title: 'Web2 Lab1',
            user: req.oidc.user || null,
            qr: null,
            err: "Numbers count must be between 6 and 10."
        });
    }
    if (!numbers.every(n => n >= 1 && n <= 45)) {
        res.render('home', {
            title: 'Web2 Lab1',
            user: req.oidc.user || null,
            qr: null,
            err: "Numbers must be between 1 and 45."
        });
    }

    const nums_set = new Set(numbers);
    if (nums_set.size !== numbers.length) {
        res.render('home', {
            title: 'Web2 Lab1',
            user: req.oidc.user || null,
            qr: null,
            err: "All numbers must be unique."
        });
    }

    // prvo provjeri postoji li aktivno kolo
    let activeRound = await Round.fetchActiveRound()
    if(activeRound === "No active round found."){
        res.render('home', {
            title: 'Web2 Lab1',
            user: req.oidc.user || null,
            qr: null,
            err: "No active round found."
        });
    }

    let user = req.oidc.user
    let user_oib = req.body.user_oib
    let ticket = new Ticket()

    // ako postoji, spremi tiket i vrati status 204 
    // Ako se metoda pozove dok su uplate aktivne ili li ako su za trenutno kolo već izvučeni brojevi, vrati status 409 
    let ticket_created = await ticket.createTicket(user.sub, activeRound.round_id, numbers, user_oib)

    const qrUrl = `https://web2-lab1-jd16.onrender.com/ticket/${ticket_created.ticket_id}`

    QRCode.toDataURL(qrUrl, function (err, generated_url) {
        if (err) {
            res.render('home', {
                title: 'Web2 Lab1',
                user: req.oidc.user || null,
                qr: null,
                err: "ERROR generating QR code for ticket: " + ticket_created.ticket_id
            });
        }
        else {
            res.render('home', {
                title: 'Web2 Lab1',
                user: req.oidc.user || null,
                qr: generated_url,
                err: null
            });
        }
    });    
        
});

module.exports = router;