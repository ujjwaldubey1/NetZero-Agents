import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { validateRequired, isValidEmail, validatePassword } from '../utils/validator.js';

/**
 * Register a new user
 */
export const register = async (req, res) => {
  try {
    const { email, password, role, organizationName, vendorName } = req.body;
    
    // Validate required fields
    const requiredValidation = validateRequired(req.body, ['email', 'password', 'role']);
    if (!requiredValidation.valid) {
      return res.status(400).json({ error: `Missing fields: ${requiredValidation.missing.join(', ')}` });
    }
    
    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.errors.join(', ') });
    }
    
    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ email, passwordHash, role, organizationName, vendorName });
    await user.save();
    
    res.json({ message: 'Registered', userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Login user
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken({ userId: user._id, role: user.role });
    
    res.json({
      token,
      user: {
        id: user._id,
        role: user.role,
        email: user.email,
        organizationName: user.organizationName,
        vendorName: user.vendorName,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


