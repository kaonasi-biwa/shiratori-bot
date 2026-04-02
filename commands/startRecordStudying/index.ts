import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import type { Command } from "../command.d.ts"
import { startRecordingStudying } from "@shared/recordStudying.ts";
import { UnfinishedTaskError } from "@shared/errors.ts";

async function interactionFunction(interaction: ChatInputCommandInteraction) {
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
}

export const startRecordStudyingCommandRaw: Command = {
  data: {
    name: "start-recording-studying-raw",
    description: "勉強時間の記録開始(直接入力)",
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: "subject",
        description: "記録する教科",
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: "workbook",
        description: "記録する参考書類等",
        required: true,
      },
    ]
  },
  execute: interactionFunction,
}

export function startRecordStudyingCommand(): Command {
  return {
    data: {
      name: "start-recording-studying",
      description: "勉強時間の記録開始",
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: "subject",
          description: "記録する教科",
          required: true,
        },
        {
          type: ApplicationCommandOptionType.String,
          name: "workbook",
          description: "記録する参考書類等",
          required: true,
        },
      ]
    },
    execute: interactionFunction,
  }
}
