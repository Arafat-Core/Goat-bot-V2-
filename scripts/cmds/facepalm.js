const Canvas = require("canvas");
const fs = require("fs");
const path = require("path");

// 🔑 Facebook App Token
const FB_TOKEN = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

module.exports = {
  config: {
    name: "facepalm",
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

      // Facebook Graph avatar
      const avatarURL =
        `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=${FB_TOKEN}`;

      // Canvas setup (same as class)
      const canvas = Canvas.createCanvas(632, 357);
      const ctx = canvas.getContext("2d");

      // Black background
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, 632, 357);

      // Load avatar
      const avatar = await Canvas.loadImage(avatarURL);
      ctx.drawImage(avatar, 199, 112, 235, 235);

      // Load facepalm overlay
      const overlay = await Canvas.loadImage(
        "https://raw.githubusercontent.com/Arafat-Core/Arafat-Temp/refs/heads/main/facepalm.png"
      );
      ctx.drawImage(overlay, 0, 0, 632, 357);

      // Save
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const imgPath = path.join(cacheDir, `facepalm_${targetID}.png`);
      fs.writeFileSync(imgPath, canvas.toBuffer());

      message.reply(
        {
          body: "🤦 Facepalm moment!",
          attachment: fs.createReadStream(imgPath)
        },
        () => fs.unlinkSync(imgPath)
      );

    } catch (err) {
      console.error("FACEPALM CMD ERROR:", err);
      message.reply("❌ Failed to generate image.");
    }
  }
};