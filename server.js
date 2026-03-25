require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize Gemini with the working key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());

app.get('/api/quiz', async (req, res) => {
    const topic = req.query.topic || "SSC General Awareness";
    
    // Structured prompt for high-quality SSC/Bank questions
    const prompt = `Generate exactly 10 high-quality multiple-choice questions for ${topic} (Level: Bank PO/SSC CGL). 
    Return ONLY a JSON array. 
    Structure: [{"q": "Question text", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "Brief explanation"}]`;

    try {
        console.log(`📡 Generating questions for: ${topic} using Gemini 2.5 Flash...`);

        // Using the model that passed our test
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Remove markdown and parse
        const cleanJson = text.replace(/```json|```/g, "").trim();
        const data = JSON.parse(cleanJson);
        
        res.json(data);
        console.log("✅ Success! Quiz sent to frontend.");

    } catch (error) {
        console.error("❌ Error:", error.message);
        res.status(500).json({ error: "Generation failed", details: error.message });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 QUIZ SERVER LIVE: http://localhost:${PORT}`);
});