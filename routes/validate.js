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
      db.collection('users', {strict: true}, (err1, usersCollection) => {
        if (usersCollection) {
          usersCollection.find({_id: user_id}).toArray().then(users => {
            if (users.length === 0) {
              return db.collection('users').insertOne(userProfile);
            } else {
              res.send({message: 'User profile is validated'});
            }
          }).then(result => {
            if (result) { // only if promise is returned from above block
              if (result.insertedCount === 1) {
                res.send({message: 'Created new user profile'});
              } else {
                var err2 = new Error('Failed to create user');
                err2.status = 500;
                next(err2);
              }
            }
          }).catch(err3 => {
            err3.status = 500;
            next(err3);
          });
        } else {
          err1.status = 500;
          next(err1);
        }
      });
    }
  });
});

module.exports = router;
