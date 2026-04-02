import { existsSync } from "node:fs";
import { mkdir, writeFile, readFile, appendFile } from "node:fs/promises";
import { UnfinishedTaskError } from "./errors.ts";

const RecordingFilePath = "./data/recordingStudying.txt"

// 記録ファイルがあるか確認、なければ作成
async function checkAndAddRecordingFile(){
  if (!existsSync("./data") ) await mkdir("./data");
  if (!existsSync(RecordingFilePath) ) await writeFile(RecordingFilePath, "", {encoding: "utf8"});
}

// 記録ファイルの最終行を取得
async function getLastLine() : Promise<string> {
  await checkAndAddRecordingFile()
  return ( await readFile(RecordingFilePath, {encoding: "utf8"}) ).trim().split("\n").at(-1) ?? ""
}

function formatDate(){
  const date = new Date();
  return `${date.getFullYear()},${date.getMonth()},${date.getDate()},${date.getHours()},${date.getMinutes()},${date.getSeconds()}`
}

// 記録を開始
export async function startRecordingStudying(subject: string, workbook: string){
  const lastLine = await getLastLine();
  if(lastLine.startsWith("START ")) throw new UnfinishedTaskError();
  await appendFile(RecordingFilePath, `START ${formatDate()} ${subject} ${workbook}`, {encoding: "utf8"});
}
