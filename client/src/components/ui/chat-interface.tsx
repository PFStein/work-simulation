"use client";

import { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import { useColorModeValue } from "./color-mode";
import { ChatMessage } from "./chat-message";
import TranscriptUploader from "./transcript-uploader";
import ResetButton from "./reset-button";

interface Message {
  sender: "user" | "agent";
  content: string;
  quotes?: { speaker: string; quote: string }[];
  visible?: boolean;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!messages.length) {
      setMessages([
        {
          sender: "agent",
          content:
            "👋 Hi there! I'm your transcript assistant. Please upload a `.txt` file so I can help answer questions about it.",
          visible: true,
        },
      ]);
    }
  }, [messages]);
  

  const handleSend = async () => {
    if (!input.trim()) return;

    const question = input;
    setInput("");

    const userMessage: Message = {
      sender: "user",
      content: question,
      visible: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/agent/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();

      const agentMessage: Message = {
        sender: "agent",
        content: data.summary,
        quotes: data.quotes,
        visible: true,
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          content: "Sorry, something went wrong.",
          visible: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  

  const bgAgent = useColorModeValue("gray.100", "gray.700");
  const bgUser = useColorModeValue("blue.100", "blue.600");
  const borderColor = useColorModeValue("gray.300", "gray.600");

  return (
    <Flex
      direction="column"
      minH="400px"
      maxH="75vh"
      w="100%"
      maxW="80vw"
      mx="auto"
    >
      <Box
        ref={chatContainerRef}
        flex="1"
        overflowY="auto"
        p={4}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="md"
      >
        <VStack align="stretch" spacing={3}>
          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
              sender={msg.sender}
              content={msg.content}
              quotes={msg.quotes}
              visible={msg.visible}
              bgUser={bgUser}
              bgAgent={bgAgent}
            />
          ))}
          {isLoading && (
            <Box alignSelf="flex-start">
              <Spinner size="sm" color="gray.500" />
            </Box>
          )}
        </VStack>
      </Box>

      <Flex
        mt={2}
        px={4}
        py={2}
        borderTop="1px solid"
        borderColor={borderColor}
      >
        <TranscriptUploader
          onUploadSuccess={(title) => {
            setMessages((prev) => [
              ...prev,
              {
                sender: "agent",
                content: `✅ Got it! I've indexed "${title}". You can now ask me anything about this session.`,
                visible: true,
              },
            ]);
          }}
        />
        <Input
          placeholder="Ask anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          mr={2}
        />
        <Button onClick={handleSend} isDisabled={isLoading} colorScheme="blue">
          Send
        </Button>
        <ResetButton onResetSuccess={() => setMessages([])} />
      </Flex>
    </Flex>
  );
}
