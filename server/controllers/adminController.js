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
            // SECURITY FIX: Validate role value
            const allowedRoles = ['employee', 'admin'];
            if (!allowedRoles.includes(role)) {
                return res.status(400).json({ msg: 'Invalid role' });
            }

            // SECURITY FIX: Ensure user belongs to admin's organization
            const user = await User.findById(userId).populate('organization');
            if (!user) return res.status(404).json({ msg: 'User not found' });

            // Check organization scope
            if (user.organization && user.organization._id.toString() !== req.user.organization.toString()) {
                return res.status(403).json({ msg: 'You can only modify users in your organization' });
            }

            user.role = role;
            await user.save();

            res.json(user);
        } catch (error) {
            res.status(500).json({error : error.message})
        }
    },
    getUserAttendance: async (req, res) => {
        try {
            const {userId} = req.params
            const {_id} = req.user.organization;

            // SECURITY FIX: Verify user belongs to admin's organization
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }

            if (user.organization && user.organization.toString() !== _id.toString()) {
                return res.status(403).json({ msg: 'You can only view attendance for users in your organization' });
            }

            const records = await AttendanceRecord.find({ user:userId })
                .populate('location', 'name')
                .select('check_in_time check_out_time location')
                .sort({ check_in_time: -1 });
            res.json(records);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    deleteUser: async (req, res) => {
        const { userId } = req.params;
        try {
            // SECURITY FIX: Verify user belongs to admin's organization before deletion
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ msg: 'User not found' });

            // Check organization scope
            if (user.organization && user.organization.toString() !== req.user.organization.toString()) {
                return res.status(403).json({ msg: 'You can only delete users in your organization' });
            }

            // Prevent admin from deleting themselves
            if (user._id.toString() === req.user.userId.toString()) {
                return res.status(400).json({ msg: 'You cannot delete your own account' });
            }

            await User.findByIdAndDelete(userId);
            res.json({ msg: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    generateReport: async (req, res) => {
        const { startDate, endDate, userId, locationId } = req.body;
        try {
            // SECURITY FIX: Validate input and enforce organization scope
            const query = {};

            // Build date range query
            if (startDate && endDate) {
                query.check_in_time = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            } else if (startDate) {
                query.check_in_time = { $gte: new Date(startDate) };
            } else if (endDate) {
                query.check_in_time = { $lte: new Date(endDate) };
            }

            // SECURITY FIX: Validate userId belongs to admin's organization
            if (userId) {
                const user = await User.findById(userId);
                if (!user || user.organization.toString() !== req.user.organization.toString()) {
                    return res.status(403).json({ msg: 'Invalid user or user not in your organization' });
                }
                query.user = userId;
            } else {
                // If no userId provided, get all users from admin's organization
                const orgUsers = await User.find({ organization: req.user.organization }).select('_id');
                query.user = { $in: orgUsers.map(u => u._id) };
            }

            // SECURITY FIX: Validate locationId belongs to admin's organization
            if (locationId) {
                const location = await Location.findById(locationId);
                if (!location || location.organization.toString() !== req.user.organization.toString()) {
                    return res.status(403).json({ msg: 'Invalid location or location not in your organization' });
                }
                query.location = locationId;
            }

            const records = await AttendanceRecord.find(query)
                .populate('user', 'name email')
                .populate('location', 'name')
                .sort({ check_in_time: -1 });

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