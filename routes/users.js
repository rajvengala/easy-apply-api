var express = require('express');
var router = express.Router();

/* GET user profile - /api/users/<user_id> */
router.get('/:user_id', (req, res, next) => {
  var db = req.app.locals.db;
  db.collection('users', {strict: true}, (err1, usersCollection) => {
    if (usersCollection) {
      usersCollection.find({_id: req.params.user_id}).toArray().then(user => {
        res.send(user);
      }).catch(err2 => {
        err2.status = 500;
        next(err2);
      })
    } else {
      err1.status = 500;
      next(err1);
    }
  });
});

/* PATCH user profile - /api/users/<user_id> */
router.patch('/:user_id', (req, res, next) => {
  var db = req.app.locals.db;
  db.collection('users', {strict: true}, (err1, usersCollection) => {
    if (usersCollection) {
      usersCollection.updateOne({_id: req.params.user_id}, {
        $set: {
          'profile.phone': (req.body.phone) ? req.body.phone : '',
          'profile.city': (req.body.city) ? req.body.city : ''
        }
      }).then(result => {
        res.send({message: 'User profile is updated'});
      }).catch(err2 => {
        err2.status = 500;
        next(err2)
      });

    } else {
      err1.status = 500;
      next(err1);
    }
  });
});

/* GET user's application data - /api/users/<user_id>/app_data */
router.get('/:user_id/app_data', (req, res, next) => {
  var db = req.app.locals.db;
  db.collection('users', {strict: true}, (err1, usersCollection) => {
    if (usersCollection) {
      usersCollection.find({_id: req.params.user_id}).toArray().then(user => {
        if (user.application_data) {
          res.send(user.application_data);
        } else {
          res.send({});
        }
      }).catch(err2 => {
        err2.status = 500;
        next(err2);
      })
    } else {
      err1.status = 500;
      next(err1);
    }
  });
});

/* Create user's application data - /api/users/<user_id>/app_data */
router.post('/:user_id/app_data', (req, res, next) => {
  var db = req.app.locals.db;
  db.collection('users', {strict: true}, (err1, usersCollection) => {
    if (usersCollection) {
      usersCollection.updateOne({_id: req.params.user_id}, {
        $set: {
          'app_data': req.body,
        }
      }).then(result => {
        res.send({message: 'User application data is created'});
      }).catch(err2 => {
        err2.status = 500;
        next(err2)
      });
    } else {
      err1.status = 500;
      next(err1);
    }
  });
});

/* Update user's application data - /api/users/<user_id>/app_data */
router.patch('/:user_id/app_data', (req, res, next) => {
  var db = req.app.locals.db;
  db.collection('users', {strict: true}, (err1, usersCollection) => {
    if (usersCollection) {
      usersCollection.updateOne({_id: req.params.user_id}, {
        $set: req.body
      }).then(result => {
        res.send({message: 'User application data is updated'});
      }).catch(err2 => {
        err2.status = 500;
        next(err2)
      });
    } else {
      err1.status = 500;
      next(err1);
    }
  });
});

module.exports = router;
