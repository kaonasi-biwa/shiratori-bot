import { pingCommand } from "./ping/index.ts";
import { exitCommand } from "./exit/index.ts";
import { statusCommand } from "./status/index.ts";
import { startRecordStudyingCommand } from "./startRecordStudying/index.ts";
import { registerWorkbookCommand } from "./registerWorkbook/index.ts";
import { registerSubjectCommand } from "./registerSubject/index.ts";
import { stopRecordStudyingCommand } from "./stopRecordStudying/index.ts";
import { cancelRecordStudyingCommand } from "./cancelRecordStudying/index.ts";
import { listOfWorkbooksCommand } from "./listOfWorkbooks/index.ts";
import { revertLastRecordCommand } from "./revertLastRecord/index.ts";
import { checkRecordingStatusCommand } from "./checkRecordingStatus/index.ts";
import type { Command } from "./command.d.ts";

export const Commands: ( Command | ( () => Command ) )[] = [
  pingCommand,
  exitCommand,
  statusCommand,
  startRecordStudyingCommand,
  registerWorkbookCommand,
  registerSubjectCommand,
  stopRecordStudyingCommand,
  cancelRecordStudyingCommand,
  listOfWorkbooksCommand,
  revertLastRecordCommand,
  checkRecordingStatusCommand,
]
