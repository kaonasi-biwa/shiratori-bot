import type { Command } from "../command.d.ts"
import { cpus, freemem, totalmem } from "node:os"

export const statusCommand: Command = {
  data: {
    name: "status",
    description: "CPUとメモリの確認"
  },
  async execute(interaction) {
    await interaction.deferReply();
    let cpuUnused = 0;
    let cpuTotal = 0;
    {
      const cpuInfos = cpus()
      for(const cpuinfo of cpuInfos){
        cpuUnused += cpuinfo.times.idle;
        for(const usedType in cpuinfo.times) cpuTotal += cpuinfo.times[usedType as "user"] ?? 0
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 10000))
    {
      const cpuInfos = cpus()
      for(const cpuinfo of cpuInfos){
        cpuUnused -= cpuinfo.times.idle;
        for(const usedType in cpuinfo.times) cpuTotal -= cpuinfo.times[usedType as "user"] ?? 0
      }
    }
    return {
      messageId: "status:message",
      messageArgs: {
        "$date": `${new Date()}`,
        "$cpu": `${Math.floor(100 - cpuUnused * 100 / cpuTotal)}%`,
        "$memory": `${Math.floor(100 - freemem() * 100 / totalmem())}%`,
      },
      codeblock: true,
      edit: true,
    }
  }
}
