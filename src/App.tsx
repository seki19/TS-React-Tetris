import React, { useEffect } from "react";
import Stage from "./components/Stage";

// TODO:constは別ファイルに移動。letで宣言している変数はuseStateに変更
type game = 1;
const GAME: game = 1;
type gameOver = 0;
const GAMEOVER: gameOver = 0;
type gameEffect = 2;
const EFFECT: gameEffect = 2;
const BLOCK_SIZE = 24;
const BLOCK_RAWS = 22;
const BLOCK_COLS = 12;

const NON_BLOCK = 0;
const NORML_BLOCK = 1;
const LOCK_BLOCK = 2;
const CLEAR_BLOCK = 3;
const WALL = 9;

const BACK_COLOR = "#ddd"; // 背景色
const GAMEOVER_COLOR = "palevioletred"; // ゲームオーバー時のブロックの色
const BLOCK_COLOR = "steelblue"; // 操作ブロックの色
const LOCK_COLOR = "lightslategray"; // ロックしたブロックの色
const WALL_COLOR = "#666"; // 壁の色
const ERROR_COLOR = "tomato"; // エラーブロックの色
const EFFECT_COLOR1 = "whitesmoke"; // エフェクト時の色1
const EFFECT_COLOR2 = "#000";

// エフェクト
const EFFECT_ANIMATION = 2; // エフェクト時のちかちかする回数
// ゲーム要素
const NEXTLEVEL = 10; // 次のレベルまでの消去ライン数

const SCREEN_WIDTH = BLOCK_SIZE * BLOCK_COLS;
const SCREEN_HEIGTH = BLOCK_SIZE * BLOCK_RAWS;
const block = [
  [
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],

  [
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
  ],

  [
    [0, 0, 1, 0],
    [0, 1, 1, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 0],
  ],

  [
    [0, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 0],
  ],

  [
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
  ],

  [
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 0],
  ],

  [
    [0, 0, 0, 0],
    [0, 1, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
  ],
];
const stage = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // ←表示しない
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
  [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]; // ←表示しない

let g: CanvasRenderingContext2D | null;
let mode: game | gameOver | gameEffect;
let effectState = { flipFlop: 0, speed: 0, count: 0 };
let blockSize: number;
let field: number[][] = new Array();
let frame: number;
let speed: number;
let oBlock: number[][];
let block_current_x: number, block_current_y: number;
let block_current_sx, block_current_sy;
let blockType: number;
let timer1: NodeJS.Timeout;
let FPS: number;
let clearLine: number;

/**
 * 初期化
 */
const initGame = () => {
  clearTimeout(timer1);
  FPS = 30;
  clearLine = 0;
  let canvasDom = document.getElementById("canvas")!;
  if (canvasDom instanceof HTMLCanvasElement) {
    canvasDom.width = SCREEN_WIDTH;
    canvasDom.height = SCREEN_HEIGTH;
    g = canvasDom.getContext("2d");
    // エフェクト設定
    effectState.flipFlop = 0;
    effectState.speed = 4;
    effectState.count = 0;
    // ブロックの設定
    blockSize = BLOCK_SIZE;
  } else {
    throw new Error("#canvas is not an HTMLCanvasElement");
  }
};

const newGame = () => {
  setStage();
  mode = GAME;
  frame = 1;
  speed = 30;
  // clearTimeout
  createBlock();
  mainLoop();
};

/**
 * ステージ設定
 */
const setStage = () => {
  for (let i = 0; i < BLOCK_RAWS; i++) {
    field[i] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
  oBlock = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  for (let i = 0; i < BLOCK_RAWS; i++) {
    for (let j = 0; j < BLOCK_COLS; j++) {
      field[i][j] = stage[i][j];
    }
  }
};

/**
 * 新しいブロックを作成
 * @returns
 */
const createBlock = () => {
  if (mode === EFFECT) return;
  block_current_x = block_current_sx = Math.floor(BLOCK_COLS / 3);
  block_current_y = block_current_sy = 0;
  blockType = Math.floor(Math.random() * 7);
  // ブロックをコピー
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      oBlock[i][j] = block[blockType][i][j];
    }
  }

  if (hitCheck()) {
    mode = GAMEOVER;
    console.log("GAMEOVER!");
  }
  putBlock();
};

