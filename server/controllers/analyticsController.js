import AttendanceRecord from "../models/AttendanceRecord.js";
import User from "../models/User.js";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, differenceInMinutes } from "date-fns";

const analyticsController = {
    // Get user's work-life balance metrics
    getUserAnalytics: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { period = 'week' } = req.query; // week, month, or custom

            let startDate, endDate;
            const now = new Date();

            if (period === 'week') {
                startDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday
                endDate = endOfWeek(now, { weekStartsOn: 1 });
            } else if (period === 'month') {
                startDate = startOfMonth(now);
                endDate = endOfMonth(now);
            } else {
                // Default to last 7 days
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                endDate = now;
            }

            // Fetch attendance records
            const records = await AttendanceRecord.find({
                user: userId,
                check_in_time: { $gte: startDate, $lte: endDate },
                check_out_time: { $ne: null } // Only completed sessions
            }).populate('location', 'name').sort({ check_in_time: 1 });

            // Calculate metrics
            const analytics = calculateUserAnalytics(records, period);

            res.json(analytics);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get team analytics (admin only)
    getTeamAnalytics: async (req, res) => {
        try {
            const organizationId = req.user.organization;
            const { period = 'week' } = req.query;

            let startDate, endDate;
            const now = new Date();

            if (period === 'week') {
                startDate = startOfWeek(now, { weekStartsOn: 1 });
                endDate = endOfWeek(now, { weekStartsOn: 1 });
            } else if (period === 'month') {
                startDate = startOfMonth(now);
                endDate = endOfMonth(now);
            } else {
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                endDate = now;
            }

            // Get all users in organization
            const orgUsers = await User.find({ organization: organizationId }).select('_id name email');

            // Get all attendance records for these users
            const records = await AttendanceRecord.find({
                user: { $in: orgUsers.map(u => u._id) },
                check_in_time: { $gte: startDate, $lte: endDate },
                check_out_time: { $ne: null }
            }).populate('user', 'name email').populate('location', 'name');

            // Calculate team metrics
            const teamAnalytics = calculateTeamAnalytics(records, orgUsers, period);

            res.json(teamAnalytics);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get flagged attendance records (admin only)
    getFlaggedRecords: async (req, res) => {
        try {
            const organizationId = req.user.organization;

            // Get all users in organization
            const orgUsers = await User.find({ organization: organizationId }).select('_id');

            // Get flagged records
            const flaggedRecords = await AttendanceRecord.find({
                user: { $in: orgUsers.map(u => u._id) },
                flagged: true,
                adminReviewed: false
            })
                .populate('user', 'name email')
                .populate('location', 'name')
                .sort({ check_in_time: -1 })
                .limit(50);

            res.json(flaggedRecords);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Review flagged record (admin only)
    reviewFlaggedRecord: async (req, res) => {
        try {
            const { recordId } = req.params;
            const { adminNotes, approved } = req.body;

            const record = await AttendanceRecord.findById(recordId);
            if (!record) {
                return res.status(404).json({ msg: 'Record not found' });
            }

            record.adminReviewed = true;
            record.adminNotes = adminNotes;

            if (approved) {
                record.flagged = false; // Remove flag if approved
            }

            await record.save();

            res.json({ msg: 'Record reviewed successfully', record });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

// Helper function to calculate user analytics
function calculateUserAnalytics(records, period) {
    if (records.length === 0) {
        return {
            totalHours: 0,
            averageHoursPerDay: 0,
            totalDaysWorked: 0,
            overtimeHours: 0,
            averageArrivalTime: null,
            longestDay: null,
            shortestDay: null,
            workPattern: [],
            healthScore: 100,
            suggestions: ['No attendance data available for this period']
        };
    }

    let totalMinutes = 0;
    const dailyHours = {};
    const arrivalTimes = [];

    records.forEach(record => {
        if (record.check_out_time) {
            const minutes = differenceInMinutes(
                new Date(record.check_out_time),
                new Date(record.check_in_time)
            );
            totalMinutes += minutes;

            const date = format(new Date(record.check_in_time), 'yyyy-MM-DD');
            dailyHours[date] = (dailyHours[date] || 0) + minutes;

            // Track arrival times (hour of day)
            const arrivalHour = new Date(record.check_in_time).getHours();
            arrivalTimes.push(arrivalHour);
        }
    });

    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const daysWorked = Object.keys(dailyHours).length;
    const averageHoursPerDay = Math.round((totalHours / daysWorked) * 10) / 10;

    // Calculate overtime (assuming 8 hour standard day)
    const standardHours = period === 'week' ? 40 : 160; // 40/week, 160/month
    const overtimeHours = Math.max(0, Math.round((totalHours - standardHours) * 10) / 10);

    // Average arrival time
    const avgArrivalHour = Math.round(arrivalTimes.reduce((a, b) => a + b, 0) / arrivalTimes.length);
    const averageArrivalTime = `${avgArrivalHour}:${String(Math.round((arrivalTimes.reduce((a, b) => a + b, 0) % arrivalTimes.length) * 60)).padStart(2, '0')}`;

    // Find longest and shortest days
    const dailyHoursArray = Object.entries(dailyHours).map(([date, minutes]) => ({
        date,
        hours: Math.round((minutes / 60) * 10) / 10
    }));
    dailyHoursArray.sort((a, b) => b.hours - a.hours);

    const longestDay = dailyHoursArray[0];
    const shortestDay = dailyHoursArray[dailyHoursArray.length - 1];

    // Calculate health score (100 = perfect balance)
    let healthScore = 100;
    if (averageHoursPerDay > 9) healthScore -= 20; // Working too much
    if (averageHoursPerDay < 6) healthScore -= 10; // Working too little
    if (overtimeHours > 10) healthScore -= 20; // Too much overtime
    if (longestDay.hours > 12) healthScore -= 15; // Very long days

    // Generate suggestions
    const suggestions = [];
    if (averageHoursPerDay > 9) {
        suggestions.push('You are working more than recommended. Consider work-life balance.');
    }
    if (overtimeHours > 10) {
        suggestions.push(`You have ${overtimeHours}h overtime. Take breaks to avoid burnout.`);
    }
    if (longestDay.hours > 11) {
        suggestions.push(`Your longest day was ${longestDay.hours}h. Try to maintain consistent hours.`);
    }
    if (avgArrivalHour < 8) {
        suggestions.push('You are an early bird! Great for productivity.');
    }
    if (suggestions.length === 0) {
        suggestions.push('Great work-life balance! Keep it up.');
    }

    return {
        totalHours,
        averageHoursPerDay,
        totalDaysWorked: daysWorked,
        overtimeHours,
        averageArrivalTime,
        longestDay,
        shortestDay,
        workPattern: dailyHoursArray,
        healthScore: Math.max(0, healthScore),
        suggestions
    };
}

// Helper function to calculate team analytics
function calculateTeamAnalytics(records, users, period) {
    const userStats = {};

    // Initialize stats for each user
    users.forEach(user => {
        userStats[user._id.toString()] = {
            userId: user._id,
            name: user.name,
            email: user.email,
            totalHours: 0,
            daysWorked: 0,
            avgHoursPerDay: 0,
            isOverworked: false,
            healthScore: 100
        };
    });

    // Calculate stats for each user
    records.forEach(record => {
        const userId = record.user._id.toString();
        if (userStats[userId] && record.check_out_time) {
            const hours = differenceInMinutes(
                new Date(record.check_out_time),
                new Date(record.check_in_time)
            ) / 60;
            userStats[userId].totalHours += hours;
        }
    });

    // Finalize calculations
    Object.values(userStats).forEach(stat => {
        if (stat.totalHours > 0) {
            stat.totalHours = Math.round(stat.totalHours * 10) / 10;
            stat.daysWorked = Math.ceil(stat.totalHours / 8); // Rough estimate
            stat.avgHoursPerDay = Math.round((stat.totalHours / Math.max(stat.daysWorked, 1)) * 10) / 10;
            stat.isOverworked = stat.avgHoursPerDay > 9;

            if (stat.avgHoursPerDay > 10) stat.healthScore -= 30;
            else if (stat.avgHoursPerDay > 9) stat.healthScore -= 15;
        }
    });

    const teamArray = Object.values(userStats).filter(s => s.totalHours > 0);
    teamArray.sort((a, b) => b.totalHours - a.totalHours);

    // Calculate team averages
    const teamAvgHours = teamArray.reduce((sum, s) => sum + s.avgHoursPerDay, 0) / teamArray.length;
    const overworkedCount = teamArray.filter(s => s.isOverworked).length;

    return {
        teamMembers: teamArray,
        teamAverageHoursPerDay: Math.round(teamAvgHours * 10) / 10,
        overworkedEmployees: overworkedCount,
        totalEmployeesTracked: teamArray.length,
        healthAlert: overworkedCount > teamArray.length * 0.3 // More than 30% overworked
    };
}

export default analyticsController;
