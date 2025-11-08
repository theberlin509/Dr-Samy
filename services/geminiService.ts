import type { Message } from '../types';

export const streamDrSamyResponse = async (
  history: Message[],
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> => {
  try {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ history }),
    });

    if (!response.ok || !response.body) {
        const errorText = await response.text();
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.error || errorText || `Server error: ${response.statusText}`);
        } catch (e) {
            throw new Error(errorText || `Server error: ${response.statusText}`);
        }
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            onComplete();
            break;
        }
        const chunk = decoder.decode(value, { stream: true });
        onChunk(chunk);
    }

  } catch (error) {
    console.error("API stream failed:", error);
    if (error instanceof Error) {
        onError(error);
    } else {
        onError(new Error("An unknown error occurred while communicating with the server."));
    }
  }
};
