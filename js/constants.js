// Constant values used in game
const DEBUG = true;     // If true enables skipping of levels by hitting return key

// Sizes of canvas, game grid and individual cells on grid, etc
const CANVAS_WIDTH = 505;
const CANVAS_HEIGHT = 606;
const GRID_ROWS = 6;
const GRID_COLS = 5;
const CELL_SIZE_X = 101;
const CELL_SIZE_Y = 83;
const HALF_SPRITE_WIDTH = 50;
const RIGHT = 0;
const LEFT = 1;
const ONE_SECOND = 1000.0;  // Used for converting times in seconds to milliseconds
const GUI_FONT = "40px Arial";
const ALPHA_FULL = 1.0; // Maximum opacity

// Background images used to create game board
const BLOCK_GRASS = 'images/grass-block.png';
const BLOCK_STONE = 'images/stone-block.png';
const BLOCK_WATER = 'images/water-block.png';
const BLOCK_FLAG = 'images/flag-block.png';
const BLOCK_LOCKED = 'images/flag-block-locked.png';

// Player
const PLAYER_START_X = 2; // Grid position
const PLAYER_START_Y = 0;
const PLAYER_WIN_ROW = 5; // The row the player must reach to win the game
const PLAYER_SPRITE = 'images/char-boy.png';
const PLAYER_Y_OFFSET = 47; // Pixel offset from top of player sprite to start of visible data
const PLAYER_Y_CENTRE = 91; // Used for rotation (y centre of visible data)
const PLAYER_HEIGHT = 76;   // Height of visible data
const PLAYER_X_OFFSET = 17; // Pixel offset from left edge of sprite to start of visible data
const PLAYER_WIDTH = 67;  // Width of visible data
const PL_STATE_ANIM = 0;  // Player sprite is currently in animation (no controllable)
const PL_STATE_PLAY = 1;  // Player sprite can be controlled

/*
Player animation descriptor notes
Each player animation has a series of movements, each represented by an object with the
following elements:
rotation - Indicates the starting orientation and spin:
           angle - position in degrees (0 = normal orientation)
           spinRate - the number of degrees to spin every second. Set to zero for no spin,
           a postive value for clockwise spin and a negative value for anticlockwise spin.
start - the starting position (canvas coordinates) for the sprite. Note that setting a value
        to null causes the animation player to use the current position for that value. It's
        an object with:
        x - x position
        y - y position
end - as above but where the movement should finish
speed - the speed of the sprite's movement in pixels per second
*/
const PL_START_ANIM = [
  {rotation: {angle: 0, spinRate: 0}, start: {x: null, y: -119}, end: {x: null, y: 0}, speed: 400},
  {rotation: {angle: 0, spinRate: 0}, start: {x: null, y: null}, end: {x: null, y: -30}, speed: 400},
  {rotation: {angle: 0, spinRate: 0}, start: {x: null, y: null}, end: {x: null, y: 0}, speed: 400},
  {rotation: {angle: 0, spinRate: 0}, start: {x: null, y: null}, end: {x: null, y: -10}, speed: 400},
  {rotation: {angle: 0, spinRate: 0}, start: {x: null, y: null}, end: {x: null, y: 0}, speed: 400}
];
const PL_DEATH_ANIM = [
  {rotation: {angle: 0, spinRate: 720}, start: {x: null, y: null}, end: {x: null, y: -119}, speed: 500}
];
const PL_END_ANIM = [
  {rotation: {angle: -5, spinRate: 0}, start: {x: null, y: null}, end: {x: null, y: 374}, speed: 200},
  {rotation: {angle: -5, spinRate: 0}, start: {x: null, y: PLAYER_WIN_ROW * CELL_SIZE_Y}, end: {x: null, y: 415}, speed: 200},
  {rotation: {angle: 5, spinRate: 0}, start: {x: null, y: null}, end: {x: null, y: 374}, speed: 200},
  {rotation: {angle: 5, spinRate: 0}, start: {x: null, y: null}, end: {x: null, y: 415}, speed: 200},
  {rotation: {angle: -5, spinRate: 0}, start: {x: null, y: null}, end: {x: null, y: 374}, speed: 200},
  {rotation: {angle: -5, spinRate: 0}, start: {x: null, y: null}, end: {x: null, y: 415}, speed: 200},
  {rotation: {angle: 5, spinRate: 0}, start: {x: null, y: null}, end: {x: null, y: 374}, speed: 200},
  {rotation: {angle: 5, spinRate: 0}, start: {x: null, y: null}, end: {x: null, y: 415}, speed: 200},
];


