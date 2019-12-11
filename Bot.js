const Discord = require("discord.js");
const bot = new Discord.Client();
const caraquiz = require("./CaraQuiz.js");
const YoutubeStream = require("ytdl-core");
const config = require("./config.json");
const Canvas = require('canvas');
const snekfetch = require('snekfetch');

bot.on("ready", function () {
	console.log("Log in as " + bot.user.tag + "!");
	console.log("Servers:");
	bot.guilds.forEach((guild) => {
		console.log(" - " + guild.name);
	});
	console.log("\n");
	bot.user.setPresence({
		game: {
			name: `${config.prefix}help`,
			type: 'WATCHING'
		},
		status: 'online'
	});
	bot.users.get(config.ownerID).send({ embed: { color: 65330, description: "Started successfully" } });
});

bot.on("error", function (error) {
	console.log("Error name: " + error.name + "\nError message:" + error.message);
});

const applyText = (canvas, text) => {
	const ctx = canvas.getContext('2d');
	let fontSize = 70;

	do {
		ctx.font = `${fontSize -= 10}px sans-serif`;
	} while (ctx.measureText(text).width > canvas.width - 300);

	return ctx.font;
};

bot.on("guildMemberAdd", async member => {
	const channel = member.guild.systemChannel;
	if (!channel)
		return;
	try {
		const canvas = Canvas.createCanvas(1024, 700);
		const ctx = canvas.getContext('2d');
		const background = await Canvas.loadImage("./welcome.png");
		ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
		ctx.strokeStyle = '#74037b';
		ctx.strokeRect(0, 0, canvas.width - 2, canvas.height - 1);
		ctx.strokeRect(1, 1, canvas.width - 3, canvas.height - 2);
		ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 3);
		ctx.strokeRect(2, 2, canvas.width - 5, canvas.height - 4);
		ctx.font = applyText(canvas, member.displayName);
		ctx.fillStyle = '#ce0707';
		ctx.fillText(member.displayName, 20, 685);
		ctx.beginPath();
		ctx.arc(825, 175, 125, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.clip();
		const avatar = await Canvas.loadImage(member.user.displayAvatarURL);
		ctx.drawImage(avatar, 700, 50, 256, 256);
		const attachment = new Discord.Attachment(canvas.toBuffer(), 'welcome-image.png');
		channel.send("Bienvenue sur ce CaraServeur, " + member + " ! <:happy_carapuce:553490319103098883>", attachment);
	} catch (exception) {
		channel.send({ embed: { color: 16711680, description: "__**ERREUR**__\nLa commande n'a pas fonctionnée <:surprised_carapuce:568777407046221824>\n\n__L'erreur suivante s'est produite:__\n" + exception + "*" } });
		bot.users.get(config.ownerID).send({ embed: { color: 16711680, description: "__**ERREUR**__\nLors de l'arrivée de l'utilisateur " + member + " sur le serveur " + member.guild.name + "\n\n__L'erreur suivante s'est produite:__\n*" + exception.stack + "*" } });
		console.log("ERREUR\nLors de l'arrivée de l'utilisateur " + member + " sur le serveur " + member.guild.name + "\nL'erreur suivante s'est produite:\n" + exception.stack);
	}
});

