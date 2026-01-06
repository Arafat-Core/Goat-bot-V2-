const axios = require("axios");

module.exports = {
  config: {
    name: "gpt",
    aliases: ["chatgpt"],
    version: "1.0.0",
    author: "𝐀𝐫𝐚𝐟𝐚𝐭",
    countDown: 5,
    role: 0,
    shortDescription: "𝐜𝐡𝐚𝐭 𝐠𝐩𝐭 𝐂𝐨𝐦𝐦𝐚𝐧𝐝",
    longDescription: "𝐂𝐡𝐚𝐭 𝐰𝐢𝐭𝐡 𝐀𝐈 𝐮𝐬𝐢𝐧𝐠 𝐀𝐫𝐚𝐟𝐚𝐭'𝐬 𝐜𝐮𝐬𝐭𝐨𝐦 𝐆𝐏𝐓 𝐀𝐏𝐈",
    category: "𝐚𝐢",
    guide: {
      en: "{pn} 𝐲𝐨𝐮𝐫 𝐪𝐮𝐞𝐬𝐭𝐢𝐨𝐧"
    }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");

    if (!prompt) {
      return api.sendMessage("𝐓𝐲𝐩𝐞 𝐲𝐨𝐮𝐫 𝐪𝐮𝐞𝐬𝐭𝐢𝐨𝐧", event.threadID, event.messageID);
    }

    try {
      const res = await axios.post(
        "https://arafat-gpt-api.vercel.app/api/chat",
        {
          messages: [
            { role: "user", content: prompt }
          ]
        },
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      const ai = res.data?.choices?.[0]?.message?.content;

      if (!ai) {
        return api.sendMessage("𝐀𝐏𝐈 𝐧𝐨 𝐫𝐞𝐬𝐩𝐨𝐧𝐬𝐞", event.threadID, event.messageID);
      }

      return api.sendMessage(ai, event.threadID, event.messageID);

    } catch (e) {
      console.log(e);
      return api.sendMessage("❌ 𝐄𝐫𝐫𝐨𝐫: " + e.message, event.threadID, event.messageID);
    }
  }
};
