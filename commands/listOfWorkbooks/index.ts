import type { Command } from "../command.d.ts"
import { getSubjects, getWorkbooks, getNameOfSubject, getNameOfWorkbook } from "@shared/recordStudying.ts";


export const listOfWorkbooksCommand: Command =  {
  data: {
    name: "list-of-workbooks",
    description: "教科とワークの一覧を表示",
  },
  async execute() {
    try{
      let message = ""
      for(const subject of getSubjects()){
        message += `# ${getNameOfSubject(subject)} (${subject})\n`
        for(const workbook of getWorkbooks(subject)){
          message += `- ${getNameOfWorkbook(subject, workbook)} (${workbook})\n`
        }
        message += "\n"
      }
      return { messageId: "recording:message.listOfWorkbooks", messageArgs: { "$workbooks": message } }
    } catch (e) {
      console.error(e)
      return { messageId: "general:error.general" }
    }
  },
}
