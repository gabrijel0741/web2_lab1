const express = require('express');
const router = express.Router();
const Round = require('../models/RoundModel');
const Ticket = require('../models/TicketModel');

router.get('/', async function (req, res, next) {
    console.log({"AAAAAAAAAAAAAAAAAAAAAAAAAA": req.query})
    let ticket = new Ticket()
    ticket_res = await ticket.fetchTicketById(req.query.ticket_id);
    if(ticket_res.length === 0){
        return res.render('ticket', {
            title: 'Ticket Details',
            ticket: null,
            round: "No ticket found with the given ID.",
            nums: null
        });
    }

    let activeRound = await Round.fetchRoundById(ticket_res[0].round_id);
    if(activeRound.length === 0){
        res.render('ticket', {
            title: 'Ticket Details',
            ticket: ticket_res[0],
            round: "Unable to fetch round details.",
            nums: null
        });
    }
    else{
        if(activeRound[0].active){
            res.render('ticket', {
                title: 'Ticket Details',
                ticket: ticket_res[0],
                round: "Winning numbers for this ticket's round have not been drawn yet.",
                nums: null
            });
        }
        else{
            if(!activeRound[0].winning_numbers){
                res.render('ticket', {
                    title: 'Ticket Details',
                    ticket: ticket_res[0],
                    round: "Winning numbers for this ticket's round are not available.",
                    nums: null
                });
            }
            else{
                res.render('ticket', {
                    title: 'Ticket Details',
                    ticket: ticket_res[0],
                    round: "Winning numbers for this ticket's round are: " + activeRound[0].winning_numbers,
                    nums: null
                });
            }
        }
    }

});

module.exports = router;