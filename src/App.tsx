import { type } from 'os';
import React, { useEffect } from 'react';
import Stage from './components/Stage';
 
type game = 1
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

const BACK_COLOR = "#ddd";              // 背景色
const GAMEOVER_COLOR = "palevioletred"; // ゲームオーバー時のブロックの色
const BLOCK_COLOR = "steelblue";            // 操作ブロックの色
const LOCK_COLOR = "lightslategray";        // ロックしたブロックの色
const WALL_COLOR = "#666";              // 壁の色
const ERROR_COLOR = "tomato";           // エラーブロックの色
const EFFECT_COLOR1 = "whitesmoke";     // エフェクト時の色1
const EFFECT_COLOR2 = "#000";      

const SCREEN_WIDTH = BLOCK_SIZE * BLOCK_COLS;
const SCREEN_HEIGTH = BLOCK_SIZE * BLOCK_RAWS;
const block =	 [ 
  [ [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0]],
  
  [	[0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0]],

  [	[0, 0, 1, 0],
    [0, 1, 1, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 0]],

  [	[0, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 0]],

  [	[0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0]],

  [	[0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 0]],

  [	[0, 0, 0, 0],
    [0, 1, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0]]
  ];
const stage = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],	// ←表示しない
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
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];	// ←表示しない

let g: CanvasRenderingContext2D | null;
let mode: game | gameOver | gameEffect;
let effectState = {flipFlop: 0, speed: 0, count: 0};
let blockSize: number;
let field: number[][] = new Array();
let frame: number;
let speed: number;
let oBlock: number[][];
let block_current_x: number, block_current_y: number;
let block_current_sx, block_current_sy;
let blockType;
let timer1;
let FPS: number;

const initGame = () => {
  FPS = 30;
  let clearLine = 0;
  let canvasDom = document.getElementById("canvas")!;
  if (canvasDom instanceof HTMLCanvasElement) {
    canvasDom.width = SCREEN_WIDTH;
    canvasDom.height = SCREEN_HEIGTH;
    g = canvasDom.getContext("2d");
    // TODO:エフェクトせってい
    effectState.flipFlop = 0;
    effectState.speed = 4;
    effectState.count = 0;
    blockSize = BLOCK_SIZE;
    
  } else {
    throw new Error("#canvas is not an HTMLCanvasElement");
  }
}

const newGame = () => {
  setStage();
  mode = GAME;
  frame = 1;
  speed = 30;
  // clearTimeout
  createBlock();
  mainLoop();
}

const setStage = () => {
  for (let i = 0; i < BLOCK_RAWS; i++) {
    field[i] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
  oBlock = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];
  for (let i = 0; i < BLOCK_RAWS; i++) {
    for (let j = 0; j < BLOCK_COLS; j++) {
      field[i][j] = stage[i][j];
    }
  }
}

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

  //
  // if (hitCheck()) {
  //   mode = GAMEOVER;
  //   console.log("GAMEOVER!");
  // }
  putBlock();
}

const clearBlock = () => {
  if (mode === EFFECT) return;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++ ) {
      if (oBlock[i][j]) field[i + block_current_y][j + block_current_x] = NON_BLOCK;
    }
  }
}

const putBlock = () => {
  if (mode === EFFECT) return;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (oBlock[i][j]) field[i + block_current_y][j + block_current_x] = oBlock[i][j];
    }
  }
}


const clearWindow = () => {
  if (g instanceof CanvasRenderingContext2D) {
    g.fillStyle = BACK_COLOR;
    g.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGTH);
  }

}

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
      if (g instanceof CanvasRenderingContext2D) g.fillRect(j * blockSize, i * blockSize, blockSize - 1, blockSize - 1);
    }
  }
}

const mainLoop = () => {
  if (mode === GAME) {
    block_current_sx = block_current_x;
    block_current_sy = block_current_y;
    if (frame % speed == 0) {
      clearBlock();
      block_current_y++;
      // if (hitCheck()) {
      //   block_current_y = block_current_sy;
      //   // loclBlock();
      //   // if (lineCheck() > 0) {
      //     // mode = EFFECT;
      //   // }
      //   createBlock();
      // }
      putBlock();
    }
    draw();
    timer1 = setTimeout(mainLoop, 1000/FPS);
  }
}

const App: React.VFC = () => {
  useEffect(() => {
    initGame();
    newGame();
  }, [])

  return (
    <React.Fragment>
      <canvas id="canvas"></canvas>
      <Stage></Stage>
    </React.Fragment>
  );
}

export default App;
