const express = require('express')
const http = require('http')
const path = require('path')
const mongoose = require('mongoose')
const stylus = require('stylus')
const formage = require('formage')

require('./dust')

const app = express()

app.set('site', 'Ronen Akerman')
app.set('port', process.env.PORT || 80)
app.set('mongo', process.env.MONGOLAB_URI || 'mongodb://localhost/ronenakerman')
app.set('cloudinary', process.env.CLOUDINARY_URL)

app.engine('dust', require('consolidate').dust)
app.set('view engine', 'dust')
app.set('views', path.join(__dirname, '..', 'views'))
app.use(stylus.middleware({
  src: path.join(__dirname, '..', 'public'),
  compile: function compile (str, path) {
    return stylus(str)
      .set('filename', path)
      .use(require('nib')())
  }
}))

if ('development' === app.get('env')) {
  app.use(express.logger('dev'))
}

app.use(express.compress())
app.use(express.cookieParser('aafa34nafksd'))
app.use(express.cookieSession({
  cookie: {maxAge: 60 * 60 * 24 * 10},
  key: app.get('site')
}))
app.use(express.static(path.join(__dirname, '../public')))

mongoose.Promise = global.Promise
mongoose.connect(app.get('mongo'), {useMongoClient: true})
formage.init(app, express, require('./models'), {
    username: 'ronen',
    password: process.env._FORMAGE_PASSWORD,
    title: 'Ronen Akerman'
})

app.use(app.router)
require('./routes')(app)

// development
if ('development' === app.get('env')) {
  app.use(express.errorHandler())
}

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'))
})
