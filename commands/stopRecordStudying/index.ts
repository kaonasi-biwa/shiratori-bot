import type { Command } from "../command.d.ts"
import { stopRecordingStudying } from "@shared/recordStudying.ts";
import { UnfinishedTaskError } from "@shared/errors.ts";


export const stopRecordStudyingCommand: Command =  {
  data: {
    name: "stop-recording-studying",
    description: "勉強時間の記録終了",
  },
  async execute() {
    try{
      const differenceTime = await stopRecordingStudying()
      let textDifferenceTime = "";
      if(differenceTime[0] > 0) textDifferenceTime += `${differenceTime[0]}時間`
      if(textDifferenceTime || differenceTime[1] > 0) textDifferenceTime += `${differenceTime[1]}分`
      if(textDifferenceTime || differenceTime[2] > 0) textDifferenceTime += `${differenceTime[2]}秒`
      return { messageId: "recording:message.endRecording", messageArgs: {"$time": textDifferenceTime}};
    } catch (e) {
      console.error(e)
      if(e instanceof UnfinishedTaskError){
        return { messageId: "recording:error.notRecoeding" }
      } else {
        return { messageId: "general:error.general" }
      }
    }
  },
}
