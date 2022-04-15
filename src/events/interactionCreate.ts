import { confirmAirdrop, enterAirdrop } from "commands/defi/airdrop"
import { SelectMenuInteraction, ButtonInteraction, Message } from "discord.js"
import { BotBaseError } from "errors"
import { logger } from "logger"
import ChannelLogger from "utils/ChannelLogger"
import CommandChoiceManager from "utils/CommandChoiceManager"
import { getLoadingEmbed } from "utils/discord"
import { Event } from "."
import profile from "../modules/profile"

export default {
  name: "interactionCreate",
  once: false,
  execute: async (interaction: SelectMenuInteraction | ButtonInteraction) => {
    try {
      const msg = interaction.message as Message
      const key = `${interaction.user.id}_${msg.guildId}_${msg.channelId}`
      const commandChoice = await CommandChoiceManager.get(key)
      if (commandChoice) {
        if (interaction.customId === "exit") {
          await msg.delete().catch(() => {
            commandChoice.interaction
              ?.editReply({ content: "Exited!", components: [], embeds: [] })
              .catch(() => {})
          })
          CommandChoiceManager.remove(key)
        } else {
          await msg.delete().catch(() => {})
          if (commandChoice.interaction) {
            await interaction.deferReply()
          } else {
            // TODO: refactor this
            await interaction.reply({
              ephemeral: interaction.customId !== "ticker_view_option",
              embeds: [
                await getLoadingEmbed({
                  channel: interaction.channel,
                  author: interaction.user,
                } as Message),
              ],
            })
          }
          const { messageOptions, commandChoiceOptions } =
            await commandChoice.handler(interaction)

          const output = await interaction.editReply({
            ...messageOptions,
          })
          await CommandChoiceManager.update(key, {
            ...commandChoiceOptions,
            interaction,
            messageId: output.id,
          })
        }
      } else {
        if (interaction.isButton()) {
          const buttonInteraction = interaction as ButtonInteraction
          switch (true) {
            case interaction.customId.startsWith("verify"):
              profile.sendVerifyURL(buttonInteraction)
              return
            case interaction.customId === "cancel_airdrop":
              await msg.delete().catch(() => {})
              return
            case interaction.customId.startsWith("confirm_airdrop-"):
              await confirmAirdrop(buttonInteraction, msg)
              return
            case interaction.customId.startsWith("enter_airdrop-"):
              await enterAirdrop(buttonInteraction, msg)
              return
          }
        }
      }
    } catch (e: any) {
      const error = e as BotBaseError
      if (error.handle) {
        error.handle()
      } else {
        logger.error(e)
      }
      ChannelLogger.log(error)
    }
  },
} as Event<"interactionCreate">