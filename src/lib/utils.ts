import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const sanitizeReviewText = (text: string) => {
  return text
    .replace(/<[^>]*>?/gm, "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim();
};

export const wordCount = (text: string) => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
};

export const enforceWordLimit = (text: string, maxWords = 150) => {
  const currentWords = text.trim().split(/\s+/).filter(Boolean).length;
  if (currentWords > maxWords) {
    const words = text.trim().split(/\s+/).filter(Boolean);
    return words.slice(0, maxWords).join(" ");
  }
  return text;
};


export const generateProfessionalQrImage = async (
  qrDataUrl: string,
  businessName: string,
  category: string
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const qrImg = new Image();

    qrImg.onload = () => {
      // Define canvas size (poster size)
      canvas.width = 800;
      canvas.height = 1200;

      // Draw background (clean white)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Top Icon (Message bubble style)
      ctx.beginPath();
      ctx.arc(canvas.width / 2, 150, 70, 0, Math.PI * 2);
      ctx.fillStyle = "#eefaf4"; // Light brand background
      ctx.fill();
      
      ctx.fillStyle = "#25a05d"; // Brand primary
      ctx.font = "100px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("💬", canvas.width / 2, 185);

      // Brand Name
      ctx.fillStyle = "#17673b"; // Brand dark
      ctx.font = "bold 42px sans-serif";
      ctx.fillText("QReview", canvas.width / 2, 280);
      
      ctx.fillStyle = "#64748b";
      ctx.font = "500 24px sans-serif";
      ctx.fillText("AI-Powered Review Assistant", canvas.width / 2, 320);

      // Separator line
      ctx.strokeStyle = "#f1f5f9";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(100, 380);
      ctx.lineTo(canvas.width - 100, 380);
      ctx.stroke();

      // Draw QR Code (Large and clear)
      const qrSize = 450;
      ctx.drawImage(qrImg, (canvas.width - qrSize) / 2, 450, qrSize, qrSize);

      // Instruction
      ctx.fillStyle = "#334155";
      ctx.font = "600 32px sans-serif";
      ctx.fillText("Scan to Leave a Review ⭐", canvas.width / 2, 980);

      // Business Details
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 64px sans-serif";
      ctx.fillText(businessName, canvas.width / 2, 1080);

      ctx.fillStyle = "#64748b";
      ctx.font = "500 28px sans-serif";
      ctx.fillText(category, canvas.width / 2, 1130);

      // Footer
      ctx.fillStyle = "#94a3b8";
      ctx.font = "400 18px sans-serif";
      ctx.fillText("Powered by RevQR AI", canvas.width / 2, 1175);

      resolve(canvas.toDataURL("image/png"));
    };

    qrImg.src = qrDataUrl;
  });
};