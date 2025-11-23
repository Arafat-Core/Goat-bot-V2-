const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); // "MahMUD"

module.exports = {
  config: {
    name: "waifugame",
    aliases: ["waifu"],
    version: "1.7",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "game",
    guide: {
      en: "{pn}"
    }
  },

  onReply: async function ({ api, event, Reply, usersData }) {
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.\n", event.threadID, event.messageID);
    }

    const { waifu, author, messageID } = Reply;
    const getCoin = 500;
    const getExp = 121;

    if (event.senderID !== author) {
      return api.sendMessage("𝐓𝐡𝐢𝐬 𝐢𝐬 𝐧𝐨𝐭 𝐲𝐨𝐮𝐫 𝐪𝐮𝐢𝐳 𝐛𝐚𝐛𝐲 >🐸", event.threadID, event.messageID);
    }

    const reply = event.body.toLowerCase();
    const userData = await usersData.get(event.senderID);

    if (reply === waifu.toLowerCase()) {
      await api.unsendMessage(messageID);
      await usersData.set(event.senderID, {
        money: userData.money + getCoin,
        exp: userData.exp + getExp
      });
      return api.sendMessage(`✅ | Correct answer baby\nYou have earned ${getCoin} coins and ${getExp} exp.`, event.threadID, event.messageID);
    } else {
      await api.unsendMessage(messageID);
      return api.sendMessage(`❌ | Wrong Answer\nCorrect answer was: ${waifu}`, event.threadID, event.messageID);
    }
  },

  onStart: async function ({ api, event }) {
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.\n", event.threadID, event.messageID);
    }

    try {
      const apiUrl = await baseApiUrl();
      const response = await axios.get(`${apiUrl}/api/waifu`);
      const { name, imgurLink } = response.data.waifu;

      const imageStream = await axios({
        url: imgurLink,
        method: "GET",
        responseType: "stream",
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      api.sendMessage(
        {
          body: "A random waifu has appeared! Guess the waifu name.",
          attachment: imageStream.data
        },
        event.threadID,
        (err, info) => {
          if (err) return;
          global.GoatBot.onReply.set(info.messageID, {
            commandName: module.exports.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            waifu: name
          });

          setTimeout(() => {
            api.unsendMessage(info.messageID);
          }, 40000);
        },
        event.messageID
      );
    } catch (error) {
      console.error("Error:", error.message);
      api.sendMessage("🥹error, contact MahMUD.", event.threadID, event.messageID);
    }
  }
};
