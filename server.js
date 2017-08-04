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

    function createRoom(socket) {
        var room = socket.id
        socketQueue.push(room)
    }

    socket.on('create room', function (username) {
        createRoom(socket)
        console.log('Player (socket id: ' + socket.id + ') named ' + username + ' joins ' + socket.id)
    })

    socket.on('join room', function (username) {
        for (var i in socketQueue) {
            var room = socketQueue[i]
            var clients = io.sockets.adapter.rooms[room].sockets
            var numClients = (typeof clients !== 'undefined') ? Object.keys(clients).length : 0;
            if (numClients === 1) {
                socket.join(room)
                console.log('Player (socket id: ' + socket.id + ') named ' + username + ' joins ' + room)
                io.to(room).emit('join room', username)
                return
            }
        }
        // no room to join, then create one
        createRoom(socket)
    })

    socket.on('share initial data', function (data) {
        var room = Object.keys(socket.adapter.rooms)[0]
        io.to(room).emit('share initial data', data)
    })

    socket.on('change grid', function (newGrid) {
        var room = Object.keys(socket.adapter.rooms)[0]
        io.to(room).emit('change grid', newGrid)
    })

    socket.on('getting ready', function (sharedData) {
        var room = Object.keys(socket.adapter.rooms)[0]
        io.to(room).emit('getting ready', sharedData)
    })

    socket.on('game start', function (data) {
        var s = socketQueue.find(function (room) {
            var clients = io.sockets.adapter.rooms[room].sockets
            for (var i in clients) {
                return Object.keys(clients[i] === socket.id)
            }
        })
        var index = socketQueue.indexOf(s)
        socketQueue.splice(index, 1)
    })

    socket.on('move made', function(moveObj){
        var room = Object.keys(socket.adapter.rooms)[0]
        io.to(room).emit('move made', moveObj)
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
        // remove client from room in the queue (automatically?)
    });


})

var server = http.listen(port)
