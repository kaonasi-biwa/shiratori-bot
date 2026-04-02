import { ApplicationCommandOptionType, ChatInputCommandInteraction, AutocompleteInteraction } from "discord.js";
import type { Command } from "../command.d.ts"
import { registerWorkbook, getSubjects, getNameOfSubject } from "@shared/recordStudying.ts";


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
  async execute(interaction: ChatInputCommandInteraction){
    try{
      if(
        !interaction.options.getString("subject")
         || !interaction.options.getString("workbook")
         || !interaction.options.getString("workbook-name")
      ){
        await interaction.reply("引数が足りないみたい。もう一回入力してみて")
      }
      else {
        await registerWorkbook(
          interaction.options.getString("subject") as string,
          interaction.options.getString("workbook") as string,
          interaction.options.getString("workbook-name") as string,
        )
        await interaction.reply("登録できたよ。")
      }
    } catch (e) {
      await interaction.reply("うまくいかなかったみたい。もう一度やってみて")
      console.error(e)
    }
  },
  async autocomplete(interaction: AutocompleteInteraction){
    await interaction.respond(getSubjects().map((subid) => ( {value: subid, name: `${subid} (${getNameOfSubject(subid)})`} )))
  }
}

