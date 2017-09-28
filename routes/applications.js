var express = require('express');
var router = express.Router();
var util = require('util');
var ObjectId = require('mongodb').ObjectID;
var request = require('request');

/**
 *  Submit school application
 *  POST /api/applications
 *
 * */
router.post('/', (req, res, next) => {
  var db = req.app.locals.db;
  // adding status field to req body
  req.body.status = 'submitted';
  var userEmail = '', userName = '', userPhone = '';

  db.collection('schools', {strict: true}, (err, schoolsCollection) => {
    // 1. Validate if school_id exists
    if (schoolsCollection) {
      // check of school_id is of right length to prevent nodejs crash
      if (req.body.school_id.length !== 24) {
        var err = new Error('Invalid school');
        err.status = 400;
        next(err);
        return;
      }
      var schoolId = new ObjectId(req.body.school_id);
      schoolsCollection.find({_id: schoolId}).toArray().then(schools => {
        if (schools.length !== 1) {
          var err = new Error('Invalid school');
          err.status = 400;
          next(err);
          return;
        } else {
          // 2. Validate if user_id exists
          var usersCollection = db.collection('users');
          if (usersCollection) {
            return usersCollection.find({_id: req.body.user_id}).toArray();
          } else {
            var err = new Error('Failed to fetch USERS collection');
            err.status = 500;
            next(err);
          }
        }
      }).then(users => {
        if (users) {
          if (users.length !== 1) {
            var err = new Error('Invalid user');
            err.status = 500;
            next(err);
          } else {
            userEmail = users[0].profile.email;
            userName = users[0].profile.name;
            userPhone = users[0].profile.phone;
            var applicationCollection = db.collection('applications');
            if (applicationCollection) {
              // replace school_id with Object of school_id passed to the API
              req.body.school_id = new ObjectId(req.body.school_id);

              // Find all applicants submitted by the logon user for this school
              return applicationCollection.find({user_id: req.body.user_id, school_id: req.body.school_id}).toArray();

            } else {
              var err = new Error('Failed to fetch APPLICATIONS collection');
              err.status = 500;
              next(err);
            }
          }
        }
      }).then(applications => {
        if (applications) {
          // Validate if application already exists for the applicant:
          // If hash of school_id, admission_year, applicant, grade
          // exists for user_id, application is already submitted
          for (var application of applications) {
            var applicationSig = util.format('%s-%s-%s-%s', application.school_id,
              application.admission_year,
              application.grade,
              application.applicant);

            var newApplicationSig = util.format('%s-%s-%s-%s', req.body.school_id,
              req.body.admission_year,
              req.body.grade,
              req.body.applicant);

            if (applicationSig === newApplicationSig) {
              var err = new Error('Application already submitted');
              err.status = 400;
              next(err);
              return;
            }
          }
          return db.collection('applications').insertOne(req.body);
        }
      }).then(result => {
        // All validation on request data done - submit the application
        if (result) {
          if (result.insertedCount === 1) {
            // redirect to payment gateway
            createPaymentRequest(res, result.insertedId, req.body.amount, userPhone, userName, userEmail);
          } else {
            var err = new Error('Unable to submit application');
            err.status = 500;
            next(err);
          }
        }
      }).catch(err => {
        err.status = 500;
        next(err);
      });
    } else {
      err.status = 500;
      next(err);
    }
  });
});

// Create Payment Request
function createPaymentRequest(res, transactionId, amount, phone, userName, userEmail) {
  var headers = {
    'X-Api-Key': app.local.paymentApiToken,
    'X-Auth-Token': app.local.paymentAuthToken
  };
  var payload = {
    purpose: transactionId + '',
    amount: amount,
    phone: (phone.length === 0) ? 9999999999 : phone,
    buyer_name: userName,
    redirect_url: 'http://localhost:3000/api/payment/',
    send_email: false,
    webhook: 'http://easyapply.online/api/payment/',
    send_sms: false,
    email: userEmail,
    allow_repeated_payments: false
  };
  request.post('https://www.instamojo.com/api/1.1/payment-requests/', {
    form: payload,
    headers: headers
  }, function (error, response, body) {
    if (!error && response.statusCode == 201) {
      res.redirect(JSON.parse(body).payment_request.longurl);
      return;
    } else {
      res.send(body);
      return;
    }
  });
}

module.exports = router;

