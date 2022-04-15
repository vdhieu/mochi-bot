import { Message, MessageOptions } from "discord.js"
import { SetOptional } from "type-fest"
import { CommandChoiceHandlerOptions } from "utils/CommandChoiceManager"

// Category of commands
export type Category = "Admin" | "Profile" | "Defi" | "Config" | "Community"

// All command must conform to this type
export type Command = {
  id: string
  command: string
  category: Category
  name: string
  checkBeforeRun?: (msg: Message) => Promise<boolean>
  run: (
    msg: Message,
    action?: string,
    isAdmin?: boolean
  ) => Promise<{
    messageOptions: MessageOptions
    commandChoiceOptions?: SetOptional<CommandChoiceHandlerOptions, "messageId">
    replyOnOriginal?: boolean
  } | void>
  getHelpMessage: (
    msg: Message,
    action?: string,
    isAdmin?: boolean
  ) => Promise<MessageOptions>
  alias?: string[]
  canRunWithoutAction?: boolean
  // can only run in admin channels & won't be shown in `$help` message
  experimental?: boolean
  inactivityTimeout?: number
  isComplexCommand?: boolean
}