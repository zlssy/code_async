var express = require('express');
var router = express.Router();

/* GET home page. */
router.all('/qingfen-detail', function(req, res, next){
	res.render('qingfen-detail', {
		title: 'TCL支付运营平台',
		req: req
	})
});
router.all('/dataDictionary/list', function(req, res, next){
    res.render('dataDictionary_list', {
        title: 'TCL支付运营平台',
        req: req
    })
});
router.all('/payment-channel', function(req, res, next){
    res.render('payment-channel', {
        title: 'TCL支付运营平台',
        req: req
    })
});
router.all('/order', function(req, res, next){
	res.render('order', {
		title: 'TCL支付运营平台',
		req: req
	})
});
router.all('/merchant-check', function(req, res, next){
	res.render('merchant-check', {
		title: 'TCL支付运营平台',
		req: req
	})
});
router.all('/merchant-info', function(req, res, next){
	res.render('merchant-info', {
		title: 'TCL支付运营平台',
		req: req
	})
});
router.all('/documet', function(req, res, next){
	res.render('document', {
		title: 'TCL支付运营平台',
		req: req
	})
});
router.all('/payment-statistics', function(req, res, next){
	res.render('payment-statistics', {
		title: 'TCL支付运营平台',
		req: req
	})
});
router.get('/statement-upload', function(req, res, next){
    res.render('statement-upload', {
        title: 'TCL支付运营平台',
        req: req
    });
});
router.get('/financial-statistics', function(req, res, next){
    res.render('financial-statistics', {
        title: 'TCL支付运营平台',
        req: req
    });
});
router.get('/statement-list', function(req, res, next){
    res.render('statement-list', {
        title: 'TCL支付运营平台',
        req: req
    });
});
router.get('/exchange-query', function(req, res, next){
    res.render('exchange-query', {
        title: 'TCL支付运营平台',
        req: req
    });
});
router.get('/qingfen-list-query', function(req, res, next){
	res.render('qingfen-list-query', {
		title: 'TCL支付运营平台',
        req: req
	});
});
router.get('/settle-card', function(req, res, next){
	res.render('settle-card', {
		title: 'TCL支付运营平台',
        req: req
	});
});
router.get('/settle-rule', function(req,res, next){
	res.render('settle-rule', {
		title: 'TCL支付运营平台',
        req: req
	});
});
router.get('/settle-limit', function(req,res, next){
	res.render('settle-limit', {
		title: 'TCL支付运营平台',
        req: req
	});
});
router.get('/settle-query', function(req,res, next){
	res.render('settle-query', {
		title: 'TCL支付运营平台',
        req: req
	});
});
router.get('/rate', function(req, res, next){
	res.render('rate', {
		title: 'TCL支付运营平台',
        req: req
	});
});
router.all('/upload', function(req, res, next){
	res.render('upload', {
		title: 'TCL支付运营平台',
		req: req
	})
});

router.all('/tradeRecord/list', function(req, res, next){
	res.render('tradeRecord_list', {
		title: 'TCL支付运营平台',
		req: req
	})
});
router.all('/exchange-query', function(req, res, next){
    res.render('exchange-query', {
        title: 'TCL支付运营平台',
        req: req
    })
});
router.all('/config', function(req, res, next){
    res.render('config', {
        title: 'TCL支付运营平台',
        req: req
    })
});
router.all('/qingfen-detail', function(req, res, next){
	res.render('qingfen-detail', {
		title: 'TCL支付运营平台',
		req: req
	})
});
router.all('/daily-collect', function(req, res, next){
	res.render('daily-collect', {
		title: 'TCL支付运营平台',
		req: req
	})
});
router.all('/charge', function(req, res, next){
	res.render('charge', {
		title: 'TCL支付运营平台',
		req: req
	})
});
router.all('/trade-stat', function(req, res, next){
	res.render('trade-stat', {
		title: 'TCL支付运营平台',
		req: req
	})
});

/** get root 放到最后 */
router.get('/', function(req, res, next) {
	// res.render('index', {
	// 	title: 'TCL业务清算平台',
 //        req: req
	// });
	res.redirect('/merchant-info');
});
module.exports = router;