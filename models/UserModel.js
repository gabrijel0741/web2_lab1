const db = require('../db')
const bcrypt = require('bcrypt')

module.exports = class User {
    constructor(username, first_name, last_name, password) {
        this.user_id = undefined
        this.user_name = username
        this.first_name = first_name
        this.last_name = last_name
        this.password = password
    }

    static async fetchByUsername(username) {
        let results = await dbGetUserByName(username)
        let newUser = new User()

        if( results.length > 0 ) {
            newUser = new User(results[0].user_name, results[0].first_name,
                results[0].last_name, results[0].password)
            newUser.user_id = results[0].user_id
        }
        return newUser
    }

    static async fetchByUserId(user_id) {

        let results = await dbGetUserById(user_id)
        let newUser = new User()

        if( results.length > 0 ) {
            newUser = new User(results[0].user_name, results[0].first_name,
                results[0].last_name, results[0].email, results[0].password)
            newUser.user_id = results[0].user_id
        }
        return newUser
    }

    //je li korisnik pohranjen u bazu podataka?
    isPersisted() {
        return this.user_id !== undefined
    }

    async checkPassword(password) {
        if (!this.password) {
            return false;
        }
        try {
            const match = await bcrypt.compare(password, this.password);
            if (match || this.password == password) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            console.error('Error comparing password:', err);
            throw err;
        }
    }

    async persist() {
        try {
            let userID = await dbNewUser(this)
            this.user_id = userID
        } catch(err) {
            console.log("ERROR persisting user data: " + JSON.stringify(this))
            throw err
        }
    }

    static async hashPassword(password) {
        const saltRounds = 10;
        try {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            return hashedPassword;
        } catch (err) {
            console.error('Error hashing password:', err);
            throw err;
        }
    }

}

dbGetUserByName = async (user_name) => {
    const sql = `SELECT user_id, user_name, first_name, last_name, password
    FROM users WHERE user_name = '` + user_name + `'`;
    try {
        const result = await db.query(sql, []);
        return result.rows;
    } catch (err) {
        console.log(err);
        throw err
    }
};

dbGetUserById = async (user_id) => {
    const sql = `SELECT user_id, user_name, first_name, last_name, password
    FROM users WHERE user_id = ` + user_id;
    try {
        const result = await db.query(sql, []);
        return result.rows;
    } catch (err) {
        console.log(err);
        throw err
    }
}

dbNewUser = async (user) => {
    const sql = "INSERT INTO users (user_name, first_name, last_name, password) VALUES ('" +
        user.user_name + "', '" + user.first_name + "', '" + user.last_name + "', '" + 
        user.password + "') RETURNING user_id";
    try {
        const result = await db.query(sql, []);
        return result.rows[0].user_id;
    } catch (err) {
        console.log(err);
        throw err
    }
}
