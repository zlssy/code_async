var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var routes = require('./routes/index');
var users = require('./routes/users');
var test_route = require('./routes/test');
var _ = require('underscore');
var local = require('./local');
global.TCL = {
  setting : _.extend({},local)
}
var setting = global.setting = global.TCL.setting;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.set('view option', {open:'{{',close:'}}', debug: true});


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger("short",{skip: function (req, res) { return res.statusCode < 400 }}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.enable('trust proxy')
_.extend(app.locals,{'setting':setting})
app.use(session({
    secret: "secret"
    ,name: "sessionID"
    ,cookie: {maxAge:1000*60*20}
    ,rolling: true
    ,resave: true
    ,saveUninitialized:true
}))


//路由开始 

app.use('/', require('./routes/root')); //路径 权限等
app.use('/', routes);
app.use('/users', users);
app.use('/test', test_route);
//数据字功能路由
app.use('/dataDictionary',require('./routes/dataDictionary'))
//系统功能
app.use('/system',require('./routes/system'));
//接口模拟
app.use('/settlement',require('./routes/settlement'))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
// if (app.get('env') === 'development') {
//   app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('public/error', {
//       message: err.message,
//       error: err
//     });
//   });
// }

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  if(req.xhr){
    res.json({
          "code": -100,
          "msg": err.message || "未知错误"
      })
  }else{
    res.status(err.status || 500);
    res.render('public/error', {
      title: 'Server Error',
      message: err.message,
      error: {}
    });
  }
  if(!err.status || err.status >= 500)  console.error(err);
});


module.exports = app;
