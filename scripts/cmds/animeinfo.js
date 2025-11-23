const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "animeinfo",
    aliases: ["aniinfo"],
    version: "1.0",
    category: "anime",
    description: "Anime info fetcher",
    usage: "af <anime name>",
    cooldown: 5,
    author: "MahMUD"
  },

  onStart: async function ({ api, event, args }) {
    if (!args[0]) return api.sendMessage("⚠️ Please enter an anime name", event.threadID, event.messageID);

    try {
      const url = `${await mahmud()}/api/animeinfo?animeName=${encodeURIComponent(args.join(" "))}`;
      const res = await axios.get(url);
      const { formatted_message, data } = res.data;

      if (!res.data || !data) return api.sendMessage("❌ Not found", event.threadID, event.messageID);

      api.sendMessage({
        body: formatted_message,
        attachment: await global.utils.getStreamFromURL(data.image_url)
      }, event.threadID, event.messageID);

    } catch (e) {
      console.error(e);
      api.sendMessage("🥹error, contact MahMUD", event.threadID, event.messageID);
    }
  }
};
