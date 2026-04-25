import { Client, Events, GatewayIntentBits, type Interaction, ChatInputCommandInteraction, AutocompleteInteraction } from "discord.js";
import { Commands } from "./commands/index.ts"
import type { commandFunction, autocompleteFunction } from "./commands/command.d.ts";
import { renderMessage, loadDefaultTempletes, loadTempletes } from "@shared/messages.ts";

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

// クライアントのトークンを照合してログインする
client.login(process.env["TOKEN"]);

loadDefaultTempletes()
