const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports = {
  config: {
    name: "freefire",
    aliases: ["ffqz", "ffgame", "ffquiz", "ff"],
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
    const { character, author } = Reply;
    const getCoin = 500;
    const getExp = 121;
    const userData = await usersData.get(event.senderID);

    if (event.senderID !== author) return;

    const reply = event.body.toLowerCase();
    if (reply === character.toLowerCase()) {
      await api.unsendMessage(Reply.messageID);
      userData.money += getCoin;
      userData.exp += getExp;
      await usersData.set(event.senderID, userData);
      api.sendMessage(
        `✅ | Correct answer, baby.\nYou have earned ${getCoin} coins and ${getExp} exp.`,
        event.threadID,
        event.messageID
      );
    } else {
      await api.unsendMessage(Reply.messageID);
      api.sendMessage(
        `❌ | Wrong Answer baby\nThe Correct answer was: ${character}`,
        event.threadID,
        event.messageID
      );
    }
  },

  onStart: async function ({ api, event, usersData }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);

    try {
      const apiUrl = await baseApiUrl();
      const apiRes = await axios.get(`${apiUrl}/api/freefire`);
      const randomCharacter = apiRes.data?.freefire;

      if (
        !randomCharacter ||
        !randomCharacter.name ||
        !randomCharacter.imgurLink ||
        !/^https?:\/\//.test(randomCharacter.imgurLink)
      )
        return;

      const imageStream = await axios({
        url: randomCharacter.imgurLink,
        method: "GET",
        responseType: "stream",
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      api.sendMessage(
        {
          body: "A random Free Fire character has appeared! Guess the character name.",
          attachment: imageStream.data
        },
        event.threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: senderID,
            character: randomCharacter.name
          });

          setTimeout(() => {
            api.unsendMessage(info.messageID);
          }, 40000);
        },
        event.messageID
      );
    } catch (error) {
      api.sendMessage(
        "🥹error, contact MahMUD.",
        event.threadID,
        event.messageID
      );
    }
  }
};
