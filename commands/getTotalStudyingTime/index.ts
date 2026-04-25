import { ApplicationCommandOptionType } from "discord.js";
import type { Command } from "../command.d.ts"
import { getSubjects, getNameOfSubject, getWorkbooks, getNameOfWorkbook, totalStudyingTime } from "@shared/recordStudying.ts";


export const getTotalStudyingTimeCommand: Command =  {
  data: {
    name: "get-total-studying-time",
    description: "勉強時間の記録開始",
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: "start",
        description: "合算を始める日付(XXXX/X/X形式)",
        required: false,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: "end",
        description: "合算を終える日付(XXXX/X/X形式)",
        required: false,
      },
    ]
  },
  async execute(interaction) {
    try{
      type time = [number, number, number]
      const startStr = ( interaction.getArguments("start") || "1960/1/1" ).split("/")
      const endStr = ( interaction.getArguments("end") || "" ).split("/")
      const start: time = [Number(startStr[0]), Number(startStr[1]), Number(startStr[2])]
      const end: time = [Number(endStr[0]), Number(endStr[1]), Number(endStr[2])]
      if(Number.isInteger(start[0]) && Number.isInteger(start[1]) && Number.isInteger(start[2])){
        let totalTime: Record<string, time>;
        if(Number.isInteger(end[0]) && Number.isInteger(end[1]) && Number.isInteger(end[2]))
          totalTime = await totalStudyingTime(start, end);
        else
          totalTime = await totalStudyingTime(start);
        let listText = "";
        listText += "\n" + `合計時間: ${totalTime["<TOTAL>"][0]}時間${totalTime["<TOTAL>"][1]}分${totalTime["<TOTAL>"][2]}秒` + "\n\n";
        for(const subject of getSubjects()){
          if(!(subject in totalTime)){
            continue;
          }
          listText += `# ${getNameOfSubject(subject)} : ${totalTime[subject][0]}時間${totalTime[subject][1]}分${totalTime[subject][2]}秒` + "\n";
          for(const workbook of getWorkbooks(subject)){
            const workbookId = `${subject}.${workbook}`;
            if(!(workbookId in totalTime)){
              continue;
            }
            listText += `- ${getNameOfWorkbook(subject,workbook)} : ${totalTime[workbookId][0]}時間${totalTime[workbookId][1]}分${totalTime[workbookId][2]}秒` + "\n";
          }
          listText += "\n";
        }
        return { messageId: "recording:message.getTotalTimeStudyingTime", messageArgs: {"$list": listText} }
      } else return { messageId: "general:error.invalidArguments" };
    } catch (e) {
      console.error(e)
      return { messageId: "general:error.general" }
    }
  },
}
