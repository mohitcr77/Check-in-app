import User from "../models/User.js";
import bcrypt from "bcrypt";
import s3 from '../config/awsConfig.js'
const userCtrl = {
  getProfile: async (req, res) => {
    try {
      // const {userId} = req.user
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
  },
  uploadProfileImage: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Please upload an image file." });
      }

      // Upload image to S3
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `profile-images/${req.user.userId}-${Date.now()}`, // Unique file name
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      };

      const s3Response = await s3.upload(params).promise();

      // Update user's profile image URL in database
      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { profileImage: s3Response.Location },
        { new: true }
      );

      res.status(200).json({
        msg: "Profile image uploaded successfully",
        profileImage: user.profileImage,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  },
};

export default userCtrl
