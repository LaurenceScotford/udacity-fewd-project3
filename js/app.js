/*
  app.js - Game logic for Jump!
*/


// Enemies our player must avoid
class Enemy {
  constructor(row, eRow) {
    this.row = row;
    this.offset = 0;  // Initial drawing position for row
    this.dir = eRow.dir;
    this.speed = eRow.speed;
    this.pattern = eRow.pattern;
    this.sprite = Resources.get(ENEMY_SPRITE);
  }

  // Update the enemy's position, required method for game
  // Parameter: dt, a time delta between ticks
  update(dt) {
    // Multiplies any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    let distance = this.speed * dt;
    if (this.dir === LEFT) {
      this.offset -= distance;
      if (this.offset < 0) {
        this.offset += GRID_COLS * CELL_SIZE_X - 1;
      }
    } else {
      this.offset += distance;
      if (this.offset > GRID_COLS * CELL_SIZE_X - 1) {
        this.offset -= GRID_COLS * CELL_SIZE_X - 1;
      }
    }
  }

  // Draw a row of enemies on the screen
  render() {
    for (let enemy = 0; enemy < this.pattern.length; enemy++) {
      let enemyXPos = this.pattern[enemy] * CELL_SIZE_X + this.offset;
      let enemyYPos = this.row * CELL_SIZE_Y + BUG_Y_OFFSET;
      // Draw enemy
      this._drawEnemy(enemyXPos, enemyYPos);
      // If enemy has wrapped, draw right side of enemy at beginning of row
      enemyXPos -= GRID_COLS * CELL_SIZE_X - 1;
      if (enemyXPos + CELL_SIZE_X >= 0) {
        this._drawEnemy(enemyXPos, enemyYPos);
      }
    }
  }

  _drawEnemy(x, y) {
    ctx.save();
    ctx.translate(x + HALF_SPRITE_WIDTH, y);
    if (this.dir === LEFT) {
      ctx.scale(-1,1);
    }
    ctx.drawImage(this.sprite, -HALF_SPRITE_WIDTH, 0);
    ctx.restore();
  }

  /*
   * This function removes enemies that hace reached the end of the path
   * and randomly generates new enemies when there is room for them
   */
  static genEnemies() {
    // Remove any enemies previously created
    allEnemies = [];

    // Create the sprite patterns for the enemies
    for (let row = 0; row < NUM_ENEMY_ROWS; row++) {
      let eRow = LEVELS[level].enemies[row];
      if (eRow !== null) {
        // If there are enemies on this row, create a new Enemy row
        allEnemies.push(new Enemy(row + ENEMY_ROW_OFFSET, eRow));
      }
    }
  }
}

// The player character
class Player {
  constructor() {
    this.sprite = Resources.get(PLAYER_SPRITE);
    this.resetPlayer();
  }

  setReset(resetFunc) {
    this.resetFunc = resetFunc;
  }

  // reset player
  resetPlayer() {
    this.gridPos = {x: PLAYER_START_X, y: PLAYER_START_Y};
    this.playerPos = gridToCoords(this.gridPos, PLAYER_Y_OFFSET);
    this.targetPos = this.playerPos;
  }

  // Handle input from the player
  handleInput(allowedKeys) {
    // Adjust player position on grid based on keypress
    switch(allowedKeys) {
      case 'left':
        this.gridPos.x -= this.gridPos.x > 0;
        break;
      case 'up':
        this.gridPos.y -= this.gridPos.y > 0;
        break;
      case 'down':
        this.gridPos.y += this.gridPos.y < GRID_ROWS - 1;
        break;
      case 'right':
        this.gridPos.x += this.gridPos.x < GRID_COLS - 1;
    }

    // Calculate canvas coordinates from new position
    this.targetPos = gridToCoords(this.gridPos, PLAYER_Y_OFFSET);
  }

  /*
   * This function detects collisions between the player and enemy sprites.
   * If a collision is detected then the collided function is called in app.js
   */
   detectCollisions() {
     for(let enemy in allEnemies) {
       let theEnemy = allEnemies[enemy];
       if (theEnemy.gridPos.y === this.gridPos.y) {
         let enLft = theEnemy.bugPos.x + EN_EDGES;
         let enRgt = theEnemy.bugPos.x + Resources.get(theEnemy.sprite).width - EN_EDGES;
         let plLft = this.playerPos.x + PL_EDGES;
         let plRgt = this.playerPos.x + Resources.get(this.sprite).width - PL_EDGES;
         if ((plLft >= enLft && plLft <= enRgt) || (plRgt >= enLft && plRgt <= enRgt)) {
           player.resetFunc();
           break;
         }
       }
     }
   }

  // Update the player's position
  update() {
    // Check for a win condition
    if (this.gridPos.y === PLAYER_WIN_ROW) {
      this.resetFunc();
    } else {
      // Otherwise move the player
      this.playerPos = this.targetPos;
    }
  }

  // Draw the player sprite
  render() {
    ctx.drawImage(this.sprite, this.playerPos.x, this.playerPos.y);
  }
}

// Utility functions

// converts a grid position to canvas coordinates
function gridToCoords(gridPos, yOffset) {
  return {x: gridPos.x * CELL_SIZE_X, y: gridPos.y * CELL_SIZE_Y + yOffset}
}

// Converts an x coordinate to an x grid position
function xCoordToGrid(xPos) {
  return Math.floor(xPos / CELL_SIZE_X);
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
var allEnemies = [];

// Place the player object in a variable called player
var player;

// This listens for key presses and sends the keys to the
// Player.handleInput() method.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
