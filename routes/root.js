//登陆，权限
var express = require('express');
var request = require('request');
var tool = require('../lib/tool');
var fs = require('fs');
var path = require('path');
var router = express.Router();


router.use(function(req, res, next){
    if(setting.proxyPath != ''){
        res.redirect_ = res.redirect;
        res.redirect = function(arg){
            var argarr = Array.prototype.slice.call(arguments,0);
            argarr[0] = argarr[0].replace(/^\/+/,setting.proxyPath+"/");
            return res.redirect_.apply(res,argarr);
        }
    }
    next();
})

//登陆页
router.get('/login', function(req, res, next){
    res.render('login', {
        title: '登录 - TCL业务清算平台'
    });
});

router.post('/login', function(req, res, next){
    var msg;
    if(!msg && req.body.username == '') msg = "用户名不能为空!";
    if(!msg && req.body.password == '') msg = "密码不能为空!";
    var userobj;
    for(var i=0; i<setting.users.length; i++){
        if(req.body.username === setting.users[i][0] && req.body.password === setting.users[i][1]){
            userobj = setting.users[i];
            break;
        }
    }
    if(userobj){
        req.session.userId = userobj[0];
        res.redirect(req.query.rurl || '/');
    }else{
        res.render('login', {
            title: '登录 - TCL业务清算平台',
            errmsg: msg || '用户名或密码错误!',
            body: req.body
        });
    }
});

//注销
router.all('/logout', function(req, res, next){
    req.session.regenerate(function(err){
    	if(err){
    		return next(err)
    	}
    	res.redirect('/');
    })
});

//登录判断
router.use(function(req,res,next){
    if(req.session.userId){
        res.locals._userName = req.session.userId;
        return next();
    }
    if(req.xhr) return res.json({"code": -100,"msg": '登陆超时,请刷新页面重新登陆!'})
	return res.redirect('/login?rurl='+encodeURIComponent(req.url));
})

module.exports = router;