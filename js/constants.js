// Constant values used in game
const CANVAS_WIDTH = 505;
const CANVAS_HEIGHT = 606;
const GRID_ROWS = 6;
const GRID_COLS = 5;
const ENEMY_SPRITE = 'images/enemy-bug.png';
const PLAYER_START_X = 2;
const PLAYER_START_Y = 0;
const PLAYER_WIN_ROW = 5;
const PLAYER_SPRITE = 'images/char-boy.png';
const CELL_SIZE_X = 101;
const CELL_SIZE_Y = 83;
const PLAYER_Y_OFFSET = -12;
const BUG_Y_OFFSET = -18;
const BUG_SPEEDS = [25, 200, 250];
const PL_EDGES = 18;
const EN_EDGES = 3;
const GRID_SIZE = {x: 5, y: 6};
const ENEMY_PROBS = [0, 0, 0];
const NUM_ENEMY_ROWS = 4;
const ENEMY_ROW_OFFSET = 1;
const HALF_SPRITE_WIDTH = 50;
const BLOCK_GRASS = 'images/grass-block.png';
const BLOCK_STONE = 'images/stone-block.png';
const BLOCK_WATER = 'images/water-block.png';
const RIGHT = 0;
const LEFT = 1;
const ONE_SECOND = 1000.0;
const LEVELS = [
  {rows: [BLOCK_GRASS, BLOCK_GRASS, BLOCK_STONE, BLOCK_STONE, BLOCK_STONE, BLOCK_WATER],
   enemies: [
     null,
     {dir: RIGHT, speed: 100, pattern:[0]},
     {dir: LEFT, speed: 150, pattern:[0,1,2,3,4,5]},
     {dir: RIGHT, speed: 200, pattern:[4]},
   ]
  }
];
