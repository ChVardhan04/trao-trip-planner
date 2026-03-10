"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import Navbar from "../../components/Navbar";
import NewTripForm from "../../components/NewTripForm";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      api
        .getTrips()
        .then(setTrips)
        .catch(console.error)
        .finally(() => setLoadingTrips(false));
    }
  }, [user]);

  async function handleDelete(tripId) {
    if (!confirm("Delete this trip?")) return;
    await api.deleteTrip(tripId);
    setTrips((prev) => prev.filter((t) => t._id !== tripId));
  }

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-sand-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display text-gray-800">Your Trips</h1>
            <p className="text-gray-500 font-body mt-1">Plan, explore, and remember</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + New Trip
          </button>
        </div>

        {loadingTrips ? (
          <p className="text-gray-400 font-body">Loading your trips...</p>
        ) : trips.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">🗺️</div>
            <h2 className="text-xl font-display text-gray-700 mb-2">No trips yet</h2>
            <p className="text-gray-500 font-body mb-6">Create your first AI-generated itinerary</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              Plan a trip
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <div key={trip._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-display text-gray-800">{trip.destination}</h3>
                    <p className="text-sm text-gray-500 font-body">
                      {trip.days} days · {trip.budget} budget
                    </p>
                  </div>
                  <span className="text-2xl">✈️</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {trip.interests.slice(0, 3).map((i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-sand-100 text-sand-600 text-xs rounded-full font-body"
                    >
                      {i}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Link href={`/trip/${trip._id}`} className="btn-primary text-sm py-1.5 flex-1 text-center">
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(trip._id)}
                    className="btn-secondary text-sm py-1.5 px-3 text-red-500 border-red-200 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && <NewTripForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
