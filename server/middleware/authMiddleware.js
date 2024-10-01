import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader) return res.status(400).json({ msg: "No token provided" });

        const token = authHeader
        if (!token) return res.status(400).json({ msg: "Invalid Authentication" });

        // console.log("Token:", token);

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
            if (err) return res.status(401).json({ msg: 'Invalid Authentication' });

            const user = await User.findById(decoded.userId).populate('organization');
            if (!user) return res.status(404).json({ msg: 'User not found' });

            // console.log("Verified User:", user);
            req.user = { 
                userId: user._id, 
                role: user.role, 
                organization: user.organization ? user.organization._id : undefined 
            };
            // console.log('Decoded User:', req.user);
            next();
        });

    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};


export default authMiddleware;