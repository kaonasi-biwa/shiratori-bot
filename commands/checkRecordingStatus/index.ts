import type { Command } from "../command.d.ts"
import { checkRecordingStatus } from "@shared/recordStudying.ts";


export const checkRecordingStatusCommand: Command =  {
  data: {
    name: "check-recording-status",
    description: "勉強時間の記録状況の確認",
  },
  async execute() {
    try{
      const recordingStatus = await checkRecordingStatus();
      if(recordingStatus) {
        const returnDate = `${recordingStatus.date[0]}/${recordingStatus.date[1]}/${recordingStatus.date[2]} ${recordingStatus.date[3]}:${recordingStatus.date[4]}:${recordingStatus.date[5]}`
        return {
          messageId: "recording:message.checkRecordingStatus.recording",
          messageArgs: { "$date" : returnDate, "$workbook": recordingStatus.workbook}
        }
      }
      else {
        return { messageId: "recording:message.checkRecordingStatus.finished" }
      }
    } catch (e) {
      console.error(e)
      return { messageId: "general:error.general" }
    }
  },
}
