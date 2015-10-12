var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var routes = require('./routes/index');
var users = require('./routes/users');
if(process.argv[2] != 'test'){
    var access_token = require("./routes/we_account/access_token");//定时刷新access_token
}
var we_account = require('./routes/we_account_2');
var test = require('./routes/we_account/test/test');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.engine('html',require('html').renderFile);

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'),{
//    etag:true,
//    maxAge:'no-cache',
//    expires:new Date().getTime() + 30000,//无效
//    setHeaders:function(res,path){
//        res.set('x-timestamp',new Date().getTime());
//        res.set('x-hehe','set header test');
//        res.set('Expires','Tuesday,19 May 2015 03:50:30 GMT');//无效
////        res.set('Last-Modified','Tue, 19 May 2015 04:27:35 GMT');
//    }
}));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));


app.use('/', routes);
app.use('/users', users);
app.use("/we_account",we_account);
//app.use('/test',test);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



//全局异常处理
process.on('uncaughtException', function(err) {
    console.log(err.stack);
});

module.exports = app;
