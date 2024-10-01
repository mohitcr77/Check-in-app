import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
    name:{
        type: String,
        required : true,
        unique: true,
        trim: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    address: {
        type: String,
        require: true,
    },
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
},{
    timestamps: true
});

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization