const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");

// 🔑 Facebook App Token
const FB_TOKEN = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

module.exports = {
  config: {
    name: "hitler",
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

      // target (mention > reply > self)
      const targetID = mention[0] || replyID || event.senderID;

      // Facebook Graph avatar
      const avatarURL =
        `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=${FB_TOKEN}`;

      // Load template
      const base = await Jimp.read(
        "https://raw.githubusercontent.com/Arafat-Core/Arafat-Temp/refs/heads/main/hitler.png"
      );

      // Load avatar
      const img = await Jimp.read(avatarURL);

      // Same logic as your class
      img.resize(140, 140);
      base.composite(img, 46, 43);

      // Save
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const imgPath = path.join(cacheDir, `hitler_${targetID}.png`);
      await base.writeAsync(imgPath);

      message.reply(
        {
          body: "🖼️ Image generated!",
          attachment: fs.createReadStream(imgPath)
        },
        () => fs.unlinkSync(imgPath)
      );

    } catch (err) {
      console.error("HITLER CMD ERROR:", err);
      message.reply("❌ Failed to generate image.");
    }
  }
};