import type { Command } from "../command.d.ts"

export const exitCommand: Command = {
  data: {
    name: "exit",
    description: "Botの終了"
  },
  async execute() {
    return { messageId: "exit:message", shutdown: true }
  }
}
