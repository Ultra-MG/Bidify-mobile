
import axios from "axios";

const API_KEY = "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"; 

export const sendMessageToChatGPT = async (userMessage: string) => {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json", 
            "Authorization": `Bearer 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`,
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-exp:free",
            messages: [
              {
                role: "user",
                content: userMessage,
              },
            ],
          }),
        });
    
        const data = await response.json();
        console.log("✅ Chatbot response:", data);
    
        if (data.choices && data.choices.length > 0) {
          const reply = data.choices[0].message.content;
          return reply;  // ✅ RETURN THE REPLY
        } else {
          console.error("⚠️ No reply found:", data);
          throw new Error("No reply from Chatbot");
        }
      } catch (error) {
        console.error("❌ Failed to fetch response:", error);
        throw error;  // ✅ throw error so you can catch it in ChatGPTScreen
      }
    };
