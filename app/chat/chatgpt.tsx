// app/chats/chatgpt.tsx
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { Colors } from "../../constants/Colors";
import { sendMessageToChatGPT } from "../../lib/chatgpt"; 
import { router } from "expo-router";

export default function ChatGPTScreen() {
  const { theme } = useTheme();
  const themeColors = Colors[theme];

  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
  
    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);
  
    try {
        const reply = await sendMessageToChatGPT(userMessage); 
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);        
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Failed to get a response. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back-outline" size={24} color={themeColors.tint} />
        </Pressable>
        <Text style={[styles.headerText, { color: themeColors.text }]}>
          Chat with GPT 🤖
        </Text>
      </View>

      {/* Messages */}
      <ScrollView
        style={styles.messages}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              {
                backgroundColor:
                  msg.role === "user"
                    ? themeColors.tint
                    : themeColors.cardBackground,
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              },
            ]}
          >
            <Text
              style={{
                color: msg.role === "user" ? "#fff" : themeColors.text,
                fontSize: 15,
              }}
            >
              {msg.content}
            </Text>
          </View>
        ))}

        {loading && (
          <ActivityIndicator size="small" color={themeColors.tint} style={{ marginTop: 10 }} />
        )}
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.inputContainer}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: themeColors.cardBackground,
              borderColor: themeColors.cardBorder,
              color: themeColors.text,
            },
          ]}
          placeholder="Type your message..."
          placeholderTextColor={themeColors.icon}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <Pressable onPress={handleSend} style={{ marginLeft: 8 }}>
          <Ionicons name="send" size={24} color={themeColors.tint} />
        </Pressable>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "600",
  },
  messages: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
    maxWidth: "80%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
});
