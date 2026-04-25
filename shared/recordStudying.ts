import { existsSync } from "node:fs";
import { mkdir, writeFile, readFile, appendFile } from "node:fs/promises";
import { UnfinishedTaskError, UnknownSubjectError, UnknownWorkbookError } from "./errors.ts";

const RecordingFilePath = "./data/recordingStudying.txt"
const SubjectAndWorkbookPath = "./data/subjectAndWorkbook.json"
let subjectsAndWorkbooks: SubjectAndWorkbook = {
  name: {},
  subjects: {},
}

interface SubjectAndWorkbook {
  name : Record<string, string>
  subjects: Record<string, string[]>
}

// 記録ファイルがあるか確認、なければ作成
async function checkAndAddRecordingFile(){
  if (!existsSync("./data") ) await mkdir("./data");
  if (!existsSync(RecordingFilePath) ) await writeFile(RecordingFilePath, "", {encoding: "utf8"});
  if (!existsSync(SubjectAndWorkbookPath) )
    await writeFile(SubjectAndWorkbookPath, JSON.stringify({"name": {}, "subjects": {}}), {encoding: "utf8"});
}

// 記録ファイルの最終行を取得
async function getLastLine() : Promise<string> {
  return ( await readFile(RecordingFilePath, {encoding: "utf8"}) ).trim().split("\n").at(-1) ?? ""
}

type DateArray = [number, number, number, number, number, number]
type TimeArray = [number, number, number]
// 現在時刻を年・月・日・時間・分・秒で返す
function getDate(): DateArray{
  const date = new Date();
  return [ date.getFullYear(),date.getMonth(),date.getDate(),date.getHours(),date.getMinutes(),date.getSeconds() ];
}

function encodeDate(date: DateArray): string{
  return `${date[0]},${date[1]},${date[2]},${date[3]},${date[4]},${date[5]}`
}

function decodeDate(encodedTime: string): DateArray {
  const returnValue = encodedTime.split(",").map((text) => Number(text)).slice(0,6) as DateArray
  return returnValue;
}

// 2つの引数の時間との差を時間・分・秒で返す。想定は1つ目の引数が後の時間。
function getTimeDifference(previousTime: DateArray, followingTime: DateArray): TimeArray {
  const differenceValue = previousTime.map((time, index) =>  time - followingTime[index]) as DateArray
  const returnValue = [...differenceValue.slice(3,6)] as TimeArray;
  if(returnValue[2] < 0){
    returnValue[1] -= 1
    returnValue[2] += 60
  }
  if(returnValue[1] < 0){
    returnValue[0] -= 1
    returnValue[1] += 60
  }
  if(differenceValue[0] || differenceValue[1] || differenceValue[2]){
    returnValue[0] += (
      (new Date(previousTime[0],previousTime[1], previousTime[2] )).getTime()
      - (new Date(followingTime[0],followingTime[1],followingTime[2])).getTime()
    ) / 3600000
  }
  return returnValue;
}

// 記録を開始
export async function startRecordingStudying(subject: string, workbook: string){
  if(!(subject in subjectsAndWorkbooks.subjects)) throw new UnknownSubjectError();
  if(!subjectsAndWorkbooks.subjects[subject].includes(`${workbook}`)) throw new UnknownWorkbookError();
  const lastLine = await getLastLine();
  if(lastLine.startsWith("START ")) throw new UnfinishedTaskError();
  await appendFile(RecordingFilePath, `START ${encodeDate(getDate())} ${subject} ${workbook}\n`, {encoding: "utf8"});
}

// 記録を終了し、かかった時間を返却
export async function stopRecordingStudying(): Promise<TimeArray>{
  const lastLine = await getLastLine();
  if(lastLine.startsWith("END")) throw new UnfinishedTaskError();
  const nowDate = getDate();
  await appendFile(RecordingFilePath, `END ${encodeDate(nowDate)}\n`, {encoding: "utf8"});
  return getTimeDifference(nowDate, decodeDate(lastLine.split(" ")[1]))
}

// 記録をキャンセルし、開始のログを消去
export async function cancelRecordingStudying(){
  const lastLine = await getLastLine();
  if(lastLine.startsWith("END")) throw new UnfinishedTaskError();
  const recordingFileContent = ( await readFile(RecordingFilePath, {encoding: "utf8"}) ).split("\n").toReversed()
  await writeFile(
    RecordingFilePath,
    recordingFileContent.toSpliced(recordingFileContent.findIndex((str) => !!str), 1).toReversed().join("\n"),
    {encoding: "utf8"}
  )
}

// 最新の終了済みの記録を1つ消去
export async function revertLastRecord(){
  const lastLine = await getLastLine();
  if(lastLine.startsWith("START")) throw new UnfinishedTaskError();
  const recordingFileContent = ( await readFile(RecordingFilePath, {encoding: "utf8"}) ).split("\n").toReversed()
  await writeFile(
    RecordingFilePath,
    recordingFileContent.toSpliced(recordingFileContent.findIndex((str) => !!str), 1)
                        .toSpliced(recordingFileContent.findIndex((str) => !!str), 1)
                        .toReversed().join("\n"),
    {encoding: "utf8"}
  )
}

