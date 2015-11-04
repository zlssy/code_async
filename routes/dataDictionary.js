//数据字典
var express = require('express');
var request = require('request');
var tool = require('../lib/tool');
var fs = require('fs');
var path = require('path');
var router = express.Router();

/* GET users listing. */
router.get('/list', function(req, res, next) {
 	res.render('dataDictionary_list', {
		title: '数据字典列表'
		,req: req
	});
});
router.get('/dropdownlist', function(req, res, next) {
 	res.render('dataDictionary_dropdownlist', {
		title: '数据字典类型详情'
		,req: req
	});
});

module.exports = router;