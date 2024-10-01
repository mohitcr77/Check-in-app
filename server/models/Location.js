import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    radius_meters: {
        type: Number,
        required: true,
        min: 1,
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization', 
        required: true,
    }
}, {
    timestamps: true
});

const Location = mongoose.model('Location', locationSchema);

export default Location;
