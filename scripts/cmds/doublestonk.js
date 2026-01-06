const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");

// 🔑 Facebook App Token
const FB_TOKEN = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

module.exports = {
  config: {
    name: "doublestonk",
    version: "1.0",
    author: "Arafat",
    role: 0,
    category: "fun",
    guide: "{pn} @user1 @user2 | reply"
  },

  onStart: async function ({ api, event, message }) {
    try {
      const mentions = Object.keys(event.mentions);
      const replyID = event.messageReply?.senderID;

      let id1, id2;

      if (mentions.length >= 2) {
        id1 = mentions[0];
        id2 = mentions[1];
      } else if (mentions.length === 1 && replyID) {
        id1 = mentions[0];
        id2 = replyID;
      } else if (replyID) {
        id1 = event.senderID;
        id2 = replyID;
      } else {
        return message.reply("❌ Mention two users or reply to someone.");
      }

      // Facebook Graph avatars
      const avatar1 =
        `https://graph.facebook.com/${id1}/picture?width=720&height=720&access_token=${FB_TOKEN}`;
      const avatar2 =
        `https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=${FB_TOKEN}`;

      // Load template
      const base = await Jimp.read(
        "https://raw.githubusercontent.com/Arafat-Core/Arafat-Temp/refs/heads/main/doubleStonk.png"
      );

      // Load avatars
      let img1 = await Jimp.read(avatar1);
      let img2 = await Jimp.read(avatar2);

      // Same logic as your class
      base.resize(577, 431);

      img1.resize(140, 140).circle();
      img2.resize(140, 140).circle();

      base.composite(img2, 60, 20);
      base.composite(img1, 0, 30);

      // Save
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const imgPath = path.join(
        cacheDir,
        `doublestonk_${id1}_${id2}.png`
      );

      await base.writeAsync(imgPath);

      message.reply(
        {
          body: "📈 Double Stonk activated!",
          attachment: fs.createReadStream(imgPath)
        },
        () => fs.unlinkSync(imgPath)
      );

    } catch (err) {
      console.error("DOUBLESTONK CMD ERROR:", err);
      message.reply("❌ Failed to generate image.");
    }
  }
};