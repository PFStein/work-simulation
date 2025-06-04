import React from "react";
import { Box, Text, VStack } from "@chakra-ui/react";

interface Quote {
  speaker: string;
  quote: string;
}

interface ChatMessageProps {
  sender: "user" | "agent";
  content: string;
  quotes?: Quote[];
  visible?: boolean;
  bgUser: string;
  bgAgent: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  sender,
  content,
  quotes = [],
  visible = true,
  bgUser,
  bgAgent,
}) => {
  return (
    <Box
      alignSelf={sender === "user" ? "flex-end" : "flex-start"}
      bg={sender === "user" ? bgUser : bgAgent}
      px={4}
      py={2}
      borderRadius="md"
      maxW="80%"
      opacity={visible ? 1 : 0}
    >
      <Text>{content}</Text>

      {quotes.length > 0 && (
        <VStack align="start" mt={2} spacing={2}>
          {quotes.map((q, i) => (
            <Box key={i} pl={4} borderLeft="2px solid" borderColor="gray.300">
              <Text fontWeight="bold">{q.speaker}:</Text>
              <Text fontStyle="italic">"{q.quote}"</Text>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};
