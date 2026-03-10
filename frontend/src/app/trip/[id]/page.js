"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../lib/api";
import Navbar from "../../../components/Navbar";

export default function TripPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [trip, setTrip] = useState(null);
  const [loadingTrip, setLoadingTrip] = useState(true);
  const [activeTab, setActiveTab] = useState("itinerary");
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const [addActivityDay, setAddActivityDay] = useState(null);
  const [newActivity, setNewActivity] = useState({ activity: "", time: "", description: "" });
  const [regenDay, setRegenDay] = useState(null);
  const [regenInstruction, setRegenInstruction] = useState("");
  const [regenLoading, setRegenLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user && params.id) {
      api
        .getTrip(params.id)
        .then((t) => {
          setTrip(t);
          setNotes(t.notes || "");
        })
        .catch(() => router.push("/dashboard"))
        .finally(() => setLoadingTrip(false));
    }
  }, [user, params.id]);

  async function handleAddActivity(dayNumber) {
    if (!newActivity.activity) return;
    const updated = await api.addActivity(trip._id, dayNumber, newActivity);
    setTrip(updated);
    setAddActivityDay(null);
    setNewActivity({ activity: "", time: "", description: "" });
  }

  async function handleRemoveActivity(dayNumber, activityId) {
    const updated = await api.removeActivity(trip._id, dayNumber, activityId);
    setTrip(updated);
  }

  async function handleRegenerate(dayNumber) {
    setRegenLoading(true);
    try {
      const updated = await api.regenerateDay(trip._id, dayNumber, { instruction: regenInstruction });
      setTrip(updated);
      setRegenDay(null);
      setRegenInstruction("");
    } catch (err) {
      alert(err.message);
    } finally {
      setRegenLoading(false);
    }
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    const updated = await api.updateNotes(trip._id, notes);
    setTrip(updated);
    setSavingNotes(false);
  }

  if (loading || !user || loadingTrip) return null;

  const tabs = ["itinerary", "budget", "hotels", "notes"];

  return (
    <div className="min-h-screen bg-sand-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <Link href="/dashboard" className="text-sm text-sand-500 hover:underline font-body">
              ← Back to trips
            </Link>
            <h1 className="text-3xl font-display text-gray-800 mt-2">{trip.destination}</h1>
            <p className="text-gray-500 font-body">
              {trip.days} days · {trip.budget} budget · {trip.interests.join(", ")}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-sand-100 pb-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 font-body font-semibold text-sm capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-sand-400 text-sand-500"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "budget" ? "💰 Budget" : tab === "hotels" ? "🏨 Hotels" : tab === "notes" ? "📝 Notes" : "🗺 Itinerary"}
            </button>
          ))}
        </div>

        {activeTab === "itinerary" && (
          <div className="space-y-6">
            {trip.itinerary.map((day) => (
              <div key={day.dayNumber} className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-display text-gray-800">
                    Day {day.dayNumber}: {day.title}
                  </h2>
                  <button
                    onClick={() => setRegenDay(day.dayNumber)}
                    className="text-xs btn-secondary py-1 px-3"
                  >
                    🔄 Regenerate
                  </button>
                </div>

                <div className="space-y-3">
                  {day.activities.map((act) => (
                    <div
                      key={act._id}
                      className="flex items-start gap-3 p-3 bg-sand-50 rounded-xl"
                    >
                      <div className="text-xs text-sand-500 font-body font-semibold min-w-[60px] mt-0.5">
                        {act.time || "—"}
                      </div>
                      <div className="flex-1">
                        <p className="font-body font-semibold text-gray-800">{act.activity}</p>
                        {act.description && (
                          <p className="text-sm text-gray-500 font-body">{act.description}</p>
                        )}
                      </div>
                      {act.estimatedCost && (
                        <span className="text-xs text-sand-600 font-body">{act.estimatedCost}</span>
                      )}
                      <button
                        onClick={() => handleRemoveActivity(day.dayNumber, act._id)}
                        className="text-red-400 hover:text-red-600 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {addActivityDay === day.dayNumber ? (
                  <div className="mt-4 p-4 bg-sand-50 rounded-xl space-y-3">
                    <input
                      className="input"
                      placeholder="Activity name *"
                      value={newActivity.activity}
                      onChange={(e) => setNewActivity({ ...newActivity, activity: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <input
                        className="input"
                        placeholder="Time (e.g. 10:00 AM)"
                        value={newActivity.time}
                        onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                      />
                      <input
                        className="input"
                        placeholder="Description"
                        value={newActivity.description}
                        onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAddActivity(day.dayNumber)} className="btn-primary text-sm py-1.5">
                        Add
                      </button>
                      <button onClick={() => setAddActivityDay(null)} className="btn-secondary text-sm py-1.5">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddActivityDay(day.dayNumber)}
                    className="mt-3 text-sm text-sand-500 font-body font-semibold hover:underline"
                  >
                    + Add activity
                  </button>
                )}

                {regenDay === day.dayNumber && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl space-y-3">
                    <p className="text-sm font-body font-semibold text-gray-700">
                      Regenerate Day {day.dayNumber}
                    </p>
                    <input
                      className="input"
                      placeholder='e.g. "More outdoor activities" or "Focus on food"'
                      value={regenInstruction}
                      onChange={(e) => setRegenInstruction(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRegenerate(day.dayNumber)}
                        className="btn-primary text-sm py-1.5"
                        disabled={regenLoading}
                      >
                        {regenLoading ? "Regenerating..." : "Regenerate"}
                      </button>
                      <button onClick={() => setRegenDay(null)} className="btn-secondary text-sm py-1.5">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "budget" && trip.budgetEstimate && (
          <div className="card max-w-md">
            <h2 className="text-xl font-display text-gray-800 mb-4">Estimated Budget</h2>
            <div className="space-y-3">
              {[
                ["✈️ Flights", trip.budgetEstimate.flights],
                ["🏨 Accommodation", trip.budgetEstimate.accommodation],
                ["🍜 Food", trip.budgetEstimate.food],
                ["🎭 Activities", trip.budgetEstimate.activities],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-sand-100">
                  <span className="font-body text-gray-700">{label}</span>
                  <span className="font-body font-semibold text-gray-800">{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-2 bg-sand-100 rounded-xl px-3 mt-2">
                <span className="font-body font-bold text-gray-800">Total Estimated</span>
                <span className="font-display text-xl text-sand-600">{trip.budgetEstimate.total}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "hotels" && (
          <div className="space-y-4">
            {trip.hotels && trip.hotels.length > 0 ? (
              trip.hotels.map((hotel, i) => (
                <div key={i} className="card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-display text-gray-800">{hotel.name}</h3>
                      <p className="text-sm text-gray-500 font-body">{hotel.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-body font-semibold text-sand-600">{hotel.priceRange}</p>
                      <p className="text-sm text-yellow-500">{"★".repeat(Math.round(hotel.rating || 4))}</p>
                    </div>
                  </div>
                  {hotel.highlights && (
                    <p className="text-sm text-gray-600 font-body mt-2">{hotel.highlights}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 font-body">No hotel suggestions available.</p>
            )}
          </div>
        )}

        {activeTab === "notes" && (
          <div className="card max-w-2xl">
            <h2 className="text-xl font-display text-gray-800 mb-4">Trip Notes</h2>
            <textarea
              className="input min-h-[200px] resize-y"
              placeholder="Add notes, reminders, packing lists..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button onClick={handleSaveNotes} className="btn-primary mt-3" disabled={savingNotes}>
              {savingNotes ? "Saving..." : "Save Notes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
