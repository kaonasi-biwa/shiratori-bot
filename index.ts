import { Client, Events, GatewayIntentBits, BaseInteraction } from "discord.js";
import { Commands } from "./commands/index.ts"
import type { commandFunction } from "./commands/command.d.ts";

const client: Client = new Client({intents: [GatewayIntentBits.Guilds]});

const CommandFunction: Record<string, commandFunction>= {}

client.once(Events.ClientReady, async readyClient => {

  await client.application?.commands.set(Commands.map((command) => command.data))
  for(const command of Commands){
    CommandFunction[command.data.name] = command.execute
  }
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
})

client.on("interactionCreate", async (interaction: BaseInteraction) => {
  if(!interaction.isCommand() || !CommandFunction[interaction.commandName]) return;

  const message = await CommandFunction[interaction.commandName](interaction);
  switch (message){
    case "exit": {
      client.destroy()
      break;
    }
    default: {
      break;
    }
  }

})

// クライアントのトークンを照合してログインする
client.login(process.env["TOKEN"]);

