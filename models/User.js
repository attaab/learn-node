const errorHandler = require('mongoose-mongodb-errors')
const md5 = require('md5')
const mongoose = require('mongoose')
const passport = require('passport-local-mongoose')
const validator = require('validator')

const Schema = mongoose.Schema
mongoose.Promise = global.Promise

const schema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid Email Address'],
    required: 'Please supply an email address',
  },
  name: {
    type: String,
    required: 'Please supply a name',
    trim: true,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  hearts: [{ type: mongoose.Schema.ObjectId, ref: 'Store' }],
})

schema.virtual('gravatar').get(function() {
  const hash = md5(this.email)
  return `https://gravatar.com/avatar/${hash}?s=200`
})

schema.plugin(passport, { usernameField: 'email' })
schema.plugin(errorHandler)

module.exports = mongoose.model('User', schema)
