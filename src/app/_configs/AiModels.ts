import Groq from "groq-sdk";

// Client-side Groq instance (for browser use)
const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

// Server-side Groq instance (for server actions)
const groqServer = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
});

// Example usage (remove or update as needed):
// export const GenerateCourseLayout = await getGroqChatCompletion("Your prompt here");
// Print the completion returned by the LLM.

export async function getGroqChatCompletion(prompt: string) {
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        temperature: 0
    });
}

// Server-side version for server actions
export async function getGroqChatCompletionServer(prompt: string) {
    return groqServer.chat.completions.create({
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        temperature: 0
    });
}

export async function GenerateChapterContent_AI(prompt: string) {
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        temperature: 0
    });
}
