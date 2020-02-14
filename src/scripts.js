const includeExpression = /\/\/\s?#import\s(?<lib>.*)\/(?<property>\S*)(\sas\s(?<importName>.*))?/g

const transformScript = (script) => {
  let match
  let transformed = script
  while (match = includeExpression.exec(script)) {
    let {lib, property, importName} = match.groups || {}
    if (lib === 'std') {
      // console.log(`Adding std library ${property} as ${importName}`)
      transformed = addStandard(transformed, property, importName)
      continue
    }
  }

  return transformed
}

const addStandard = (script, field, importName) => {
  const stdFunc = standard[field]
  if (!stdFunc) { return }

  const stdFuncText = stdFunc.toString()
  const stdFuncTextWithName = importName ? stdFuncText.replace(`function ${field}`, `function ${importName}`) : stdFuncText
  return stdFuncTextWithName + `\n\n` + script
}

const standard = {
  makeHex: function makeHex(x, y) { return {x, y} },
  makeGrid: function makeGrid() {
    // Create grid (easier for writing bot given imperative stuff idk) (+1 as haskell coords start at 1,1)
    let grid = []
    for (let i = 1; i <= 11; i++) {
      grid[i] = []
      for (let j = 1; j <= 11; j++) {
        grid[i][j] = {x: i, y: j}
      }
    }

    return grid
  },
  makePositionsList: function makePositionsList() {
    let positions = []
    for (let i = 1; i <= 11; i++) {
      for (let j = 1; j <= 11; j++) {
        positions.push({x: i, y: j})
      }
    }

    return positions
  },
  isTaken: function isTaken(list, {x, y}) {
    for (let hex of list) {
      if (hex.x === x && hex.y === y) {
        return true
      }
    }
    return false
  }
}


module.exports = transformScript
