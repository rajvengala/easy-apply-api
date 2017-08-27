var express = require('express');
var GoogleAuth = require('google-auth-library');
var router = express.Router();
var CLIENT_ID = '944056354118-53uhhn2tnmmoaj2cj2830qmsreua2jvc.apps.googleusercontent.com';

var auth = new GoogleAuth;
var client = new auth.OAuth2(CLIENT_ID, '', '');
router.post('/', function (req, res, next) {
    client.verifyIdToken(
        req.body.idtoken,
        CLIENT_ID,
        function (err, login) {
            if (login) {
                var payload = login.getPayload();
                var userid = payload['sub'];
                res.send(payload);
            } else {
                res.send('invalid user');
            }

        });
});

module.exports = router;
