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
    name: "actor",
    aliases: ["actorgame"],
    version: "1.7",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "game",
    guide: { en: "{pn}" }
  },

  onReply: async function ({ api, event, Reply, usersData }) {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 

    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }

    const { actorNames, author } = Reply;
    const getCoin = 500;
    const getExp = 121;

    const userData = await usersData.get(event.senderID);
    if (event.senderID !== author) {
    return api.sendMessage("❌ This is not your question!", event.threadID, event.messageID);
    }

    const reply = event.body.toLowerCase();
    await api.unsendMessage(Reply.messageID);
    const isCorrect = actorNames.some(name => reply.includes(name.toLowerCase()));
    if (isCorrect) {
      userData.money += getCoin;
      userData.exp += getExp;
      await usersData.set(event.senderID, userData);

      return api.sendMessage(
        `✅ Correct answer baby!\nYou earned ${getCoin} coins & ${getExp} exp.`,
        event.threadID,
        event.messageID
      );
    } else {
      return api.sendMessage(
        `🥺 Wrong answer baby!\nCorrect actor: ${actorNames.join(", ")}`,
        event.threadID,
        event.messageID
      );
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const apiUrl = await baseApiUrl();
      const response = await axios.get(`${apiUrl}/api/actor`);
      const { name, imgurLink } = response.data.actor;

      const actorNames = Array.isArray(name) ? name : [name];
      const imageStream = await axios({
        url: imgurLink,
        method: "GET",
        responseType: "stream",
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      api.sendMessage(
        {
          body: "A random actor has appeared! Guess the actor name",
          attachment: imageStream.data
        },
        event.threadID,
        (err, info) => {
          if (err) return api.sendMessage("❌ Failed to send image.", event.threadID);

          global.GoatBot.onReply.set(info.messageID, {
            commandName: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            actorNames
          });

          setTimeout(() => api.unsendMessage(info.messageID), 40000);
        },
        event.messageID
      );

    } catch (err) {
      console.error("ActorGame Error:", err.message);
      return api.sendMessage(`🥹error, contact MahMUD`, event.threadID, event.messageID);
    }
  }
};
