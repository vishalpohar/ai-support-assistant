export const formatTime = (timestamp: string | null): string => {
  if (!timestamp) return "";

  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};
