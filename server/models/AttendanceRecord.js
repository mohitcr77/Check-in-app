import { Schema, model } from 'mongoose';

const AttendanceRecordSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    location: {
        type: Schema.Types.ObjectId,
        ref: "Location",
        required: true,
    },
    check_in_time: {
        type: Date,
        required: true,
    },
    check_out_time: {
        type: Date,
        default: null,
    },
    // Security metadata for fraud detection
    check_in_metadata: {
        coordinates: {
            latitude: Number,
            longitude: Number,
            accuracy: Number,
        },
        device: {
            deviceId: String,
            deviceName: String,
            osName: String,
            osVersion: String,
            appVersion: String,
        },
        isMockLocation: {
            type: Boolean,
            default: false
        },
        isAutomatic: {
            type: Boolean,
            default: false
        },
        ipAddress: String,
        riskScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    },
    check_out_metadata: {
        coordinates: {
            latitude: Number,
            longitude: Number,
            accuracy: Number,
        },
        device: {
            deviceId: String,
            deviceName: String,
            osName: String,
            osVersion: String,
            appVersion: String,
        },
        isMockLocation: {
            type: Boolean,
            default: false
        },
        isAutomatic: {
            type: Boolean,
            default: false
        },
        ipAddress: String,
        riskScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    },
    // Flags for admin review
    flagged: {
        type: Boolean,
        default: false
    },
    flagReason: String,
    adminReviewed: {
        type: Boolean,
        default: false
    },
    adminNotes: String,
},{
    timestamps: true
});

const AttendanceRecord = model("AttendanceRecord", AttendanceRecordSchema);

export default AttendanceRecord;