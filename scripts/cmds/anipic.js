const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "anipic",
    aliases: ["animepic"],
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    category: "anime",
    guide: "{pn} <category>"
  },

  onStart: async function ({ event, args, api }) {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage(
        "❌ | You are not authorized to change the author name.",
        event.threadID,
        event.messageID
      );
    }

    const categories = ["gojo", "naruto", "goku", "luffy", "itachi", "madara", "ichigo", "aizen"];

    if (!args[0]) {
      return api.sendMessage(
        `Please select a category:\n• ${categories.join("\n• ")}`,
        event.threadID,
        event.messageID
      );
    }

    const category = args[0].toLowerCase();
    if (!categories.includes(category)) {
      return api.sendMessage(
        `Invalid category! Choose one from:\n${categories.join(", ")}`,
        event.threadID,
        event.messageID
      );
    }

    try {
      const baseURL = await mahmud();

      const imageStream = await axios({
        method: "GET",
        url: `${baseURL}/api/anipic?category=${category}`,
        responseType: "stream",
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      const caption = `Here's your ${category} image <😘`;

      api.sendMessage(
        { body: caption, attachment: imageStream.data },
        event.threadID,
        event.messageID
      );

    } catch (err) {
      api.sendMessage(
        "🥹error, Contact MahMUD.",
        event.threadID,
        event.messageID
      );
    }
  }
};
