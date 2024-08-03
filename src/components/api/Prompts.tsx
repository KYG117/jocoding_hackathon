import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI('AIzaSyCKHj6GBTDC1vs84cAGtP4Aev5KiewH6TY');

// Function to generate responses using Gemini API
async function prompts(question: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

    const result = await model.generateContent(question);
    const response = result.response;
    const text = response.text();
    console.log(text);

    return text;
  } catch (error) {
    console.error('Error communicating with Google Generative AI:', error);

    return "";
  }
}

export default prompts;
