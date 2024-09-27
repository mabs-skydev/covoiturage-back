const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CarSchema = new Schema({
	model: {
		type: String,
		required: true
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	}
});

module.exports = mongoose.model('Car', CarSchema);