/**
 * ブロックを消去する
 * @returns
 */
const clearBlock = () => {
  if (mode === EFFECT) return;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (oBlock[i][j])
        field[i + block_current_y][j + block_current_x] = NON_BLOCK;
    }
  }
};

/**
 * ブロックの回転処理
 * @returns
 */
const rotateBlock = (): 0 | void => {
  if (mode === EFFECT) return;
  clearBlock();
  let tBlock = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      tBlock[i][j] = oBlock[i][j];
    }
  }
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      oBlock[i][j] = tBlock[3 - j][i];
    }
  }
  if (hitCheck()) {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        oBlock[i][j] = tBlock[i][j];
      }
    }
  }
  putBlock();
  return 0;
};

/**
 * ブロックをロック（動かせないように）する
 * @returns
 */
const lockBlock = () => {
  if (mode === EFFECT) return;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (oBlock[i][j])
        field[i + block_current_y][j + block_current_x] = LOCK_BLOCK;
    }
  }
};

/**
 * ブロックの当たり判定処理（移動できるか？落下できるか？）
 * @returns
 */
const hitCheck = (): 1 | void => {
  if (mode === EFFECT) return;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (field[i + block_current_y][j + block_current_x] && oBlock[i][j])
        return 1;
    }
  }
};

/**
 * ラインが揃ったかチェックする
 */
const lineCheck = (): number | void => {
  if (mode === EFFECT) return;
  let count;
  let lineCount = 0;
  for (let i = 0; i < BLOCK_RAWS - 2; i++) {
    count = 0;
    for (let j = 0; j < BLOCK_COLS; j++) {
      if (field[i][j]) count++;
      else break;
    }
    if (count >= BLOCK_COLS) {
      lineCount++;
      clearLine++;
      for (let j = 1; j < BLOCK_COLS - 1; j++) field[i][j] = CLEAR_BLOCK;
      console.log("lineCount = " + lineCount);
      console.log("clearLine = " + clearLine);
    }
  }
  return lineCount;
};

/**
 * そろったラインを消去する
 * @returns
 */
const deleteLine = () => {
  if (mode === EFFECT) return;
  for (let i = BLOCK_RAWS - 1; i >= 1; i--) {
    for (let j = 1; j < BLOCK_COLS - 1; j++) {
      if (field[i][j] === CLEAR_BLOCK) {
        field[i][j] = field[i - 1][j];
        for (let above = i - 1; above >= 1; above--) {
          field[above][j] = field[above - 1][j];
        }
        i++;
      }
    }
  }
};

/**
 * ブロックをステージにセットする
 * @returns
 */
const putBlock = () => {
  if (mode === EFFECT) return;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (oBlock[i][j])
        field[i + block_current_y][j + block_current_x] = oBlock[i][j];
    }
  }
};

/**
 * ゲーム画面クリア
 */
const clearWindow = () => {
  if (g instanceof CanvasRenderingContext2D) {
    g.fillStyle = BACK_COLOR;
    g.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGTH);
  }
};

/**
 * 画面描画
 */
const draw = () => {
  clearWindow();
  for (let i = 0; i < BLOCK_RAWS; i++) {
    for (let j = 0; j < BLOCK_COLS; j++) {
      switch (field[i][j]) {
        case NON_BLOCK:
          if (g instanceof CanvasRenderingContext2D) {
            g.fillStyle = BACK_COLOR;
          }
          break;
        case NORML_BLOCK:
          if (g instanceof CanvasRenderingContext2D) {
            g.fillStyle = BLOCK_COLOR;
          }
          break;
        case LOCK_BLOCK:
          if (g instanceof CanvasRenderingContext2D) {
            g.fillStyle = LOCK_COLOR;
          }
          break;
        case CLEAR_BLOCK:
          if (g instanceof CanvasRenderingContext2D) {
            g.fillStyle = BLOCK_COLOR;
          }
          break;
        case WALL:
          if (g instanceof CanvasRenderingContext2D) {
            g.fillStyle = WALL_COLOR;
          }
          break;
        default:
          if (g instanceof CanvasRenderingContext2D) {
            g.fillStyle = ERROR_COLOR;
          }
      }
      if (g instanceof CanvasRenderingContext2D)
        g.fillRect(j * blockSize, i * blockSize, blockSize - 1, blockSize - 1);
    }
  }
};

