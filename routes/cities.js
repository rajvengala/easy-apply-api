var express = require('express');
var util = require('util');
var router = express.Router();
var ObjectId = require('mongodb').ObjectID;

/* GET all cities - /api/cities */
router.get('/', (req, res, next) => {
  var db = req.app.locals.db;
  db.collection('schools', {strict: true}, (err, schoolsCollection) => {
    if (schoolsCollection) {
      schoolsCollection.distinct('city').then(cities => {
        res.send(cities);
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

/* GET all localities - /api/cities/<city_name>/localities */
router.get('/:city_name/localities', (req, res, next) => {
  var db = req.app.locals.db;
  db.collection('schools', {strict: true}, (err, schoolsCollection) => {
    if (schoolsCollection) {
      schoolsCollection.distinct('locality', {city: new RegExp(["^", req.params.city_name, "$"].join(''), 'i')}).then(localities => {
        res.send(localities);
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

/* GET all schools in a locality of a city - /api/cities/<city_name>/localities/<locality_name>/schools */
router.get('/:city_name/localities/:locality_name/schools', (req, res, next) => {
  var db = req.app.locals.db;
  db.collection('schools', {strict: true}, (err, schoolsCollection) => {
    if (schoolsCollection) {
      schoolsCollection.find({
        $and: [
          {city: new RegExp(["^", req.params.city_name, "$"].join(''), 'i')},
          {locality: new RegExp(["^", req.params.locality_name, "$"].join(''), 'i')},
        ]
      }).toArray().then(schools => {
        res.send(schools);
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

/* GET school details in a locality of a city - /api/cities/<city_name>/localities/<locality_name>/schools/school_id */
router.get('/:city_name/localities/:locality_name/schools/:school_id', (req, res, next) => {
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

module.exports = router;
