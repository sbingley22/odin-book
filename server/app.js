require('dotenv').config()
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const cors = require('cors')

// Mongoose setup
const mongoose = require('mongoose')
mongoose.set("strictQuery", false)
const mongoDB = process.env.MONGODB_URI
// Try connecting
main().catch((err) => {
  console.log(err)
});
async function main() {
  await mongoose.connect(mongoDB);
}

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// Enable CORS
app.use(cors())
app.options('*', cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
