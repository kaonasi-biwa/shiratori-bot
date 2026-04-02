import { ApplicationCommandData, ChatInputCommandInteraction } from "discord.js"

export type commandFunction = (interaction: ChatInputCommandInteraction) => Promise<void | string>;

export interface Command {
  data: ApplicationCommandData,
  execute: commandFunction,
}
