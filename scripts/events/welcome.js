const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "welcome",
    version: "2.0",
    author: "Arafat",
    category: "events"
  },

  onStart: async function ({ api, event }) {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID, logMessageData } = event;
    const newUsers = logMessageData.addedParticipants;
    const botID = api.getCurrentUserID();

    if (newUsers.some(u => u.userFbId === botID)) return;

    const threadInfo = await api.getThreadInfo(threadID);
    const groupName = threadInfo.threadName;
    const memberCount = threadInfo.participantIDs.length;

    for (const user of newUsers) {
      const userId = user.userFbId;
      const fullName = user.fullName;

      try {
        const timeStr = new Date().toLocaleString("en-BD", {
          timeZone: "Asia/Dhaka",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          weekday: "long",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour12: true
        });

        const apiUrl =
          `https://welcome-v2.vercel.app/api/welcome-arafat?name=${encodeURIComponent(fullName)}&uid=${userId}&threadname=${encodeURIComponent(groupName)}&members=${memberCount}`;

        const tmp = path.join(__dirname, "..", "cache");
        await fs.ensureDir(tmp);
        const imagePath = path.join(tmp, `welcome_${userId}.png`);

        const response = await axios.get(apiUrl, {
          responseType: "arraybuffer"
        });
        fs.writeFileSync(imagePath, response.data);

        await api.sendMessage(
          {
            body:
              `‎𝐇𝐞𝐥𝐥𝐨 ${fullName}\n` +
              `𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨 ${groupName}\n` +
              `𝐘𝐨𝐮'𝐫𝐞 𝐭𝐡𝐞 ${memberCount} 𝐦𝐞𝐦𝐛𝐞𝐫 𝐨𝐧 𝐭𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩, 𝐩𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐣𝐨𝐲 🎉\n` +
              `━━━━━━━━━━━━━━━━\n` +
              `📅 ${timeStr}`,
            attachment: fs.createReadStream(imagePath),
            mentions: [{ tag: fullName, id: userId }]
          },
          threadID
        );

        fs.unlinkSync(imagePath);

      } catch (err) {
        console.error("❌ Error sending welcome message:", err);
      }
    }
  }
};
