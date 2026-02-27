
export const encodeState = (data: any): string => {
  const jsonString = JSON.stringify(data);
  const uint8 = new TextEncoder().encode(jsonString);
  let binString = "";
  uint8.forEach((byte) => {
    binString += String.fromCharCode(byte);
  });
  return btoa(binString);
};

export const decodeState = (code: string): any => {
  try {
    const cleanCode = code.trim().replace(/\s/g, '');
    const binaryString = atob(cleanCode);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const decoded = new TextDecoder().decode(bytes);
    return JSON.parse(decoded);
  } catch (e) {
    console.error("Failed to decode state", e);
    return null;
  }
};
