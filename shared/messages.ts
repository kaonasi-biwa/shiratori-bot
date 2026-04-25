import DefaultMessageTemplates from "./defaultMessageTemplates.ts"
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

const messageTemplates: Record<string,  (string | TemplateStructure[])[]> = {}

interface Placeholder{
  type: "placeholder"
  name: string;
}
type TemplateStructure = string | Placeholder
export type RenderingMessageArgs = Record<string, string>

export function renderMessage(id: string, args: RenderingMessageArgs = {}): string {
  if (id in messageTemplates) {
    let resolvingMessage: string | TemplateStructure[];
    if (messageTemplates[id].length <= 1){
      resolvingMessage = messageTemplates[id][0];
    } else {
      resolvingMessage = messageTemplates[id][Math.floor(Math.random() * messageTemplates[id].length)];
    }
    if(typeof resolvingMessage === "string") return resolvingMessage;
    else {
      let resultMessage = "";
      for(const fragment of resolvingMessage){
        if(typeof fragment === "string") resultMessage += fragment;
        else if (fragment.type === "placeholder") resultMessage += args[fragment.name] ?? "";
      }
      return resultMessage;
    }
  } else {
    return "Error: 該当するメッセージテンプレートが存在しません。"
  }
}

export async function loadTemplates(filename: string) {
  const filepath = "messageTemplates/" + filename
  if(existsSync(filepath)){
    try {
      const template = JSON.parse(await readFile(filepath, {encoding: "utf8"}))
      Object.assign(messageTemplates, template);
    } catch(e){
      console.error(e)
      console.error(filepath, "の読み込みに失敗しました")
    }
  }
}

export function loadDefaultTemplates(){
  Object.assign(messageTemplates, DefaultMessageTemplates);
}
