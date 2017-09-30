var express = require('express');
var router = express.Router();
var request = require('request');
var util = require('util');
var ObjectId = require('mongodb').ObjectID;

/*
 * Fetch payment details
 * This is a redirect URL initiated by payment gateway after
 * failure/success of the payment
 * GET /api/payment?payment_id=<xxx>&payment_request_id=<yyy>
 *
 * */
router.get('/', (req, res, next) => {
  // var db = req.app.locals.db;
  var paymentId = req.query.payment_id;
  var paymentReqId = req.query.payment_request_id;

  if (!paymentId || !paymentReqId) {
    var err = new Error('Invalid callback from payment gateway');
    err.status = 500;
    next(err);
  } else {
    var headers = {
      'X-Api-Key': req.app.locals.paymentApiToken,
      'X-Auth-Token': req.app.locals.paymentAuthToken
    };
    processPaymentResponse(headers, paymentReqId, paymentId, req, res, next);
  }
});

function processPaymentResponse(headers, paymentReqId, paymentId, req, res, next) {
  getPaymentRequestPurpose(headers, paymentReqId, paymentId, req, res, next);
}

// 1. get purpose from payment request details (use paymentReqId)
function getPaymentRequestPurpose(headers, paymentReqId, paymentId, req, res, next) {
  request.get(util.format('%s/payment-requests/%s/', req.app.locals.paymentGatewayUrl, paymentReqId),
    {
      headers: headers
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        // 2. get application id using purpose as ID from DB
        var applicationId = JSON.parse(body).payment_request.purpose;
        getPaymentStatus(headers, paymentId, req, res, next, applicationId);
      } else {
        var err = new Error(JSON.parse(body).message);
        err.status = response.statusCode;
        next(err);
        return;
      }
    });
}

// 3. get payment status from payment details (use paymentId)
function getPaymentStatus(headers, paymentId, req, res, next, applicationId) {
  request.get(util.format('%s/payments/%s', req.app.locals.paymentGatewayUrl, paymentId),
    {
      headers: headers
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        // 4. update application status in the database
        var appPaymentStatus = JSON.parse(body).payment.status.toLowerCase();
        updateApplicationStatus(req, res, applicationId, appPaymentStatus);
      } else {
        var err = new Error('Unable to fetch payment details');
        err.status = '500';
        next(err);
        return;
      }
    });
}

function updateApplicationStatus(req, res, applicationId, paymentStatus) {
  var db = req.app.locals.db;
  var objectApplicationId = new ObjectId(applicationId);
  db.collection('applications').updateOne(
    {_id: objectApplicationId}, {$set: {status: paymentStatus}}).then(result => {
    if (result.matchedCount === 0) {
      res.send('Payment status not updated');
    } else {
      res.send('Payment status updated');
    }
    return;
  }).catch(err => {
    err.status = '500';
    next(err);
    return;
  });
}

/*
 * Called by payment gateway based on various events
 * POST /api/payment/
 *
 * */
router.post('/', (req, res, next) => {
  var applicationId = req.body.purpose;
  var paymentStatus = req.body.status;
  console.log(applicationId, paymentStatus);
  updateApplicationStatus(req, res, applicationId, paymentStatus);
});

module.exports = router;
