const express = require('express');
const { User } = require('../models/User');
const Car = require('../models/Car');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

// User registration
router.post('/register', async (req, res) => {
	try {
		const { email, password, firstname, lastname, is_driver } = req.body;

		const hashedPassword = await bcrypt.hash(password, 10);
		const user = new User({ email, firstname, lastname, password: hashedPassword, is_driver });
		await user.save();
		res.status(201).json({ message: 'Utilisateur enregistré avec succès' });
	} catch (error) {
		res.status(500).json({ error: 'Utilisateur existe déja' });
	}
});

// User login
router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;
		let user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({ error: 'Utilisateur n\'exite pas' });
		}
		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			return res.status(401).json({ error: 'Mot de passe incorrect' });
		}
		const token = jwt.sign({ userId: user._id }, 'covoiturage', {
			expiresIn: '12h',
		});

		const car = await Car.findOne({ user: user._id });
		const userWithCar = user.toObject();
		if (car) {
			userWithCar.car = car;
		}

		res.status(200).json({ user: userWithCar, token });
	} catch (error) {
		res.status(500).json({ error: 'Login failed' });
	}
});

module.exports = router;