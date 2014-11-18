var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username:  String,
  password: { type: String, default: '' },
  socket_id: { type: String, default: '' }
});

var User = mongoose.model('user', userSchema);

module.exports = User;