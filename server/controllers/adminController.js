import User from '../models/User.js'

const adminCtrl = {
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find().select('-password');
            res.json(users);
        } catch (error) {
            res.status(500).json({error : error.message})
        }
    },
    updateUserRole: async (req, res) =>{
        const {userId} = req.params
        const {role} = req.body;
        try {
            const user = await User.findByIdAndUpdate(
                userId,
                {role},
                {new: true}).select('-password');
            if(!user) return res.status(404).json({msg : 'User not found'});
            res.json(user);
        } catch (error) {
            res.status(500).json({error : error.message})
        }
    },
    getUserAttendance: async (req, res) => {
        try {
            const records = await AttendanceRecord.find({ user: req.user.userId });
            res.json(records);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    deleteUser: async (req, res) => {
        const { userId } = req.params;
        try {
            const user = await User.findByIdAndDelete(userId);
            if (!user) return res.status(404).json({ msg: 'User not found' });
            res.json({ msg: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    generateReport: async (req, res) => {
        const { startDate, endDate, userId, locationId } = req.body;
        try {
            const query = {};
            if (startDate) query.check_in_time = { $gte: new Date(startDate) };
            if (endDate) query.check_in_time = { $lte: new Date(endDate) };
            if (userId) query.user = userId;
            if (locationId) query.location = locationId;

            const records = await AttendanceRecord.find(query).populate('user location');
            res.json(records);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

};

export default adminCtrl;