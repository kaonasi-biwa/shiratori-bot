import { CommandInteraction } from "discord.js";
import type { Command } from "../command.d.ts"

export const pingCommand: Command = {
  data: {
    name: "ping",
    description: "疎通確認"
  },
  async execute(interaction : CommandInteraction) {
    await interaction.reply("ここにいるよ")
  }
}
