var express = require('express');
var router = express.Router();

/* GET user profile - /api/users/<user_id> */
router.get('/:user_id', (req, res, next) => {
  var db = req.app.locals.db;
  db.collection('users', {strict: true}, (err, usersCollection) => {
    if (usersCollection) {
      usersCollection.find({_id: req.params.user_id}).toArray().then(user => {
        res.send(user);
      }).catch(err => {
        err.status = 500;
        next(err);
      })
    } else {
      err.status = 500;
      next(err);
    }
  });
});

/* PATCH user profile - /api/users/<user_id> */
router.patch('/:user_id', (req, res, next) => {
  var db = req.app.locals.db;
  db.collection('users', {strict: true}, (err, usersCollection) => {
    if (usersCollection) {
      usersCollection.updateOne({_id: req.params.user_id}, {
        $set: {
          'profile.phone': (req.body.phone) ? req.body.phone : '',
          'profile.city': (req.body.city) ? req.body.city : ''
        }
      }).then(result => {
        res.send({message: 'User profile is updated'});
      }).catch(err => {
        err.status = 500;
        next(err)
      });
    } else {
      err.status = 500;
      next(err);
    }
  });
});

/* GET user's application data - /api/users/<user_id>/app_data */
router.get('/:user_id/app_data', (req, res, next) => {
  var db = req.app.locals.db;
  db.collection('users', {strict: true}, (err, usersCollection) => {
    if (usersCollection) {
      usersCollection.find({_id: req.params.user_id}).toArray().then(user => {
        if (user.application_data) {
          res.send(user.application_data);
        } else {
          res.send({});
        }
      }).catch(err => {
        err.status = 500;
        next(err);
      })
    } else {
      err.status = 500;
      next(err);
    }
  });
});

/* Create user's application data - /api/users/<user_id>/app_data */
router.post('/:user_id/app_data', (req, res, next) => {
  var db = req.app.locals.db;
  db.collection('users', {strict: true}, (err, usersCollection) => {
    if (usersCollection) {
      usersCollection.updateOne({_id: req.params.user_id}, {
        $set: {
          'app_data': req.body,
        }
      }).then(result => {
        res.send({message: 'User application data is created'});
      }).catch(err => {
        err.status = 500;
        next(err)
      });
    } else {
      err.status = 500;
      next(err);
    }
  });
});

/* Update user's application data - /api/users/<user_id>/app_data */
router.patch('/:user_id/app_data', (req, res, next) => {
  var db = req.app.locals.db;
  db.collection('users', {strict: true}, (err, usersCollection) => {
    if (usersCollection) {
      usersCollection.updateOne({_id: req.params.user_id}, {
        $set: req.body
      }).then(result => {
        res.send({message: 'User application data is updated'});
      }).catch(err => {
        err.status = 500;
        next(err)
      });
    } else {
      err.status = 500;
      next(err);
    }
  });
});

module.exports = router;
