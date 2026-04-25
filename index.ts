import { Client, Events, GatewayIntentBits, type Interaction, ChatInputCommandInteraction } from "discord.js";
import { Commands } from "./commands/index.ts"
import type { commandFunction, autocompleteFunction } from "./commands/command.d.ts";
import { renderMessage, loadDefaultTemplates, loadTemplates } from "@shared/messages.ts";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

const client: Client = new Client({intents: [GatewayIntentBits.Guilds]});

const CommandFunction: Record<string, commandFunction>= {}
const AutoCompleteFunction: Record<string, autocompleteFunction>= {}

client.once(Events.ClientReady, async readyClient => {

  await client.application?.commands.set(Commands.map((commandData) => {
    let command = (typeof commandData === "function") ? commandData() : commandData;;
    CommandFunction[command.data.name] = command.execute;
    if(command.autocomplete) AutoCompleteFunction[command.data.name] = command.autocomplete;
    return command.data;
  }))
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
})

client.on("interactionCreate", async (interaction: Interaction) => {

  if( interaction.isCommand() && CommandFunction[interaction.commandName]){
    const message = await CommandFunction[interaction.commandName]({
      deferReply: async () => await interaction.deferReply(),
      getArguments(id){
        return ( interaction as ChatInputCommandInteraction ).options.getString(id) ?? ""
      }
    });
    let messageText = renderMessage(message.messageId, message.messageArgs ?? {})
    if (message.edit) 
      await interaction.editReply(messageText);
    else
      await interaction.reply(messageText);
    if (message.shutdown){
      client.destroy();
    }
  } else if(interaction.isAutocomplete() && AutoCompleteFunction[interaction.commandName]){
    interaction.respond(await AutoCompleteFunction[interaction.commandName]({
      getArguments(id){
        return interaction.options.getString(id) ?? ""
      },
      getFocused: () => interaction.options.getFocused(true).name
    }))
  }
})

let botConfig: {
  ignoreDefaultMessageTemplate?: boolean,
  messageTemplates?: string[],
} = {}
if(existsSync("./config.json")){
  try {
    botConfig = JSON.parse(await readFile("./config.json", {encoding: "utf8"}))
  } catch(e){}
}

if(!botConfig.ignoreDefaultMessageTemplate)
  loadDefaultTemplates()
if(botConfig.messageTemplates && Array.isArray(botConfig.messageTemplates))
  for(const filename of botConfig.messageTemplates) await loadTemplates(filename)

// クライアントのトークンを照合してログインする
client.login(process.env["TOKEN"]);

