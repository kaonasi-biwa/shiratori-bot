import { ApplicationCommandOptionType } from "discord.js";
import type { Command } from "../command.d.ts"
import { registerWorkbook, getSubjects, getNameOfSubject } from "@shared/recordStudying.ts";
import { UnknownSubjectError } from "@shared/errors.ts";


export const registerWorkbookCommand: Command = {
  data: {
    name: "register-workbook",
    description: "参考書の登録",
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: "subject",
        description: "登録する教科",
        required: true,
        autocomplete: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: "workbook",
        description: "登録する参考書類等",
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: "workbook-name",
        description: "参考書類等の名前",
        required: true,
      },
    ]
  },
  async execute(interaction){
    try{
      const subject = interaction.getArguments("subject");
      const workbook = interaction.getArguments("workbook");
      const workbookName = interaction.getArguments("workbook-name");
      if(!subject || !workbook || !workbookName){
        return { messageId: "general:error.lessArguments" }
      }
      else {
        await registerWorkbook(subject, workbook, workbookName);
        return { messageId: "recording:message.registerWorkbook" }
      }
    } catch (e) {
      if(e instanceof UnknownSubjectError){
        return { messageId: "recording:error.unknownSubject" }
      } else {
        console.error(e)
        return { messageId: "general:error.general" }
      }
    }
  },
  async autocomplete(){
    return getSubjects().map((subid) => ( {value: subid, name: `${subid} (${getNameOfSubject(subid)})`} ))
  }
}

