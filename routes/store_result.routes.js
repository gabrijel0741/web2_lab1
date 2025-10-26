const express = require('express');
const router = express.Router();
const Ticket = require('../models/TicketModel')
const Round = require('../models/RoundModel');
const QRCode = require('qrcode');

router.post('/', async function (req, res, next) {
    const {nums, user_oib} = req.body;
    if (!nums || !user_oib) {
        return res.status(400).json({ err: 'Numbers and OIB are required' });
    }

    let numbers_split = nums.split(',');

    let numbers = numbers_split.map(number => parseInt(number.trim()));
    //Provjere brojeva
    if (numbers.length < 6 || numbers.length > 10) {
        return {err: "Numbers count must be between 6 and 10.", qr: null};
    }
    if (!numbers.every(n => n >= 1 && n <= 45)) {
        return {err: "Numbers must be between 1 and 45.", qr: null};
    }

    const nums_set = new Set(numbers);
    if (nums_set.size !== numbers.length) {
        return {err: "All numbers must be unique.", qr: null};
    }

    // prvo provjeri postoji li aktivno kolo
    let activeRound = await Round.fetchActiveRound()
    if(activeRound === "No active round found."){
        return {err: "No active round found.", qr: null};
    }

    let user = req.oidc.user
    let ticket = new Ticket()

    // ako postoji, spremi tiket i vrati status 204 
    // Ako se metoda pozove dok su uplate aktivne ili li ako su za trenutno kolo već izvučeni brojevi, vrati status 409 
    let ticket_created = await ticket.createTicket(user.sub, activeRound.round_id, numbers, user_oib)

    const qrUrl = `https://web2-lab1-jd16.onrender.com/ticket/${ticket_created.ticket_id}`

    QRCode.toDataURL(qrUrl, function (err, generated_url) {
        if (err) {
            return {err: "ERROR generating QR code", qr: null};
        }
        else {
            return {err: null, qr: generated_url};
        }
    });    
        
});

module.exports = router;