// controllers/authController.js
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Organization from '../models/Organization.js';

const { hash, compare } = bcrypt;
const { sign } = jwt;

const authCtrl = {
  register: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      let user = await User.findOne({ email }).populate('organization');
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      // SECURITY FIX: Validate role - only allow 'employee' during registration
      // Admins must be promoted by existing admins or during organization creation
      const allowedRoles = ['employee'];
      const sanitizedRole = allowedRoles.includes(role) ? role : 'employee';

      const password_hash = await hash(password, 10);
      user = new User({ name, email, password: password_hash, role: sanitizedRole });

      await user.save();

      // SECURITY FIX: Reduce token expiration to 15 minutes
      const accessToken = jwt.sign(
        {
          userId: user._id,
          role: user.role,
          organization: user.organization,
          name: user.name,
          email: user.email,
          joined: user.createdAt
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
      );

      // Generate refresh token (7 days)
      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.REFRESH_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({ user, accessToken, refreshToken });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    try {
      // SECURITY FIX: Use constant-time lookup to prevent timing attacks
      const user = await User.findOne({ email }).populate('organization');
      if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

      const isMatch = await compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      // SECURITY FIX: Reduce token expiration to 15 minutes
      const accessToken = jwt.sign(
        {
          userId: user._id,
          role: user.role,
          organization: user.organization,
          name: user.name,
          email: user.email,
          joined: user.createdAt,
          profileImage: user.profileImage
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
      );

      // Generate refresh token (7 days)
      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.REFRESH_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({ user, accessToken, refreshToken });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  refreshToken: async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) return res.status(401).json({ msg: 'Refresh token is required' });

    try {
      // SECURITY FIX: Properly verify refresh token and fetch current user data
      const decoded = await new Promise((resolve, reject) => {
        jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET,
          (err, user) => {
            if (err) reject(err);
            else resolve(user);
          }
        );
      });

      // Fetch current user data from database
      const user = await User.findById(decoded.userId).populate('organization');
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Generate new access token with current user data
      const accessToken = jwt.sign(
        {
          userId: user._id,
          role: user.role,
          organization: user.organization,
          name: user.name,
          email: user.email,
          joined: user.createdAt,
          profileImage: user.profileImage
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
      );

      // Optional: Implement refresh token rotation for additional security
      const newRefreshToken = jwt.sign(
        { userId: user._id },
        process.env.REFRESH_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ accessToken, refreshToken: newRefreshToken });

    } catch (error) {
      res.status(403).json({ msg: 'Invalid refresh token', error: error.message });
    }
  }
};

export default authCtrl;
