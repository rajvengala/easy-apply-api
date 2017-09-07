var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectID;

/*
 * Fetch a school's details in a locality of a city
 * GET /api/schools/school_id
 *
 * */
router.get('/:school_id', (req, res, next) => {
  var db = req.app.locals.db;
  db.collection('schools', {strict: true}, (err, schoolsCollection) => {
    if (schoolsCollection) {
      var objId = new ObjectId(req.params.school_id);
      schoolsCollection.find({_id: objId}).toArray().then(school => {
        res.send(school);
      }).catch(err => {
        err.status = 500;
        next(err);
      });
    } else {
      err.status = 500;
      next(err);
    }
  });
});


/*
 * Fetch all applications received by a school
 * GET /schools/school_id/applications
 *
 * */
router.get('/:school_id/applications', (req, res, next) => {
  var db = req.app.locals.db;
  db.collection('applications', {strict: true}, (err, applicationsCollection) => {
    if (applicationsCollection) {
      var objId = new ObjectId(req.params.school_id);
      applicationsCollection.find({school_id: objId}).toArray().then(school => {
        res.send(school);
      }).catch(err => {
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