// 現在記録中かどうかを確認。記録中であれば開始時刻と参考書名を返す。
export async function checkRecordingStatus(): Promise<false | {date: DateArray, workbook: string}>{
  const lastLine = await getLastLine();
  if(lastLine.startsWith("END")) return false;
  const lineContent = lastLine.split(" ")
  return {
    date: decodeDate(lineContent[1]),
    workbook: getNameOfWorkbook(lineContent[2], lineContent[3])
  }
}

// 指定期間の勉強時間の合計を取得
export async function totalStudyingTime(start:[number, number, number], end?:[number,number,number]): Promise<Record<string, TimeArray>>{
  const filelines = ( await readFile(RecordingFilePath, {encoding: "utf8"}) ).split("\n").filter((line) => !!line);
  const totalTime: Record<string, TimeArray> = {"<TOTAL>": [0,0,0]}
  let startTime: DateArray | null = null;
  let recordWorkbook = ""
  let recordSubject = ""
  const startDate = ( new Date(start[0], start[1]-1, start[2], 4) ).getTime()
  const endDate = end ? ( new Date(end[0], end[1]-1, start[2]+1, 4) ).getTime() : Infinity;
  for(const line of filelines){
    const lineContent = line.split(" ")
    // console.log(lineContent)
    if(lineContent[0] === "END"){
      if(startTime){
        const timeDifference = getTimeDifference(decodeDate(lineContent[1]), startTime)
        totalTime[recordWorkbook][0] += timeDifference[0]
        totalTime[recordWorkbook][1] += timeDifference[1]
        totalTime[recordWorkbook][2] += timeDifference[2]
        totalTime[recordSubject][0] += timeDifference[0]
        totalTime[recordSubject][1] += timeDifference[1]
        totalTime[recordSubject][2] += timeDifference[2]
        totalTime["<TOTAL>"][0] += timeDifference[0]
        totalTime["<TOTAL>"][1] += timeDifference[1]
        totalTime["<TOTAL>"][2] += timeDifference[2]
      } else continue
    } else if(lineContent[0] === "START"){
      const dateArray = decodeDate(lineContent[1]);
      const date = ( new Date(...dateArray) ).getTime();
      if(date <=startDate) continue;
      if(endDate <= date) break;
      recordSubject = lineContent[2]
      recordWorkbook = `${recordSubject}.${lineContent[3]}`
      if(!totalTime[recordSubject]) totalTime[recordSubject] = [0,0,0];
      if(!totalTime[recordWorkbook]) totalTime[recordWorkbook] = [0,0,0];
      startTime = dateArray;
    }
  }
  for(const workbook in totalTime){
    totalTime[workbook][1] += Math.floor(totalTime[workbook][2] / 60)
    totalTime[workbook][2] += totalTime[workbook][2] % 60
    totalTime[workbook][0] += Math.floor(totalTime[workbook][1] / 60)
    totalTime[workbook][1] += totalTime[workbook][1] % 60
  }
  return totalTime;
}

// 教科と参考書等を保存
async function saveSubjectAndWorkbook(){
  await writeFile(SubjectAndWorkbookPath, JSON.stringify(subjectsAndWorkbooks), {encoding: "utf8"})
}

// 教科を登録
export async function registerSubject(id: string, name: string){
  subjectsAndWorkbooks.subjects[id] = []
  subjectsAndWorkbooks.name[id] = name
  saveSubjectAndWorkbook()
}

// 参考書等を登録
export async function registerWorkbook(subject: string, id: string, name: string){
  if(!(subject in subjectsAndWorkbooks.subjects)) throw new UnknownSubjectError();
  subjectsAndWorkbooks.subjects[subject].push(id)
  subjectsAndWorkbooks.name[`${subject}.${id}`] = name
  saveSubjectAndWorkbook()
}

// 登録された教科を取得
export function getSubjects(){
  return Object.keys(subjectsAndWorkbooks.subjects).toSorted();
}

// 登録された参考書等を取得
export function getWorkbooks(subject: string){
  return subjectsAndWorkbooks.subjects[subject].toSorted();
}

// 登録された教科の名前を取得
export function getNameOfSubject(subject: string){
  return subjectsAndWorkbooks.name[subject] || ""
}

// 登録された教科の名前を取得
export function getNameOfWorkbook(subject: string, workbook: string){
  return subjectsAndWorkbooks.name[`${subject}.${workbook}`] || ""
}

await checkAndAddRecordingFile()
subjectsAndWorkbooks = JSON.parse(await readFile(SubjectAndWorkbookPath, {encoding: "utf8"}))
