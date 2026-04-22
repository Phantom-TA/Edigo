import Groq from "groq-sdk";

let groq: Groq | null = null;
let groqServer: Groq | null = null;

const getGroqClient = () => {
    if (!groq) {
        const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
        if (!apiKey) console.warn('NEXT_PUBLIC_GROQ_API_KEY is missing');
        groq = new Groq({
            apiKey: apiKey || 'dummy-key-for-build',
            dangerouslyAllowBrowser: true
        });
    }
    return groq;
};

const getGroqServerClient = () => {
    if (!groqServer) {
        const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
        if (!apiKey) console.warn('NEXT_PUBLIC_GROQ_API_KEY is missing');
        groqServer = new Groq({
            apiKey: apiKey || 'dummy-key-for-build',
        });
    }
    return groqServer;
};

// Example usage (remove or update as needed):
// export const GenerateCourseLayout = await getGroqChatCompletion("Your prompt here");
// Print the completion returned by the LLM.

export async function getGroqChatCompletion(prompt: string) {
    const client = getGroqClient();
    return client.chat.completions.create({
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
    const client = getGroqServerClient();
    return client.chat.completions.create({
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
    const client = getGroqClient();
    return client.chat.completions.create({
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
