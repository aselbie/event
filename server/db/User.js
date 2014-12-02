var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  email:  String,
  username:  String,
  password: { type: String, default: null },
  socket_id: { type: String, default: null },
  session_id: { type: String, default: null }
});

var User = mongoose.model('user', userSchema);

module.exports = User;