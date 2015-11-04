//系统功能
var express = require('express');
var request = require('request');
var tool = require('../lib/tool');
var fs = require('fs');
var path = require('path');
var router = express.Router();

/* GET users listing. */
router.get('/password', function(req, res, next) {
 	res.render('system_password', {
		title: '修改密码'
		,req: req
	});
});

module.exports = router;