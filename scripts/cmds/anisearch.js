const { GoatWrapper } = require('fca-liane-utils');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function getStreamFromURL(url) {
  const response = await axios.get(url, { responseType: 'stream' });
  return response.data;
}

async function fetchTikTokVideos(query) {
  try {
    const response = await axios.get(`https://short-video-api-by-arafat.vercel.app/arafat?keyword=${query}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = {
  config: {
    name: "anisearch",
    aliases: ["anisr"],
    author: "Arafat",
    version: "1.0",
    shortDescription: {
      en: "get anime edit",
    },
    longDescription: {
      en: "search for anime edits video",
    },
    category: "𝗠𝗘𝗗𝗜𝗔",
    guide: {
      en: "{p}{n} [query]",
    },
  },
  onStart: async function ({ api, event, args }) {
     api.setMessageReaction("✨", event.messageID, (err) => {}, true);
    const query = args.join(' ');
    const modifiedQuery = `${query} anime edit`;

    const videos = await fetchTikTokVideos(modifiedQuery);

    if (!videos || videos.length === 0) {
      api.sendMessage({ body: `${query} not found.` }, event.threadID, event.messageID);
      return;
    }

    const selectedVideo = videos[Math.floor(Math.random() * videos.length)];
    const videoUrl = selectedVideo.videoUrl;

    if (!videoUrl) {
      api.sendMessage({ body: 'Error: Video not found.' }, event.threadID, event.messageID);
      return;
    }

    try {
      const videoStream = await getStreamFromURL(videoUrl);

      await api.sendMessage({
        body: ``,
        attachment: videoStream,
      }, event.threadID, event.messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage({ body: 'An error occurred while processing the video.\nPlease try again later.' }, event.threadID, event.messageID);
    }
  },
};
const wrapper = new GoatWrapper(module.exports);
    wrapper.applyNoPrefix({ allowPrefix: true });
