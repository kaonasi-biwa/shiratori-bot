import { Client, Events, GatewayIntentBits, type Interaction, ChatInputCommandInteraction, AutocompleteInteraction } from "discord.js";
import { Commands } from "./commands/index.ts"
import type { commandFunction, autocompleteFunction } from "./commands/command.d.ts";

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
    const message = await CommandFunction[interaction.commandName](interaction as ChatInputCommandInteraction);
    switch (message){
      case "exit": {
        client.destroy()
        break;
      }
      default: {
        break;
      }
    }
  } else if(interaction.isAutocomplete() && AutoCompleteFunction[interaction.commandName]){
    await AutoCompleteFunction[interaction.commandName](interaction as AutocompleteInteraction)
  }
})

// クライアントのトークンを照合してログインする
client.login(process.env["TOKEN"]);

