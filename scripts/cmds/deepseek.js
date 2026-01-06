const axios = require("axios");

const API_JSON =
  "https://raw.githubusercontent.com/Arafat-Core/cmds/refs/heads/main/api.json";

module.exports = {
  config: {
    name: "deepseek",
    aliases: ["ds"],
    version: "1.6",
    author: "Arafat",
    role: 0,
    description: {
      en: "DeepSeek AI (No Prefix, Clean Reply)"
    },
    category: "AI",
    usePrefix: false
  },

  onStart: async function () {},

  
  onChat: async function ({ message, event }) {
    try {
      const body = event.body || "";
      const lower = body.toLowerCase();

    
      if (
        !lower.startsWith("deepseek ") &&
        !lower.startsWith("ds ")
      ) {
        return;
      }

      const prompt = body.split(" ").slice(1).join(" ").trim();
      if (!prompt) return;

    
      const apiRes = await axios.get(API_JSON);
      const BASE_API = apiRes.data.api;

      const res = await axios.post(
        `${BASE_API}/deepseek`,
        { prompt },
        { headers: { "Content-Type": "application/json" } }
      );

      if (!res.data?.success) {
        return message.reply("❌ Failed to get response.");
      }

      
      return message.reply(res.data.reply);

    } catch (err) {
      return message.reply(
        err.response?.data?.error || err.message
      );
    }
  }
};