/**
 * ラインを消去するときのエフェクト
 */
const gameEffect = () => {
  let colos = [EFFECT_COLOR1, EFFECT_COLOR2];

  if (g instanceof CanvasRenderingContext2D) {
    g.fillStyle = colos[effectState.flipFlop];
    for (let i = 0; i < BLOCK_RAWS; i++) {
      for (let j = 0; j < BLOCK_COLS; j++) {
        if (field[i][j] === CLEAR_BLOCK) {
          g.fillRect(
            j * blockSize,
            i * blockSize,
            blockSize - 1,
            blockSize - 1
          );
        }
      }
    }
    effectState.flipFlop = 1 - effectState.flipFlop;

    if (effectState.count > EFFECT_ANIMATION) {
      mode = GAME;
      effectState.count = 0;
      effectState.flipFlop = 0;
      deleteLine();
      createBlock();
    }
    effectState.count++;
  }
};

const gameOver = () => {
  for (let i = 0; i < BLOCK_RAWS; i++) {
    for (let j = 0; j < BLOCK_COLS; j++) {
      if (field[i][j] && field[i][j] !== WALL) {
        if (g instanceof CanvasRenderingContext2D) {
          g.fillStyle = GAMEOVER_COLOR;
          g.fillRect(
            j * blockSize,
            i * blockSize,
            blockSize - 1,
            blockSize - 1
          );
        }
      }
    }
  }
};

/**
 * メインループ
 */
const mainLoop = () => {
  if (mode === GAME) {
    block_current_sx = block_current_x;
    block_current_sy = block_current_y;
    if (frame % speed == 0) {
      clearBlock();
      block_current_y++;
      if (hitCheck()) {
        block_current_y = block_current_sy;
        lockBlock();
        if (lineCheck() > 0) {
          mode = EFFECT;
        }
        createBlock();
      }
      putBlock();
    }
    draw();
  } else if (mode === GAMEOVER) {
    gameOver();
  } else if (mode === EFFECT) {
    if (frame % effectState.speed === 0) {
      gameEffect();
    }
  }
  frame++;
  if (speed < 1) speed = 1;
  timer1 = setTimeout(mainLoop, 1000 / FPS);
};

/**
 * 操作用の関数
 */
const keyDownFunc = (e: KeyboardEvent) => {
  if (mode === EFFECT) return;
  if (mode === GAME) {
    clearBlock();
    block_current_sx = block_current_x;
    block_current_sy = block_current_y;
    // 元ソースコードはkeyCodeを使用していたが、現在は非推奨となっているためkeyを使用して判定
    if (e.key === " " || e.key === "ArrowUp") {
      rotateBlock();
    } else if (e.key === "ArrowLeft") {
      block_current_x--;
    } else if (e.key === "ArrowRight") {
      block_current_x++;
    } else if (e.key === "ArrowDown") {
      block_current_y++;
    }
    if (hitCheck()) {
      block_current_x = block_current_sx;
      block_current_y = block_current_sy;
    }
    putBlock();
  } else if (mode === GAMEOVER) {
    if (e.key === "Enter") {
      newGame();
    }
  }
};

const App: React.VFC = () => {
  window.addEventListener("keydown", keyDownFunc, false);
  useEffect(() => {
    console.log("game start");
    initGame();
    newGame();
  }, []);

  return (
    <React.Fragment>
      <canvas id="canvas"></canvas>
      <Stage></Stage>
    </React.Fragment>
  );
};

export default App;
