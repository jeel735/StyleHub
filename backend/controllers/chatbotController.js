import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `
You are StyleBot, a friendly and helpful AI shopping assistant for StyleHub — a modern fashion e-commerce store.

Your responsibilities:
- Help customers find the right clothing, accessories, and fashion products based on their preferences, size, budget, and style.
- Answer general store FAQs such as shipping policy, return/exchange policy, payment methods, and order-related questions.
- Suggest outfit combinations and product recommendations.
- Be concise, warm, and helpful.

StyleHub Store Info (use this to answer FAQs):
- Shipping: Free shipping on orders above ₹999. Standard delivery in 5–7 business days.
- Returns: 7-day easy return policy. Items must be unused and in original packaging.
- Payment: Accepts UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery.
- Exchange: Exchange allowed within 7 days for size/color issues.
- Customer Support: Available Monday–Saturday, 10AM–6PM IST.

Important rules:
- Only answer questions related to fashion, clothing, styling, and StyleHub store policies.
- If asked something unrelated (e.g., coding, politics, etc.), politely say you can only help with fashion and store-related topics.
- Keep responses short and easy to read. Use bullet points when listing multiple things.
- Do not make up product names, prices, or stock availability.
`;

export const chatWithBot = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message cannot be empty." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const formattedHistory = (history || []).map((msg) => ({
      role: msg.role === "bot" ? "model" : "user",
      parts: [{ text: msg.text }],
    }));

    const chat = model.startChat({
      history: formattedHistory,
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Chatbot Controller Error:", error.message);
    return res.status(500).json({
      error: "Something went wrong with the chatbot. Please try again.",
    });
  }
};