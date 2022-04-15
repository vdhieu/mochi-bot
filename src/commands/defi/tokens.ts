import { Command } from "types/common"
import { MessageEmbed } from "discord.js"
import { PREFIX, SOCIAL_COLOR } from "env"
import {
  getEmbedFooter,
  getEmoji,
  getHeader,
  getHelpEmbed,
  thumbnails,
} from "utils/discord"
import Social from "modules/social"

const command: Command = {
  id: "tokens",
  command: "tokens",
  name: "Tokens",
  category: "Defi",
  run: async function (msg) {
    let description = ""
    const supportedTokens = await Social.getSupportedTokens()
    for (const token of supportedTokens) {
      const tokenEmoji = getEmoji(token.symbol)
      description += `${tokenEmoji} **${token.symbol.toUpperCase()}**\n`
    }
    const embedMsg = new MessageEmbed()
      .setColor(SOCIAL_COLOR)
      .setAuthor("Supported tokens")
      .setDescription(description)
      .setFooter(getEmbedFooter([msg.author.tag]), msg.author.avatarURL())
      .setTimestamp()

    return {
      messageOptions: {
        embeds: [embedMsg],
        content: getHeader("View all supported tokens", msg.author),
      },
    }
  },
  getHelpMessage: async () => {
    const embedMsg = getHelpEmbed("Tokens")
      .setThumbnail(thumbnails.TOKENS)
      .setTitle(`${PREFIX}tokens`)
      .addField("_Examples_", `\`${PREFIX}tokens\``)
      .setDescription(`\`\`\`Check the list of supported tokens.\`\`\``)
    return { embeds: [embedMsg] }
  },
  canRunWithoutAction: true,
  alias: ["token", "tkn", "currency", "currencies", "cur", "curs"],
}

export default command