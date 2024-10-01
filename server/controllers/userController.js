import User from "../models/User.js";
import bcrypt from "bcrypt"

const userCtrl = {
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.userId).select("-password");
      if (!user) return res.status(404).json({ msg: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  updateProfile: async (req, res) => {
    const { name, email } = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            {name, email},
            {new: true}
        ).select('-password');
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({error: error.message})
    }
  },
  changePassword: async(req, res) => {
    const{currentPassword, newPassword} = req.body;
    try {
        const user = await User.findById(req.user.userId);
        if(!user) return res.status(404).json({msg : "User not found"});

        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if(!isMatch) return res.status(400).json({msg: "Current password is incorrect"});

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt)

        await user.save();

        res.json({ msg: "Password Updated successfully"})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
  }
};

export default userCtrl
