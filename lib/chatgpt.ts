
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
          return reply;  
        } else {
          console.error("⚠️ No reply found:", data);
          throw new Error("No reply from Chatbot");
        }
      } catch (error) {
        console.error("❌ Failed to fetch response:", error);
        throw error;  // ✅ throw error so you can catch it in ChatGPTScreen
      }
    };
