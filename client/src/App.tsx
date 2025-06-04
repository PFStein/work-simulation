import { Container, Heading, VStack } from "@chakra-ui/react";
import ChatInterface from "./components/ui/chat-interface";

function App() {
  return (
    <Container maxW="100%" px={8} py={8}>
      <VStack gap={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Blueprint AI Work Simulation Exercise
        </Heading>
        <ChatInterface />
      </VStack>
    </Container>
  );
}

export default App;
