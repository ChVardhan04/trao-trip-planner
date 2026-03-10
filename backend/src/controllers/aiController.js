const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateItinerary(destination, days, budget, interests) {
  const prompt = `You are a travel planning expert. Generate a detailed day-by-day travel itinerary for the following trip:

Destination: ${destination}
Number of Days: ${days}
Budget Type: ${budget}
Interests: ${interests.join(", ")}

Return ONLY valid JSON with this exact structure:
{
  "itinerary": [
    {
      "dayNumber": 1,
      "title": "Day title",
      "activities": [
        {
          "time": "9:00 AM",
          "activity": "Activity name",
          "description": "Brief description",
          "estimatedCost": "$20"
        }
      ]
    }
  ],
  "budgetEstimate": {
    "flights": "$X",
    "accommodation": "$X",
    "food": "$X",
    "activities": "$X",
    "total": "$X"
  },
  "hotels": [
    {
      "name": "Hotel name",
      "category": "Budget / Mid-Range / Luxury",
      "priceRange": "$X - $X per night",
      "rating": 4.5,
      "highlights": "Key feature"
    }
  ]
}

Generate exactly ${days} days. Make it realistic, fun, and aligned with the interests and budget. Return only the JSON, no extra text.`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

async function regenerateDay(destination, dayNumber, days, budget, interests, customInstruction) {
  const prompt = `You are a travel planning expert. Regenerate Day ${dayNumber} of a ${days}-day trip to ${destination}.

Budget: ${budget}
Interests: ${interests.join(", ")}
Special instruction: ${customInstruction || "Make it interesting and varied"}

Return ONLY valid JSON with this exact structure:
{
  "dayNumber": ${dayNumber},
  "title": "Day title",
  "activities": [
    {
      "time": "9:00 AM",
      "activity": "Activity name",
      "description": "Brief description",
      "estimatedCost": "$20"
    }
  ]
}

Return only the JSON, no extra text.`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

module.exports = { generateItinerary, regenerateDay };
