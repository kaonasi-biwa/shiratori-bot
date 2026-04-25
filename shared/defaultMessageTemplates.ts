export default {
  "exit:message": [ "Botを終了します" ],
  "ping:message": [ "Received" ],
  "status:message": [
    [
      "現在の状態:",
      "```\r",
      "現在時刻     : ", { type: "placeholder", name: "$date"}, "\r",
      "CPU使用率    : ", { type: "placeholder", name: "$cpu"}, "\r",
      "メモリ使用率 : ", { type: "placeholder", name: "$memory"},
      "\r```",
    ]
  ],
  "recording:message.startRecording": [
    [
      "記録を開始しました。\r",
      "参考書名: ", { type: "placeholder", name: "$workbook"},
    ]
  ],
  "recording:message.endRecording": [ 
    [
      "記録を終了しました\r",
      "勉強時間: ", { type: "placeholder", name: "$time" },
    ]
  ],
  "recording:message.registerSubject": [ "登録しました" ],
  "recording:message.registerWorkbook": [ "登録しました" ],
  "recording:message.listOfWorkbooks": [
    [
      "登録されている教科と参考書類:",
      "\n```",
      { type: "placeholder", name: "$workbooks"},
      "```\n",
    ],
  ],
  "recording:message.checkRecordingStatus.recording": [
    [
      "開始時刻: ", { type: "placeholder", name: "$date"}, "\n",
      "参考書名: ", { type: "placeholder", name: "$workbook"},
    ],
  ],
  "recording:message.checkRecordingStatus.finished": [ "現在記録中ではありません" ],
  "recording:message.cancelRecording": [ "記録をキャンセルしました" ],
  "recording:message.revertLastRecord": [ "最新の記録を取り消しました" ],
  "recording:error.notRecoeding": [ "Error: 記録をまだ開始していません" ],
  "recording:error.unfinishedRecoeding": [ "Error: 記録をまだ終了していません" ],
  "recording:error.unknownWorkbook": [ "Error: この参考書は登録されていません" ],
  "recording:error.unknownSubject": [ "Error: この教科は登録されていません" ],
  "general:error.general": [ "Error: もう一度やり直してください" ],
  "general:error.lessArguments": [ "Error: 引数が足りません" ],
}
