//数据模拟
var express = require('express');
var request = require('request');
var tool = require('../lib/tool');
var fs = require('fs');
var qs = require('querystring')
var path = require('path');
var _ = require('underscore');
var router = express.Router();

//代理
var daili = true; //是否启用代理
var daili_url = setting.apiUrl || "http://testtclpay.tclclouds.com/settlement";
var userid = 12345;

if (daili) {
    var downFiles = [
        '/clearing/export'
        ,'/settleStatement/export'
        ,'/downloadStatisticalRecord'
        ,'/downloadTradeRecord'
        ,'/downloadWrongRecord'
        ,'/settleCard/template'
        ,'/settleCard/import'
        ,'/settleCard/importReturnJson'
        ,'/reconciliation'
        ,"/test"
    ]

    var conditions = [
        '/queryTradeRecord'
        ,'/downloadTradeRecord'
        ,'/queryStatisticalRecord'
        ,'/downloadStatisticalRecord'
        ,'/queryWrongRecord'
        ,'/downloadWrongRecord'
    ]

    router.all(conditions,function(req,res,next){
        if(req.query.condition){return next()}
        var comd = {'condition':JSON.stringify(req.query)}
        req.apiurl = req._parsedUrl.pathname + '?' + qs.stringify(comd)
        //req.query.condition = JSON.stringify(req.query)
        next();
    })

    //文件流代理
    router.all(downFiles,function(req,res,next){
        req.headers.userId = req.session.userId;

        if(req.url == '/test'){
            var r = request("http://127.0.0.1:3000/settlement/set");
            req.pipe(r).pipe(res);
            return;
        }
        // var obj = {
        //     "method": req.method,
        //     "uri": daili_url + req.url,
        //     "headers": {
        //         "userId": userid
        //     }
        // }
        // if (req.method === "POST") {
        //     obj.form = _.extend({}, req.body)
        // }
        var r = request(daili_url + (req.apiurl || req.url));
        // r.on('error',function(e){
        //     res.json({
        //         'msg' : e.message
        //         ,'code' : 1
        //     })
        //     return;
        // })
        // 


        req.pipe(r).pipe(res);
    })

    router.all("/set",function(req,res,next){
        console.log(req.headers);
        return req.pipe(res);
    })

    //普通 get set 代理
    router.all("/*", function(req, res, next) {
        //var callback = req.query.callback;
 //       if(~req.url.indexOf('queryTradeRecord') && ((Math.random()*1000)>>0) % 2){return next(new Error("test error"))}
        var obj = {
            "method": req.method,
            "uri": daili_url + (req.apiurl || req.url),
            "headers": {
                "userId": req.session.userId || "0"
            }
        };
        if (req.method === "POST") {
            obj.form = _.extend({}, req.body)
            //关于dataArray的特殊处理
            if(req.body.dataArray){
                obj.json = JSON.parse(req.body.dataArray);
                obj.qs = _.extend({},req.query,req.body);
                delete obj.qs.dataArray;
                delete obj.form;
            }
        }
        tool.qrequestStr(obj).done(function(data) {
            try{
                var json = JSON.parse(data);
                if(typeof json.code == "undefined") json.code = 0;
                res.json(json);
            }catch(e){
                //res.set('Content-Type','application/json; charset=utf-8');
                res.send(data);
            }
        }, function(err) {
            res.json({
                "code": -102,
                "msg": err.message || err
            })
            console.error(err);
            //next(e)
        })
    })
}


//以下为模拟数据
var DATAY = {
    "code": 0,
    "msg": 'Success'
}
// 通用约定
// 	pageNo Integer 表示第几页，默认为1
// 	pageSize Integer 每页返回多少条数据，默认20
//处理page
router.all('/*', function(req, res, next) {
    var _Page = res._Page = {
        "totalCount": 100,
        "pageSize": req.query.pageSize || req.body.pageSize || 20,
        "pageNo": req.query.pageNo || req.body.pageNo || 1
    }
    next()
});

// 功能：获取数据字典类型列表
// URL：/dataDictionary/list
// METHOD：GET
// 参数：
// type	String	否	字典类型编码
// languageCode	String	否	默认中文zh
// sort	String	否	排序字段 默认类型编码
// order	String	否	asc/desc 默认升序
router.all('/dataDictionary/list', function(req, res, next) {
    var arr = []
    for (var i = 1; i <= res._Page.pageSize; i++) {
        arr.push({
            "id": i,
            "type": 'clearingStatus', //字典类型编码
            "label": '清分状态' //字典类型名称
        })
    }
    var data = _.extend({}, DATAY, {
        "data": _.extend(res._Page, {
            "pageData": arr
        })
    })
    res.json(data);
});

