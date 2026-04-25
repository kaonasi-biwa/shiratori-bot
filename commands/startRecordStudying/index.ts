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
  async execute(interaction) {
    try{
      const subject = interaction.getArguments("subject")
      const workbook = interaction.getArguments("workbook")
      if(!subject || !workbook){
        return { messageId: "general:error.lessArguments" }
      }
      else {
        await startRecordingStudying(subject, workbook)
        return { messageId: "recording:message.startRecording", messageArgs: { "$workbook": getNameOfWorkbook(subject, workbook) } }
      }
    } catch (e) {
      if(e instanceof UnfinishedTaskError){
        return { messageId: "recording:error.unfinishedRecoeding" }
      } else {
        console.error(e)
        return { messageId: "general:error.general" }
      }
    }
  },
  async autocomplete(interaction) {
    const focusedOption = interaction.getFocused();
    if(focusedOption === "subject"){
      return getSubjects()
          .map((subid) => ( {value: subid, name: `${subid} (${getNameOfSubject(subid)})`} ))
    } else if(focusedOption === "workbook"){
      const subject = interaction.getArguments("subject")
      if(subject && getSubjects().includes(subject)){
        return getWorkbooks(subject)
          .map((workid) => ( {value: workid, name: `${workid} (${getNameOfWorkbook(subject, workid)})`} ))
      } else return [];
    } else return [];
  }
}
