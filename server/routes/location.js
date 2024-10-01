import {Router} from "express";
import locationCtrl from "../controllers/locationController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
const router = Router();

router.post('/', authMiddleware, adminMiddleware, locationCtrl.createLocation);
router.put('/:locationId', authMiddleware, adminMiddleware, locationCtrl.updateLocation);
router.get('/', authMiddleware, locationCtrl.getLocations);
router.delete('/:locationId', authMiddleware, adminMiddleware, locationCtrl.deleteLocation);
router.get('/office', authMiddleware, locationCtrl.getOfficeLocation);
router.get('/organization', authMiddleware, locationCtrl.getOrganizationLocations)

export default router;