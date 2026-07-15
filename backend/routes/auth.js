const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'stugig_super_secret_key_12345';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Signup Route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isAdmin: user.isAdmin }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Google Sign-In Route — Real GIS verification (not mocked)
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    
    console.log('[DEBUG] [/api/auth/google] Received Google credential request from frontend.');
    if (credential) {
      console.log(`[DEBUG] [/api/auth/google] ID Token starts with: ${credential.substring(0, 20)}...`);
    }

    if (!credential) {
      return res.status(400).json({ message: 'Google credential token is required.' });
    }

    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: 'GOOGLE_CLIENT_ID is not configured on the server.' });
    }

    // Cryptographically verify the signed ID token against Google's public keys
    let ticket;
    try {
      console.log('[DEBUG] [/api/auth/google] Initializing cryptographic signature check against Google public keys...');
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      console.log('[DEBUG] [/api/auth/google] Signature validation succeeded.');
    } catch (verifyErr) {
      console.error('[ERROR] [/api/auth/google] Google token verification failed:', verifyErr.message);
      return res.status(401).json({ message: 'Invalid Google credential. Verification failed.' });
    }

    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    console.log(`[DEBUG] [/api/auth/google] Verified Payload - Email: ${email}, Name: ${name}, Sub (Google ID): ${sub}`);

    // Look up existing user or create a new one
    let user = await User.findOne({ email });

    if (!user) {
      console.log(`[DEBUG] [/api/auth/google] User with email ${email} not found. Creating new user record...`);
      // Generate a random placeholder password — Google users never log in with a password
      const crypto = require('crypto');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(crypto.randomUUID(), salt);

      user = new User({
        name: name || email.split('@')[0],
        email,
        password: hashedPassword,
        role: 'Freelancer', // same default as manual signup
      });
      await user.save();
      console.log(`[DEBUG] [/api/auth/google] Created new User document in database with ID: ${user._id}`);
    } else {
      console.log(`[DEBUG] [/api/auth/google] Found existing user with ID: ${user._id}`);
    }

    // Issue the same JWT format as /login so the rest of the app works identically
    const token = jwt.sign(
      { id: user._id, role: user.role, isAdmin: user.isAdmin || false },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    console.log(`[DEBUG] [/api/auth/google] Issuing final app session JWT starting with: ${token.substring(0, 20)}...`);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin || false,
      }
    });
  } catch (error) {
    console.error('[ERROR] [/api/auth/google] Google sign-in error:', error);
    res.status(500).json({ message: 'Server error during Google login' });
  }
});

const authMiddleware = require('../middleware/authMiddleware');

// Get current user details to validate active session
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found in active session database.' });
    res.json(user);
  } catch (err) {
    console.error('Validate session error:', err);
    res.status(550).json({ message: 'Session validation error' });
  }
});

module.exports = router;
