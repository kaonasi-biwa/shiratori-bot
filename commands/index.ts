import { pingCommand } from "./ping/index.ts";
import { exitCommand } from "./exit/index.ts";
import { statusCommand } from "./status/index.ts";
import type { Command } from "./command.d.ts";

export const Commands: Command[] = [
  pingCommand,
  exitCommand,
  statusCommand,
]
