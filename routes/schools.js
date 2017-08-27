
var express = require('express');
var router = express.Router();

/* GET schools listing. */
router.get('/', function(req, res, next) {
    res.send('Schools --');
});

module.exports = router;
