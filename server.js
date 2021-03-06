// Requires
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const localStorage = require('passport-local');
const app = express();
const db = require('./models');
const env = require('dotenv');
const flash = require('connect-flash');
     

// Routes Requires
const drinkRoutes = require('./routes/drinks-routes.js');
const commentsRoutes = require('./routes/comments-routes');

// Config Variables
const publicPath = path.join(__dirname, '/public');
const port = process.env.PORT || 3000;

// Express Configuration
app.use(express.static(publicPath));
// Body Parser Configuration
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(flash());

// EJS Config
app.set("view engine", "ejs");

// ===== Passport ======

app.use(session({
    secret: process.env.SECRET_KEY || "yolo swag",
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: new Date(Date.now() + 3600000)
    }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// ===== TEST ROUTES ======
app.get("/", (req, res) => {
    res.render('landing');
});

// ===== ROUTES ======

// ===== Auth ======
require('./routes/auth-routes.js')(app, passport);
// Load Passport Strategies
require('./config/passport/passport.js')(passport, db.users);



// ===== Drinks ======
app.use("/drinks", drinkRoutes);

// ======= Comments =======
app.use('/drinks/:id/comments', commentsRoutes);


// ===== APIs ======
require('./routes/api-routes.js')(app);


app.get('*', function (req, res) {
    res.status(404).render('notfound');
});

// Server Listen Setup
db.sequelize.sync({}).then(() => {
    app.listen(port, () => {
        console.log("Server listening on port: " + port);
    });
})