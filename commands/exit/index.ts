import { CommandInteraction } from "discord.js";
import type { Command } from "../command.d.ts"

export const exitCommand: Command = {
  data: {
    name: "exit",
    description: "Botの終了"
  },
  async execute(interaction : CommandInteraction) {
    await interaction.reply("また今度")
    return "exit"
  }
}
