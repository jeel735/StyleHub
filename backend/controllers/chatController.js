import { GoogleGenerativeAI } from "@google/generative-ai";
import Product from "../models/productModel.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const handleAIChat = async (req, res) => {
    const { message } = req.body;

    try {
        // 1. Check if API Key exists
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is missing from .env file");
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // 2. Extraction Step
        const extractionPrompt = `
            Extract e-commerce filters from: "${message}"
            Return ONLY a JSON object: {"searchTerm": string|null, "category": string|null, "maxPrice": number|null}.
            Do not use markdown blocks.
        `;

        const extractionResult = await model.generateContent(extractionPrompt);
        let rawText = extractionResult.response.text();
        
        // --- FIX: Robust JSON Cleaning ---
        const cleanJsonString = rawText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
        
        let filters;
        try {
            filters = JSON.parse(cleanJsonString);
        } catch (e) {
            console.error("Failed to parse Gemini JSON. Raw text was:", rawText);
            filters = { searchTerm: message, category: null, maxPrice: null }; // Fallback
        }

        // 3. Database Query
        let dbQuery = {};
        if (filters.searchTerm) dbQuery.name = { $regex: filters.searchTerm, $options: "i" };
        if (filters.category) dbQuery.category = { $regex: filters.category, $options: "i" };
        if (filters.maxPrice) dbQuery.price = { $lte: filters.maxPrice };

        const products = await Product.find(dbQuery).limit(4);

        // 4. Final Response Synthesis
        const finalPrompt = `User asked: "${message}". Found items: ${JSON.stringify(products)}. Write a 1-sentence friendly reply.`;
        const finalResult = await model.generateContent(finalPrompt);

        res.status(200).json({
            reply: finalResult.response.text(),
            products: products
        });

    } catch (error) {
        // This is what you see in the BACKEND terminal
        console.error("Detailed Backend Error:", error.message);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};