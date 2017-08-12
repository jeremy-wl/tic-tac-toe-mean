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
    secret: process.env.WD_SESSION_SECRET,
    resave: true,
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

var http = require('http').Server(app);
var io = require('socket.io')(http);

var socketQueue = []

io.on('connection', function (socket) {

    socket.on('join room', function (user) {
        if (socketQueue.length === 0) {
            // no room to join, then create one
            createRoom(socket, user.username)

        } else {
            var room = socketQueue[0]
            if (room === socket.room)  return
            joinRoom(socket, user.username, room)
            socketQueue.shift()  // dequeue room
            io.to(room).emit('game starts', user)
        }
    })

    socket.on('share initial data', function (data) {  // data contains: grid, and gameObj returned from db
        var room = socket.id
        io.to(room).emit('sharing initial data', data)
    })

    socket.on('move made', function(moveObj) {
        var room = socket.room
        io.to(room).emit('move made', moveObj)
    });

    socket.on('game over', function(username) {
        leaveRoom(socket, username)
    });

    socket.on('disconnect', function() {
        var room = socket.room
        if (socket.room) {
            leaveRoom(socket)
            console.log('Player (socket id: '+ socket.id + ') disconnects');
            io.to(room).emit('someone fled')
        }
    });

    socket.on('leave during game', function (username) {
        var room = socket.room
        leaveRoom(socket)
        io.to(room).emit('someone fled')
    })

    function createRoom(socket, username) {
        // leaveRoom(socket, username)

        var room = socket.id
        socketQueue.push(room)
        console.log('new room ' + socket.id + ' created by ' + username)

        joinRoom(socket, username, room)
    }

    function leaveRoom(socket, username) {
        if (socket.room) {
            console.log('Player ' + username + '                      (' + socket.id + ') leaves ' + socket.room)
        }
        socket.leave(socket.room)
        socket.room = null
    }

    function joinRoom(socket, username, room) {
        console.log('Player ' + username + '                      (' + socket.id + ') joins ' + room)
        socket.join(room)
        socket.room = room
    }

})

var server = http.listen(port)
