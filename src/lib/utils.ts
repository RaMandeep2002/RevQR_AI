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

export const applyLogoToQr = async ({
  qrDataUrl,
  logoDataUrl,
  logoSizePercent = 22,
  logoShape = "rounded"
}: {
  qrDataUrl: string;
  logoDataUrl?: string | null;
  logoSizePercent?: number;
  logoShape?: "square" | "rounded" | "circle";
}): Promise<string> => {
  if (!logoDataUrl) return qrDataUrl;

  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const qrImg = new Image();
    const logoImg = new Image();

    qrImg.crossOrigin = "anonymous";
    logoImg.crossOrigin = "anonymous";

    qrImg.onload = () => {
      canvas.width = qrImg.width;
      canvas.height = qrImg.height;
      if (!ctx) return resolve(qrDataUrl);
      ctx.drawImage(qrImg, 0, 0);

      logoImg.onload = () => {
        const size = Math.max(40, Math.floor((Math.min(canvas.width, canvas.height) * logoSizePercent) / 100));
        const x = (canvas.width - size) / 2;
        const y = (canvas.height - size) / 2;

        // White background patch behind logo for scan reliability.
        const padding = 10;
        const bgX = x - padding;
        const bgY = y - padding;
        const bgSize = size + padding * 2;

        ctx.save();
        if (logoShape === "circle") {
          ctx.beginPath();
          ctx.arc(bgX + bgSize / 2, bgY + bgSize / 2, bgSize / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fillStyle = "#ffffff";
          ctx.fill();
        } else {
          const radius = logoShape === "rounded" ? 18 : 0;
          ctx.beginPath();
          ctx.moveTo(bgX + radius, bgY);
          ctx.lineTo(bgX + bgSize - radius, bgY);
          ctx.quadraticCurveTo(bgX + bgSize, bgY, bgX + bgSize, bgY + radius);
          ctx.lineTo(bgX + bgSize, bgY + bgSize - radius);
          ctx.quadraticCurveTo(bgX + bgSize, bgY + bgSize, bgX + bgSize - radius, bgY + bgSize);
          ctx.lineTo(bgX + radius, bgY + bgSize);
          ctx.quadraticCurveTo(bgX, bgY + bgSize, bgX, bgY + bgSize - radius);
          ctx.lineTo(bgX, bgY + radius);
          ctx.quadraticCurveTo(bgX, bgY, bgX + radius, bgY);
          ctx.closePath();
          ctx.fillStyle = "#ffffff";
          ctx.fill();
        }
        ctx.restore();

        ctx.save();
        if (logoShape === "circle") {
          ctx.beginPath();
          ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
        } else if (logoShape === "rounded") {
          const r = 14;
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + size - r, y);
          ctx.quadraticCurveTo(x + size, y, x + size, y + r);
          ctx.lineTo(x + size, y + size - r);
          ctx.quadraticCurveTo(x + size, y + size, x + size - r, y + size);
          ctx.lineTo(x + r, y + size);
          ctx.quadraticCurveTo(x, y + size, x, y + size - r);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.closePath();
          ctx.clip();
        }

        ctx.drawImage(logoImg, x, y, size, size);
        ctx.restore();
        resolve(canvas.toDataURL("image/png"));
      };

      logoImg.onerror = () => resolve(qrDataUrl);
      logoImg.src = logoDataUrl;
    };

    qrImg.onerror = () => resolve(qrDataUrl);
    qrImg.src = qrDataUrl;
  });
};
