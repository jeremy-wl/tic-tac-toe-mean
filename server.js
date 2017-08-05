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
            joinRoom(socket, user.username, room)
        }
        io.to(room).emit('join room', user)
    })

    socket.on('share initial data', function (data) {

        removeRoomFromQueue(socket)

        var room = socket.id

        io.to(room).emit('share initial data', data)
    })

    socket.on('move made', function(moveObj) {
        var room = socket.room
        io.to(room).emit('move made', moveObj)
    });

    socket.on('game over', function(data) {  // no data passed
        socket.leave(socket.room)
    });

    socket.on('disconnect', function(socket) {
        console.log('Player (socket id: '+ socket.id + ') disconnects');
        // remove client from room in the queue (automatically?)
    });


    function createRoom(socket, username) {
        // leaveRoom(socket, username)

        var room = socket.id
        socketQueue.push(room)
        console.log('new room ' + socket.id + ' created by' + username)

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
        // if (!socket.room) {
            console.log('Player ' + username + '                      (' + socket.id + ') joins ' + room)
        // }
        socket.join(room)
        socket.room = room
    }

    function removeRoomFromQueue(socket) {
        var s = socketQueue.find(function (room) {
            var clients = socket.adapter.rooms[room].sockets
            for (var i in clients) {
                return Object.keys(clients[i] === socket.id)
            }
        })
        var index = socketQueue.indexOf(s)
        socketQueue.splice(index, 1)
    }

})

var server = http.listen(port)
