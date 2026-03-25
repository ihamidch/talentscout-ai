const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- REGISTER LOGIC ---
exports.register = async (req, res) => {
  console.log("1. 📥 Registration Request Received:", req.body.email);

  try {
    const { name, email, password, role } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    // 2. Email Normalization (Prevents duplicate accounts like Hamid@ and hamid@)
    const normalizedEmail = email.toLowerCase();

    // 3. Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      console.log("❌ User already exists:", normalizedEmail);
      return res.status(400).json({ message: "Email already registered" });
    }

    // 4. Hash Password
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log("2. 🔐 Password Hashed");

    // 5. Create & Save
    const newUser = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'candidate'
    });

    const savedUser = await newUser.save();
    console.log("3. ✅ SUCCESS! User saved with ID:", savedUser._id);

    res.status(201).json({ 
      message: "User registered successfully!", 
      user: { id: savedUser._id, name: savedUser.name, role: savedUser.role } 
    });

  } catch (err) {
    console.error("❌ DATABASE ERROR:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// --- LOGIN LOGIC ---
exports.login = async (req, res) => {
  console.log("1. 🔑 Login Attempt for:", req.body.email);

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // 1. Find the user (Normalizing input email to match DB)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log("❌ User not found in DB");
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    // 2. Compare Hashed Passwords
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("2. 🔐 Password Match Result:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    // 3. Generate JWT Token
    // We include ID and ROLE so the frontend can restrict access
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log("3. ✅ Login Successful for:", user.name);

    res.json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        role: user.role // Helps React decide to show 'Apply' or 'Dashboard'
      }
    });

  } catch (err) {
    console.error("❌ Login Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};