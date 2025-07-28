import { readFileSync } from "fs";
import path from "path";

export function readFile(path: string) {
  const data = readFileSync(path, {
    encoding: 'utf-8'
  })
  return data
}
interface Token {
  type: string,
  value: string
}
const data = readFile(path.join("src", "demo.json"))
const TOKENS: Token[] = []
let ITER = 0;
while (ITER < data.length) {
  const token = data[ITER]
  switch (token) {
    case "{":
      TOKENS.push({ type: 'OBRACKET', value: '{' })
      break
    case ":":
      TOKENS.push({ type: 'COLON', value: ":" })
      break
    case ",":
      TOKENS.push({ type: 'COMMA', value: ',' })
      break
    case "}":
      TOKENS.push({ type: 'CBRACKET', value: '}' })
      break
    case "\"":
      let value = "";
      let i = ITER + 1
      while (i < data.length && data[i] != "\"") {
        if (data[i] != '') {
          value += data[i]
        }
        i++
      }
      TOKENS.push({ type: 'STRING', value })
      ITER = i + 1
      break
    case "[":
      TOKENS.push({ type: "OSQBRACKET", value: "[" })
      break
    case "]":
      TOKENS.push({ type: "CSQBRACKET", value: "]" })
      break

    default:
      switch (true) {
        case /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/
          .test(token):
          let i = ITER + 1;
          while (/-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/
            .test(data[i])) {
            i++
          }
          TOKENS.push({ type: "INTEGER", value: data.slice(ITER, i) })
          ITER = i
          break
        case data[ITER] === 't':
          let j = ITER + 1;
          let k = 0;
          let match = "rue"
          while (match[k] === data[j]) {
            k++
            j++
          }
          if (k == match.length) {
            TOKENS.push({ type: "BOOLEAN", value: "TRUE" })
            ITER = j
          }
          break
        case data[ITER] === 'f':
          let y = ITER + 1;
          let x = 0;
          let match2 = "alse"
          while (match2[x] === data[y]) {
            x++
            y++
          }
          if (x == match2.length) {
            TOKENS.push({ type: "BOOLEAN", value: "FALSE" })
            ITER = y
          }
          break
      }
  }
  ITER++;
}

console.log(TOKENS)