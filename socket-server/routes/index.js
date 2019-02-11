var express = require('express');
var router = express.Router();
// var mysql = require('../config/mysqlConnection');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('express');
});

module.exports = router;