import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import type { Command } from "../command.d.ts"
import { registerSubject } from "@shared/recordStudying.ts";
import { UnfinishedTaskError } from "@shared/errors.ts";


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
  async execute(interaction: ChatInputCommandInteraction){
    try{
      if(!interaction.options.getString("subject") || !interaction.options.getString("subject-name")){
        await interaction.reply("引数が足りないみたい。もう一回入力してみて")
      }
      else {
        await registerSubject(
          interaction.options.getString("subject") as string,
          interaction.options.getString("subject-name") as string
        )
        await interaction.reply("登録できたよ。")
      }
    } catch (e) {
      await interaction.reply("うまくいかなかったみたい。もう一度やってみて")
      console.error(e)
    }
  }
}

