import { DefaultMessageTempletes } from "./defaultMessageTempletes.ts"

const messageTempletes: Record<string,  (string | TempleteStructure[])[]> = {}

interface Placeholder{
  type: "placeholder"
  name: string;
}
type TempleteStructure = string | Placeholder
type RenderingMessageArgs = Record<string, string>

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

export function loadTempletes(filename: string){

}

export function loadDefaultTempletes(){
  Object.assign(messageTempletes, DefaultMessageTempletes);
}
