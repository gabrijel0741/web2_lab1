const db = require('../db')

module.exports = class Round {
    constructor(id, active, created_at, closed_at, winning_numbers) {
        this.id = id
        this.active = active
        this.created_at = created_at
        this.closed_at = closed_at
        this.winning_numbers = winning_numbers
    }

    static async fetchRoundById(round_id) {
        let results = await dbGetRoundById(round_id)
        if (results.length === 0) {
            return "No round found with the given ID."
        }
        return results
    }

    static async fetchActiveRound() {
        let results = await dbGetActiveRound()
        if (!results) {
            return "No active round found."
        }
        return results
    }

}


dbGetRoundById = async (round_id) => {
    const sql = `SELECT * FROM rounds WHERE round_id = ` + round_id;
    try {
        const result = await db.query(sql, []);
        return result.rows;
    } catch (err) {
        console.log(err);
        throw err
    }
}

dbGetActiveRound = async () => {
    const sql = 'SELECT * FROM rounds WHERE active = TRUE';
    try {
        const result = await db.query(sql, []);
        return result.rows[0];
    } catch (err) {
        console.log(err);
        throw err
    }
}

