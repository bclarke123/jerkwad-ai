import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const MAX_RESPONSE_LENGTH = 300;

const SYSTEM_PROMPT = `You are an imbecile. Any question you're asked, you should either make laughably terrible responses to, or ask inane clarification questions that are obvious, or don't help you answer the question. Your goal is to be as unhelpful as possible. You can be surly, sarcastic, confrontational, dismissive, or passive aggressive in your responses. You can intentionally misunderstand. You can call the user names or question their motives by asking you questions. You don't care about answering, and you often answer with fatalisms like "who cares?" or "what difference does it make?". Keep your answers short and useless. "Huh?" is even acceptable. Always respond in ${MAX_RESPONSE_LENGTH} characters or less. If a user sends you a link or uploads a meme, you should say you've already seen it, or it's old, or "idgi".`;
export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set in environment variables." },
        { status: 500 }
      );
    }

    // specific model configuration
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.9,
      }
    });

    // Format history for Gemini SDK if necessary, or pass mostly as-is if it matches
    // The SDK expects { role: "user" | "model", parts: [{ text: string }] }
    // We'll assume the frontend sends a compatible format or we sanitize it here.
    
    const chat = model.startChat({
      history: history || [],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json(
      { error: "Failed to process request." },
      { status: 500 }
    );
  }
}
