const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RideUserSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to User model
	status: {
		type: String,
		enum: ['pending', 'accepted', 'rejected'],
		default: 'pending'
	}  // Status field for each user
});

const RideSchema = new Schema({
	from: {
		type: String,
		required: true
	},
	to: {
		type: String,
		required: true
	},
	pickup_time: {
		type: Number,
		min: 0,
		max: 24,
		required: true
	},
	capacity: {
		type: Number,
		default: 4
	},
	price: {
		type: Number,
		default: 0
	},
	users: [RideUserSchema],
	car: {
		type: Schema.Types.ObjectId,
		ref: 'Car',
		required: true
	}
});

module.exports.Ride = mongoose.model('Ride', RideSchema);