function printHelp(message)
{
	message.channel.send({
		embed: {
			color: 3447003,
			description: "__**Les différentes commandes**__",
			fields: [
				{
					name: `${config.prefix}help`,
					value: "Pour afficher cette aide."
				},
				{
					name: `${config.prefix}bonjour`,
					value: "Carapuce te dit bonjour."
				},
				{
					name: `${config.prefix}ping`,
					value: "Pong !"
				},
				{
					name: `${config.prefix}puce`,
					value: "Carapuce !"
				},
				{
					name: `${config.prefix}love`,
					value: "Envoie de l\'amour."
				},
				{
					name: `${config.prefix}listemojis`,
					value: "Envoie la liste des emojis du serveur."
				},
				{
					name: `${config.prefix}play [*lien ou ID de vidéo youtube*]`,
					value: "Joue la vidéo du lien (ou ID) Youtube fourni en paramètre."
				},
				{
					name: `${config.prefix}pin`,
					value: "Epingle le message qui commence par cette commande"
				},
				{
					name: `${config.prefix}quiz`,
					value: "Permet de jouer à un quiz!"
				},
				{
					name: `${config.prefix}vatar`,
					value: "Renvoie l\'URL vers votre Avatar."
				},
				{
					name: `${config.prefix}flip [pile ou face]`,
					value: "Permet de jouer à pile ou face."
				},
				{
					name: `${config.prefix}shifumi [pierre (ou p) ou feuille (ou f) ou ciseaux (ou c)]`,
					value: "Permet de jouer à shifumi (ou pierre feuille ciseaux selon comment tu appelles ce jeu)."
				},
				{
					name: `${config.prefix}DansLaWhiteList`,
					value: "Permet de savoir si vous êtes dans la white list."
				},
				{
					name: `${config.prefix}invite`,
					value: "Permet d'obtenir un lien d'invitation du bot, si vous voulez l'inviter sur votre serveur."
				}
			],
		}
	});
}

let listMusics = [];
let isPlayingMusic = false;

function setURL(content, channel) {
	let args = content.split(" ");
	let requestUrl;

	if (args[1]) {
		if (!args[1].startsWith("https://www.youtube.com/") && !args[1].startsWith("http://www.youtube.com/") && !args[1].startsWith("www.youtube.com/"))
			requestUrl = "https://www.youtube.com/watch?v=" + args[1];
		else
			requestUrl = args[1]
		if (!YoutubeStream.validateURL(requestUrl)) {
			channel.send(`Tu dois ajouter une URL ou un identifiant de vidéo (ID) YouTube valide après avoir utilisé la commande *${config.prefix}play* 😉`);
			return ("");
		};

		if (isPlayingMusic) {
			listMusics.push(requestUrl);
			return ("");
		}
	} else {
		if (listMusics.length === 0) {
			channel.send(`Tu dois ajouter une URL ou un identifiant de vidéo (ID) YouTube valide après avoir utilisé la commande *${config.prefix}play* 😉`);
			return ("");
		} else
			requestUrl = listMusics[0];
	}
	return (requestUrl);
}


function DJCarapuce(message)
{
	let requestUrl = setURL(message.content, message.channel);

	if (requestUrl === "")
		return;
	if (message.member.voiceChannel) {
		message.member.voiceChannel.join().then(connection => {
			try {
				isPlayingMusic = true;
				let stream = YoutubeStream(requestUrl);
				stream.on('error', function (err) {
					console.log(err.stack);
					message.reply("Je n'ai pas réussi à lire cette vidéo :(");
					connection.disconnect();
				});
				connection.playStream(stream).on("end", function () {
					connection.disconnect();
					isPlayingMusic = false;
					if (listMusics.length != 0)
						listMusics.shift();
					let newMessage = message;
					message.content = message.content.split(" ")[0];
					if (listMusics.length != 0)
						DJCarapuce(newMessage);
				});
			} catch (exception) {
				connection.disconnect();
				console.log(exception);
				message.channel.send("Tu dois ajouter une URL ou un identifiant de vidéo (ID) YouTube valide après avoir utilisé la commande *!caraplay* 😉");
				isPlayingMusic = false;
				if (listMusics.length != 0)
					listMusics.shift();
			}
		}).catch(console.log);
	} else
		message.reply("Tu dois d'abord rejoindre un salon vocal!");
}

