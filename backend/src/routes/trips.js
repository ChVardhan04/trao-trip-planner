const express = require("express");
const Trip = require("../models/Trip");
const authMiddleware = require("../middleware/auth");
const { generateItinerary, regenerateDay } = require("../controllers/aiController");

const router = express.Router();

router.use(authMiddleware);

router.post("/generate", async (req, res) => {
  const { destination, days, budget, interests } = req.body;

  if (!destination || !days || !budget || !interests) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const aiData = await generateItinerary(destination, days, budget, interests);

    const trip = await Trip.create({
      userId: req.user._id,
      destination,
      days,
      budget,
      interests,
      itinerary: aiData.itinerary,
      budgetEstimate: aiData.budgetEstimate,
      hotels: aiData.hotels,
    });

    res.status(201).json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate itinerary" });
  }
});

router.get("/", async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch trips" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch trip" });
  }
});

router.patch("/:id/day/:dayNumber/add-activity", async (req, res) => {
  const { activity, time, description, estimatedCost } = req.body;

  if (!activity) {
    return res.status(400).json({ error: "Activity name is required" });
  }

  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const day = trip.itinerary.find((d) => d.dayNumber === parseInt(req.params.dayNumber));
    if (!day) return res.status(404).json({ error: "Day not found" });

    day.activities.push({ activity, time: time || "", description: description || "", estimatedCost: estimatedCost || "" });
    await trip.save();

    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: "Failed to add activity" });
  }
});

router.patch("/:id/day/:dayNumber/remove-activity/:activityId", async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const day = trip.itinerary.find((d) => d.dayNumber === parseInt(req.params.dayNumber));
    if (!day) return res.status(404).json({ error: "Day not found" });

    day.activities = day.activities.filter(
      (a) => a._id.toString() !== req.params.activityId
    );
    await trip.save();

    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: "Failed to remove activity" });
  }
});

router.post("/:id/day/:dayNumber/regenerate", async (req, res) => {
  const { instruction } = req.body;

  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const dayNumber = parseInt(req.params.dayNumber);
    const newDay = await regenerateDay(
      trip.destination,
      dayNumber,
      trip.days,
      trip.budget,
      trip.interests,
      instruction
    );

    const dayIndex = trip.itinerary.findIndex((d) => d.dayNumber === dayNumber);
    if (dayIndex === -1) return res.status(404).json({ error: "Day not found" });

    trip.itinerary[dayIndex] = newDay;
    await trip.save();

    res.json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to regenerate day" });
  }
});

router.patch("/:id/notes", async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    trip.notes = req.body.notes || "";
    await trip.save();

    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: "Failed to update notes" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    res.json({ message: "Trip deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete trip" });
  }
});

module.exports = router;
