/**
 * Created by Jeremy on 7/30/17.
 */

const express = require('express')  // the express lib itself
const app = express() // creates an instance of express
app.express = express // also (btw) bind the express lib to the express instance
module.exports = app  // exports app as a variable for it to be used anywhere by 'require'ing it as a module
