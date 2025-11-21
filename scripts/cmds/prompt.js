const axios = require("axios");

const getArafatPromptAPI = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/Arafat-Core/Arafat-api-zone/main/api.json"
  );
  return base.data.arafat_prompt; 
};

module.exports = {
  config: {
    name: "prompt",
    aliases: ["p"],
    version: "2.0",
    author: "Arafat",
    category: "ai",
    guide: {
      en: "{pn} reply an image with your prompt text"
    }
  },

  onStart: async function ({ api, event, args }) {
    
    const apiBase = await getArafatPromptAPI();
    const apiUrl = `${apiBase}/api/prompt`;

    const prompt = args.join(" ") || "Describe this image";

    
    if (
      event.type === "message_reply" &&
      event.messageReply.attachments[0]?.type === "photo"
    ) {
      try {
        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        const imageUrl = event.messageReply.attachments[0].url;

        const response = await axios.post(
          apiUrl,
          { imageUrl, prompt },
          {
            headers: {
              "Content-Type": "application/json",
              "author": module.exports.config.author
            }
          }
        );

        const output =
          response.data.response ||
          response.data.error ||
          "No response.";

        api.sendMessage(output, event.threadID, event.messageID);
        api.setMessageReaction("✅", event.messageID, () => {}, true);

      } catch (err) {
        api.sendMessage(
          "❌ API error! Prompt server not responding.", 
          event.threadID,
          event.messageID
        );
        api.setMessageReaction("💔", event.messageID, () => {}, true);
      }

      return;
    }

    api.sendMessage(
      "📸 Please reply to an image and type your prompt.",
      event.threadID,
      event.messageID
    );
  }
};
