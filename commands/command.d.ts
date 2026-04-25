import { ApplicationCommandData, AutocompleteInteraction } from "discord.js"
import { RenderingMessageArgs } from "@shared/messages.ts";

export type commandFunction = (interaction: ShiratoriInteraction) => Promise<InteractionReturn>;
export type autocompleteFunction = (interaction: ShiratoriAutocomplete) => Promise<{value: string, name: string}[]>;

export interface Command {
  data: ApplicationCommandData,
  execute: commandFunction,
  autocomplete?: autocompleteFunction,
}

export interface InteractionReturn {
  messageId: string,
  messageArgs?: RenderingMessageArgs,
  codeblock?: boolean,
  shutdown?: boolean,
  edit?: boolean,
}

export interface ShiratoriInteraction {
  deferReply: (...args: any[]) => Promise<any>,
  getArguments: (id: string) => string,
}

export interface ShiratoriAutocomplete {
  getArguments: (id: string) => string,
  getFocused: () => string,
}

