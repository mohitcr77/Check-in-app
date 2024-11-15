import User from '../models/User.js'
import AttendanceRecord from '../models/AttendanceRecord.js'
import { startOfDay, endOfDay } from "date-fns";
import Location from '../models/Location.js'
const adminCtrl = {
    getAllUsers: async (req, res) => {
        try {
            const {_id} = req.user.organization; 
            
            const users = await User.find({organization:_id}).select('name profileImage email');
            
            const userNames = users.map(user =>({ name : user.name, profileImage : user.profileImage, email: user.email}));
            res.json(userNames);
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
            const {userId} = req.params
            const {_id} = req.user.organization; 
            
            // const users = await User.find({organization:_id}).select('-password');
            const records = await AttendanceRecord.find({ user:userId }).select('check_in_time check_out_time') .sort({ check_in_time: -1 });
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
    },
        
    getAttendanceByDate :async (req, res) => {
        try {
            const { location, date } = req.query;
    
            const startDate = new Date(`${date}T00:00:00Z`);
            const endDate = new Date(`${date}T23:59:59.999Z`);
    
            const records = await AttendanceRecord.find({
                location,
                check_in_time: { $gte: startDate, $lte: endDate }
            })
            .populate("user", "name email")
            .sort({ check_in_time: -1 });
    
            res.json(records);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    //get office location
        getLocationsByOrganization : async (req, res) => {
            try {
                const { organization } = req.user; 
                const locations = await Location.find({ organization }).select('name _id');
                
                res.json(locations);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }}

};

export default adminCtrl;