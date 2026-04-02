import { ChatInputCommandInteraction } from "discord.js";
import type { Command } from "../command.d.ts"
import { stopRecordingStudying, getSubjects, getNameOfSubject, getWorkbooks, getNameOfWorkbook } from "@shared/recordStudying.ts";
import { UnfinishedTaskError } from "@shared/errors.ts";


export const stopRecordStudyingCommand: Command =  {
  data: {
    name: "stop-recording-studying",
    description: "勉強時間の記録終了",
  },
  async execute(interaction: ChatInputCommandInteraction) {
    try{
      const differenceTime = await stopRecordingStudying()
      let textDifferenceTime = "";
      if(differenceTime[0] > 0) textDifferenceTime += `${differenceTime[0]}時間`
      if(textDifferenceTime || differenceTime[1] > 0) textDifferenceTime += `${differenceTime[1]}分`
      if(textDifferenceTime || differenceTime[2] > 0) textDifferenceTime += `${differenceTime[2]}秒`
      await interaction.reply(`勉強していた時間は、${textDifferenceTime}だったよ
お疲れさま`)
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
