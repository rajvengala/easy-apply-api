var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectID;

/**
 *  Submit school application
 *  POST /api/applications
 *
 * */
router.post('/', (req, res, next) => {
  var db = req.app.locals.db;
  // adding status field to req body
  req.body.status = 'submitted';

  db.collection('schools', {strict: true}, (err, schoolsCollection) => {
    // 1. Validate if school_id exists
    if (schoolsCollection) {
      // check of school_id is of right length to prevent nodejs crash
      if (req.body.school_id.length !== 24) {
        var err = new Error('Invalid school');
        err.status = 400;
        next(err);
        return;
      }
      var schoolId = new ObjectId(req.body.school_id);
      schoolsCollection.find({_id: schoolId}).toArray().then(schools => {
        if (schools.length !== 1) {
          var err = new Error('Invalid school');
          err.status = 500;
          throw err;
        } else {
          // 2. Validate if user_id exists
          var usersCollection = db.collection('users');
          if (usersCollection) {
            return usersCollection.find({_id: req.body.user_id}).toArray();
          } else {
            var err = new Error('Failed to fetch USERS collection');
            err.status = 500;
            throw err;
          }
        }
      }).then(users => {
        if (users) {
          if (users.length !== 1) {
            var err = new Error('Invalid user');
            err.status = 500;
            throw err;
          } else {
            // insert application
            var applicationCollection = db.collection('applications');
            if (applicationCollection) {
              // replace school_id with Object of school_id passed to the API
              req.body.school_id = new ObjectId(req.body.school_id);
              return applicationCollection.insertOne(req.body);
            } else {
              var err = new Error('Failed to fetch APPLICATIONS collection');
              err.status = 500;
              throw err;
            }
          }
        }
      }).then(result => {
        // All validation on request data done - submit the application
        if (result) {
          if (result.insertedCount === 1) {
            res.send({message: 'User application is submitted'});
          } else {
            var err = new Error('Unable to submit application');
            err.status = 500;
            throw err;
          }
        }
      }).catch(err => {
        if (err.message.indexOf('duplicate key error collection')) {
          err.message = 'Application already submitted';
        }
        err.status = 500;
        next(err);
      });
    } else {
      err.status = 500;
      next(err);
    }
  });
});

module.exports = router;

