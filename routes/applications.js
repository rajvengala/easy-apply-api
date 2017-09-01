var express = require('express');
var router = express.Router();

/* GET applications listing. */
router.get('/', (req, res, next) => {
  res.send('Applications --');
});

module.exports = router;

