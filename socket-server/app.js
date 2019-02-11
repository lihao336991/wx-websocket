var createError = require('http-errors');
var express = require('express');

var path = require('path');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var app = express();
//获取参数的中间件
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.all("*", function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://wl.qeebu.com");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
//cors跨域设置
var cors = require('cors')
app.use(cors({
    origin: 'http://wl.qeebu.com',
    credentials: true
}))




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});



// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


/*--------------------------------------------*/
module.exports = app;