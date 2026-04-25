import type { Command } from "../command.d.ts"

export const pingCommand: Command = {
  data: {
    name: "ping",
    description: "疎通確認"
  },
  async execute() {
    return { messageId: "ping:message"}
  }
}
