import Location from '../models/Location.js';
import Organization from '../models/Organization.js';
import mongoose from 'mongoose';
const locationCtrl = {
    createLocation: async(req, res)=>{
        try{
            const {name, latitude, longitude, radius_meters} = req.body;

            // console.log(req.user);
            
            const organization = await Organization.findById(req.user.organization);
            if (!organization) {
                return res.status(404).json({ msg: 'Organization not found' });
            }
            

            const newLocation = new Location({
                name,
                latitude,
                longitude,
                radius_meters,
                organization: organization._id
            });

            const savedLocation = await newLocation.save();
            res.status(201).json(savedLocation);
        } catch(error){
            return res.status(404).json({ msg: 'Error while creating Location' });
        }
    },

    updateLocation: async(req, res)=>{
        try{
            const {locationId} = req.params
            const {name, latitude, longitude, radius_meters} = req.body;

            
            if (!mongoose.Types.ObjectId.isValid(locationId)) {
                return res.status(400).json({ error: "Location not found" });
            }
            const getLoc = await Location.findById(locationId)

            if(!getLoc)
                return res.status(404).json({ msg: 'Location not found' });

            

            const updatedLocation = await Location.findByIdAndUpdate(
                locationId,
                {
                name,
                latitude,
                longitude,
                radius_meters
            },{new: true} 
        );

        if (!updatedLocation) {
            return res.status(404).json({ msg: 'Error while updating Location' });
          }
    
          res.status(200).json(updatedLocation);
        } catch(error){
            res.status(500).json({ error: error.message });
        }
    },

    getLocationById: async(req, res)=>{
        try{
            const {locationId} = req.params

            if (!mongoose.Types.ObjectId.isValid(locationId)) {
                return res.status(400).json({ msg: "Location not found" });
            }

            const location = await Location.findById(locationId);

      if (!location) {
        return res.status(404).json({ msg: 'Location not found' });
      }

      res.json(location);
        } catch(error){
            res.status(500).json({ error: error.message });
        }
    },
    //gets the location associated with the admin
    getLocations: async (req, res) => {
        try {
            const locations = await Location.find({organization : req.organization.user});
            res.json(locations);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    deleteLocation: async (req, res) => {
        const { locationId } = req.params;
        try {
            const location = await Location.findByIdAndDelete(locationId);
            if (!location) return res.status(404).json({ msg: 'Location not found' });
            res.json({ msg: 'Location deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    getOfficeLocation: async (req, res) => {
        try {
            const { organization } = req.user;
            if (!organization) {
                return res.status(400).json({ msg: 'Organization not found for the user.' });
              }
              const officeLocation = await Location.findOne({ organization });
              if (!officeLocation) {
                return res.status(404).json({ msg: 'Office location not found.' });
              }
          
              res.json(officeLocation);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    getOrganizationLocations: async (req, res) => {
        try {
            const {organization} = req.user;
            
            if(!organization) return res.status(400).json({ msg: 'Organization not found.' });

            const locations = await Location.find({organization});
            // console.log(locations);
            
            res.json(locations);

        } catch (error) {
            res.status(500).json({error: error.message });
        }
    }
};

export default locationCtrl;