function shufumi(message) {
	let arg = message.content.split(" ");
	if (arg.length !== 2) {
		message.channel.send("Dis moi juste pierre, feuille ou ciseaux, je n'ai pas besoin d'autre chose ici <:carapuce:551198314687758357>");
		return;
	}
	if (arg[1] !== "pierre" && arg[1] !== "p" && arg[1] !== "feuille" && arg[1] !== "f" && arg[1] !== "ciseaux" && arg[1] !== "c") {
		message.channel.send("Dis moi ce que tu veux jouer quand même! <:angry_carapuce:568356340003635200>");
		return;
	}
	let pChoice = 0;
	if (arg[1].startsWith("p"))
		pChoice = 1;
	else if (arg[1].startsWith("f"))
		pChoice = 2;
	else if (arg[1].startsWith("c"))
		pChoice = 3;
	else {
		message.channel.send("Il y a eu une erreur");
		return;
	}

	let flip = Math.floor(Math.random() * 3 + 1);

	if (flip === 1)
		message.channel.send({ embed: { color: 3447003, description: "Pierre!" } });
	else if (flip === 2)
		message.channel.send({ embed: { color: 3447003, description: "Feuille!" } });
	else 
		message.channel.send({ embed: { color: 3447003, description: "Ciseaux!" } });

		if ((flip === 1 && pChoice === 2) || (flip === 2 && pChoice === 3) || (flip === 3 && pChoice === 1))
		message.channel.send("Bien joué, tu as été meilleur(e) ! <:happy_carapuce:553490319103098883>");
	else
		message.channel.send("Oh non tu n'as pas été meilleur(e)... <:sad_carapuce:562773515745361920>");
}

function flipCoin(message) {
	let arg = message.content.split(" ");

	if (arg.length !== 2) {
		message.channel.send("Dis moi juste pile ou face, je n'ai pas besoin d'autre chose ici <:carapuce:551198314687758357>");
		return;
	}
	if (arg[1] !== "pile" && arg[1] !== "face") {
		message.channel.send("Dis moi pile ou face quand même! <:angry_carapuce:568356340003635200>");
		return;
	}

	let flip = Math.floor(Math.random() * 2 + 1);

	if (flip === 1)
		message.channel.send({ embed: { color: 3447003, description: "C'est tombé sur Pile!" } });
	else
		message.channel.send({ embed: { color: 3447003, description: "C'est tombé sur Face!" } });
	if ((flip === 1 && arg[1] === "pile") || (flip === 2 && arg[1] === "face"))
		message.channel.send("Super tu as gagné!!! <:happy_carapuce:553490319103098883>");
	else
		message.channel.send("Oh non tu as perdu... <:sad_carapuce:562773515745361920>");
}

let bannedWords = ["fuck", "pute", "fils de pute", "bite", "ta race", "connard", "conard", "connasse", "conasse", "conase", "conace", "connace", "salope", "enculé"];