// Enemy
const ENEMY_SPRITE = 'images/enemy-bug.png';
const LILYPAD_SPRITE = 'images/lilypad.png';
const ENEMY_Y_OFFSET = 53;  // Pixel offset from top edge of sprite to start of visible data
const ENEMY_HEIGHT = 66;  // Height of visible data
const ENEMY_X_OFFSET = 2; // Pixel offset from left edge of sprite to start of visible data
const ENEMY_WIDTH = 97; // Width of visible data
const ENEMY_ROW_OFFSET = 1; // First row that can be occupied by enemies

// Key
const KEY = 'images/Key.png';

// Pickups
const HEART = 'images/Heart.png';
const GEM_BLUE = 'images/Gem Blue.png';
const GEM_GREEN = 'images/Gem Green.png';
const GEM_ORANGE = 'images/Gem Orange.png';
const BLUE_SCORE = 5;
const GREEN_SCORE = 10;
const ORANGE_SCORE = 20;

// Rocks
const ROCK = 'images/Rock.png';

// Star
const STAR = 'images/Star.png';
const STAR_SCORE = 200;
const STAR_BASE_TIME = 20;
const STAR_TIME_DEDUCT = 1;
const STAR_FADE_TIME = 5;

// Score
const WIN_SCORE = 50;
const SCORE_TEXT = 'Score ';
const SCORE_X = 0;
const SCORE_Y = 35;
const SCORE_DELAY = 0.05;
const POINTS_TEXT_FILL = 'rgba(0, 255, 0, ';
const POINTS_TEXT_STROKE = 'rgba(0, 0, 0, ';
const POINTS_TEXT_LINE_WIDTH = 2;
const POINTS_FONT = '80px Impact';
const POINTS_DISPLAY_TIME = 1;
const POINTS_SPEED = 10;

// Lives
const LIVES_TEXT = 'Lives ';
const LIVES_X = 380;
const LIVES_Y = 35;
const START_LIVES = 5;

// Status text
const STATUS_FONT = '120px Impact';
const STATUS_TEXT_X = 252;
const STATUS_TEXT_Y = 303;
const STATUS_TEXT_FILL = 'rgba(255, 0, 0, ';
const STATUS_TEXT_STROKE = 'rgba(0, 0, 0, ';
const STATUS_TEXT_LINE_WIDTH = 4;
const LEVEL_TEXT_TIME = 0.5;
const LEVEL_TEXT = 'LEVEL ';
const TEXT_FADE_DELAY = 0.005;
const TEXT_ALPHA_FADE_AMOUNT = 0.01;

