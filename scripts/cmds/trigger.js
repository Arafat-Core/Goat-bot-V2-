const Canvas = require("canvas");
const GIFEncoder = require("gifencoder");
const fs = require("fs");
const path = require("path");

// 🔑 Facebook App Token
const FB_TOKEN = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

module.exports = {
  config: {
    name: "trigger",
    version: "1.0",
    author: "Arafat",
    role: 0,
    category: "fun",
    guide: "{pn} @mention / reply"
  },

  onStart: async function ({ api, event, message, args }) {
    try {
      const mention = Object.keys(event.mentions);
      const replyID = event.messageReply?.senderID;

      // target user (mention > reply > self)
      const targetID = mention[0] || replyID || event.senderID;

      // delay / timeout (optional)
      const timeout = !isNaN(args[0]) ? Number(args[0]) : 15;

      // Facebook Graph avatar
      const avatarURL =
        `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=${FB_TOKEN}`;

      // Load images
      const base = await Canvas.loadImage(
        "https://raw.githubusercontent.com/Arafat-Core/Arafat-Temp/refs/heads/main/triggered.png"
      );
      const avatar = await Canvas.loadImage(avatarURL);

      // GIF setup (same as class)
      const width = 256;
      const height = 310;
      const GIF = new GIFEncoder(width, height);

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const gifPath = path.join(cacheDir, `triggered_${targetID}.gif`);
      const stream = fs.createWriteStream(gifPath);

      GIF.createReadStream().pipe(stream);
      GIF.start();
      GIF.setRepeat(0);
      GIF.setDelay(timeout);

      const canvas = Canvas.createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      const BR = 20; // big random
      const LR = 10; // little random

      for (let i = 0; i < 9; i++) {
        ctx.clearRect(0, 0, width, height);

        // avatar shake
        ctx.drawImage(
          avatar,
          Math.floor(Math.random() * BR) - BR,
          Math.floor(Math.random() * BR) - BR,
          width + BR,
          height - 54 + BR
        );

        // red overlay
        ctx.fillStyle = "#FF000033";
        ctx.fillRect(0, 0, width, height);

        // triggered bar
        ctx.drawImage(
          base,
          Math.floor(Math.random() * LR) - LR,
          height - 54 + Math.floor(Math.random() * LR) - LR,
          width + LR,
          54 + LR
        );

        GIF.addFrame(ctx);
      }

      GIF.finish();

      stream.on("finish", () => {
        message.reply(
          {
            body: "😡 TRIGGERED!",
            attachment: fs.createReadStream(gifPath)
          },
          () => fs.unlinkSync(gifPath)
        );
      });

    } catch (err) {
      console.error("TRIGGERED CMD ERROR:", err);
      message.reply("❌ Failed to generate triggered GIF.");
    }
  }
};