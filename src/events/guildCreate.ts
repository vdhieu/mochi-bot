import { Event } from "."
import Discord from "discord.js"
import guildConfig from "../modules/guildConfig"

export default {
	name: "guildCreate",
	once: false,
	execute: async (guild: Discord.Guild) => {
		console.log(`Joined guild: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`)

		try {
			guildConfig.createGuildConfig(guild.id, guild.name)
		} catch (err) {
			console.error(err)
		}
	},
} as Event<"guildCreate">