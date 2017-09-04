var express = require('express');
var util = require('util');
var router = express.Router();
var ObjectId = require('mongodb').ObjectID;

/* GET all cities - /api/cities */
router.get('/', (req, res, next) => {
  var db = req.app.locals.db;
  db.collection('schools', (err, citiesCollection) => {
    if (citiesCollection) {
      citiesCollection.distinct('city').then(cities => {
        res.send(cities);
      }).catch(err => {
        res.status(500).send(util.format('Error searching collection - %s', err));
      });
    } else {
      res.status(500).send(util.format('Error getting collection - %s', err));
    }
  });
});

/* GET all localities - /api/cities/<city_name>/localities */
router.get('/:city_name/localities', (req, res, next) => {
  var db = req.app.locals.db;
  db.collection('schools', (err, localitiesCollection) => {
    if (localitiesCollection) {
      localitiesCollection.distinct('locality', {city: new RegExp(["^", req.params.city_name, "$"].join(''), 'i')}).then(localities => {
        res.send(localities);
      }).catch(err => {
        res.status(500).send(util.format('Error searching collection - %s', err));
      });
    } else {
      res.status(500).send(util.format('Error getting collection - %s', err));
    }
  });
});

/* GET all schools in a locality of a city - /api/cities/<city_name>/localities/<locality_name>/schools */
router.get('/:city_name/localities/:locality_name/schools', (req, res, next) => {
  var db = req.app.locals.db;
  db.collection('schools', (err, schoolsCollection) => {
    if (schoolsCollection) {
      schoolsCollection.find({
        $and: [
          {city: new RegExp(["^", req.params.city_name, "$"].join(''), 'i')},
          {locality: new RegExp(["^", req.params.locality_name, "$"].join(''), 'i')},
        ]
      }).toArray().then(schools => {
        res.send(schools);
      }).catch(err => {
        next(util.format('Error searching collection - %s', err));
      });
    } else {
      next.send(util.format('Error getting collection - %s', err));
    }
  });
});

/* GET school details in a locality of a city - /api/cities/<city_name>/localities/<locality_name>/schools/school_id */
router.get('/:city_name/localities/:locality_name/schools/:school_id', (req, res, next) => {
  var db = req.app.locals.db;
  db.collection('schools', (err, schoolsCollection) => {
    if (schoolsCollection) {
      var objId = new ObjectId(req.params.school_id);
      schoolsCollection.find({_id: objId}).toArray().then(school => {
        res.send(school);
      }).catch(err => {
        next(util.format('Error searching collection - %s', err));
      });
    } else {
      next.send(util.format('Error getting collection - %s', err));
    }
  });
});

module.exports = router;
