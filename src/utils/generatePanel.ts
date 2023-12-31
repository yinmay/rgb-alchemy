import { IItem } from '../components/AlchemyPanel'

function generateTable(row: number, col: number, target: number[]) {
  let array = new Array(row)
  for (let i = 0; i < row + 2; i++) {
    array[i] = new Array(col)
    for (let j = 0; j < col + 2; j++) {
      array[i][j] = {
        x: i,
        y: j,
        color: [0, 0, 0],
        colorGroup: [],
        gap: 0,
      }
    }
  }
  return array
}

const calculateColorForCell = (
  p: number,
  total: number,
  initColor: number[]
) => {
  return initColor.map((c) => {
    if (c === 255) {
      c = Math.floor((255 * p) / total)
    } else {
      c = Math.floor((c * p) / total)
    }
    return c
  })
}

const calculateColorGap = (target: number[], resColor: number[]) => {
  return (
    (1 / 255) *
    (1 / Math.sqrt(3)) *
    Math.sqrt(
      Math.pow(target[0] - resColor[0], 2) +
        Math.pow(target[1] - resColor[1], 2) +
        Math.pow(target[2] - resColor[2], 2)
    )
  )
}

const getChangedColorPanel = (
  type: 'column' | 'row',
  changeColorArr: IItem[],
  panel: IItem[][],
  initColor: number[],
  item: IItem,
  target: number[]
) => {
  const { x = 0, y = 0 } = item
  const changePanel = [...panel]
  for (let f = 0; f < changeColorArr.length; f++) {
    const x0 = changeColorArr[f].x
    const y0 = changeColorArr[f].y
    const total = changeColorArr.length + 1
    let p = 0
    if (type === 'row') {
      p = x === 0 ? changeColorArr.length + 1 - x0 : x0
    } else if (type === 'column') {
      p = y === 0 ? changeColorArr.length + 1 - y0 : y0
    }
    // calculate every column or row's cell color
    const color = calculateColorForCell(p, total, initColor)

    changePanel[x0][y0].colorGroup = changePanel[x0][y0].colorGroup.concat([
      color,
    ])
    if (changePanel[x0][y0].colorGroup.length >= 2) {
      // if the cell's color is multiple
      const colorGroup = changePanel[x0][y0].colorGroup
      const result: number[] = []
      for (let key in colorGroup) {
        colorGroup[key].forEach((value, index: number) => {
          if (!result[index]) {
            result[index] = 0
          }
          result[index] += value
        })
      }
      const f = 255 / Math.max(result[0], result[1], result[2], 255)
      const resColor = [
        Math.floor(result[0] * f),
        Math.floor(result[1] * f),
        Math.floor(result[2] * f),
      ]
      changePanel[x0][y0].color = resColor
      changePanel[x0][y0].gap = calculateColorGap(target, resColor)
    } else {
      // if the cell's color is just one
      changePanel[x0][y0].color = color
      changePanel[x0][y0].gap = calculateColorGap(target, color)
    }
  }
  return changePanel
}

const calculateColorPanel = (
  item: IItem,
  colorPanel: IItem[][] = [],
  initColor: number[],
  target: number[]
) => {
  const { x = 0, y = 0 } = item
  let changePanel = [...colorPanel]
  const flatArr = [...colorPanel].flat() // get all the cells when table flatten
  for (let i = 0; i < colorPanel.length; i++) {
    for (let j = 0; j < colorPanel[i].length; j++) {
      if (x === i && y === j) {
        // find the cell and init color into it

        changePanel[i][j].color = initColor
        if (x === 0 || x === changePanel.length - 1) {
          const arr = flatArr.filter((item) => item.y === y)
          const length = arr.length - 1
          let changeColorArr = arr.filter(
            (item) => item.x !== 0 && item.x !== length
          )

          // get the change color row
          changePanel = getChangedColorPanel(
            'row',
            changeColorArr,
            changePanel,
            initColor,
            item,
            target
          )
        } else if (y === 0 || y === colorPanel[i].length - 1) {
          const arr = flatArr.filter((item) => item.x === x)
          const length = arr.length - 1
          let changeColorArr = arr.filter(
            (item) => item.y !== 0 && item.y !== length
          )

          // get the change color column
          changePanel = getChangedColorPanel(
            'column',
            changeColorArr,
            changePanel,
            initColor,
            item,
            target
          )
        }
      }
    }
  }
  return changePanel
}

const findSmallestGapCell = (arr: IItem[][]) => {
  return arr.flat().reduce((prev: IItem | null, curr) => {
    if (curr.gap !== 0 && (prev === null || curr.gap < prev.gap)) {
      return curr
    } else {
      return prev
    }
  }, null)
}

export {
  calculateColorPanel,
  generateTable,
  findSmallestGapCell,
  calculateColorGap,
}
