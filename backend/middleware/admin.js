import User from "../models/User.js";


export const updateUserStatus = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;

        if (!['active', 'inactive', 'suspended'].includes(status)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid status. Must be 'active', 'inactive', or 'suspended'"
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { status, updatedAt: new Date() },
            { new: true, select: '-password' }
        );

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "User status updated successfully",
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

export const getUserStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'active' });
        const inactiveUsers = await User.countDocuments({ status: 'inactive' });
        const suspendedUsers = await User.countDocuments({ status: 'suspended' });

        // Users registered in the last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentUsers = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        return res.status(200).json({
            status: "success",
            data: {
                total: totalUsers,
                active: activeUsers,
                inactive: inactiveUsers,
                suspended: suspendedUsers,
                recentSignups: recentUsers
            }
        });
    } catch (error) {
        next(error);
    }
};
