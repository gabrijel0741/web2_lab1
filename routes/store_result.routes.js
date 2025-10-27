const express = require('express');
const router = express.Router();
const Ticket = require('../models/TicketModel')
const Round = require('../models/RoundModel');
const QRCode = require('qrcode');
const { body } = require('express-validator');

router.post('/', async function (req, res, next) {
    let nums = req.body.numbers;
    let user_oib = req.body.oib;
    console.log("request: " + JSON.stringify(req.body));
    if (!nums || !user_oib) {
        return res.json({err: "Please fill in all fields.", qr: null, body: req.body});
    }
    console.log("Primio numbers i user_oib");
    let numbers_split = nums.split(',');
    
    let numbers = numbers_split.map(number => parseInt(number.trim()));
    console.log("Podijelio numbers: " + JSON.stringify(numbers));
    //Provjere brojeva
    if (numbers.length < 6 || numbers.length > 10) {
        return {err: "Numbers count must be between 6 and 10.", qr: null};
    }
    console.log("Provjerio kolicinu brojeva");
    if (!numbers.every(n => n >= 1 && n <= 45)) {
        return {err: "Numbers must be between 1 and 45.", qr: null};
    }
    console.log("Provjerio range brojeva");
    const nums_set = new Set(numbers);
    if (nums_set.size !== numbers.length) {
        return {err: "All numbers must be unique.", qr: null};
    }
    
    console.log("Zapocinjem fetch aktivne runde");
    // prvo provjeri postoji li aktivno kolo
    let activeRound = await Round.fetchActiveRound()
    if(activeRound.length === 0){
        return {err: "No active round found.", qr: null};
    }
    console.log("Aktivno kolo: " + JSON.stringify(activeRound));
    let user = req.oidc.user
    let ticket = new Ticket()

    // ako postoji, spremi tiket i vrati status 204 
    // Ako se metoda pozove dok su uplate aktivne ili li ako su za trenutno kolo već izvučeni brojevi, vrati status 409 
    let ticket_created = await ticket.createTicket(user.sub, activeRound[0].id, numbers, user_oib)
    console.log("Ticket created: " + JSON.stringify(ticket_created));
    const qrUrl = "https://web2-lab1-jd16.onrender.com/ticket/" + ticket_created.ticket_id

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