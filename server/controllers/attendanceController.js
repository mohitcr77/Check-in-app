import AttendanceRecord from "../models/AttendanceRecord.js";
import Location from "../models/Location.js";
import mongoose from "mongoose";

// Calculate risk score based on various factors
const calculateRiskScore = (metadata) => {
    let score = 0;

    // Mock location detected
    if (metadata.isMockLocation) score += 100;

    // Poor GPS accuracy (> 50m)
    if (metadata.coordinates?.accuracy > 50) score += 20;

    // No device info provided
    if (!metadata.device?.deviceId) score += 30;

    // Different device than usual (would need history check)
    // This can be enhanced with device tracking

    return Math.min(score, 100);
};

const attendanceController = {
    checkIn: async (req, res) => {
        const { locationId, latitude, longitude, isAutomatic, deviceInfo, isMockLocation } = req.body;
        try {
            const location = await Location.findOne({ _id: locationId, organization: req.user.organization });
            if (!location) return res.status(404).json({ msg: 'Location not found in your organization' });

            // Validate distance if coordinates are provided
            let accuracy = null;
            if (latitude && longitude) {
                const distance = getDistanceFromLatLonInKm(location.latitude, location.longitude, latitude, longitude);
                // Convert radius from meters to kilometers for comparison
                const radiusInKm = location.radius_meters / 1000;

                if (distance > radiusInKm) {
                    return res.status(400).json({
                        msg: 'You are not within the defined perimeter',
                        distance: `${(distance * 1000).toFixed(0)}m away`,
                        required: `Within ${location.radius_meters}m`
                    });
                }

                // Extract accuracy if provided
                accuracy = req.body.accuracy;
            } else if (!isAutomatic) {
                // For manual check-ins, coordinates are required
                return res.status(400).json({ msg: 'Location coordinates are required for manual check-in' });
            }

            // Check for existing active check-in
            const recordSearch = await AttendanceRecord.findOne({
                user: req.user.userId,
                location: location._id,
                check_out_time: null
            }).sort({ check_in_time: -1 });

            if (recordSearch) {
                return res.status(400).json({
                    msg: 'You have already checked-in',
                    existingCheckIn: recordSearch.check_in_time
                });
            }

            // Build security metadata
            const metadata = {
                coordinates: latitude && longitude ? {
                    latitude,
                    longitude,
                    accuracy: accuracy || null
                } : null,
                device: deviceInfo || {},
                isMockLocation: isMockLocation || false,
                isAutomatic: isAutomatic || false,
                ipAddress: req.ip || req.connection.remoteAddress,
                riskScore: 0
            };

            // Calculate risk score
            metadata.riskScore = calculateRiskScore(metadata);

            const record = new AttendanceRecord({
                user: req.user.userId,
                location: location._id,
                check_in_time: new Date(),
                check_in_metadata: metadata,
                flagged: metadata.riskScore > 50,
                flagReason: metadata.riskScore > 50 ? 'High risk score detected' : null
            });
            await record.save();

            res.json({
                ...record.toObject(),
                locationName: location.name,
                isAutomatic: !!isAutomatic
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    checkOut: async (req, res) => {
        const { locationId, latitude, longitude, isAutomatic, deviceInfo, isMockLocation } = req.body;
        try {

            if (!mongoose.Types.ObjectId.isValid(locationId)) {
                return res.status(400).json({ error: "Invalid location ID format" });
            }

            const location = await Location.findOne({ _id: locationId, organization: req.user.organization });
            if (!location) return res.status(404).json({ msg: 'Location not found in your organization' });

            // Validate distance if coordinates are provided
            let accuracy = null;
            if (latitude && longitude) {
                const distance = getDistanceFromLatLonInKm(location.latitude, location.longitude, latitude, longitude);
                // Convert radius from meters to kilometers for comparison
                const radiusInKm = location.radius_meters / 1000;

                if (distance > radiusInKm) {
                    return res.status(400).json({
                        msg: 'You are not within the defined perimeter to check out',
                        distance: `${(distance * 1000).toFixed(0)}m away`,
                        required: `Within ${location.radius_meters}m`
                    });
                }

                accuracy = req.body.accuracy;
            } else if (!isAutomatic) {
                // For manual check-outs, coordinates are required
                return res.status(400).json({ msg: 'Location coordinates are required for manual check-out' });
            }

            const record = await AttendanceRecord.findOne({
                user: req.user.userId,
                location: location._id,
                check_out_time: null
            }).sort({ check_in_time: -1 });

            if (!record) {
                return res.status(400).json({ msg: 'No active check-in found for this location' });
            }

            // Build security metadata for check-out
            const metadata = {
                coordinates: latitude && longitude ? {
                    latitude,
                    longitude,
                    accuracy: accuracy || null
                } : null,
                device: deviceInfo || {},
                isMockLocation: isMockLocation || false,
                isAutomatic: isAutomatic || false,
                ipAddress: req.ip || req.connection.remoteAddress,
                riskScore: 0
            };

            // Calculate risk score
            metadata.riskScore = calculateRiskScore(metadata);

            record.check_out_time = new Date();
            record.check_out_metadata = metadata;

            // Flag if checkout is also suspicious
            if (metadata.riskScore > 50 && !record.flagged) {
                record.flagged = true;
                record.flagReason = 'High risk score detected on check-out';
            }

            await record.save();

            // Calculate time spent
            const timeSpent = Math.floor((record.check_out_time - record.check_in_time) / 1000 / 60); // in minutes

            res.json({
                ...record.toObject(),
                locationName: location.name,
                timeSpentMinutes: timeSpent,
                isAutomatic: !!isAutomatic
            });
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
