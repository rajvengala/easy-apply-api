var express = require('express');
var path = require('path');
var util = require('util');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

/* Setup Mongodb connection */
var dbName = 'demo';
var MongoClient = require('mongodb').MongoClient;
var dbUri = "mongodb://localhost:27017";
MongoClient.connect(dbUri, function (err, db) {
    if (db) {
        console.info('Connected to Mongodb instance %s ', dbUri);
        app.locals.db = db.db(dbName);
        console.info('Switched database to %s', dbName);
    } else {
        console.error(err);
    }
});

/* Import Routes */
var validateRoute = require('./routes/validate');
var usersRoute = require('./routes/users');
var schoolsRoute = require('./routes/schools');
var applicationsRoute = require('./routes/applications');
var apiContext = 'api';

/* Configure Middleware */
var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));
app.use(util.format('/%s/validate', apiContext), validateRoute);
app.use(util.format('/%s/users', apiContext), usersRoute);
app.use(util.format('/%s/schools', apiContext), schoolsRoute);
app.use(util.format('/%s/applications', apiContext), applicationsRoute);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send('error');
});

app.listen(3000, function () {
    console.log('Easy Apply application listening on port 3000 ...')
});

module.exports = app;
