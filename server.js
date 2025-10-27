const express = require('express');
const app = express();
const path = require('path');
const pg = require('pg')
const db = require('./db')
const session = require('express-session')
const pgSession = require('connect-pg-simple')(session)
const { auth: authOIDC } = require('express-openid-connect');
const { auth: jwtCheck } = require('express-oauth2-jwt-bearer');

const homeRouter = require('./routes/home.routes');
const storeResultRoute = require('./routes/store_result.routes');
const ticketRoute = require('./routes/ticket_result.routes');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

//
const oidcConfig = {
  authRequired: false, 
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
};

app.use(authOIDC(oidcConfig));

app.use((req, res, next) => {
  res.locals.user = req.oidc && req.oidc.user;
  next();
});

const checkJwt = jwtCheck({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
});

app.post('/new-round', checkJwt, async (req, res) => {
  try {
    const { rows } = await db.pool.query(
      'SELECT * FROM rounds WHERE active = TRUE'
    );
    //Vec postoji aktivno kolo
    if (rows.length > 0) {
      return res.status(204).send();
    }

    await db.pool.query(
      'INSERT INTO rounds (active, created_at) VALUES (TRUE, NOW())'
    );
    return res.status(204).send();

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.post('/close', checkJwt, async (req, res) => {
  try {
      const { rows } = await db.pool.query(
          'SELECT * FROM rounds WHERE active = TRUE'
        );
        
    //Nema aktivnog kola
    if (rows.length === 0) {
      return res.status(204).send();
    }

    const numbers = new Set();
    while (numbers.size < 6) {
        const num = Math.floor(Math.random() * 45) + 1;
        numbers.add(num);
    }
    sorted_numbers = Array.from(numbers).sort((a, b) => a - b);

    await db.pool.query(
      'UPDATE rounds SET active = FALSE, closed_at = NOW(), winning_numbers = $1 WHERE active = TRUE', [sorted_numbers]
    );
    return res.status(204).send();

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Error handler za JWT
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }
  next(err);
});
//


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
app.use('/store-result', storeResultRoute);
app.use('/ticket', ticketRoute);

app.get('/auth-test', (req, res) => {
  if (req.oidc.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: req.oidc.user
    });
  } else {
    res.json({
      authenticated: false,
      message: 'User is not logged in'
    });
  }
});

app.listen(3000);

