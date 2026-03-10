const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/auth/me"),

  generateTrip: (body) => request("/trips/generate", { method: "POST", body: JSON.stringify(body) }),
  getTrips: () => request("/trips"),
  getTrip: (id) => request(`/trips/${id}`),
  deleteTrip: (id) => request(`/trips/${id}`, { method: "DELETE" }),

  addActivity: (tripId, dayNumber, body) =>
    request(`/trips/${tripId}/day/${dayNumber}/add-activity`, { method: "PATCH", body: JSON.stringify(body) }),

  removeActivity: (tripId, dayNumber, activityId) =>
    request(`/trips/${tripId}/day/${dayNumber}/remove-activity/${activityId}`, { method: "PATCH" }),

  regenerateDay: (tripId, dayNumber, body) =>
    request(`/trips/${tripId}/day/${dayNumber}/regenerate`, { method: "POST", body: JSON.stringify(body) }),

  updateNotes: (tripId, notes) =>
    request(`/trips/${tripId}/notes`, { method: "PATCH", body: JSON.stringify({ notes }) }),
};
