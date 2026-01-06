const axios = require("axios");
const fs = require("fs");
const path = require("path");

const API_JSON =
  "https://raw.githubusercontent.com/Arafat-Core/cmds/refs/heads/main/api.json";

module.exports = {
  config: {
    name: "removebg",
    aliases: ["rbg", "rmbg"],
    version: "1.5",
    author: "Arafat",
    countDown: 5,
    role: 0,
    description: {
      en: "𝐑𝐞𝐦𝐨𝐯𝐞 𝐢𝐦𝐚𝐠𝐞 𝐛𝐚𝐜𝐤𝐠𝐫𝐨𝐮𝐧𝐝 "
    },
    category: "image",
    guide: {
      en: "Reply to an image and type: {pn}"
    }
  },

  onStart: async function ({ message, event }) {
    try {

      if (!event.messageReply || !event.messageReply.attachments?.length)
        return message.reply("❌ | 𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧 𝐢𝐦𝐚𝐠𝐞");

      const att = event.messageReply.attachments[0];
      if (att.type !== "photo")
        return message.reply("❌ | 𝐎𝐧𝐥𝐲 𝐩𝐡𝐨𝐭𝐨 𝐬𝐮𝐩𝐩𝐨𝐫𝐭𝐞𝐝");

      const apiJson = await axios.get(API_JSON);
      const BASE_API = apiJson.data.api;

      if (!BASE_API)
        return message.reply("❌ | 𝐀𝐏𝐈 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝");

      message.reply("⏳ | 𝐑𝐞𝐦𝐨𝐯𝐢𝐧𝐠 𝐛𝐚𝐜𝐤𝐠𝐫𝐨𝐮𝐧𝐝...!!");

      const { data } = await axios.get(`${BASE_API}/removebg`, {
        params: { image: att.url }
      });

      if (!data || data.status !== true || !data.output)
        return message.reply("❌ | 𝐑𝐞𝐦𝐨𝐯𝐞 𝐟𝐚𝐢𝐥𝐞𝐝");

      const pngUrl = data.output;

      const img = await axios.get(pngUrl, { responseType: "arraybuffer" });
      const filePath = path.join(
        __dirname,
        "cache",
        `removebg_${Date.now()}.png`
      );
      fs.writeFileSync(filePath, img.data);

      const body =
`𝐑𝐄𝐌𝐎𝐕𝐄 𝐁𝐀𝐂𝐊𝐆𝐑𝐎𝐔𝐍𝐃

 𝐒𝐭𝐚𝐭𝐮𝐬 : 𝐒𝐮𝐜𝐜𝐞𝐬𝐬
 𝐅𝐨𝐫𝐦𝐚𝐭 : 𝐏𝐍𝐆

🔗 𝐏𝐍𝐆 𝐋𝐢𝐧𝐤
${pngUrl}`;

      message.reply(
        {
          body,
          attachment: fs.createReadStream(filePath)
        },
        () => fs.unlinkSync(filePath)
      );

    } catch (err) {
      message.reply("❌ | 𝐒𝐞𝐫𝐯𝐞𝐫 𝐄𝐫𝐫𝐨𝐫");
    }
  }
};
