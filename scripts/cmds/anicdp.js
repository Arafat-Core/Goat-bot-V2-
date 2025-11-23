const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "anicdp",
    aliases: ["animecdp"],
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    category: "media",
    guide: "{p}animecdp"
  },

  onStart: async function ({ message }) {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }
    try {
      const apiBase = await mahmud();
      const baseUrl = `${apiBase}/api/cdpvip2`;

      const getStream = async (url) => {
        const res = await axios({
          url,
          method: "GET",
          responseType: "stream",
          headers: { "User-Agent": "Mozilla/5.0" }
        });
        return res.data;
      };

      const category = "anime";

      const res = await axios.get(`${baseUrl}?category=${category}`);
      const groupImages = res.data?.group || [];

      if (!groupImages.length)
        return message.reply(`⚠ No DP found in "${category}" category.`);

      const streamAttachments = [];
      for (const url of groupImages) {
        try {
          const stream = await getStream(url);
          streamAttachments.push(stream);
        } catch {
          console.warn(`⚠ Failed to load image: ${url}`);
        }
      }

      if (!streamAttachments.length)
        return message.reply("❌ All image URLs failed to load.");

      return message.reply({
        body: `🎀 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐫𝐚𝐧𝐝𝐨𝐦 𝐚𝐧𝐢𝐦𝐞 𝐜𝐝𝐩 𝐛𝐚𝐛𝐲.`,
        attachment: streamAttachments
      });

    } catch (err) {
      console.error("Full error:", err.response?.data || err.message);
      return message.reply("🥹error, contact MahMUD");
    }
  }
};
