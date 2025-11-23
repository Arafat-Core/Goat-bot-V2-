const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports = {
  config: {
    name: "flaggame",
    aliases: ["flag"],
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
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage("❌ You are not authorized to change the author name.", event.threadID, event.messageID);
    }

    const { flag, author } = Reply;
    const getCoin = 500;
    const getExp = 121;
    const userData = await usersData.get(event.senderID);

    if (event.senderID !== author) {
      return api.sendMessage("❌ This is not your flag, baby >🐸", event.threadID, event.messageID);
    }

    const reply = event.body.toLowerCase();
    await api.unsendMessage(Reply.messageID);

    if (reply === flag.toLowerCase()) {
      userData.money += getCoin;
      userData.exp += getExp;
      await usersData.set(event.senderID, userData);

      return api.sendMessage(
        `✅ | Correct answer, baby!\nYou have earned ${getCoin} coins and ${getExp} exp.`,
        event.threadID,
        event.messageID
      );
    } else {
      return api.sendMessage(
        `🥺 | Wrong Answer, baby!\nCorrect answer was: ${flag}`,
        event.threadID,
        event.messageID
      );
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const apiUrl = await baseApiUrl();
      const response = await axios.get(`${apiUrl}/api/flag`, {
        responseType: "json",
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const { link, country } = response.data;

      const imageStream = await axios({
        method: "GET",
        url: link,
        responseType: "stream",
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      api.sendMessage(
        {
          body: "🌍 A random flag has appeared! Guess the country name.",
          attachment: imageStream.data
        },
        event.threadID,
        (err, info) => {
          if (err) return api.sendMessage("❌ Failed to send flag image.", event.threadID);

          global.GoatBot.onReply.set(info.messageID, {
            commandName: module.exports.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            flag: country
          });

          setTimeout(() => {
            api.unsendMessage(info.messageID);
          }, 40000); 
        },
        event.messageID
      );
    } catch (error) {
      console.error("FlagGame Error:", error.message);
      api.sendMessage(`🥹error, contact MahMUD.: ${error.message}`, event.threadID, event.messageID);
    }
  }
};
