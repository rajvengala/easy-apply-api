var express = require('express');
var router = express.Router();
var util = require('util');
var GoogleAuth = require('google-auth-library');

/* Validate user's token post google sign-in */
router.post('/', (req, res, next) => {
  var CLIENT_ID = '944056354118-53uhhn2tnmmoaj2cj2830qmsreua2jvc.apps.googleusercontent.com';
  var auth = new GoogleAuth;
  var client = new auth.OAuth2(CLIENT_ID, '', '');
  client.verifyIdToken(req.body.idtoken, CLIENT_ID, (err, login) => {
      if (login) {
        var payload = login.getPayload();
        var user_id = payload.sub;
        var email = payload.email;
        var name = payload.name;
        var userProfile = {
          _id: user_id,
          profile: {
            city: "",
            name: name,
            country: "India",
            email: email,
            phone: ""
          }
        };

        var db = req.app.locals.db;
        db.collection('users').find({_id: user_id}).toArray().then(users => {
          if (users.length === 0) {
            db.collection('users').insertOne(userProfile).then(result => {
              if (result.insertedCount === 1) {
                res.send('User created');
              } else {
                next('Error creating user');
              }
            }).catch(err1 => {
              next(util.format('Error creating user - %s', err1));
            });
          } else {
            res.send('User is validated');
          }

        }).catch(err2 => {
          next(util.format('Error searching collection - %s', err2));
        });
      } else {
        next(err);
      }
    }
  );
});

module.exports = router;
