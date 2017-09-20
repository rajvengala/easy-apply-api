var express = require('express');
var path = require('path');
var util = require('util');
var fs = require('fs')
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// var config = require('./config/local');
var config = require('./config/dev');

/* Setup Mongodb connection */
var dbName = config.dbName;
var MongoClient = require('mongodb').MongoClient;
var dbConnStr = config.dbConnStr;
MongoClient.connect(dbConnStr, function (err, db) {
  if (db) {
    console.info('Connected to Mongodb instance %s ', dbConnStr);

    app.locals.db = db.db(dbName);
    console.info('Switched database to %s', dbName);
  } else {
    throw err;
  }
});

/* Import Routes */
var validateRoute = require('./routes/validate');
var usersRoute = require('./routes/users');
var citiesRoute = require('./routes/cities');
var schoolsRoute = require('./routes/schools');
var applicationsRoute = require('./routes/applications');
var apiContext = 'api';

/* Configure Middleware */
var app = express();

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});
app.use(morgan('combined', {stream: accessLogStream}))

app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static('public'));

app.use(util.format('/%s/validate', apiContext), validateRoute);
app.use(util.format('/%s/users', apiContext), usersRoute);
app.use(util.format('/%s/cities', apiContext), citiesRoute);
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
  res.status(err.status || 500).send({
    message: err.message,
    details: (err.stack) ? err.stack : 'N/A'
  });
});

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Server running at http://127.0.0.1:' + port + '/');
});

module.exports = app;
