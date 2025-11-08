import type { Message } from '../types';

export const getDrSamyResponse = async (
  history: Message[]
): Promise<string> => {
  try {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ history }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.error || errorText || `Server error: ${response.statusText}`);
        } catch (e) {
            throw new Error(errorText || `Server error: ${response.statusText}`);
        }
    }

    const data = await response.json();
    if (typeof data.text !== 'string') {
      throw new Error("Invalid response format from server.");
    }
    return data.text;

  } catch (error) {
    console.error("API call failed:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("An unknown error occurred while communicating with the server.");
  }
};
