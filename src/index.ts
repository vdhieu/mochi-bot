import Koa from "koa"
import Router from "koa-router"
import cors from "@koa/cors"
import bodyParser from "koa-bodyparser"
import Discord from "discord.js"
import { logger } from "./logger"
import handlers from "./handlers"
import events from "./events"
import { DISCORD_CLIENT_ID, DISCORD_BOT_GUILD_ID, DISCORD_TOKEN } from "./env"
import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v9"
import alpha from "./slashCommands/alpha"

const app = new Koa()
const publicRouter = new Router()
const protectedRouter = new Router()
const publicHandlers = handlers.filter((h) => !h.protected)
const protectedHandlers = handlers.filter((h) => h.protected)

const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Discord.Intents.FLAGS.GUILD_MEMBERS,
    Discord.Intents.FLAGS.DIRECT_MESSAGES,
  ],
  partials: ["MESSAGE", "REACTION", "CHANNEL"],
})

publicHandlers.forEach((handler) => {
  // @ts-ignore
  publicRouter[handler.method](handler.route, handler.handler)
})

app.use(cors()).use(publicRouter.routes()).use(publicRouter.allowedMethods())

protectedHandlers.forEach((handler) => {
  // @ts-ignore
  protectedRouter[handler.method](handler.route, handler.handler)
})

app
  .use(cors())
  .use(bodyParser())
  .use(protectedRouter.routes())
  .use(protectedRouter.allowedMethods())

// discord client
client.login(DISCORD_TOKEN)
for (const e of events) {
  if (e.once) {
    client.once(e.name, e.execute as any)
  } else {
    client.on(e.name, e.execute as any)
  }
}

const commands = [alpha.data.toJSON()]

const rest = new REST({ version: "9" }).setToken(DISCORD_TOKEN)

;(async () => {
  try {
    console.log("Started refreshing application (/) commands.")

    await rest.put(
      Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_BOT_GUILD_ID),
      { body: commands }
    )

    console.log("Successfully reloaded application (/) commands.")
  } catch (error) {
    console.error(error)
  }
})()

const server = app.listen(3001, () => {
  logger.info("HTTP Server started at 3001")
})

process.on("SIGTERM", () => {
  server.close(() => {
    process.exit(0)
  })
})
