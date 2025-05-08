import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateInviteCode(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function snakeCaseToTitleCase(str: string) {
  return str
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function detectImageMimeType(buffer: ArrayBuffer): string | null {
  const uint = new Uint8Array(buffer);

  if (
    uint[0] === 0x89 &&
    uint[1] === 0x50 &&
    uint[2] === 0x4e &&
    uint[3] === 0x47
  ) {
    return "image/png";
  }
  if (uint[0] === 0xff && uint[1] === 0xd8 && uint[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    uint[0] === 0x47 &&
    uint[1] === 0x49 &&
    uint[2] === 0x46 &&
    uint[3] === 0x38 &&
    (uint[4] === 0x37 || uint[4] === 0x39) &&
    uint[5] === 0x61
  ) {
    return "image/gif";
  }
  if (
    uint[0] === 0x52 &&
    uint[1] === 0x49 &&
    uint[2] === 0x46 &&
    uint[3] === 0x46 &&
    uint[8] === 0x57 &&
    uint[9] === 0x45 &&
    uint[10] === 0x42 &&
    uint[11] === 0x50
  ) {
    return "image/webp";
  }
  if (
    uint[0] === 0x3c &&
    uint[1] === 0x3f &&
    uint[2] === 0x78 &&
    uint[3] === 0x6d
  ) {
    return "image/svg+xml"; // starts with "<?xm"
  }

  return null;
}
