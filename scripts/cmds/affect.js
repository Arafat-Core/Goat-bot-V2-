const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");

// 🔑 Facebook App Token (required)
const FB_TOKEN = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

module.exports = {
  config: {
    name: "affect",
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

      // Load base template
      const base = await Jimp.read(
        "https://raw.githubusercontent.com/Arafat-Core/Arafat-Temp/refs/heads/main/affect.png"
      );

      // Load avatar
      const img = await Jimp.read(avatarURL);

      // Resize avatar (same as your class)
      img.resize(200, 157);

      // Composite avatar onto template
      base.composite(img, 180, 383);

      // Save
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const imgPath = path.join(cacheDir, `affect_${targetID}.png`);
      await base.writeAsync(imgPath);

      message.reply(
        {
          body: "😈 Affected successfully!",
          attachment: fs.createReadStream(imgPath)
        },
        () => fs.unlinkSync(imgPath)
      );

    } catch (err) {
      console.error("AFFECT CMD ERROR:", err);
      message.reply("❌ Failed to generate affect image.");
    }
  }
};