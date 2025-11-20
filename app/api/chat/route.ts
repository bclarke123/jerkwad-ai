import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MAX_RESPONSE_LENGTH = 500;
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

    const model = "gemini-flash-latest";
    
    const config = {
      temperature: 0.9,
      thinkingConfig: {
        thinkingBudget: -1,
      },
      systemInstruction: [
        {
          text: SYSTEM_PROMPT,
        }
      ],
    };

    const contents = [
      ...(history || []),
      {
        role: 'user',
        parts: [
          {
            text: message,
          },
        ],
      },
    ];

    const responseStream = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    let fullText = '';
    for await (const chunk of responseStream) {
      if (chunk.text) {
        fullText += chunk.text;
      }
    }

    return NextResponse.json({ response: fullText });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json(
      { error: "Failed to process request." },
      { status: 500 }
    );
  }
}
