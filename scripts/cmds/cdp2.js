const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "copuledp2",
    aliases: ["cdp2"],
    version: "1.7",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    longDescription: "Fetch a random couple DP for nibba and nibbi",
    category: "image",
    guide: "{pn}"
  },

  onStart: async function ({ message, event, api }) {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }

    try {
      const response = await axios.get(`${await baseApiUrl()}/api/cdp2`, {
        headers: { "author": module.exports.config.author }
      });

      if (response.data.error)
        return message.reply(response.data.error);

      const { male, female } = response.data;
      if (!male || !female)
        return message.reply("Couldn't fetch couple DP. Try again later.");

      const attachments = [
        await global.utils.getStreamFromURL(male),
        await global.utils.getStreamFromURL(female)
      ];

      await message.reply({
        body: "Here is your cdp <😘",
        attachment: attachments
      });

    } catch (error) {
      console.error("CDP Fetch Error:", error);
      message.reply("🥹error, contact MahMUD.");
    }
  }
};
