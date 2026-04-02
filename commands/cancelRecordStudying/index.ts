import { ChatInputCommandInteraction } from "discord.js";
import type { Command } from "../command.d.ts"
import { cancelRecordingStudying } from "@shared/recordStudying.ts";
import { UnfinishedTaskError } from "@shared/errors.ts";


export const cancelRecordStudyingCommand: Command =  {
  data: {
    name: "cancel-recording-studying",
    description: "勉強時間の記録を中止",
  },
  async execute(interaction: ChatInputCommandInteraction) {
    try{
      await cancelRecordingStudying();
      await interaction.reply(`記録をキャンセルだね。わかったよ`)
    } catch (e) {
      if(e instanceof UnfinishedTaskError){
        await interaction.reply("まだ記録を始めていないみたいだね")
      } else {
        await interaction.reply("うまくいかなかったみたい。もう一度やってみて")
        console.error(e)
      }
    }
  },
}
