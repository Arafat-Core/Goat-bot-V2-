const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports = {
  config: {
    name: "cdp",
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    category: "love",
    guide: "{pn} Get a random Couple DP\n{pn} list  Show total number of Couple DPs"
  },

  onStart: async function ({ message, args, event, api }) {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }

    try {
      const baseURL = await mahmud();

      if (args[0] === "list") {
        const res = await axios.get(`${baseURL}/api/cdp/list`);
        const { total } = res.data;
        return message.reply(`🎀 𝐓𝐨𝐭𝐚𝐥 𝐂𝐨𝐮𝐩𝐥𝐞 𝐃𝐏: ${total}`);
      }

      const res = await axios.get(`${baseURL}/api/cdp`);
      const { boy, girl } = res.data;
      if (!boy || !girl) return message.reply("⚠ No Couple DP found.");

      const getStream = async (url) => {
        const response = await axios({
          method: "GET",
          url,
          responseType: "stream",
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        return response.data;
      };

      const attachments = [
        await getStream(boy),
        await getStream(girl)
      ];

      message.reply({
        body: "🎀 | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐜𝐝𝐩 𝐛𝐚𝐛𝐲",
        attachment: attachments
      });

    } catch (error) {
      console.error("CDP command error:", error.message || error);
      message.reply("🥹error, contact MahMUD.");
    }
  }
};
