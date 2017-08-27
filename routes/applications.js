var express = require('express');
var router = express.Router();

/* GET applications listing. */
router.get('/', function (req, res, next) {
    res.send('Applications --');
});

module.exports = router;

