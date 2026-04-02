import { ApplicationCommandData, ChatInputCommandInteraction, AutocompleteInteraction } from "discord.js"

export type commandFunction = (interaction: ChatInputCommandInteraction) => Promise<void | string>;
export type autocompleteFunction = (interaction: AutocompleteInteraction) => Promise<void | string>;

export interface Command {
  data: ApplicationCommandData,
  execute: commandFunction,
  autocomplete?: autocompleteFunction,
}
