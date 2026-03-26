import crypto from "crypto";

export const generateTrackingId = (): string => {
  const randomChars = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `WF-${randomChars}`;
};
