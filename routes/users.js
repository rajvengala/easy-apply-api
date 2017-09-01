var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
  var db = req.app.locals.db;
  db.collection('users', (err, usersCollection) => {
    if (usersCollection) {
      usersCollection.find({}).toArray().then(users => {
        res.send(users);
      }).catch(err => {
        res.status(500).send(util.format('Error searching collection - %s', err));
      })

    } else {
      res.status(500).send(util.format('Error getting collection - %s', err));
    }
  });
});

module.exports = router;
