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
const loginRoute = require('./routes/login.routes');
const logoutRoute = require('./routes/logout.routes');
const signupRoute = require('./routes/signup.routes');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//
const oidcConfig = {
  authRequired: false, 
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
  //audience: process.env.AUTH0_AUDIENCE
};

app.use(authOIDC(oidcConfig));

app.use((req, res, next) => {
  res.locals.user = req.oidc && req.oidc.user;
  next();
});

const checkJwt = jwtCheck({
  audience: process.env.AUTH0_AUDIENCE,
  secret: process.env.AUTH0_SECRET,
  tokenSigningAlg: 'RS256',
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
});
app.use('/new-round', checkJwt);
app.use('/close', checkJwt);
//
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

