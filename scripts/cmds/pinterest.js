const axios = require('axios');

module.exports = {
  config: {
    name: 'pinterest',
    aliases: ['pin', 'pinterestsearch'],
    version: '1.0.3',
    author: 'Arafat',
    cooldown: 5,
    role: 0,
    shortDescription: 'Pinterest Image Search',
    longDescription: 'Search images via Pinterest',
    category: 'search'
  },

  onStart: async function ({ api, args, event, utils }) {
    const threadID = event.threadID;

    try {
      if (!args || args.length === 0) {
        return api.sendMessage(
          "Usage: .pinterest <search item> [amount]\nExample: .pinterest naruto 50",
          threadID
        );
      }

      let limit = 6;
      let query = args.join(' ');
      const lastArg = args[args.length - 1];
      const parsed = parseInt(lastArg, 10);

      
      if (!isNaN(parsed) && args.length > 1) {
        limit = parsed;
        query = args.slice(0, -1).join(' ');
      }

      const apiBase = 'https://arafat-pinterest-api.vercel.app/pinterest';
      const url = `${apiBase}?search=${encodeURIComponent(query)}&limit=${limit}`;

      const loadingMsg = await api.sendMessage(
        `Searching '${query}'`,
        threadID
      );

      const resp = await axios.get(url, { timeout: 15000 });
      const respData = resp.data;

      let images = [];

      if (Array.isArray(respData)) images = respData.filter(u => typeof u === 'string');
      else if (respData && Array.isArray(respData.data)) images = respData.data.filter(u => typeof u === 'string');
      else if (respData && Array.isArray(respData.results)) images = respData.results.filter(u => typeof u === 'string');

      if (!images || images.length === 0) {
        try { await api.unsendMessage(loadingMsg.messageID); } catch (e) {}
        return api.sendMessage(`No images found for '${query}'.`, threadID);
      }

      const sendLimit = Math.min(limit, images.length);
      const attachments = [];

      
      for (const imgUrl of images.slice(0, sendLimit)) {
        try {
          if (utils && typeof utils.getStreamFromURL === 'function') {
            attachments.push(await utils.getStreamFromURL(imgUrl));
          } else {
            const img = await axios.get(imgUrl, { responseType: 'stream' });
            attachments.push(img.data);
          }
        } catch (e) {
          console.log("Failed to load:", imgUrl);
        }
      }

      
      if (attachments.length > 0) {
        await api.sendMessage(
          { attachment: attachments },
          threadID
        );
      }

      try { await api.unsendMessage(loadingMsg.messageID); } catch {}

    } catch (error) {
      console.error('Pinterest Error:', error);
      try {
        await api.sendMessage('Server error. Try again later.', event.threadID);
      } catch {}
    }
  }
};
