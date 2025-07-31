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

const data = readFile(path.join("src", "simple_json.json"))
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
    case '"':
      let value = "";
      let i = ITER + 1
      while (i < data.length && data[i] != '"') {
        value += data[i]
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
        case /-|\d/.test(data[ITER]):
          const match1 = data.slice(ITER).match(
            /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/
          );

          if (!match1) {
            throw new Error(`Invalid number at index ${ITER}`);
          }
          TOKENS.push({
            type: TokenType.NUMBER,
            value: match1[0],
          });
          ITER += match1[0].length - 1;
          break
        case data[ITER] === 't':
          let j = ITER;
          let k = 0;
          let match = "true"
          while (match[k] === data[j]) {
            k++
            j++
          }
          if (k == match.length) {
            TOKENS.push({ type: TokenType.BOOLEAN, value: "TRUE" })
            ITER = j - 1
          }
          break
        case data[ITER] === 'f':
          let y = ITER;
          let x = 0;
          let match2 = "false"
          while (match2[x] === data[y]) {
            x++
            y++
          }
          if (x == match2.length) {
            TOKENS.push({ type: TokenType.BOOLEAN, value: "FALSE" })
            ITER = y - 1
          }
          break
        case data.slice(ITER, ITER + 4) === 'null':
          TOKENS.push({ type: TokenType.NULL, value: "NULL" })
          ITER += 4 - 1
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

export function* GEN(): Generator<Token> {
  for (let token of TOKENS as Token[]) {
    yield token as Token
  }
}

const G: Generator<Token> = GEN()

let INDEX = 0;
// console.log(TOKENS)
const cursor = {
  next: () => { return TOKENS[INDEX++] },
  peek: () => { return TOKENS[INDEX] },
  done: () => { return INDEX >= TOKENS.length },
  current: () => { return TOKENS[INDEX - 1] }
}
let OBJ = {}
let ArrObjs: any[] = []
function parseValue(token: Token) {
  switch (token.type) {
    case TokenType.OBRACE:
      return parseObject(OBJ)
    case TokenType.OSQUARE:
      return parseArray(ArrObjs)
    case TokenType.BOOLEAN:
      if (token.value === "TRUE") {
        return true
      } else {
        return false
      }
    case TokenType.CBRACE:

      return
    case TokenType.COLON:

      return
    case TokenType.COMMA:

      return
    case TokenType.CSQUARE:

      return
    case TokenType.STRING:
      return token.value
    case TokenType.NUMBER:
      return parseFloat(token.value)
    case TokenType.NULL:
      return null
  }
}

// function parseArray(arr: any[]) {
//   const token = cursor.next()
//   if (token.type === TokenType.CSQUARE) {
//     cursor.next()
//     return arr
//   }
//   let value;
//   if (cursor.peek().type === TokenType.OBRACE) {
//     cursor.next()
//     value = parseObject({})
//     // cursor.next()
//   } else if (cursor.peek().type === TokenType.OSQUARE) {
//     cursor.next()
//     value = parseArray([])
//     // cursor.next()
//   } else {
//     value = parseValue(token)
//   }

//   arr.push(value)
//   if (cursor.peek().type === TokenType.COMMA) {
//     cursor.next()
//     return parseArray(arr)
//   }
//   return arr
// }

// function parseObject(obj: any) {
//   const token = cursor.next()
//   console.log(token, cursor.peek())
//   if (token.type === TokenType.CBRACE) {
//     return obj
//   }
//   // if (token.type !== TokenType.STRING) {
//   //   throw new Error("Error Parsing 1")
//   // }
//   const key = parseValue(token)

//   // if (cursor.peek().type !== TokenType.COLON) {
//   //   throw new Error("Error Parsing 2")
//   // }
//   cursor.next()
//   let value;
//   if (cursor.peek().type === TokenType.OBRACE) {
//     cursor.next()
//     value = parseObject({})
//     cursor.next()
//   } else if (cursor.peek().type === TokenType.OSQUARE) {
//     cursor.next()
//     value = parseArray([])
//     cursor.next()
//   } else {
//     value = parseValue(cursor.next())
//   }

//   // console.log(token, cursor.peek())
//   obj[key] = value
//   // console.log(cursor.peek())
//   if (cursor.peek().type === TokenType.COMMA) {
//     cursor.next()
//     return parseObject(obj)
//   }
//   return obj
// }

function parseObject(obj: any) {
  let token = cursor.next()

  if (token.type === TokenType.CBRACE) {
    cursor.next()
    return obj
  }
  if (token.type === TokenType.OBRACE) {
    token = cursor.next()
  }
  if (token.type === TokenType.COMMA) {
    token = cursor.next()
  }
  if (token.type !== TokenType.STRING) {
    throw new Error("Not Parsing ts 1")
  }
  const key = parseValue(token) as string
  if (cursor.peek().type != TokenType.COLON) {
    throw new Error("Not Parsing ts 2")
  }
  cursor.next()
  let value;
  if (cursor.peek().type === TokenType.OBRACE) {
    value = parseObject({})
  } else if (cursor.peek().type === TokenType.OSQUARE) {
    value = parseArray([])
  } else {
    value = parseValue(cursor.peek())
  }
  obj[key] = value
  cursor.next()
  if (!cursor.done() && (cursor.peek().type === TokenType.COMMA || cursor.peek().type === TokenType.CBRACE)) {
    return parseObject(obj)
  }
  return obj
}

function parseArray(arr: any[]) {

}
const token = cursor.next()
OBJ = parseValue(token)
console.log(OBJ)
console.log(ArrObjs)