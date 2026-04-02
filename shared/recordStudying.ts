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