// 功能：添加或修改数据字典类型
// URL：/dataDictionary/addOrUpdate
// METHOD：POST
// 参数：
// id	Integer	否	字典类型ID,新增为空,修改必须传
// type	String	是	字典类型编码
// label	String	是	字典类型名称
// languageCode	String	否	默认中文zh
// dataArray	Json Array	否	数据字典Json数组
// dataArray 参数说明:
// code	String	是	字典编码
// label	String	是	字典名称
// dataDictionaryStatus	String	是	字典状态:可用;禁用
// displayOrder	Integer	是	字典顺序 数值越低，在下拉框中显示最靠前
router.all('/dataDictionary/addOrUpdate', function(req, res, next) {
    res.json(DATAY);
});

// 功能：获取数据字典详细信息
// URL：/dataDictionary/detail
// METHOD：GET
// 参数：
// id	Integer	是	数据字典类型ID
router.all('/dataDictionary/detail', function(req, res, next) {
    res.send({"code":"0","data":{"creationDate":"2015-09-25 18:50:39","creationUser":"init","dataArray":[{"code":"ToCorporation","creationDate":"2015-09-25 18:50:39","creationUser":"init","dataDictionaryStatus":"可用","dataInfoId":4,"displayOrder":1,"innerValue":1,"isHidden":0,"label":"对公","label_en":"To Corporation","label_zh":"对公","modifyDate":"2015-09-25 18:50:39","modifyUser":"init","status":2,"type":"settleCardType"},{"code":"ToPersonal","creationDate":"2015-09-25 18:50:39","creationUser":"init","dataDictionaryStatus":"可用","dataInfoId":5,"displayOrder":2,"innerValue":2,"isHidden":0,"label":"对私","label_en":"To Personal","label_zh":"对私","modifyDate":"2015-09-25 18:50:39","modifyUser":"init","status":1,"type":"settleCardType"}],"id":2,"isHidden":0,"label":"结算卡类型","modifyDate":"2015-09-25 18:50:39","modifyUser":"init","type":"settleCardType","typeLabel_en":"Settle Card Type","typeLabel_zh":"结算卡类型"},"msg":"Success"});
});


// 功能：获取数据字典显示列表
// URL：/dataDictionary/dropdownlist
// METHOD：GET
// 参数：
// 字段名	类型	是否必选	说明
// type	String	是	下拉列表类型如:clearingStatus
// languageCode	String	否	中文zh,英语en 默认zh
router.all('/dataDictionary/dropdownlist', function(req, res, next) {
    var data = _.extend({}, DATAY, {
        "data": {
            "type": "clearingStatus",
            "label": "清分状态",
            "dataArray": [{
                "label": "待结算", //显示名字
                "innerValue": "1", //内部值
                "displayOrder": "" //显示顺序1>2>3
            }, {
                "label": 0, //显示名字
                "innerValue": "结算中", //内部值
                "displayOrder": "1" //显示顺序1>2>3
            }, {
                "label": 0, //显示名字
                "innerValue": "已结算", //内部值
                "displayOrder": "3" //显示顺序1>2>3
            }]
        }
    })
    res.json(data);
});

var fileapi = {
    '/clearing/list': "settlement-clearing-list.json",
    '/settleCard/list': 'settle-card-list.json',
    '/settleCard/list:1': 'settle-card-list.json',
    '/settleCard/list:2':'settle-card-list2.json',
    '/settleCard/history':'settle-card-history.json',
    '/settleRule/list':'settle-rule-list.json',
    '/settleRule/history':'settle-card-history.json',
    '/queryStatisticalRecord':'queryStatisticalRecord.json',
    '/exchangeRate/list':'exchange-list.json',
    '/settleLimit/list': 'settle-limit-list.json',
    '/queryWrongRecord': 'queryWrongRecord.json',
    '/reconciliation': 'reconciliation.json',
    '/settleLimit/history': 'settle-card-history.json'
};

if (!daili) {
    router.get('/*', function(req, res, next) {
        var href = req.url,
            basePath = req.path,
            pageNo = href.indexOf('pageNo') > -1 ? href.replace(/^.*pageNo=(\d+).*/, '$1') : 0,
            fileName = '';
        if (pageNo) {
            fileName = req.path + ':' + pageNo;
            if (fileapi[fileName]) {
                console.log(fileName, ' replace as ', fileapi[fileName]);
                fs.readFile(path.resolve(__dirname, '../temp_data', fileapi[fileName]), {
                    encoding: 'utf-8'
                }, function(err, data) {
                    if (err) {
                        console.log(err.message);
                        next();
                    } else {
                        res.json(JSON.parse(data));
                    }
                });
            } else {
                next();
            }
        } else {
            if (fileapi[req.path]) {
                console.log(req.path, ' replace as ', fileapi[req.path]);
                fs.readFile(path.resolve(__dirname, '../temp_data', fileapi[req.path]), {
                    encoding: 'utf-8'
                }, function(err, data) {
                    if (err) {
                        console.log(err.message);
                        next();
                    } else {
                        res.json(JSON.parse(data));
                    }
                });
            } else {
                next();
            }
        }
    });
}

module.exports = router;

