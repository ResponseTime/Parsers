import { readFileSync } from "fs";
import path from "path";

export enum TokenType {
  OBRACE = "OBRACE",
  CBRACE = "CBRACE",
  OSQUARE = "OSQUARE",
  CSQUARE = "CSQUARE",
  COLON = "COLON",
  COMMA = "COMMA",
  STRING = "STRING",
  NUMBER = "NUMBER",
  BOOLEAN = "BOOLEAN",
  NULL = "NULL",
}
interface Token {
  type: TokenType,
  value: string
}

export function readFile(path: string) {
  const data = readFileSync(path, {
    encoding: 'utf-8'
  })
  return data
}

const data = readFile(path.join("src", "demo.json"))
const TOKENS: Token[] = []
let ITER = 0;
while (ITER < data.length) {
  const token = data[ITER]

  if (/\s/.test(token)) {
    ITER++;
    continue;
  }

  switch (token) {
    case "{":
      TOKENS.push({ type: TokenType.OBRACE, value: '{' })
      break
    case ":":
      TOKENS.push({ type: TokenType.COLON, value: ":" })
      break
    case ",":
      TOKENS.push({ type: TokenType.COMMA, value: ',' })
      break
    case "}":
      TOKENS.push({ type: TokenType.CBRACE, value: '}' })
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
      TOKENS.push({ type: TokenType.STRING, value })
      ITER = i
      break
    case "[":
      TOKENS.push({ type: TokenType.OSQUARE, value: "[" })
      break
    case "]":
      TOKENS.push({ type: TokenType.CSQUARE, value: "]" })
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
          TOKENS.push({ type: TokenType.NUMBER, value: data.slice(ITER, i) })
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
            TOKENS.push({ type: TokenType.BOOLEAN, value: "TRUE" })
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
            TOKENS.push({ type: TokenType.BOOLEAN, value: "FALSE" })
            ITER = y
          }
          break
        case data.slice(ITER, ITER + 4) === 'null':
          TOKENS.push({ type: TokenType.NULL, value: "NULL" })
          ITER += 4
          break
      }
  }
  ITER++;
}

export const GENERATOR = {
  from: 0,
  to: TOKENS.length,

  [Symbol.iterator]() {
    return {
      current: this.from,
      last: this.to,
      next() {
        if (this.current < this.last) {
          return { done: false, value: TOKENS[this.current++] }
        } else {
          return { done: true }
        }
      }
    }
  }
}
