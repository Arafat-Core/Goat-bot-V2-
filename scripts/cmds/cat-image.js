const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "cat",
    version: "1.7",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "image",
    guide: "{pn}"
  },

  onStart: async function ({ message, event, api }) {
    try {
      const apiUrl = await baseApiUrl();
      const res = await axios.get(`${apiUrl}/api/catimg/random-cats`);
      const images = res.data?.images;
      
      if (!images || images.length === 0) 
        return message.reply("No cat images found from API.");

      const attachments = await Promise.all(images.map(url => getStreamFromURL(url)));
      
      await api.sendMessage({
        body: "🐱 | | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐫𝐚𝐧𝐝𝐨𝐦 𝐜𝐚𝐭 𝐢𝐦𝐚𝐠𝐞𝐬",
        attachment: attachments
      }, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      message.reply("An error occurred while fetching cat images.");
    }

    async function getStreamFromURL(url) {
      const response = await axios({
        method: "GET",
        url,
        responseType: "stream",
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      return response.data;
    }
  }
};
