import DefaultMessageTempletes from "./defaultMessageTempletes.ts"
import { existsSync } from "node:fs";

const messageTempletes: Record<string,  (string | TempleteStructure[])[]> = {}

interface Placeholder{
  type: "placeholder"
  name: string;
}
type TempleteStructure = string | Placeholder
export type RenderingMessageArgs = Record<string, string>

export function renderMessage(id: string, args: RenderingMessageArgs = {}): string {
  if (id in messageTempletes) {
    let resolvingMessage: string | TempleteStructure[];
    if (messageTempletes[id].length <= 1){
      resolvingMessage = messageTempletes[id][0];
    } else {
      resolvingMessage = messageTempletes[id][Math.floor(Math.random() * messageTempletes[id].length)];
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

export async function loadTempletes(filename: string) {
  const filepath = "./messageTempletes/" + filename
  if(existsSync(filepath)){
    try {
      const templete = await import("." + filepath)
      Object.assign(messageTempletes, templete.default);
    } catch(e){
      console.error(e)
      console.error(filepath, "の読み込みに失敗しました")
    }
  }
}

export function loadDefaultTempletes(){
  Object.assign(messageTempletes, DefaultMessageTempletes);
}
