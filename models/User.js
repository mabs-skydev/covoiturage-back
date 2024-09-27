const mongoose = require("mongoose");

const User = mongoose.model(
	"User",
	new mongoose.Schema({
		email: {
			type: String,
			required: true,
			unique: true
		},
		firstname: {
			type: String,
			required: true
		},
		lastname: {
			type: String,
			required: true
		},
		password: {
			type: String,
			required: true
		},
		is_driver: {
			type: Boolean,
			default: false
		}
	})
);

module.exports.User = User;