// routes/auth.js

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const passport = require('passport');

const router = express.Router();

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect to your desired page.
    console.log("google callback API hit Success:::-",req.user);
    res.redirect('/dashboard');
  });



// router.get(
//   '/google/callback',
//   passport.authenticate('google', { failureRedirect: '/login' }),
//   (req, res) => {
//     // You can create a JWT token here and send it to the client, similar to the login route
//     const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
//       expiresIn: '1h',
//     });

//     res.status(200).json({ token });
//   }
// );

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password , name } = req.body;

    console.log("register API hit:::-",req.body);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = new User({ email, password, name });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '10h',
    });
    res.status(201).json({ message: 'User registered successfully', user , token});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("login API hit:::-",req.body);
    const user = await User.findOne({ email });
    
    console.log("login API hit:::-",user);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '10h',
    });

    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware for protected routes
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Protected route example
router.get('/protected', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'You have access to this protected route!' });
});

module.exports = router;
