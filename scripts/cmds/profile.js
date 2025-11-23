const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "profile",
    aliases: ["pp", "dp", "pfp"],
    version: "1.7",
    author: "MahMUD",
    role: 0,
    category: "media",
    guide: {
      en: "{pn} [mention/reply/userID/facebook profile link] - Get the profile picture.",
      bn: "{pn} [মেনশন/রিপ্লাই/ব্যবহারকারী আইডি/ফেসবুক প্রোফাইল লিঙ্ক] - প্রোফাইল ছবি দেখুন।"
    }
  },

  onStart: async function ({ event, message, usersData, args }) {
   const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
if (module.exports.config.author !== obfuscatedAuthor) {
return api.sendMessage(
"❌ | You are not authorized to change the author name.",
event.threadID,
event.messageID
);
}
    const getUserId = () => {
      const mentionedUid = Object.keys(event.mentions)[0];
      const repliedUid = event.messageReply ? event.messageReply.senderID : null;
      return mentionedUid || repliedUid || args[0] || event.senderID;
    };

    const getAvatarUrl = async (uid) => await usersData.getAvatarUrl(uid);

    let uid = getUserId();
    let avatarUrl;

    try {
      const facebookUrl = args.find(arg => arg.includes("facebook.com"));
      if (facebookUrl) {
        const match = facebookUrl.match(/facebook\.com\/(?:profile\.php\?id=)?(\d{5,})/);
        if (match) {
          uid = match[1];
        } else {
          return message.reply("❌ Could not extract user ID from the Facebook URL. Only numeric ID links are supported.");
        }
      }

      avatarUrl = await getAvatarUrl(uid);
      if (!avatarUrl) throw new Error("No avatar found");

      const avatarStream = await global.utils.getStreamFromURL(avatarUrl);
      message.reply({
        body: "😘 𝐇𝐞𝐫𝐞 𝐢𝐬 𝐭𝐡𝐞 𝐩𝐫𝐨𝐟𝐢𝐥𝐞 𝐢𝐦𝐚𝐠𝐞",
        attachment: avatarStream
      });
    } catch (e) {
      message.reply("❌ Failed to fetch the profile image. Please check the input and try again.");
    }
  }
};
