import Organization from '../models/Organization.js';
import User from '../models/User.js';

const organizationCtrl = {
    registerOrganization: async (req, res) => {
        const { name, code, address } = req.body;
        try {
            const existingOrg = await Organization.findOne({ name });
            if (existingOrg) return res.status(400).json({ msg: 'Organization already exists' });

            const newOrganization = new Organization({
                name,
                code,
                address,
                admins: [req.user.userId] 
            });
            await newOrganization.save();

            const organization = await Organization.findOne({ code });
            await User.findByIdAndUpdate(req.user.userId, { organization: organization._id},{new : true});
            res.status(201).json(newOrganization);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    joinOrganization: async (req, res) => {
        try {
            const { orgCode } = req.body;
            const organization = await Organization.findOne({ code: orgCode.toLowerCase()});
            if (!organization) return res.status(404).json({ msg: 'Organization not found' });

            console.log(organization);
            
            await User.findByIdAndUpdate(req.user.userId, { organization: organization._id },{new : true});

            res.json({ msg: `Joined organization ${organization.name}` });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    listOrganizations: async (req, res) => {
        try {
            const organizations = await Organization.find().select('name code');
            res.json(organizations);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

};

export default organizationCtrl;
