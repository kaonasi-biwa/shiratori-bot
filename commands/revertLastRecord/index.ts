import type { Command } from "../command.d.ts"
import { revertLastRecord } from "@shared/recordStudying.ts";
import { UnfinishedTaskError } from "@shared/errors.ts";


export const revertLastRecordCommand: Command =  {
  data: {
    name: "revert-last-record",
    description: "最新の勉強時間の記録を取り返し",
  },
  async execute() {
    try{
      await revertLastRecord();
      return { messageId: "recording:message.revertLastRecord" }
    } catch (e) {
      if(e instanceof UnfinishedTaskError){
        return { messageId: "recording:error.unfinishedRecoeding" }
      } else {
        return { messageId: "general:error.general" }
      }
    }
  },
}
