import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Part } from "@google/genai";
import { DR_SAMY_SYSTEM_PROMPT } from '../constants';
import type { Message } from '../types';

export const config = {
  runtime: 'edge',
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { 
            status: 405, 
            headers: { 'Content-Type': 'application/json', 'Allow': 'POST' } 
        });
    }

    try {
        const { history } = await req.json() as { history: Message[] };

        if (!history || history.length === 0) {
            return new Response(JSON.stringify({ error: 'History is required and cannot be empty.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // FIX: Per coding guidelines, the API key must be obtained exclusively from `process.env.API_KEY`.
        const apiKey = process.env.API_KEY; 
        if (!apiKey) {
            console.error("API key not found in environment variables.");
            return new Response(JSON.stringify({ error: 'API key is not configured on the server.' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const ai = new GoogleGenAI({ apiKey });

        const contents = history.map(msg => {
            const parts: Part[] = [];
            if (msg.text) {
                parts.push({ text: msg.text });
            }
            if (msg.role === 'user' && msg.images) {
                for (const image of msg.images) {
                    parts.push({
                        inlineData: {
                            mimeType: image.type,
                            data: image.base64,
                        }
                    });
                }
            }
            return { role: msg.role, parts };
        });

        // FIX: The `safetySettings` property should be inside the `config` object.
        const stream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: DR_SAMY_SYSTEM_PROMPT,
                safetySettings,
            },
        });
        
        const readableStream = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const text = chunk.text;
                    if (text) {
                        controller.enqueue(new TextEncoder().encode(text));
                    }
                }
                controller.close();
            },
        });

        return new Response(readableStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error) {
        console.error("Gemini API stream failed on server:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
        return new Response(JSON.stringify({ error: errorMessage }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
