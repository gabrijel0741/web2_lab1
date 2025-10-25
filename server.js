const express = require('express');
const app = express();
const path = require('path');
const pg = require('pg')
const db = require('./db')
const session = require('express-session')
const pgSession = require('connect-pg-simple')(session)

const homeRouter = require('./routes/home.routes');
const loginRoute = require('./routes/login.routes');
const logoutRoute = require('./routes/logout.routes');
const signupRoute = require('./routes/signup.routes');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

//pohrana sjednica u postgres bazu korštenjem connect-pg-simple modula
app.use(session({
    store: new pgSession({
        pool: db.pool,
    }),
    secret: "weblab2-zadatak1-secret",
    resave: false,
    saveUninitialized: true
}))

app.use('/', homeRouter);
app.use('/login', loginRoute);
app.use('/logout', logoutRoute);
app.use('/signup', signupRoute);

app.listen(3000);

