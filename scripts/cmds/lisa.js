const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

/* ---------- simple wrapText helper (inline, no utils) ---------- */
function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  for (const word of words) {
    const testLine = line + word + " ";
    const { width } = ctx.measureText(testLine);
    if (width > maxWidth && line !== "") {
      lines.push(line.trim());
      line = word + " ";
    } else {
      line = testLine;
    }
  }
  if (line) lines.push(line.trim());
  return lines;
}

module.exports = {
  config: {
    name: "lisa",
    version: "1.0",
    author: "Arafat",
    role: 0,
    category: "fun",
    guide: "{pn} <text>"
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      const text = args.join(" ");
      if (!text || text.length > 300) {
        return message.reply("❌ Please provide text (max 300 characters).");
      }

      // Load base image
      const base = await loadImage(
        "https://raw.githubusercontent.com/Arafat-Core/Arafat-Temp/refs/heads/main/lisa-presentation.png"
      );

      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext("2d");

      // Draw background
      ctx.drawImage(base, 0, 0);

      // Text settings
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      let fontSize = 40;
      ctx.font = `${fontSize}px sans-serif`;

      // Auto font resize
      while (ctx.measureText(text).width > 1320 && fontSize > 15) {
        fontSize--;
        ctx.font = `${fontSize}px sans-serif`;
      }

      // Wrap text
      const lines = wrapText(ctx, text, 330);

      // Vertical centering logic (same idea as original)
      const topMost =
        185 -
        (((fontSize * lines.length) / 2) +
          ((20 * (lines.length - 1)) / 2));

      // Draw text
      for (let i = 0; i < lines.length; i++) {
        const y = topMost + ((fontSize + 20) * i);
        ctx.fillText(lines[i], base.width / 2, y);
      }

      // Save
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const imgPath = path.join(cacheDir, `lisa_${event.senderID}.png`);
      fs.writeFileSync(imgPath, canvas.toBuffer());

      message.reply(
        {
          body: "🖍️ Presentation created!",
          attachment: fs.createReadStream(imgPath)
        },
        () => fs.unlinkSync(imgPath)
      );

    } catch (err) {
      console.error("LISA CMD ERROR:", err);
      message.reply("❌ Failed to generate presentation image.");
    }
  }
};