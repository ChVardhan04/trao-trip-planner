const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  time: String,
  activity: String,
  description: String,
  estimatedCost: String,
});

const daySchema = new mongoose.Schema({
  dayNumber: Number,
  title: String,
  activities: [activitySchema],
});

const budgetSchema = new mongoose.Schema({
  flights: String,
  accommodation: String,
  food: String,
  activities: String,
  total: String,
});

const hotelSchema = new mongoose.Schema({
  name: String,
  category: String,
  priceRange: String,
  rating: Number,
  highlights: String,
});

const tripSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    destination: { type: String, required: true },
    days: { type: Number, required: true },
    budget: { type: String, required: true },
    interests: [String],
    itinerary: [daySchema],
    budgetEstimate: budgetSchema,
    hotels: [hotelSchema],
    notes: { type: String, default: "" },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);
