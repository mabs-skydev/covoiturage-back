const express = require('express');
const router = express.Router();
const { Ride } = require('../models/Ride');
const Car = require('../models/Car');

const verifyToken = require("../middleware/authMiddleware");

// GET: List all rides with car and user info
router.get('/', async (req, res) => {
	try {
		const rides = await Ride.find()
			.populate('car')
			.populate({
				path: 'car',
				populate: { path: 'user', select: 'firstname lastname' }
			});
		res.json(rides);
	} catch (err) {
		res.status(500).json({ error: 'Server error' });
	}
});

// GET: Get the current user's rides along with the users requesting them
router.get('/me', verifyToken, async (req, res) => {
	try {
		const userId = req.userId;  // Assume req.user contains the authenticated user info

		// Find rides where the current user is the owner of the car
		const rides = await Ride.find()
			.populate('car')  // Populate car details
			.populate({
				path: 'users.user',  // Populate the users who requested the ride
				select: 'firstname lastname email'  // Select specific fields for the user
			})
			.populate({
				path: 'car',
				match: { user: userId },  // Only include rides where the car belongs to the current user
				select: 'model'  // Optionally select fields from car, like 'model'
			})
			.exec();

		// Filter out rides that don't belong to the current user's car
		const userRides = rides.filter(ride => ride.car !== null);

		res.json(userRides);
	} catch (err) {
		res.status(500).json({ error: 'Server error' });
	}
});

// POST: Create a ride for the current user's car
router.post('/', verifyToken, async (req, res) => {
	try {
		const { from, to, pickup_time, capacity, price } = req.body;
		const userId = req.userId;

		// Find the car associated with the current user
		const car = await Car.findOne({ user: userId });
		if (!car) {
			return res.status(400).json({ error: 'No car found for the current user' });
		}

		const ride = new Ride({
			from,
			to,
			pickup_time,
			capacity: capacity || 4,
			remaining_places: capacity || 4,
			price,
			car: car._id
		});
		await ride.save();
		res.status(201).json(ride);
	} catch (err) {
		res.status(500).json({ error: 'Server error' });
	}
});

// PUT: Add current user to the ride with 'pending' status
router.put('/:id/book', verifyToken, async (req, res) => {
	try {
		const rideId = req.params.id;
		const userId = req.userId;

		const ride = await Ride.findById(rideId).populate('car')
			.populate({
				path: 'car',
				populate: { path: 'user', select: 'firstname lastname' }
			});
		if (!ride) {
			return res.status(404).json({ error: 'Voyage introuvable' });
		}

		const existingUser = ride.users.find(u => u.user.toString() === userId.toString());
		if (existingUser) {
			return res.status(400).json({ error: 'Vous avez déja demander cette voyage' });
		}

		const acceptedUsers = ride.users.filter(u => u.status === 'accepted');
		if (acceptedUsers.length >= ride.capacity) {
			return res.status(400).json({ error: 'Il y\'a plus de places' });
		}

		ride.users.push({ user: userId, status: 'pending' });

		await ride.save();
		res.json(ride);
	} catch (err) {
		res.status(500).json({ error: 'Server error' });
	}
});

router.put('/:id/cancel', verifyToken, async (req, res) => {
	try {
		const rideId = req.params.id;
		const userId = req.userId;

		const ride = await Ride.findById(rideId).populate('car')
			.populate({
				path: 'car',
				populate: { path: 'user', select: 'firstname lastname' }
			});
		if (!ride) {
			return res.status(404).json({ error: 'Voyage introuvable' });
		}

		// Find the user object within the ride.users array
		const userIndex = ride.users.findIndex(u => u.user.toString() === userId.toString());

		// Check if the user is already present in the ride
		if (userIndex === -1) {
			return res.status(400).json({ error: 'Vous n\'êtes pas inscrit à ce voyage' });
		}

		// Remove the user object from the ride.users array
		ride.users.splice(userIndex, 1);

		await ride.save();
		res.json(ride);
	} catch (err) {
		res.status(500).json({ error: 'Server error' });
	}
});

// PUT: Update the status of a user in a ride
router.put('/:rideId/status', verifyToken, async (req, res) => {
	try {
		const { rideId } = req.params;
		const { userId, status } = req.body;

		// Validate status
		const validStatuses = ['pending', 'accepted', 'rejected'];
		if (!validStatuses.includes(status)) {
			return res.status(400).json({ error: 'Invalid status' });
		}

		// Find the ride by ID
		const ride = await Ride.findById(rideId);
		if (!ride) {
			return res.status(404).json({ error: 'Ride not found' });
		}

		// Find the user in the ride's users list
		const rideUser = ride.users.find(u => u._id.toString() === userId);
		if (!rideUser) {
			return res.status(404).json({ error: 'User not found in this ride' });
		}

		// Update the user's status
		rideUser.status = status;

		// Save the updated ride
		await ride.save();

		res.json(ride);
	} catch (err) {
		res.status(500).json({ error: 'Server error' });
	}
});

module.exports = router;
