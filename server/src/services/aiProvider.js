const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const generateAIResponse = async (messages) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL;

    if (!apiKey || !model) {
      throw new Error("OpenRouter configuration is missing.");
    }

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "SentinelOps",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        max_tokens: 3000,
        response_format: {
          type: "json_object",
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter API error:", data.error?.message);

      throw new Error(data.error?.message || "AI request failed.");
    }

    const content = data.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      throw new Error("Invalid response received from AI.");
    }

    return {
      content,
      model: data.model || model,
    };
  } catch (error) {
    console.error("AI Provider Error:", error.message);
    throw error;
  }
};
