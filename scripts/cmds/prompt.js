const axios = require("axios");

const API_JSON_URL =
  "https://raw.githubusercontent.com/Arafat-Core/cmds/refs/heads/main/api.json";

let API_BASE = null;

async function getApiBase() {
  if (API_BASE) return API_BASE;
  try {
    const { data } = await axios.get(API_JSON_URL, { timeout: 5000 });
    API_BASE = data?.api;
  } catch {
    API_BASE = null;
  }
  return API_BASE;
}

module.exports = {
  config: {
    name: "prompt",
    aliases: ["p"],
    version: "1.6",
    author: "Arafat",
    role: 0,
    shortDescription: "Image to prompt",
    longDescription: "Generate an AI prompt from an image",
    category: "ai",
    guide: {
      en:
        "#prompt <image url>\n" +
        "#p <image url>\n" +
        "Reply to an image with #p"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      let imageUrl = args[0];

      if (!imageUrl && event.messageReply?.attachments?.length) {
        const att = event.messageReply.attachments[0];
        if (att.type === "photo") imageUrl = att.url;
      }

      if (!imageUrl) {
        return api.sendMessage(
          "Image URL required.",
          event.threadID,
          event.messageID
        );
      }

      const BASE = await getApiBase();
      if (!BASE) {
        return api.sendMessage(
          "API unavailable.",
          event.threadID,
          event.messageID
        );
      }

      const requestUrl =
        `${BASE}/prompt?url=` + encodeURIComponent(imageUrl);

      const { data } = await axios.get(requestUrl, { timeout: 60000 });

      if (!data || data.success === false || !data.prompt) {
        return api.sendMessage(
          "Failed to generate prompt.",
          event.threadID,
          event.messageID
        );
      }

      return api.sendMessage(
        data.prompt,
        event.threadID,
        event.messageID
      );
    } catch (err) {
      return api.sendMessage(
        "Error: " + (err?.message || "unknown"),
        event.threadID,
        event.messageID
      );
    }
  }
};
