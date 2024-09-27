const express = require('express');
const router = express.Router();
const Car = require('../models/Car');  // Assuming your Car model is in the models folder
const User = require('../models/User');  // Assuming user authentication middleware provides current user
const verifyToken = require('../middleware/authMiddleware');

// POST: Create a car for the current user
router.post('/', verifyToken, async (req, res) => {
	try {
		const { model } = req.body;

		const userId = req.userId;

		// Check if the user already has a car
		const existingCar = await Car.findOne({ user: userId });
		if (existingCar) {
			return res.status(400).json({ error: 'User already has a car' });
		}

		const car = new Car({ model, user: userId });
		await car.save();
		res.status(201).json(car);
	} catch (err) {
		res.status(500).json({ error: 'Server error' });
	}
});

module.exports = router;