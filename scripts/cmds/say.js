const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud
};

module.exports = {
  config: {
    name: "say",
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    category: "media",
    guide: "{pn} <text> (or reply to a message)",
  },

  onStart: async function ({ api, message, args, event }) {
    let text = args.join(" ");

    if (event.type === "message_reply" && event.messageReply.body) {
      text = event.messageReply.body;
    }

    if (!text) {
      return message.reply("⚠️ দয়া করে কিছু লিখুন বা একটি মেসেজে রিপ্লাই দিন!");
    }

    try {
      const baseUrl = await baseApiUrl();
      const response = await axios.get(`${baseUrl}/api/say`, {
        params: { text },
        headers: { "Author": module.exports.config.author },
        responseType: "stream",
      });

      if (response.data.error) {
        return message.reply(`${response.data.error}`);
      }

      message.reply({
        body: "",
        attachment: response.data,
      });

    } catch (e) {
      console.error("API Error:", e.response ? e.response.data : e.message);
      message.reply("🥹error, contact MahMUD.\n" + (e.response?.data?.error || e.message));
    }
  },
};
