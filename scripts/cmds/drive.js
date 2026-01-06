const axios = require("axios");

module.exports = {
  config: {
    name: "drive",
    aliases: [" "],
    version: "0.2",
    author: "Arafat",
    countDown: 5,
    role: 0,
    category: "UTILITY",
    guide: {
      en: "{pn} reply to a file or give direct URL"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      let fileUrl;

      
      if (event.messageReply?.attachments?.length > 0) {
        fileUrl = event.messageReply.attachments[0].url;
      }

      else if (args[0]?.startsWith("http")) {
        fileUrl = args[0];
      }
      else {
        return message.reply("❌ | 𝐅𝐢𝐥𝐞 𝐫𝐞𝐩𝐥𝐲 𝐤𝐨𝐫𝐨 𝐨𝐫 𝐝𝐢𝐫𝐞𝐜𝐭 𝐔𝐑𝐋 𝐝𝐚𝐨");
      }

      const waitMsg = await message.reply("⏳ | 𝐃𝐫𝐢𝐯𝐞 𝐞 𝐮𝐩𝐥𝐨𝐚𝐝 𝐡𝐨𝐜𝐜𝐡𝐞...");

      
      const res = await axios.post(
        "https://driver-public-by-arafat.vercel.app/api/upload",
        { url: fileUrl },
        { headers: { "Content-Type": "application/json" } }
      );

      
      if (!res.data || !res.data.downloadUrl) {
        throw new Error("Upload failed");
      }

      api.unsendMessage(waitMsg.messageID);

      return message.reply(
`✅ 𝐃𝐫𝐢𝐯𝐞 𝐔𝐩𝐥𝐨𝐚𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥

🔗 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐋𝐢𝐧𝐤:
${res.data.downloadUrl}`
      );

    } catch (err) {
      return message.reply("❌ | 𝐄𝐫𝐫𝐨𝐫: " + err.message);
    }
  }
};
