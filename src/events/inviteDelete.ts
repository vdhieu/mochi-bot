import { Event } from "."
import Discord from "discord.js"
import { invites } from "./index"
import { BotBaseError } from "errors"
import { logger } from "logger"
import ChannelLogger from "utils/ChannelLogger"

export default {
  name: "inviteDelete",
  once: false,
  execute: async (invite: Discord.Invite) => {
    try {
      const invitesCollection = invites.get(
        invite.guild.id
      ) as Discord.Collection<string, number>
      invitesCollection.delete(invite.code)
    } catch (e) {
      const error = e as BotBaseError
      if (error.handle) {
        error.handle()
      } else {
        logger.error(e as string)
      }
      ChannelLogger.log(error)
    }
  },
} as Event<"inviteDelete">
