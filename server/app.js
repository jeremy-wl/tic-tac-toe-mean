var mongoose = require('mongoose')

var connectionString = 'mongodb://localhost/tic-tac-toe' // for local
// if (process.env.MLAB_USERNAME_WEBDEV) {              // check if running remotely
//     var username = process.env.MLAB_USERNAME_WEBDEV  // get from environment
//     var password = process.env.MLAB_PASSWORD_WEBDEV
//     connectionString = 'mongodb://' + username + ':' + password
//     connectionString += '@ds147821.mlab.com:47821/heroku_sccp2r5d'
// }

mongoose.connect(connectionString, { useMongoClient: true })
mongoose.Promise = require('q').Promise

require('./services/user.service.server')
require('./services/game.service.server')
require('./services/move.service.server')
