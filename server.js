var app = require('./express')

require('dotenv').config()                 // loading env vars from .env into process.env
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var session = require('express-session')
var passport = require('passport')


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cookieParser())
app.use(session({
    secret: process.env.WD_SESSION_SECRET, // secret 应该以这种方式获得, 不应直接存于源代码中, 而应存环境变量中
    resave: true,                          // 从而只有有管理这台服务器权限的人才能知道 secret
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())


// configure a public directory to host static content
app.use(app.express.static(__dirname + '/public'))
app.use('/bower_components', app.express.static(__dirname + '/bower_components'))
app.use('/node_modules', app.express.static(__dirname + '/node_modules'))

require('./server/app')

var port = process.env.PORT || 3000

var server = app.listen(port)
