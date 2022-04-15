import { Event } from "."
import {
  API_SERVER_HOST,
  DISCORD_ALPHA_CHANNEL,
  DISCORD_AMPAWSSADOR_CHANNEL,
} from "../env"
import Twitter from "../modules/twitter"
import fetch from "node-fetch"

export default {
  name: "messageReactionAdd",
  once: false,
  execute: async (reaction, user) => {
    if (user.bot) return

    if (
      [DISCORD_AMPAWSSADOR_CHANNEL, DISCORD_ALPHA_CHANNEL].includes(
        reaction.message.channelId
      ) &&
      reaction.emoji.name === "nekolove"
    ) {
      const users = await reaction.users.fetch()
      const members = await reaction.message.guild.members.fetch()

      const adminReacted = users.some((user) => {
        const member = members.get(user.id)
        return member.roles.cache.some((role) =>
          // pod heads, pod gangs
          ["882290383625801748", "882309061763297280"].includes(role.id)
        )
      })
      if (!adminReacted) {
        return
      }

      const msg = await reaction.message.fetch()
      if (reaction.message.channelId === DISCORD_AMPAWSSADOR_CHANNEL) {
        await Twitter.handleSharedLink(msg)
      } else if (reaction.message.channelId === DISCORD_ALPHA_CHANNEL) {
        const body = JSON.stringify({
          discordId: msg.author.id,
          guildId: msg.guildId,
        })

        await fetch(API_SERVER_HOST + "/api/v1/alpha/reactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        })
      }

      return
    }
  },
} as Event<"messageReactionAdd">