const Canvas = require("canvas");
const fs = require("fs");
const path = require("path");

// 🔑 Facebook App Token (stable)
const FB_TOKEN = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

module.exports = {
  config: {
    name: "ads",
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

      // target user
      const targetID = mention[0] || replyID || event.senderID;

      // Facebook Graph avatar
      const avatarURL =
        `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=${FB_TOKEN}`;

      // Canvas setup
      const canvas = Canvas.createCanvas(550, 474);
      const ctx = canvas.getContext("2d");

      // Load images
      const avatar = await Canvas.loadImage(avatarURL);
      const background = await Canvas.loadImage(
        "https://raw.githubusercontent.com/Arafat-Core/Arafat-Temp/refs/heads/main/ad.png"
      );

      // Draw
      ctx.drawImage(avatar, 150, 75, 230, 230);
      ctx.drawImage(background, 0, 0, 550, 474);

      // Save
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const imgPath = path.join(cacheDir, `ad_${targetID}.png`);
      fs.writeFileSync(imgPath, canvas.toBuffer());

      message.reply(
        {
          body: "📢 Advertisement generated!",
          attachment: fs.createReadStream(imgPath)
        },
        () => fs.unlinkSync(imgPath)
      );

    } catch (err) {
      console.error("AD CMD ERROR:", err);
      message.reply("❌ Failed to generate ad image.");
    }
  }
};