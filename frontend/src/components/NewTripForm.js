"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";

const INTERESTS = ["Food", "Culture", "Adventure", "Shopping", "Nature", "History", "Nightlife", "Wellness"];
const BUDGETS = ["Low", "Medium", "High"];

export default function NewTripForm({ onClose }) {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState("Medium");
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function toggleInterest(interest) {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (interests.length === 0) {
      setError("Please select at least one interest");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const trip = await api.generateTrip({ destination, days: parseInt(days), budget, interests });
      router.push(`/trip/${trip._id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none"
        >
          ×
        </button>

        <h2 className="text-2xl font-display text-gray-800 mb-6">Plan a new trip</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Destination</label>
            <input
              type="text"
              className="input"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Tokyo, Japan"
              required
            />
          </div>

          <div>
            <label className="label">Number of Days</label>
            <input
              type="number"
              className="input"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              min={1}
              max={14}
              required
            />
          </div>

          <div>
            <label className="label">Budget</label>
            <div className="flex gap-2">
              {BUDGETS.map((b) => (
                <button
                  type="button"
                  key={b}
                  onClick={() => setBudget(b)}
                  className={`flex-1 py-2 rounded-xl border font-body font-semibold text-sm transition-colors ${
                    budget === b
                      ? "bg-sand-400 text-white border-sand-400"
                      : "bg-white text-gray-600 border-sand-200 hover:border-sand-400"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Interests</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-full border text-sm font-body font-semibold transition-colors ${
                    interests.includes(interest)
                      ? "bg-sand-400 text-white border-sand-400"
                      : "bg-white text-gray-600 border-sand-200 hover:border-sand-400"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "✨ Generating your itinerary..." : "Generate Itinerary"}
          </button>
        </form>
      </div>
    </div>
  );
}
