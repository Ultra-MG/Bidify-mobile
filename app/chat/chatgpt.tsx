import { useState, useRef, useEffect } from "react";
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

  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

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
        {
          role: "assistant",
          content: "⚠️ Failed to get a response. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons
            name="arrow-back-outline"
            size={26}
            color={themeColors.tint}
          />
        </Pressable>
        <Text style={[styles.headerText, { color: themeColors.text }]}>
          Chat with GPT 🤖
        </Text>
      </View>

      {/* Messages */}
      <ScrollView
        style={styles.messages}
        ref={scrollViewRef}
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
                marginLeft: msg.role === "user" ? 40 : 10,
                marginRight: msg.role === "user" ? 10 : 40,
              },
            ]}
          >
            <Text
              style={{
                color: msg.role === "user" ? "#fff" : themeColors.text,
                fontSize: 15,
                lineHeight: 22,
              }}
            >
              {msg.content}
            </Text>
          </View>
        ))}

        {loading && (
          <ActivityIndicator
            size="small"
            color={themeColors.tint}
            style={{ marginTop: 10 }}
          />
        )}
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[
          styles.inputContainer,
          { backgroundColor: themeColors.background },
        ]}
      >
        <View
          style={[
            styles.inputBox,
            {
              backgroundColor: themeColors.cardBackground,
              borderColor: themeColors.cardBorder,
            },
          ]}
        >
          <TextInput
            style={[styles.input, { color: themeColors.text }]}
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
        </View>
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
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "700",
  },
  messages: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  messageBubble: {
    padding: 14,
    borderRadius: 16,
    marginVertical: 6,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
});
