const { GoatWrapper } = require('fca-liane-utils');
const axios = require('axios');

async function getStreamFromURL(url) {
  const response = await axios.get(url, { responseType: 'stream' });
  return response.data;
}

async function fetchLyricsVideos(query) {
  try {
    const response = await axios.get(`https://short-video-api-by-arafat.vercel.app/arafat?keyword=${encodeURIComponent(query + " lyrics video")}`);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
}

module.exports = {
  config: {
    name: "lyrics",
    aliases: ["lrvideo"],
    author: "𝗔𝗿𝗮𝗳𝗮𝘁",
    version: "1.0",
    shortDescription: {
      en: "get lyrics video",
    },
    longDescription: {
      en: "search for songs' lyrics videos",
    },
    category: "𝗠𝗘𝗗𝗜𝗔",
    guide: {
      en: "{p}{n} [song name]",
    },
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(' ');
    if (!query) {
      return api.sendMessage("#𝐥𝐫𝐯𝐢𝐝𝐞𝐨 𝐒𝐨𝐧𝐠 𝐧𝐚𝐦𝐞", event.threadID, event.messageID);
    }

    api.setMessageReaction("🦋", event.messageID, () => {}, true);
    
    const videos = await fetchLyricsVideos(query);

    if (!Array.isArray(videos) || videos.length === 0) {
      return api.sendMessage(`"${query}" 𝐍𝐨𝐭 𝐅𝐨𝐮𝐧𝐝`, event.threadID, event.messageID);
    }

    const selectedVideo = videos[Math.floor(Math.random() * videos.length)];
    const videoUrl = selectedVideo.videoUrl;

    if (!videoUrl) {
      return api.sendMessage("𝐍𝐨 𝐥𝐲𝐫𝐢𝐜𝐬 𝐕𝐢𝐝𝐞𝐨 𝐅𝐨𝐮𝐧𝐝", event.threadID, event.messageID);
    }

    try {
      const videoStream = await getStreamFromURL(videoUrl);
      await api.sendMessage({
        body: `𝐋𝐲𝐫𝐢𝐜𝐬: ${query}`,
        attachment: videoStream,
      }, event.threadID, event.messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage("𝐄𝐫𝐫𝐨𝐫 𝐁𝐚𝐛𝐲 🥺", event.threadID, event.messageID);
    }
  },
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
