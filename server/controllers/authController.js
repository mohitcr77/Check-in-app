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
      console.log("accessed");
      
      let user = await User.findOne({ email }).populate('organization');
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }
      
      const password_hash = await hash(password, 10);
      user = new User({ name, email, password: password_hash, role });
      // console.log(user);
      await user.save();

      const accessToken = jwt.sign({ userId: user._id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30d' });

res.status(201).json({ user, accessToken });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email }).populate('organization'); 
      if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
      
      const isMatch = await compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
      const accessToken = jwt.sign({ userId: user._id, role: user.role, 
        organization: user.organization, name: user.name, email: user.email, joined: user.createdAt  }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30d' });

res.status(201).json({ user, accessToken });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  refreshToken: async (req, res) => {
    const { refreshToken } = req.body;
  
    if (!refreshToken) return res.status(401).json({ msg: 'Refresh token is required' });
  
    try {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ msg: 'Invalid refresh token' });
  
        const accessToken = jwt.sign({ userId: user.userId, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
  
        res.json({ accessToken });
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default authCtrl;
