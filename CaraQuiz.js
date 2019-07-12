const config = require("./config.json")

module.exports = {
	inQuizz : false,
	score : 0,
	numQuestion : 1,
	waitResponse : false,

	CaraQuiz : function(message) {

		try {

			if (message.content === "stop") {

				message.channel.send("Fin du cara-quiz !\nFélicitations, ton score est de " + this.score + "/" + (this.numQuestion - 1) + "! <:carapuce:551198314687758357>")
				this.score = 0
				this.numQuestion = 1
				this.inQuizz = false
				return
			} else if (message.content === config.prefix+"quiz" && this.inQuizz === true) {

				message.channel.send("Un quizz est déjà en cours <:carapuce:551198314687758357>\nMais si tu veux arrêter celui-ci dis *stop*")
				return
			}

			switch (this.numQuestion) {

				case 1:
					if (!this.waitResponse) {

						this.inQuizz = true
						message.channel.send("Nous allons jouer à un cara-quiz!\nPour répondre il te suffira de donner la lettre correspondante à la réponse que tu aura choisi <:carapuce:551198314687758357>")
						message.channel.send({
							embed: {
								color: 3447003,
								description: "__**Question n°1:**__",
								fields: [{
									name: "Zargith m'a créé",
									value: "A: Vrai\tB: Faux"
								}
								],
							}
						})
						this.waitResponse = true
					} else {
						if (message.content === "a") {
							this.score++
							this.numQuestion++
							this.waitResponse = false
							message.channel.send("Bonne réponse ! <:happy_carapuce:553490319103098883>")
							this.CaraQuiz(message)
						} else if (message.content === "b") {
							this.numQuestion++
							this.waitResponse = false
							message.channel.send("Mauvaise réponse... <:sad_carapuce:562773515745361920>")
							this.CaraQuiz(message)
						}
					}
					break;
				case 2:
					if (!this.waitResponse) {
						this.inQuizz = true
						message.channel.send({
							embed: {
								color: 3447003,
								description: "__**Question n°2:**__",
								fields: [{
									name: "Quel est le meilleur starteur parmis ces choix ?",
									value: "A: Bulbizarre\tB: Carapuce\tC: Salemèche"
								}
								],
							}
						})
						this.waitResponse = true
					} else {
						if (message.content.toLowerCase() === "b") {
							this.score++
							this.numQuestion++
							this.waitResponse = false
							message.channel.send("Bonne réponse ! <:happy_carapuce:553490319103098883>")
							this.CaraQuiz(message)
						} else if (message.content === "a" || message.content === "c") {
							this.numQuestion++
							this.waitResponse = false
							message.channel.send("Mauvaise réponse... <:sad_carapuce:562773515745361920>")
							this.CaraQuiz(message)
						}
					}
					break;
				default:
					message.channel.send("Fin du cara-quiz!\nTu as fais un score de " + this.score + "/" + (this.numQuestion - 1) + " <:happy_carapuce:553490319103098883>")
					this.score = 0
					this.numQuestion = 1
					this.waitResponse = false
					this.inQuizz = false
					break;
			}
		} catch (exception) {
			this.inQuizz = false,
			this.score = 0,
			this.numQuestion = 1,
			this.waitResponse = false
			throw (exception)
		}
	}
}