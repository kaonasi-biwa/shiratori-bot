import { ApplicationCommandOptionType, ChatInputCommandInteraction, AutocompleteInteraction } from "discord.js";
import type { Command } from "../command.d.ts"
import { startRecordingStudying, getSubjects, getNameOfSubject, getWorkbooks, getNameOfWorkbook } from "@shared/recordStudying.ts";
import { UnfinishedTaskError } from "@shared/errors.ts";


export const startRecordStudyingCommand: Command =  {
  data: {
    name: "start-recording-studying",
    description: "勉強時間の記録開始",
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: "subject",
        description: "記録する教科",
        required: true,
        autocomplete: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: "workbook",
        description: "記録する参考書類等",
        required: true,
        autocomplete: true,
      },
    ]
  },
  async execute(interaction: ChatInputCommandInteraction) {
    try{
      if(!interaction.options.getString("subject") || !interaction.options.getString("workbook")){
        await interaction.reply("引数が足りないみたい。もう一回入力してみて")
      }
      else {
        await startRecordingStudying(
          interaction.options.getString("subject") as string,
          interaction.options.getString("workbook") as string
        )
        await interaction.reply("記録を始めたよ。頑張って")
      }
    } catch (e) {
      if(e instanceof UnfinishedTaskError){
        await interaction.reply("前の記録がまだ終了していないみたいだね")
      } else {
        await interaction.reply("うまくいかなかったみたい。もう一度やってみて")
        console.error(e)
      }
    }
  },
  async autocomplete(interaction: AutocompleteInteraction) {
    const focusedOption = interaction.options.getFocused(true)
    if(focusedOption.name === "subject"){
      await interaction.respond(
        getSubjects()
          .map((subid) => ( {value: subid, name: `${subid} (${getNameOfSubject(subid)})`} ))
      )
    } else if(focusedOption.name === "workbook"){
      const subject = interaction.options.getString("subject")
      if(subject && getSubjects().includes(subject)){
        await interaction.respond(
          getWorkbooks(subject)
            .map((workid) => ( {value: workid, name: `${workid} (${getNameOfWorkbook(subject, workid)})`} ))
        )
      }
    }
  }
}
