var express = require('express');
var path = require('path');
var session = require('express-session');
const port = 3000;
const app = module.exports = express();
const debug = require('debug')('main');

const bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//to serve static content:
//app.use(express.static('login'));


var xxx = require('authentication-flows-js');
const authFlowsInmem = require('authentication-flows-js-inmem');
const inmemRepo = new authFlowsInmem.AuthenticationAccountInmemRepository();
const linksInmemRepo = new authFlowsInmem.LinksInmemRepository();

xxx.config({
    user_app: app,
    authenticationAccountRepository: inmemRepo,
    linksRepository: linksInmemRepo
});


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


async function authenticate(name, pass) {
    debug(`authenticating ${name}...`);

    const hashedPass = xxx.shaString(pass);

    var user = await inmemRepo.loadUserByUsername(name);//AuthenticationUser
    // query the db for the given username
    if (!user)
        throw new Error('cannot find user');

    if(!user.isEnabled())
        throw new Error('account is not active');


    //validate the credentials:
    if(hashedPass !== user.getPassword()) {
        //wrong password: TODO call setLoginFailureForUser
        await xxx.onAuthenticationFailure(user.getUsername());
    }

    //success
    return user;
}

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

app.get('/logout', function(req, res){
    // destroy the user's session to log them out
    // will be re-created next request
    req.session.destroy(function(){
        res.redirect('/');
    });
});

app.get('/login', function(req, res){
    res.render('login');
});

app.post('/login', async function(req, res){
    let user;
    try {
        user = await authenticate(req.body.username, req.body.password);
    }
    catch(e) {
        debug(`authentication failed for ${req.body.username}`);
        req.session.error = 'Authentication failed, please check your '
            + ' username and password.';
        res.redirect(401, '/login');
        return;
    }

    debug(user);

    // Regenerate session when signing in
    // to prevent fixation
    req.session.regenerate(function() {
        // Store the user's primary key
        // in the session store to be retrieved,
        // or in this case the entire user object
        req.session.user = user;
        req.session.success = 'Authenticated as ' + user.email
            + ' click to <a href="/logout">logout</a>. '
            + ' You may now access <a href="/restricted">/restricted</a>.';
        res.redirect('back');
    });
});

app.get('/ohads', (req, res) => {
    const requestBody = req.body;
    debug(`ohads `);

    res
        .status(200)
        .append('ohads','is the man')
        .render('createAccountPage', { "err_msg": null });

});

app.get('/link/:username', (req, res) => {
    debug(`get link for username: ${req.params.username}`);
    const link = linksInmemRepo.getLink(req.params.username);
    debug(`link for username: ${req.params.username} is: ${link}`);
    res
        .send({'link': link});
});

/* istanbul ignore next */
if (!module.parent) {
    app.listen(port);
    debug(`Express started on port ${port}`);
}
