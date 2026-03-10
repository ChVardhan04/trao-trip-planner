# Trao – AI Travel Planner

An AI-powered travel planning web application built as a full-stack assessment project.

---

## Project Overview

Trao lets users generate complete day-by-day travel itineraries using Claude AI. Users provide a destination, trip duration, budget type, and interests. The AI returns a structured itinerary, budget estimate, and hotel suggestions. Users can then edit the plan by adding/removing activities, regenerating specific days, and writing trip notes.

---

## Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | Next.js 14 + Tailwind CSS |
| Backend   | Node.js + Express        |
| Database  | MongoDB + Mongoose       |
| AI        | Anthropic Claude (claude-opus-4) |
| Auth      | JWT (jsonwebtoken) + bcryptjs |

---

## Setup Instructions (Local)

### Prerequisites
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI
- Anthropic API key

### Backend

```bash
cd backend
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

`.env` variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tripplanner
JWT_SECRET=your_secret_here
ANTHROPIC_API_KEY=sk-ant-...
FRONTEND_URL=http://localhost:3000
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Architecture

```
trip-planner/
├── backend/
│   └── src/
│       ├── index.js              # Express entry point
│       ├── models/
│       │   ├── User.js           # User schema
│       │   └── Trip.js           # Trip + itinerary schema
│       ├── routes/
│       │   ├── auth.js           # Register / Login / Me
│       │   └── trips.js          # CRUD + AI endpoints
│       ├── middleware/
│       │   └── auth.js           # JWT verification
│       └── controllers/
│           └── aiController.js   # Anthropic API calls
└── frontend/
    └── src/
        ├── app/                  # Next.js App Router pages
        │   ├── login/
        │   ├── register/
        │   ├── dashboard/
        │   └── trip/[id]/
        ├── components/
        │   ├── Navbar.js
        │   └── NewTripForm.js
        ├── context/
        │   └── AuthContext.js    # Global auth state
        └── lib/
            └── api.js            # Fetch wrapper for all API calls
```

---

## Authentication & Authorization

- Passwords are hashed with **bcryptjs** before storing
- On login/register, a **JWT** is issued (7-day expiry)
- The token is stored in `localStorage` on the client
- Every protected backend route uses the `authMiddleware` which verifies the JWT and attaches `req.user`
- All trip queries filter by `userId: req.user._id`, so users can never access each other's data

---

## AI Agent Design

The AI agent uses **Anthropic's Claude** (`claude-opus-4`) via the official SDK.

Two functions in `aiController.js`:

1. **`generateItinerary`** – Takes destination, days, budget, interests and returns a full JSON object with `itinerary`, `budgetEstimate`, and `hotels`.
2. **`regenerateDay`** – Takes the same trip context plus a custom instruction (e.g. "more outdoor activities") and returns a regenerated single day.

The prompts instruct Claude to return only valid JSON, which is then parsed and saved directly to MongoDB.

---

## Creative Feature: Trip Notes

The **Notes tab** on each trip lets users write freeform text — packing lists, reminders, things to research, contacts, etc. Notes are saved per-trip and isolated per user. This solves a real travel planning pain point: people need a scratchpad alongside their itinerary, not a separate app.

---

## Key Design Decisions

- **App Router (Next.js 14)** was chosen for simpler file-based routing and server component readiness
- **Mongoose subdocuments** for activities inside days keeps the data model simple and avoids extra collections
- **No Redux** — React Context + `useState` is sufficient for this scale
- **Simple JWT in localStorage** — acceptable for an assessment; in production, HTTP-only cookies would be more secure
- **Tailwind utility classes** for fast, consistent styling without a component library

---

## Known Limitations

- AI generation can take 5–15 seconds; a loading indicator shows but no streaming is implemented
- Budget estimates are AI-generated approximations, not real prices
- No email verification on registration
- JWT stored in localStorage (XSS risk in production — use HTTP-only cookies instead)


