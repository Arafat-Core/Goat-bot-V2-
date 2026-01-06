const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "imgbb",
    aliases: ["imgbb"],
    version: "1.3.1",
    author: "Arafat",
    shortDescription: "𝐈𝐦𝐠𝐁𝐁 𝐔𝐩𝐥𝐨𝐚𝐝 𝐒𝐭𝐲𝐥𝐢𝐬𝐡",
    longDescription: "𝐔𝐩𝐥𝐨𝐚𝐝 𝐭𝐨 𝐈𝐦𝐠𝐁𝐁.",
    category: "utility"
  },

  onStart: async function ({ api, event, args }) {
    try {
      
      const KEY_SOURCE =
        "https://raw.githubusercontent.com/Arafat-Core/Arafat-Temp/refs/heads/main/imgbb.json";

      const keyData = await axios.get(KEY_SOURCE);
      const IMGBB_KEY = keyData.data.imgbb_key;

      if (!IMGBB_KEY) {
        return api.sendMessage("❌ 𝐀𝐏𝐈 𝐊𝐄𝐘 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝!", event.threadID);
      }

      
      let expiration = null;
      if (args[0]) {
        const t = args[0].toLowerCase();
        const m = t.match(/^(\d+)(s|sec|m|min|h|hr|d)$/);

        if (m) {
          const v = parseInt(m[1]);
          const u = m[2];
          if (u.startsWith("s")) expiration = v;
          else if (u.startsWith("m")) expiration = v * 60;
          else if (u.startsWith("h")) expiration = v * 3600;
          else if (u === "d") expiration = v * 86400;
        }
      }

      
      let imageUrl = null;
      if (event.messageReply?.attachments?.length > 0) {
        imageUrl = event.messageReply.attachments[0].url;
      } else if (event.attachments?.length > 0) {
        imageUrl = event.attachments[0].url;
      } else if (args[0] && !expiration) {
        imageUrl = args.join(" ");
      }

      if (!imageUrl) {
        return api.sendMessage(
          "𝐔𝐬𝐚𝐠𝐞:\n" +
            "• #imgbb → 𝐋𝐢𝐟𝐞𝐭𝐢𝐦𝐞\n" +
            "• #imgbb 1d → 𝟏 𝐝𝐚𝐲\n" +
            "• #imgbb 1m → 𝟏 𝐦𝐢𝐧𝐮𝐭𝐞\n" +
            "• #imgbb 30d → 𝟑𝟎 𝐝𝐚𝐲𝐬",
          event.threadID,
          event.messageID
        );
      }

      
      const img = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const buffer = Buffer.from(img.data);
      const base64 = buffer.toString("base64");

      
      const form = new URLSearchParams();
      form.append("key", IMGBB_KEY);
      form.append("image", base64);
      if (expiration) form.append("expiration", expiration);

      const upload = await axios.post("https://api.imgbb.com/1/upload", form.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      const data = upload.data.data;

    
      const txt =
        "✅ 𝐔𝐩𝐥𝐨𝐚𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥\n\n" +
        `🔗 𝐃𝐢𝐫𝐞𝐜𝐭 𝐔𝐑𝐋:\n${data.url}\n\n` +
        `⏳ 𝐄𝐱𝐩𝐢𝐫𝐚𝐭𝐢𝐨𝐧: ${expiration ? args[0] : "𝐋𝐢𝐟𝐞𝐭𝐢𝐦𝐞"}`;

      
      const temp = path.join(__dirname, `imgbb_${Date.now()}.jpg`);
      await fs.writeFile(temp, buffer);

      api.sendMessage(
        {
          body: txt,
          attachment: fs.createReadStream(temp)
        },
        event.threadID,
        () => fs.remove(temp),
        event.messageID
      );
    } catch (err) {
      api.sendMessage(
        "𝐔𝐩𝐥𝐨𝐚𝐝 𝐅𝐚𝐢𝐥𝐞𝐝:\n" + err.message,
        event.threadID,
        event.messageID
      );
    }
  }
};
