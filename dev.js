const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "dev",
		version: "1.5",
		author: "Arafat",
		countDown: 5,
		role: 0,
		shortDescription: {
			en: "Add, remove, edit dev role"
		},
		longDescription: {
			en: "Add, remove, edit dev role"
		},
		category: "owner",
		guide: {
			en: '{pn} [add | -a] <uid | @tag | reply>: Add dev role\n'
				+ '{pn} [remove | -r] <uid | @tag | reply>: Remove dev role\n'
				+ '{pn} [list | -l]: List all devs'
		}
	},

	langs: {
		en: {
			added: "✅ | Added dev role for %1 user(s):\n%2",
			alreadyAdmin: "\n⚠️ | %1 user(s) already had dev role:\n%2",
			missingIdAdd: "⚠️ | Please mention, reply, or provide UID to add.",
			removed: "✅ | Removed dev role from %1 user(s):\n%2",
			notAdmin: "⚠️ | %1 user(s) don't have dev role:\n%2",
			missingIdRemove: "⚠️ | Please mention, reply, or provide UID to remove.",
			listAdmin: "👑 | Current DEV list:\n%1"
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang, api }) {
		const permission = config.DEV;
		if (!permission.includes(event.senderID)) {
			return message.reply("You don't have permission to use this command.");
		}

		const sub = args[0];
		const getUIDs = () => {
			if (Object.keys(event.mentions).length > 0)
				return Object.keys(event.mentions);
			if (event.messageReply)
				return [event.messageReply.senderID];
			return args.slice(1).filter(arg => /^\d+$/.test(arg));
		};

		switch (sub) {
			case "add":
			case "-a": {
				const uids = getUIDs();
				if (uids.length === 0)
					return message.reply(getLang("missingIdAdd"));

				const alreadyDev = [], newDevs = [];
				for (const uid of uids) {
					if (config.DEV.includes(uid)) {
						alreadyDev.push(uid);
					} else {
						config.DEV.push(uid);
						newDevs.push(uid);
					}
				}

				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				const getNames = await Promise.all(
					uids.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
				);

				return message.reply(
					(newDevs.length > 0 ? getLang("added", newDevs.length, getNames.filter(({ uid }) => newDevs.includes(uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "") +
					(alreadyDev.length > 0 ? getLang("alreadyAdmin", alreadyDev.length, getNames.filter(({ uid }) => alreadyDev.includes(uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
				);
			}

			case "remove":
			case "-r": {
				const uids = getUIDs();
				if (uids.length === 0)
					return message.reply(getLang("missingIdRemove"));

				const removed = [], notDev = [];
				for (const uid of uids) {
					if (config.DEV.includes(uid)) {
						config.DEV.splice(config.DEV.indexOf(uid), 1);
						removed.push(uid);
					} else {
						notDev.push(uid);
					}
				}

				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

				const getNames = await Promise.all(
					uids.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
				);

				return message.reply(
					(removed.length > 0 ? getLang("removed", removed.length, getNames.filter(({ uid }) => removed.includes(uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "") +
					(notDev.length > 0 ? getLang("notAdmin", notDev.length, getNames.filter(({ uid }) => notDev.includes(uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
				);
			}

			case "list":
			case "-l": {
				const getNames = await Promise.all(
					config.DEV.map(uid => usersData.getName(uid).then(name => `• ${name} (${uid})`))
				);
				return message.reply(getLang("listAdmin", getNames.join("\n")));
			}

			default:
				return message.SyntaxError();
		}
	}
};
