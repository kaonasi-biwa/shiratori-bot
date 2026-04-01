import { CommandInteraction } from "discord.js";
import type { Command } from "../command.d.ts"
import { cpus, freemem, totalmem } from "node:os"

export const statusCommand: Command = {
  data: {
    name: "status",
    description: "CPUとメモリの確認"
  },
  async execute(interaction : CommandInteraction) {
    await interaction.deferReply()
    let cpuUnued = 0;
    let cpuTotal = 0;
    {
      const cpuInfos = cpus()
      for(const cpuinfo of cpuInfos){
        cpuUnued += cpuinfo.times.idle;
        for(const usedType in cpuinfo.times) cpuTotal += cpuinfo.times[usedType as "user"] ?? 0
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 10000))
    {
      const cpuInfos = cpus()
      for(const cpuinfo of cpuInfos){
        cpuUnued -= cpuinfo.times.idle;
        for(const usedType in cpuinfo.times) cpuTotal -= cpuinfo.times[usedType as "user"] ?? 0
      }
    }
    await interaction.editReply(`今の状態はこんな感じだよ
\`\`\`
現在時刻     : ${new Date()}
CPU使用率    : ${Math.floor(100 - cpuUnued * 100 / cpuTotal)}%
メモリ使用率 : ${Math.floor(100 - freemem() * 100 / totalmem())}%
\`\`\`
`)
  }
}
