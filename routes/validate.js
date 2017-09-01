var express = require('express');
var router = express.Router();
var util = require('util');
var GoogleAuth = require('google-auth-library');

/* Validate user's token post google sign-in */
router.post('/', (req, res, next) => {
  var CLIENT_ID = '944056354118-53uhhn2tnmmoaj2cj2830qmsreua2jvc.apps.googleusercontent.com';
  var auth = new GoogleAuth;
  var client = new auth.OAuth2(CLIENT_ID, '', '');
  client.verifyIdToken(req.body.idtoken, CLIENT_ID, (err, user) => {
      if (user) {
        var payload = user.getPayload();
        var user_id = payload.sub;
        var email = payload.email;
        var name = payload.name;
        var userProfile = {
          _id: user_id,
          profile: {
            city: "",
            "country": "India",
            email: email,
            phone: ""
          }
        };

        var db = req.app.locals.db;
        db.collection('users').find({_id: user_id}).toArray().then(docs => {
          if (docs.length === 0) {
            db.collection('users').insertOne(userProfile).then(row_count => {
              if (row_count === 1) {
                res.send({status: 'ok'});
              } else {
                res.status(500).send(util.format('Error searching collection - %s', err));
              }
            }).catch(err => {
              res.status(500).send(util.format('Error creating user - %s', err));
            });
          }
          res.send({status: "ok"}); // if user already exists
        }).catch(err => {
          res.status(500).send(util.format('Error searching collection - %s', err));
        });
      } else {
        res.status(500).send('Invalid login');
      }
    }
  );
});

module.exports = router;
