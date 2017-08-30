var express = require('express');
var util = require('util');
var router = express.Router();

/* GET all cities - /api/cities */
router.get('/', function (req, res, next) {
    var db = req.app.locals.db;
    db.collection('schools', function (err, citiesCollection) {
        if (citiesCollection) {
            citiesCollection.distinct('city', function (err, cursor) {
                if (cursor) {
                    res.send(cursor);
                } else {
                    res.status(500).send(util.format('Error searching collection - %s', err));
                }
            });
        } else {
            res.status(500).send(util.format('Error getting collection - %s', err));
        }
    });
});

/* GET all localities - /api/cities/<city_name>/localities */
router.get('/:city_name/localities', function (req, res, next) {
    var db = req.app.locals.db;
    db.collection('schools', function (err, localitiesCollection) {
        if (localitiesCollection) {
            localitiesCollection.distinct('locality',
                {city: new RegExp(["^", req.params.city_name, "$"].join(''), 'i')},
                function (err, cursor) {
                    if (cursor) {
                        res.send(cursor);
                    } else {
                        res.status(500).send(util.format('Error searching collection - %s', err));
                    }
                });
        } else {
            res.status(500).send(util.format('Error getting collection - %s', err));
        }
    });
});

/* GET all schools in a locality - /api/cities/<city_name>/localities/<locality_name>/schools */
router.get('/:city_name/localities/:locality_name/schools', function (req, res, next) {
    var db = req.app.locals.db;
    db.collection('schools', function (err, schoolsCollection) {
        if (schoolsCollection) {
            schoolsCollection.find(
                {
                    $and: [
                        {city: new RegExp(["^", req.params.city_name, "$"].join(''), 'i')},
                        {locality: new RegExp(["^", req.params.locality_name, "$"].join(''), 'i')},
                    ]
                },
                function (err, cursor) {
                    if (cursor) {
                        cursor.toArray(function (err, schoolDocs) {
                            res.send(schoolDocs);
                        });
                    } else {
                        res.status(500).send(util.format('Error searching collection - %s', err));
                    }
                });
        } else {
            res.status(500).send(util.format('Error getting collection - %s', err));
        }
    });
});

module.exports = router;
