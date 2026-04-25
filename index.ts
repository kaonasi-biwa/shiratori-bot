import { Client, Events, GatewayIntentBits, type Interaction, ChatInputCommandInteraction, type ApplicationCommandOptionData } from "discord.js";
import { Commands } from "./commands/index.ts"
import type { commandFunction, autocompleteFunction } from "./commands/command.d.ts";
import { renderMessage, loadDefaultTemplates, loadTemplates } from "@shared/messages.ts";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import readline from "node:readline";

const client: Client = new Client({intents: [GatewayIntentBits.Guilds]});

const CommandFunction: Record<string, commandFunction>= {}
const CommandArgumentsData: Record<string,Readonly<ApplicationCommandOptionData[]>> = {}
const AutoCompleteFunction: Record<string, autocompleteFunction>= {}

client.once(Events.ClientReady, async readyClient => {

  await client.application?.commands.set(Commands.map((command) => {
    if(command.data.options) CommandArgumentsData[command.data.name] = command.data.options;
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
      process.exit()
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


async function runCommandConsole(command: string[]) {
  if(command[0] in CommandFunction){
    const message = await CommandFunction[command[0]]({
      deferReply: async () => undefined,
      getArguments(id){
        const argIndex = CommandArgumentsData[command[0]].findIndex((argData) => argData.name === id)
        return command[argIndex + 1]
      }
    })
    let messageText = renderMessage(message.messageId, message.messageArgs ?? {})
    console.log(messageText)
    if (message.shutdown){
      client.destroy();
      process.exit()
    }
  } else console.log(renderMessage("general:error.unknownCommand"))
}
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
})

let autocompleteIndex = 0;
let autocompletingCommand: string[] = []
let autocompleteContents: string[] = []
rl.setPrompt('> ');
rl.prompt();
rl.on("line", async (line) => {
  if(autocompleteIndex > 0 ){
    if(autocompleteContents[0] === "<inputText>"){
      autocompletingCommand.push(line)
      autocompleteContents = []
      await autocompleteConsole()
    } else if(/^[0-9]+$/.test(line.trim())){
      const selectedIndex = Number(line.trim())
      if(selectedIndex < autocompleteContents.length + 1){
        if(selectedIndex === autocompleteContents.length){
          autocompleteIndex = 0
          autocompletingCommand = []
          autocompleteContents = []
          rl.setPrompt('> ');
        } else {
          autocompletingCommand.push(autocompleteContents[selectedIndex])
          autocompleteContents = []
          await autocompleteConsole()
        }
      }
    }
  }
  else if(line.startsWith("ankosoba")) console.log("oisii")
  else if(line.startsWith("/")){
    const command = line.slice(1).split(" ");
    await runCommandConsole(command)
  }
  else if(line.startsWith(":autocomplete")) await autocompleteConsole()
  rl.prompt();
})

async function autocompleteConsole(){
  const runCommand = async () => {
    await runCommandConsole(autocompletingCommand)
    autocompleteIndex = 0;
    autocompleteContents = []
    autocompletingCommand = []
    rl.setPrompt('> ');
  }
  if(autocompleteIndex === 0 ) {
    let message = ""
    const commands = Commands.toSorted((a,b) => a.data.name.localeCompare(b.data.name))
    for(let i = 0; i < commands.length; i++){
      message += `${i}) /${commands[i].data.name}\n`
      autocompleteContents.push(commands[i].data.name)
    }
    message += `${commands.length}) キャンセル`
    console.log(message)
    autocompleteIndex++
    rl.setPrompt('>> ');
  } else {
    const commandName = autocompletingCommand[0]
    if (autocompleteIndex < ( CommandArgumentsData[commandName] ?? []).length + 1){
      const option = CommandArgumentsData[commandName][autocompleteIndex-1]
      const isAutocomplete = option.autocomplete
      if(!isAutocomplete){
        console.log( `${option.name}(${option.description})を入力してください` )
        autocompleteContents = ["<inputText>"]
        autocompleteIndex++
      } else {
        console.log( `${option.name}(${option.description})` )
        const autocompleteContent = await AutoCompleteFunction[commandName]({
          getArguments(id){
            return autocompletingCommand[CommandArgumentsData[commandName].findIndex((findingOption) => id === findingOption.name)+1] ?? ""
          },
          getFocused: () => option.name
        })
        let message = ""
        for(let i = 0; i < autocompleteContent.length; i++){
          message += `${i}) ${autocompleteContent[i].name}\n`
          autocompleteContents.push(autocompleteContent[i].value)
        }
        message += `${autocompleteContent.length}) キャンセル`
        console.log(message)
        autocompleteIndex++
      }
    } else await runCommand()
  }
}
