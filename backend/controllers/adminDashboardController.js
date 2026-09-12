import User from "../models/User.js";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import SellTicket from "../models/SellTicket.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const [userStats, eventStats, bookingStats, revenueStats, pendingSellTickets, recentBookings, recentSellTickets] = await Promise.all([
      User.aggregate([{ $group: { _id: null, totalUsers: { $sum: 1 } } }]),
      Event.aggregate([{ $group: { _id: null, totalEvents: { $sum: 1 } } }]),
      Booking.aggregate([{ $group: { _id: null, totalBookings: { $sum: 1 } } }]),
      Booking.aggregate([{ $group: { _id: null, totalRevenue: { $sum: { $ifNull: ["$totalAmount", "$totalPrice"] } } } }]),
      SellTicket.countDocuments({ status: "Pending" }),
      Booking.find().sort({ createdAt: -1 }).limit(5).populate("user", "name email"),
      SellTicket.find().sort({ createdAt: -1 }).limit(5).populate("user", "name email"),
    ]);

    const totalUsers = userStats[0]?.totalUsers || 0;
    const totalEvents = eventStats[0]?.totalEvents || 0;
    const totalBookings = bookingStats[0]?.totalBookings || 0;
    const totalRevenue = revenueStats[0]?.totalRevenue || 0;

    res.json({
      totalUsers,
      totalEvents,
      totalBookings,
      totalRevenue,
      pendingSellTickets,
      recentBookings,
      recentSellTickets,
      recentContacts: [],
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    res.status(500).json({ message: "Failed to fetch admin dashboard data" });
  }
};
