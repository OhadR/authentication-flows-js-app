var express = require('express');
var path = require('path');
var session = require('express-session');
const port = 3000;
const app = module.exports = express();
const debug = require('debug')('main');

// module variables
const result = require('dotenv').config();

const bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//to serve static content:
//app.use(express.static('login'));


var xxx = require('authentication-flows-js');
const authFlowsInmem = require('authentication-flows-js-inmem');
const inmemRepo = new authFlowsInmem.AuthenticationAccountInmemRepository();

// config

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// middleware

app.use(express.urlencoded({ extended: false }))
app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: 'shhhh, very secret'
}));

// Session-persisted message middleware

app.use(function(req, res, next){
    var err = req.session.error;
    var msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
    if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
    next();
});

//note: 'app' is AFTER all settings (body-parser and express-session:
xxx.config({
    user_app: app,
    authenticationAccountRepository: inmemRepo,
});


function restrict(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/login');
    }
}

app.get('/', function(req, res){
    res.redirect('/login');
});

app.get('/restricted', restrict, function(req, res){
    res.send('Wahoo! restricted area, click to <a href="/logout">logout</a>');
});


app.get('/ohads', (req, res) => {
    const requestBody = req.body;
    debug(`ohads `);

    res
        .status(200)
        .append('ohads','is the man')
        .render('createAccountPage', { "err_msg": null });
});

/**
 * for automated tests:
 */
app.get('/link/:username', (req, res) => {
    debug(`get link for username: ${req.params.username}`);
    const link = inmemRepo.getLink(req.params.username);
    debug(`link for username: ${req.params.username} is: ${link}`);
    res
        .send({'link': link});
});

/* istanbul ignore next */
if (!module.parent) {
    app.listen(port);
    debug(`Express started on port ${port}`);
}
