const Canvas = require("canvas");
const fs = require("fs");
const path = require("path");

// 🔑 Facebook App Token
const FB_TOKEN = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

/* -------- inline applyText (no utils) -------- */
function applyText(canvas, text, maxWidth, startSize, font = "Times New Roman") {
  const ctx = canvas.getContext("2d");
  let fontSize = startSize;
  do {
    ctx.font = `${fontSize}px ${font}`;
    fontSize--;
  } while (ctx.measureText(text).width > maxWidth && fontSize > 10);
  return ctx.font;
}

module.exports = {
  config: {
    name: "wanted",
    version: "1.0",
    author: "Arafat",
    role: 0,
    category: "fun",
    guide: "{pn} @mention / reply"
  },

  onStart: async function ({ api, event, message }) {
    try {
      const mention = Object.keys(event.mentions);
      const replyID = event.messageReply?.senderID;

      // target user (mention > reply > self)
      const targetID = mention[0] || replyID || event.senderID;

      // Random bounty (same logic)
      const price = Math.floor(Math.random() * 188708) + 329889;
      const currency = "$";

      // Facebook Graph avatar
      const avatarURL =
        `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=${FB_TOKEN}`;

      // Canvas setup (same as class)
      const canvas = Canvas.createCanvas(257, 383);
      const ctx = canvas.getContext("2d");

      // Load images
      const avatar = await Canvas.loadImage(avatarURL);
      const background = await Canvas.loadImage(
        "https://raw.githubusercontent.com/Arafat-Core/Arafat-Temp/refs/heads/main/wanted.png"
      );

      // Draw avatar
      ctx.drawImage(avatar, 25, 60, 210, 210);

      // Draw wanted poster overlay
      ctx.drawImage(background, 0, 0, 257, 383);

      // Text style (same behavior)
      ctx.textAlign = "center";
      ctx.fillStyle = "#513d34";
      ctx.font = applyText(
        canvas,
        price.toLocaleString() + currency,
        80,
        200,
        "Times New Roman"
      );

      ctx.fillText(
        price.toLocaleString() + currency,
        128,
        315
      );

      // Save
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const imgPath = path.join(cacheDir, `wanted_${targetID}.png`);
      fs.writeFileSync(imgPath, canvas.toBuffer());

      message.reply(
        {
          body: "🤠 Wanted poster generated!",
          attachment: fs.createReadStream(imgPath)
        },
        () => fs.unlinkSync(imgPath)
      );

    } catch (err) {
      console.error("WANTED CMD ERROR:", err);
      message.reply("❌ Failed to generate wanted poster.");
    }
  }
};