/*
Levvel editing notes:
All grid coordinates are zero based from top left
rows = The block type to use for each row from top to bottom. The bottom row should usually be
       BLOCK_FLAG, especially if it's a locked level. The top row should never be water or the
       player will die instantly)
enemies - holds the enemy pattens for the four enemy rows (2nd row (1) to 5th row (4). Note
          that the lily pad type is not strictly an enemy but uses the enemy mechanic, so
          should be included here. If you don't want enemies on a particular row, set it to
          null. Each occupied row is an object with fhe following:
          type - enemy type, either LILYPAD_SPRITE or ENEMY_SPRITE. BUgs should be matched to
                 a grass or stone block and lilypads to a water block.
          dir - the direction of movement for that row, either LEFT or RIGHT
          speed - How fast the enemies on that row move in pixels per second.
          pattern: a list of number representing column positions. An enemy will start at each
          of the specified columns.
rocks - an array of rocks to place. Note thers is nothing to stop you putting rocks in a row
        with bug enemies, but they will look odd as they will float over the tops of the bugs.
        If you don't want any rocks, set it to an empty array.
        Each is an object with:
        x - column on the grid
        y - row on the grid.
pickups - a list of pickups to include on this level. If you don't want any pickups set it to
          an empty array. Note there is nothing to stop you placing pickups in a row with bug
          enemies but they will look odd as they will float over the top of the bugs. Each
          is an object with:
          type - HEART = extra life, GEM_BLUE = 5 bonus points, GEM_GREEN = 10 bonus points
                 GEM_ORANGE = 20 bonus points
          x - column on the grid
          y - row on the grid
key - The location of the key, if you want the level to a be a locked level, if not, set it to
      null. Note there is nothing to stop you from putting the key in a row with bug enemies,
      but it will look odd as it will float over the tops of the bugs.
      It's an object with:
      x - column on the grid
      y - row on the grid
Note - generally speaking you should avoid putting anything at x: 2, y: 0 as this is the
player's starting point, although you could give them a pickup there if you wanted to give
them an instant bonus.
*/
const LEVELS = [
  // Level 1
  {rows: [BLOCK_GRASS, BLOCK_GRASS, BLOCK_STONE, BLOCK_GRASS, BLOCK_STONE, BLOCK_FLAG],
   enemies: [
     null,
     {type: ENEMY_SPRITE, dir: RIGHT, speed: 100, pattern:[0]},
     null,
     {type: ENEMY_SPRITE, dir: LEFT, speed: 150, pattern:[2]},
   ],
   rocks: [],
   pickups: [{type: GEM_BLUE, x:2, y:3}],
   key: null
  },
  // Levwl 2
  {rows: [BLOCK_GRASS, BLOCK_STONE, BLOCK_GRASS, BLOCK_WATER, BLOCK_STONE, BLOCK_FLAG],
   enemies: [
     {type: ENEMY_SPRITE, dir: RIGHT, speed: 100, pattern:[0, 3]},
     null,
     {type: LILYPAD_SPRITE, dir: RIGHT, speed: 50, pattern:[2, 3]},
     {type: ENEMY_SPRITE, dir: LEFT, speed: 150, pattern:[2]},
  ],
  rocks: [],
  pickups: [],
  key: null
  },
  // Level 3
  {rows: [BLOCK_GRASS, BLOCK_STONE, BLOCK_STONE, BLOCK_GRASS, BLOCK_STONE, BLOCK_FLAG],
   enemies: [
     {type: ENEMY_SPRITE, dir: LEFT, speed: 150, pattern:[3]},
     {type: ENEMY_SPRITE, dir: RIGHT, speed: 100, pattern:[2, 5]},
     null,
     {type: ENEMY_SPRITE, dir: LEFT, speed: 150, pattern:[2]},
   ],
   rocks: [{x: 1, y:3}, {x:3, y:3}],
   pickups: [{type: GEM_GREEN, x:2, y:3}],
   key: null
   },
   // Level 4
   {rows: [BLOCK_GRASS, BLOCK_STONE, BLOCK_GRASS, BLOCK_WATER, BLOCK_GRASS, BLOCK_FLAG],
    enemies: [
      {type: ENEMY_SPRITE, dir: RIGHT, speed: 150, pattern:[3]},
      null,
      {type: LILYPAD_SPRITE, dir: LEFT, speed: 100, pattern:[2, 5]},
      null
    ],
    rocks: [{x:1, y:4}, {x:2, y:4}],
    pickups: [],
    key: null
    },
    // Level 5
    {rows: [BLOCK_GRASS, BLOCK_STONE, BLOCK_STONE, BLOCK_GRASS, BLOCK_STONE, BLOCK_FLAG],
     enemies: [
      {type: ENEMY_SPRITE, dir: LEFT, speed: 100, pattern:[3, 4]},
      {type: ENEMY_SPRITE, dir: LEFT, speed: 200, pattern:[2]},
      null,
      {type: ENEMY_SPRITE, dir: RIGHT, speed: 150, pattern:[0, 3]},
     ],
     rocks: [],
     pickups: [],
     key: {x: 3, y:3}
     },
   // Level 6
   {rows: [BLOCK_GRASS, BLOCK_STONE, BLOCK_GRASS, BLOCK_WATER, BLOCK_WATER, BLOCK_FLAG],
    enemies: [
      {type: ENEMY_SPRITE, dir: RIGHT, speed: 250, pattern:[0]},
      null,
      {type: LILYPAD_SPRITE, dir: LEFT, speed: 100, pattern:[2, 4]},
      {type: LILYPAD_SPRITE, dir: RIGHT, speed: 250, pattern:[4]}
    ],
    rocks: [{x: 3, y: 2}],
    pickups: [{type: HEART, x: 4, y: 2}],
    key: null
    },
    // Level 7
    {rows: [BLOCK_GRASS, BLOCK_STONE, BLOCK_GRASS, BLOCK_GRASS, BLOCK_STONE, BLOCK_FLAG],
     enemies: [
       {type: ENEMY_SPRITE, dir: RIGHT, speed: 200, pattern:[1, 3]},
       null,
       null,
       {type: ENEMY_SPRITE, dir: LEFT, speed: 250, pattern:[4]}
     ],
     rocks: [{x: 0, y: 2}, {x: 0, y: 3}, {x: 1, y: 3}, {x: 2, y:3}, {x:2, y:2}],
     pickups: [{type: GEM_ORANGE, x: 4, y: 3}],
     key: {x: 1, y: 2}
     },
     // Level 8
    {rows: [BLOCK_GRASS, BLOCK_STONE, BLOCK_WATER, BLOCK_STONE, BLOCK_WATER, BLOCK_FLAG],
     enemies: [
        {type: ENEMY_SPRITE, dir: LEFT, speed: 100, pattern:[1, 3]},
        {type: LILYPAD_SPRITE, dir: RIGHT, speed: 50, pattern:[4]},
        {type: ENEMY_SPRITE, dir: RIGHT, speed: 300, pattern:[4]},
        {type: LILYPAD_SPRITE, dir: LEFT, speed: 50, pattern:[2]}
     ],
     rocks: [],
     pickups: [],
     key: null
    },
    // Level 9
    {rows: [BLOCK_GRASS, BLOCK_STONE, BLOCK_GRASS, BLOCK_STONE, BLOCK_GRASS, BLOCK_FLAG],
     enemies: [
       {type: ENEMY_SPRITE, dir: RIGHT, speed: 100, pattern:[1, 3]},
       null,
       {type: ENEMY_SPRITE, dir: LEFT, speed: 300, pattern:[4]},
       null
     ],
     rocks: [{x: 2, y: 2}, {x: 3, y: 2}, {x: 2, y: 4}, {x: 3, y: 4}, {x: 4, y: 4}],
     pickups: [{type: HEART, x: 4, y:2}],
     key: null
    },
    // Level 10
    {rows: [BLOCK_GRASS, BLOCK_WATER, BLOCK_STONE, BLOCK_GRASS, BLOCK_STONE, BLOCK_FLAG],
    enemies: [
      {type: LILYPAD_SPRITE, dir: LEFT, speed: 100, pattern:[4]},
      {type: ENEMY_SPRITE, dir: RIGHT, speed: 300, pattern:[0]},
      null,
      {type: ENEMY_SPRITE, dir: LEFT, speed: 200, pattern:[1, 3]},
    ],
    rocks: [{x: 3, y: 0}, {x: 1, y: 3}, {x: 3, y: 3}],
    pickups: [{type: GEM_BLUE, x: 0, y:3}, {type: GEM_GREEN, x:2, y:3}, {type: GEM_ORANGE, x: 4, y:3}],
    key: {x: 4, y: 0}
  }
];
