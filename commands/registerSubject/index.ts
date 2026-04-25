import { ApplicationCommandOptionType } from "discord.js";
import type { Command } from "../command.d.ts"
import { registerSubject } from "@shared/recordStudying.ts";


export const registerSubjectCommand: Command = {
  data: {
    name: "register-subject",
    description: "教科の登録",
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: "subject",
        description: "登録する教科",
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: "subject-name",
        description: "教科の名前",
        required: true,
      },
    ]
  },
  async execute(interaction){
    try{
      const subject = interaction.getArguments("subject");
      const subjectName = interaction.getArguments("subject-name");
      if(!subject || !subjectName){
        return { messageId: "general:error.lessArguments" }
      }
      else {
        await registerSubject(
          subject,
          subjectName,
        )
        return { messageId: "recording:message.registerSubject" }
      }
    } catch (e) {
      console.error(e)
      return { messageId: "general:error.general" }
    }
  }
}

