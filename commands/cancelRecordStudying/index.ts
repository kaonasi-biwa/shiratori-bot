import type { Command } from "../command.d.ts"
import { cancelRecordingStudying } from "@shared/recordStudying.ts";
import { UnfinishedTaskError } from "@shared/errors.ts";


export const cancelRecordStudyingCommand: Command =  {
  data: {
    name: "cancel-recording-studying",
    description: "勉強時間の記録を中止",
  },
  async execute() {
    try{
      await cancelRecordingStudying();
      return { messageId: "recording:message.cancelRecording" }
    } catch (e) {
      if(e instanceof UnfinishedTaskError){
        return { messageId: "recording:error.notRecoeding" }
      } else {
        return { messageId: "general:error.general" }
      }
    }
  },
}
