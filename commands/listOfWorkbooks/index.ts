import { ChatInputCommandInteraction } from "discord.js";
import type { Command } from "../command.d.ts"
import { getSubjects, getWorkbooks, getNameOfSubject, getNameOfWorkbook } from "@shared/recordStudying.ts";


export const listOfWorkbooksCommand: Command =  {
  data: {
    name: "list-of-workbooks",
    description: "教科とワークの一覧を表示",
  },
  async execute(interaction: ChatInputCommandInteraction) {
    try{
      let message = ""
      for(const subject of getSubjects()){
        message += `# ${getNameOfSubject(subject)} (${subject})\n`
        for(const workbook of getWorkbooks(subject)){
          message += `- ${getNameOfWorkbook(subject, workbook)} (${workbook})\n`
        }
        message += "\n"
      }
      await interaction.reply("登録されている教科と参考書類はこんな感じだよ\n```" + message + "```")
    } catch (e) {
      await interaction.reply("うまくいかなかったみたい。もう一度やってみて")
      console.error(e)
    }
  },
}