function redirectCommands(message) {
	if (message.guild !== null)
		console.log("Message from server " + message.guild.name + ", and from user " + message.author.username + ":\n\"" + message.content + "\"\n");

	if (message.content.startsWith(config.prefix+"play"))
		DJCarapuce(message);

	bannedWords.forEach(function (bannedWord) {
		if (!message.channel.nsfw && message.content.toLowerCase().includes(bannedWord)) {
//			message.delete()
			message.reply("je peux pas te laisser dire des cara-gros-mots... <:angry_carapuce:568356340003635200>");
			return;
		}
	});

	if (message.content === `${config.prefix}help`)
		printHelp(message);
	
	if (message.content == `${config.prefix}ownerHelp`)
		message.channel.send("Désolé mais tu n'as pas accès à cette commande... <:sad_carapuce:562773515745361920>");

	if (message.content === config.prefix+"quiz" || caraquiz.inQuizz === true || caraquiz.waitResponse === true)
		caraquiz.CaraQuiz(message);

	if (message.content === config.prefix+"ping")
		message.channel.send("Carapong ! <:carapuce:551198314687758357>");

	if (message.content === config.prefix+"vatar")
		message.reply(message.author.avatarURL);

	if (message.content === config.prefix+"bonjour") {
		message.react("553490319103098883");
		message.reply("Carabonjour à toi! <:happy_carapuce:553490319103098883>");
	}

	if (message.content === config.prefix+"puce")
		message.channel.send("Cara, carapuce !\nhttps://img.fireden.net/v/image/1527/08/1527086908147.gif");

	if (message.content === config.prefix+"love")
		message.channel.send("dab dab, I dab you some dabing love! :heart:");

	if (message.content.includes("stan"))
		message.channel.send("J\'aime embêter <@127132143842361345>");

	if (message.content.includes("ta maman") || message.content.includes("ta mère"))
		message.reply(" ON AVAIT DIT PAS LES MAMANS!!! <:angry_carapuce:568356340003635200>");

	if (message.content.includes("carapuce") || (message.content.includes("<@550786957245153290>"))) {
		const emojiCarapuce = bot.emojis.find(emoji => emoji.name === "carapuce");
		message.react(emojiCarapuce);
	}

	if (message.content === `${config.prefix}listemojis`) {
		const emojiList = message.guild.emojis.map((e) => e + " => :" + e.name + ":");
		message.channel.send(emojiList);
	}

	if (message.content.startsWith(`${config.prefix}pin`))
		message.pin();

	if (message.content.startsWith(`${config.prefix}flip`))
		flipCoin(message);

	if (message.content.startsWith(`${config.prefix}shifumi`))
		shufumi(message);
	
	if (message.content === `${config.prefix}DansLaWhiteList`) {
		if (isInWhiteList(message.author.id) || message.author.id === config.ownerID)
			message.reply("oui tu y es!");
		else
			message.reply("non tu n'y es pas.");
	}

	if (message.content === `${config.prefix}invite`)
		message.channel.send("https://discordapp.com/api/oauth2/authorize?client_id=550786957245153290&permissions=0&scope=bot");
}

function ownerDMCommands(message) {
	try {
		if (message.content === "!listGuilds") {
			let str = "";
			bot.guilds.forEach((guild) => {
				str += ("- __name:__ " + guild.name + "\n\t\t__id:__ " + guild.id + "\n\n");
			})
			message.channel.send(str);
		}

		if (message.content.startsWith("!channelsOfGuild")) {
			let args = message.content.split(" ");
			let listGuild = bot.guilds.array();
			let guild = 0;
			let str = "";
			for (let i = 0; bot.guilds.array().length; i++)
				if (listGuild[i].id == args[1]) {
					str += "__Serveur:__ " + listGuild[i].name + ",\t__id:__ " + listGuild[i].id + "\n\n";
					guild = listGuild[i];
					break;
				}
			if (guild === 0 || guild === null) {
				message.channel.send("**Error**\nID not found or guild is null.");
				return;
			}
			guild.channels.array().forEach((chan) => {
				str += ("\t- __name:__ " + chan.name + "\n\t\t__type:__ " + chan.type + "\n\t\t__id:__ " + chan.id + "\n\n");
			});
			message.channel.send(str);
		}

		if (message.content.startsWith("!messageToChannel")) {
			let args = message.content.split(" ");
			let str = "";
			args.shift();
			let id = args[0];
			args.shift();
			args.forEach((arg) => {
				str += arg + " ";
			});
			bot.channels.get(id).send(str);
		}

		if (message.content.startsWith("!sendMP")) {
			let args = message.content.split(" ");
			let str = "";
			args.shift();
			let id = args[0];
			args.shift();
			args.forEach((arg) => {
				str += arg + " ";
			});
			bot.users.get(id).send(str);
			message.channel.send("Message envoyé!");
		}

		if (message.content == "!restart");
			process.exit();

		redirectCommands(message);
	} catch (exception) {
		bot.users.get(config.ownerID).send({ embed: { color: 16711680, description: "__**ERREUR**__\nLa commande n'a pas fonctionnée pour cette raison:\n\n*" + exception.stack + "*" } });
		console.log("ERREUR\nLa commande n'a pas fonctionnée pour cette raison:\n\n" + exception.stack);
	}
}

