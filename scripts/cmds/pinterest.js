const axios = require('axios');
const fs = require('fs');

module.exports = {
  config: {
    name: 'pinterest',
    aliases: ['pin', 'pinterestsearch'],
    version: '1.0.2',
    author: 'Arafat',
    cooldown: 5,
    role: 0,
    shortDescription: '𝐏𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭 𝐈𝐦𝐚𝐠𝐞 𝐒𝐞𝐚𝐫𝐜𝐡',
    longDescription: '𝐒𝐞𝐚𝐫𝐜𝐡 𝐢𝐦𝐚𝐠𝐞𝐬 𝐯𝐢𝐚 𝐏𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭',
    category: 'search'
  },

  onStart: async function ({ api, args, event, utils }) {
    const threadID = event.threadID;

    try {
      if (!args || args.length === 0) {
        return api.sendMessage(
          "𝐔𝐬𝐚𝐠𝐞: .pinterest <search item> [amount]\n𝐄𝐱𝐚𝐦𝐩𝐥𝐞: .pinterest naruto 50",
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
        `𝐒𝐞𝐚𝐫𝐜𝐡𝐢𝐧𝐠 𝐟𝐨𝐫 '${query}'\n𝐏𝐥𝐞𝐚𝐬𝐞 𝐖𝐚𝐢𝐭... (𝐀𝐦𝐨𝐮𝐧𝐭: ${limit})`,
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
        return api.sendMessage(`𝐍𝐨 𝐢𝐦𝐚𝐠𝐞𝐬 𝐟𝐨𝐮𝐧𝐝 𝐟𝐨𝐫 '${query}'.`, threadID);
      }

      const sendLimit = Math.min(limit, images.length);
      const batches = [];

      for (let i = 0; i < sendLimit; i += 5) {
        batches.push(images.slice(i, i + 5));
      }

      for (const batch of batches) {
        const attachments = [];

        for (const imgUrl of batch) {
          try {
            if (utils && typeof utils.getStreamFromURL === 'function') {
              attachments.push(await utils.getStreamFromURL(imgUrl));
            } else {
              attachments.push(imgUrl);
            }
          } catch {
            attachments.push(null);
          }
        }

        try {
          const valid = attachments.filter(a => !!a);

          if (valid.length > 0) {
            await api.sendMessage(
              { body: `𝐇𝐞𝐫𝐞 𝐚𝐫𝐞 ${valid.length} 𝐢𝐦𝐚𝐠𝐞𝐬 𝐟𝐨𝐫 '${query}':`, attachment: valid },
              threadID
            );
          }

          const failed = batch.filter((_, i) => !attachments[i]);
          for (const urlFail of failed) {
            await api.sendMessage(`𝐈𝐦𝐚𝐠𝐞 𝐋𝐢𝐧𝐤: ${urlFail}`, threadID);
          }

        } catch {
          for (const imgUrl of batch) {
            await api.sendMessage(`𝐈𝐦𝐚𝐠𝐞: ${imgUrl}`, threadID);
          }
        }
      }

      try { await api.unsendMessage(loadingMsg.messageID); } catch {}

    } catch (error) {
      console.error('Pinterest Error:', error);
      try {
        if (event && event.threadID) {
          await api.sendMessage('𝐒𝐞𝐫𝐯𝐞𝐫 𝐄𝐫𝐫𝐨𝐫. 𝐓𝐫𝐲 𝐀𝐠𝐚𝐢𝐧.', event.threadID);
        }
      } catch {}
    }
  }
};
