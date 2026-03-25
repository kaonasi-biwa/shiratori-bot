import { ApplicationCommandData, CommandInteraction } from "discord.js"

export type commandFunction = (interaction: CommandInteraction) => Promise<void | string>;

export interface Command {
  data: ApplicationCommandData,
  execute: commandFunction,
}
