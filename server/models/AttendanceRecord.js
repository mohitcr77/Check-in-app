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
},{
    timestamps: true
});

const AttendanceRecord = model("AttendanceRecord", AttendanceRecordSchema);

export default AttendanceRecord;