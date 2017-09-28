var express = require('express');
var router = express.Router();
var request = require('request');
var util = require('util');

/*
 * Fetch payment details
 * This is a redirect URL initiated by payment gateway after
 * failure/success of the payment
 * GET /api/payment?payment_id=<xxx>&payment_request_id=<yyy>
 *
 * */
router.get('/', (req, res, next) => {
  var db = req.app.locals.db;
  var paymentId = req.query.payment_id;
  var paymentReqId = req.query.payment_request_id;

  if (!paymentId || !paymentReqId) {
    var err = new Error('Invalid callback from payment gateway');
    err.status = 500;
    next(err);
  } else {
    var headers = {
      'X-Api-Key': app.local.paymentApiToken,
      'X-Auth-Token': app.local.paymentAuthToken
    };
    request.get(util.format('https://www.instamojo.com/api/1.1/payments/%s', paymentId),
      {
        headers: headers
      },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body);
        } else {
          console.log(error)
          var err = new Error('Unable to fetch payment details');
          err.status = 500;
          next(err);
        }
      });
  }
});

/*
 * Called by payment gateway based on various events
 * POST /api/payment/
 *
 * */
router.post('/', (req, res, next) => {

});

module.exports = router;
