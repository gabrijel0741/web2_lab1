const {Pool} = require('pg');

const pool = new Pool({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOSTNAME,
    database: 'web2labos1',
    password: process.env.DB_PASSWORD,
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

const sql_create_sessions = `CREATE TABLE IF NOT EXISTS session (
    sid varchar NOT NULL COLLATE "default",
    sess json NOT NULL,
    expire timestamp(6) NOT NULL
  )
  WITH (OIDS=FALSE);`

const sql_create_session_index1 = `ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE`
const sql_create_session_index2 = `CREATE INDEX IDX_session_expire ON session(expire)`

const sql_create_rounds = `CREATE TABLE IF NOT EXISTS rounds (
    id SERIAL PRIMARY KEY,
    active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMP,
    winning_numbers INT[] NOT NULL
)`;

const sql_create_tickets = `CREATE TABLE IF NOT EXISTS tickets (
    ticket_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_sub TEXT NOT NULL,
    round_id INT NOT NULL REFERENCES rounds(id),
    numbers INT[] NOT NULL,
    user_oib VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
)`;

let table_names = [
    "session",
    "rounds"
]

let tables = [
    sql_create_sessions,
    sql_create_rounds,
    sql_create_tickets
];

let table_data = [
    undefined
]

let indexes = [
  sql_create_session_index1,
  sql_create_session_index2
]

if ((tables.length !== table_data.length) || (tables.length !== table_names.length)) {
    console.log("tables, names and data arrays length mismatch.")
    
}

(async () => {
    await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
    console.log("Creating and populating tables");
    for (let i = 0; i < tables.length; i++) {
        console.log("Creating table " + table_names[i] + ".");
        try {
            await pool.query(tables[i], [])
            console.log("Table " + table_names[i] + " created.");
            if (table_data[i] !== undefined) {
                try {
                    await pool.query(table_data[i], [])
                    console.log("Table " + table_names[i] + " populated with data.");
                } catch (err) {
                    console.log("Error populating table " + table_names[i] + " with data.")
                    return console.log(err.message);
                }
            }
        } catch (err) {
            console.log("Error creating table " + table_names[i])
            return console.log(err.message);
        }
    }

    console.log("Creating indexes");
    for (let i = 0; i < indexes.length; i++) {
        try {
            await pool.query(indexes[i], [])
            console.log("Index " + i + " created.")
        } catch (err) {
            console.log("Error creating index " + i + ".")
        }
    }

    await pool.end();
})()