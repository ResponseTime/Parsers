import { readFileSync } from 'node:fs';
import path from 'node:path';

const JSON_PARSED = {};
const STACK = new Array();

export function getJsonFile(path: string) {
  const reader = readFileSync(path, {
    encoding: 'utf-8'
  })
  const lines = reader.split('\r\n');
  return lines
}
function parseValue(rawValue: string) {
  const finalValue = rawValue.trim().replace(/,$/, "");

  switch (true) {
    case finalValue.startsWith("\"") && finalValue.endsWith("\""):
      return finalValue.substring(1, finalValue.length - 1);
    case !Number.isNaN(parseFloat(finalValue)):
      return parseFloat(finalValue)
    case finalValue === 'null':
      return null
    case finalValue === 'true':
      return true
    case finalValue === 'false':
      return false
    case finalValue.length === 0:
      return ""
    case finalValue === '{':
      return 'Parse Object'
    case finalValue === '[':
      return 'Parse Array'
    case finalValue === "[]":
      return []
    case finalValue === "{}":
      return {}
    default:
      console.log(finalValue)
      throw new Error("Not parseable")
  }
}
function parseKey(rawKey: string) {
  const trimmed = rawKey.trim()
  if (!trimmed.startsWith("\"") || !trimmed.endsWith("\"")) {
    throw new Error("Not parseable")
  }
  return trimmed.substring(1, trimmed.length - 1)
}

function parseObject(lines: string, i: number, obj: object) {
  if (!lines[0].startsWith("{") || !lines[lines.length - 1].endsWith("}")) {
    throw new Error("Not parseable")
  }
  if (lines[i] && lines[i].trim().replace(/,$/, "") == '}' || i >= lines.length) {
    return [obj, i]
  }
  if (lines[i].trim() == '{') {
    return parseObject(lines, i + 1, obj)
  }
  else {
    let row = lines[i].trim().split(':')
    if (row.length < 2) {
      return parseObject(lines, i + 1, obj)
    }
    const key = parseKey(row[0])
    let value = parseValue(row[1])
    if (value == 'Parse Object') {
      lines[i] = row[1].trim().replace(/,$/, "")
      let [newValue, newI] = parseObject(lines, i, {})
      value = newValue
      i = newI
    } else if (value == 'Parse Array') {
      lines[i] = row[1].trim().replace(/,$/, "")
      let [newValue, newI] = parseArray(lines, i, [])
      value = newValue
      i = newI
    }
    obj[key] = value
    return parseObject(lines, i + 1, obj)
  }
}

function parseArray(lines: string[], i: number, arr: number[] | object[]): [number[], number] {
  if (lines[i].trim().replace(/,$/, "") == ']' || i >= lines.length) {
    return [arr, i]
  }
  else if (lines[i] == "[") {
    return parseArray(lines, i + 1, arr)
  } else {
    if (lines[i].trim() == "{") {
      const [obj, newI] = parseObject(lines, i, {})
      arr.push(obj)
      i = newI
      return parseArray(lines, i + 1, arr)
    }
    if (lines[i].trim() === "[") {
      const [subArr, newI] = parseArray(lines, i + 1, []);
      arr.push(subArr);
      return parseArray(lines, newI + 1, arr);
    }
    arr.push(parseValue(lines[i]))
    return parseArray(lines, i + 1, arr)
  }
}

const json_lines = getJsonFile(path.join('src', 'demo.json'))
// const simple_json = getJsonFile(path.join('.', 'simple_json.json'))


let [obj] = parseObject(json_lines, 0, {})
console.log(obj)
// for (const [key, value] of Object.entries(obj)) {
//   console.log(key, value, typeof value)
// }