function ownerCommands(message) {
	if (message.content === `${config.prefix}join`) {
		bot.emit('guildMemberAdd', message.member);
		return;
	}

	if (message.content == `${config.prefix}ownerHelp`) {
		printOwnerHelp(message);
		return;
	}

	if (message.content == `${config.prefix}restart`) {
		process.exit();
		return;
	}

	if (message.content === `${config.prefix}emote`) {
		message.delete();
		message.channel.send("<:carapuce:551198314687758357>");
		return;
	}

	if (message.content === `${config.prefix}happy`) {
		message.delete();
		message.channel.send("<:happy_carapuce:553490319103098883>");
		return;
	}

	if (message.content === `${config.prefix}sad`) {
		message.delete();
		message.channel.send("<:sad_carapuce:562773515745361920>");
		return;
	}

	if (message.content === `${config.prefix}angry`) {
		message.delete();
		message.channel.send("<:angry_carapuce:568356340003635200>");
		return;
	}

	if (message.content === `${config.prefix}chocked`) {
		message.delete();
		message.channel.send("<:surprised_carapuce:568777407046221824>");
		return;
	}

	redirectCommands(message);
}

function printOwnerHelp(message) {
	message.channel.send({
		embed: {
			color: 3447003,
			description: "__**Les différentes commandes**__",
			fields: [
				{
					name: `${config.prefix}emote`,
					value: "Pour afficher l\'émote Carapuce débile."
				},
				{
					name: `${config.prefix}happy`,
					value: "Pour afficher l\'émote Carapuce heureux."
				},
				{
					name: `${config.prefix}sad`,
					value: "Pour afficher l\'emote Carapuce triste."
				},
				{
					name: `${config.prefix}angry`,
					value: "Pour afficher l\'emote Carapuce en colère."
				},
				{
					name: `${config.prefix}chocked`,
					value: "Pour afficher l\'emote Carapuce choqué."
				},
				{
					name: `${config.prefix}join`,
					value: "Pour simuler notre arrivée sur le serveur."
				},
				{
					name: `${config.prefix}ownerHelp`,
					value: "Pour afficher cette aide pour les membres de la white list."
				},
				{
					name: `${config.prefix}restart`,
					value: "Pour redémarrer le bot."
				},

			],
		}
	});
}

function isInWhiteList(id) {
	let res = false;

	config.whiteList.forEach(function (whiteID) {
		if (whiteID === id)
			res = true;
	});
	return (res);
}

bot.on("message", message => {
	try {
		if (message.author.bot)
			return;

		if (message.guild === null) {
			if (message.author.id === config.ownerID)
				ownerDMCommands(message);
			else
				bot.users.get(config.ownerID).send({ embed: { color: 3447003, description: "L'utilisateur " + message.author.username + " m'a envoyé:\n\n" + message.content}});
			return;
		}

		if (message.author.id === config.ownerID || isInWhiteList(message.author.id))
			ownerCommands(message);
		else
			redirectCommands(message);
	} catch (exception) {
		message.channel.send({ embed: { color: 16711680, description: "__**ERREUR**__\nLa commande n'a pas fonctionnée <:surprised_carapuce:568777407046221824>\n\n__L'erreur suivante s'est produite:__\n*" + exception + "*"}});
		bot.users.get(config.ownerID).send({embed:{color: 16711680, description: "__**ERREUR**__\nL'utilisateur " + message.author.username + ", sur le serveur " + message.member.guild.name +  " a envoyé la commande:\n" + message.content + "\n\n__L'erreur suivante s'est produite:__\n*" + exception.stack + "*"}});
		console.log("ERREUR\nLors de l'arrivée de l'utilisateur " + message.author.username + " sur le serveur " + message.member.guild.name + "\nL'erreur suivante s'est produite:\n" + exception.stack);
	}
});

bot.login(config.token);