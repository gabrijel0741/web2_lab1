const db = require('../db')

module.exports = class Ticket {
    constructor(ticket_id, user_sub, round_id, numbers, user_oib, created_at) {
        this.ticket_id = ticket_id
        this.user_sub = user_sub
        this.round_id = round_id
        this.numbers = numbers
        this.user_oib = user_oib
        this.created_at = created_at
    }

    async createTicket(user_sub, round_id, numbers, user_oib) {
        try {
            let ticket_id = await dbNewTicket(user_sub, round_id, numbers, user_oib)
            this.ticket_id = ticket_id
            return this
        } catch(err) {
            console.log("ERROR creating ticket: " + JSON.stringify(this))
            throw err
        }
    }

    static async fetchTicketById(ticket_id) {
        let results = await dbGetTicketById(ticket_id)
        if (!results) {
            return "No ticket found with the given ID."
        }
        return results
    }

}

dbGetTicketById = async (ticket_id) => {
    const sql = `SELECT * FROM tickets WHERE ticket_id = ` + ticket_id;
    try {
        const result = await db.query(sql, []);
        return result.rows;
    } catch (err) {
        console.log(err);
        throw err
    }
}

dbNewTicket = async (user_sub, round_id, numbers, user_oib) => {
    const sql = `INSERT INTO tickets (user_sub, round_id, numbers, user_oib)
        VALUES ($1, $2, $3, $4) RETURNING ticket_id`;
    const values = [user_sub, round_id, numbers, user_oib];
    try {
        const result = await db.query(sql, values);
        return result.rows[0].ticket_id;
    } catch (err) {
        console.log(err);
        throw err
    }
}
