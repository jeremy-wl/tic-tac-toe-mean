var app = require('./express')

var bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


// configure a public directory to host static content
app.use(app.express.static(__dirname + '/public'))
app.use('/bower_components', app.express.static(__dirname + '/bower_components'))
app.use('/node_modules', app.express.static(__dirname + '/node_modules'))

// require('./server/app')

var port = process.env.PORT || 3000

app.listen(port)
