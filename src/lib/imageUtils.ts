export function base64ToBytes(imageBase64: string): Uint8Array {
  const base64Data = imageBase64.split(',')[1] || imageBase64;
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function base64ToFile(base64Data: string, filename: string = "image.jpg", mimeType: string = "image/jpeg"): Promise<File> {
  const res = await fetch(base64Data);
  const blob = await res.blob();
  return new File([blob], filename, { type: mimeType });
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
