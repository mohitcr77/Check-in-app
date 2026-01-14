import * as Device from 'expo-device';
import * as Application from 'expo-application';
import Constants from 'expo-constants';

/**
 * Get device information for security tracking
 */
export const getDeviceInfo = async () => {
    try {
        const deviceInfo = {
            deviceId: Constants.deviceId || 'unknown',
            deviceName: Device.deviceName || 'unknown',
            osName: Device.osName || 'unknown',
            osVersion: Device.osVersion || 'unknown',
            appVersion: Application.nativeApplicationVersion || '1.0.0',
            brand: Device.brand || 'unknown',
            modelName: Device.modelName || 'unknown',
        };

        return deviceInfo;
    } catch (error) {
        console.error('Error getting device info:', error);
        return {
            deviceId: 'unknown',
            deviceName: 'unknown',
            osName: 'unknown',
            osVersion: 'unknown',
            appVersion: '1.0.0'
        };
    }
};

/**
 * Detect if location is mocked (spoofed)
 * Note: This is a best-effort detection and can be bypassed by sophisticated attackers
 */
export const detectMockLocation = (locationData) => {
    // On iOS, check if location is from simulator or has mock flag
    if (locationData.mocked !== undefined) {
        return locationData.mocked;
    }

    // Additional checks for mock location indicators
    // Low accuracy can indicate mocked locations
    if (locationData.coords?.accuracy && locationData.coords.accuracy > 100) {
        return true; // Potentially mocked due to poor accuracy
    }

    // Check for impossible speed (teleportation)
    // This would require storing last known location and comparing

    return false;
};
