"use client";

import { Button } from "@chakra-ui/react";
import { useState } from "react";
import { toaster } from "./toaster";
import { useColorModeValue } from "./color-mode";
import { Tooltip } from "./tooltip";

interface ResetButtonProps {
  onResetSuccess?: () => void;
}

export default function ResetButton({ onResetSuccess }: ResetButtonProps) {
  const [isResetting, setIsResetting] = useState(false);
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const textColor = useColorModeValue("red.600", "red.300");

  const handleReset = async () => {
    setIsResetting(true);

    const toastId = toaster.create({
      type: "loading",
      title: "Resetting data...",
      description: "Clearing all transcripts and messages",
      meta: { closable: false },
    });

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/agent/reset`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Reset failed");

      toaster.update(toastId, {
        type: "success",
        title: "Reset complete",
        description: "All transcripts and chat history were cleared.",
        meta: { closable: true },
      });

      onResetSuccess?.();
    } catch (err) {
      toaster.update(toastId, {
        type: "error",
        title: "Reset failed",
        description: (err as Error).message || "Unexpected error occurred.",
        meta: { closable: true },
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Tooltip content="Deletes all transcripts & chunks" showArrow>
      <Button
        size="sm"
        variant="outline"
        borderColor={borderColor}
        color={textColor}
        onClick={handleReset}
        isLoading={isResetting}
      >
        Reset
      </Button>
    </Tooltip>
  );
}
