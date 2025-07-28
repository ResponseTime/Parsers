import { readFileSync } from 'node:fs';
import path from 'node:path';

const JSON_PARSED = {};
const STACK = new Array();

function getJsonFile(path) {
  const reader = readFileSync(path, {
    encoding: 'utf-8'
  })

  const lines = reader.split('\r\n');
  return lines
}
function parseValue(rawValue) {
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
    default:
      throw new Error("Not parseable")
  }
}
function parseKey(rawKey) {
  const trimmed = rawKey.trim()
  if (!trimmed.startsWith("\"") || !trimmed.endsWith("\"")) {
    throw new Error("Not parseable")
  }
  return trimmed.substring(1, trimmed.length - 1)
}

function parseObject(lines, i, obj) {
  if (!lines[0].startsWith("{") || !lines[lines.length - 1].endsWith("}")) {
    throw new Error("Not parseable")
  }
  if (lines[i] == '}' || i >= lines.length) {
    return obj
  }
  if (lines[i] == '{') {
    return parseObject(lines, i + 1, obj)
  }
  else {
    let row = lines[i].trim().split(':')
    if (row.length < 2) throw new Error("Not parseable")
    const key = parseKey(row[0])
    const value = parseValue(row[1])
    obj[key] = value
    return parseObject(lines, i + 1, obj)
  }
}
const json_lines = getJsonFile(path.join('.', 'demo.json'))
const simple_json = getJsonFile(path.join('.', 'simple_json.json'))


let obj = parseObject(simple_json, 0, {})
console.log(obj)
for (const [key, value] of Object.entries(obj)) {
  console.log(key, value, typeof value)
}
