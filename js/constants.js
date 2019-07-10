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
const PLAYER_Y_OFFSET = 47;
const PLAYER_HEIGHT = 76;
const PLAYER_X_OFFSET = 17;
const PLAYER_WIDTH = 67;
const ENEMY_Y_OFFSET = 53;
const ENEMY_HEIGHT = 66;
const ENEMY_X_OFFSET = 2;
const ENEMY_WIDTH = 97;
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
const BLOCK_FLAG = 'images/flag-block.png';
const BLOCK_LOCKED = 'images/flag-block-locked.png';
const ROCK = 'images/Rock.png';
const HEART = 'images/Heart.png';
const KEY = 'images/Key.png';
const GEM_BLUE = 'images/Gem Blue.png';
const GEM_GREEN = 'images/Gem Green.png';
const GEM_ORANGE = 'images/Gem Orange.png';
const RIGHT = 0;
const LEFT = 1;
const ONE_SECOND = 1000.0;
const BLUE_SCORE = 5;
const GREEN_SCORE = 10;
const ORANGE_SCORE = 20;
const WIN_SCORE = 50;
const FONT = "40px Arial";
const SCORE_TEXT = "Score ";
const SCORE_X = 0;
const SCORE_Y = 35;
const SCORE_DELAY = 0.05;
const LIVES_TEXT = "Lives ";
const LIVES_X = 380;
const LIVES_Y = 35;
const LEVELS = [
  {rows: [BLOCK_GRASS, BLOCK_GRASS, BLOCK_STONE, BLOCK_GRASS, BLOCK_STONE, BLOCK_FLAG],
   enemies: [
     null,
     {dir: RIGHT, speed: 100, pattern:[0]},
     null,
     {dir: LEFT, speed: 150, pattern:[2]},
//     {dir: RIGHT, speed: 200, pattern:[4]},
   ],
   rocks: [{x:1, y:1}],
   pickups: [{type: HEART, x: 3, y:3}, {type: GEM_BLUE, x:0, y:3}, {type: GEM_GREEN, x:1, y:3},
   {type: GEM_ORANGE, x:2, y:3}],
   key: {x: 4, y: 3}
  }
];
