var express = require('express');
var router = express.Router();

/* GET test listing. */
router.get('/', function(req, res, next) {
	res.render('test', {
		title: 'Test'
	});
	next();
});

module.exports = router;