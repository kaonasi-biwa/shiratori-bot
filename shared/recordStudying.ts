import { existsSync } from "node:fs";
import { mkdir, writeFile, readFile, appendFile } from "node:fs/promises";
import { UnfinishedTaskError } from "./errors.ts";

const RecordingFilePath = "./data/recordingStudying.txt"
const SubjectAndWorkbookPath = "./data/subjectAndWorkbook.txt"
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
