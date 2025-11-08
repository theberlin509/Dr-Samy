import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Part } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DR_SAMY_SYSTEM_PROMPT } from '../constants';
import type { Message } from '../types';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { history } = req.body as { history: Message[] };

        if (!history || history.length === 0) {
            return res.status(400).json({ error: 'History is required and cannot be empty.' });
        }
        
        const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY; 
        if (!apiKey) {
            console.error("API key not found in environment variables.");
            return res.status(500).json({ error: 'API key is not configured on the server.' });
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

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            safetySettings,
            config: {
                systemInstruction: DR_SAMY_SYSTEM_PROMPT,
            },
        });
        
        return res.status(200).json({ text: response.text });

    } catch (error) {
        console.error("Gemini API call failed on server:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
        return res.status(500).json({ error: errorMessage });
    }
}