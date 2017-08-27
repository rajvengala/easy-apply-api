var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    var db = req.app.locals.db;
    db.collection('users', function (err, usersCollection) {
        if (usersCollection) {
            usersCollection.find({}, function (err, cursor) {
                if (cursor) {
                    cursor.toArray(function (err, docs) {
                        res.send(docs);
                    });
                } else {
                    console.log('Error searching collection - %s', err);
                }
            });
        } else {
            console.log('Error getting collection - %s', err);
        }
    });

});

module.exports = router;
