export const generateTrackingId = (): string => {
  // Generates a random 6 character alphanumeric string
  const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `WF-${randomChars}`;
};
