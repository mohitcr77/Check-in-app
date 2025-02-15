import AttendanceRecord from "../models/AttendanceRecord.js";
import Location from "../models/Location.js";
import mongoose from "mongoose";

const attendanceController = {
    checkIn: async (req, res) => {
        const { locationId, latitude, longitude } = req.body;
        try {
            const location = await Location.findOne({ _id: locationId, organization: req.user.organization });
            if (!location) return res.status(404).json({ msg: 'Location not found in your organization' });


            const distance = getDistanceFromLatLonInKm(location.latitude, location.longitude, latitude, longitude);
            if (distance > location.radius_meters) {
                return res.status(400).json({ msg: 'You are not within the defined perimeter' });
            }

            const recordSearch = await AttendanceRecord.findOne({
                user: req.user.userId,
                location: location._id,
                check_out_time: null
            }).sort({ check_in_time: -1 });
            // console.log(recordSearch);
            
            if (recordSearch) {
                return res.status(400).json({ msg: 'You have already checked-in' });
            }

            const record = new AttendanceRecord({
                user: req.user.userId,
                location: location._id,
                check_in_time: new Date(),
            });
            await record.save();

            res.json(record);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    checkOut: async (req, res) => {
        const { locationId, latitude, longitude } = req.body;
        try {

            if (!mongoose.Types.ObjectId.isValid(locationId)) {
                return res.status(400).json({ error: "Invalid location ID format" });
            }

            const location = await Location.findOne({ _id: locationId, organization: req.user.organization });
            if (!location) return res.status(404).json({ msg: 'Location not found in your organization' });
            

            const distance = getDistanceFromLatLonInKm(location.latitude, location.longitude, latitude, longitude);
            if (distance > location.radius_meters) {
                return res.status(400).json({ msg: 'You are not within the defined perimeter to check out' });
            }

            // console.log(distance);
            const record = await AttendanceRecord.findOne({
                user: req.user.userId,
                location: location._id,
                check_out_time: null
            }).sort({ check_in_time: -1 });
            
            if (!record) {
                return res.status(400).json({ msg: 'No active check-in found for this location' });
            }

            record.check_out_time = new Date();
            await record.save();

            res.json(record);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    getUserAttendance: async (req, res) => {
        try {
            const records = await AttendanceRecord.find({ user: req.user.userId }).populate('location');
            res.json(records);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    
};

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);  // deg2rad below
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

export default attendanceController;
