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
      let enemyYPos = this.row * CELL_SIZE_Y;
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

  hasEnemyAt(x, y, width, height) {
    for(let enemy = 0; enemy < this.pattern.length; enemy++) {
      let enemyXPos = this.pattern[enemy] * CELL_SIZE_X + this.offset + HALF_SPRITE_WIDTH;
      let enemyYPos = this.row * CELL_SIZE_Y + ENEMY_Y_OFFSET + ENEMY_HEIGHT / 2;
      if (boundingBoxCollision(x, y, width, height, enemyXPos, enemyYPos, ENEMY_WIDTH, ENEMY_HEIGHT)) {
        return true;
      }
      enemyXPos -= GRID_COLS * CELL_SIZE_X - 1;
      if (boundingBoxCollision(x, y, width, height, enemyXPos, enemyYPos, ENEMY_WIDTH, ENEMY_HEIGHT)) {
        return true;
      }
    }
    return false; // No enemies where found within the tested area
  }

  /*
   * This class factory function generates new enemy rows at the start of a level
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
    this.playerPos = gridToCoords(this.gridPos);
    this.targetPos = {...this.gridPos};
  }

  // Handle input from the player
  handleInput(allowedKeys) {
    // Adjust player position on grid based on keypress
    switch(allowedKeys) {
      case 'left':
        this.targetPos.x = this.gridPos.x > 0 ? this.gridPos.x - 1 : this.gridPos.x;
        break;
      case 'up':
        this.targetPos.y = this.gridPos.y > 0 ? this.gridPos.y - 1 : this.gridPos.y;
        break;
      case 'down':
        this.targetPos.y = this.gridPos.y < GRID_ROWS - 1 ? this.gridPos.y + 1 : this.gridPos.y;
        break;
      case 'right':
        this.targetPos.x = this.targetPos.x < GRID_COLS - 1 ? this.gridPos.x + 1 : this.gridPos.x;
    }
  }

  /*
   * This method detects collisions between the player and enemy sprites.
   * If a collision is detected then the collided function is called in app.js
   */
   detectCollisions() {
     for (let enemy in allEnemies) {
       let theEnemy = allEnemies[enemy];
       if (theEnemy.hasEnemyAt(this.playerPos.x + HALF_SPRITE_WIDTH, this.playerPos.y + PLAYER_Y_OFFSET + PLAYER_HEIGHT / 2,
           PLAYER_WIDTH, PLAYER_HEIGHT)) {
             lives--;
             player.resetFunc();
             break;
        }
      }
   }

   /*
    * This method detects collisions between the player and a pickup.
    * If a collision is detected then action is taken appropriate to the pick-up type
    * and the pickup is destroyed
    */
   detectPickups() {
     for (let pickup in pickups) {
       if (pickups[pickup].x === this.gridPos.x && pickups[pickup].y === this.gridPos.y) {
         switch(pickups[pickup].type) {
           case HEART:
            lives++;
            break;
          case GEM_BLUE:
            score += 5;
            break;
          case GEM_GREEN:
            score += 10;
            break;
          case GEM_ORANGE:
            score += 20;
            break;
         }
         pickups.splice(pickup, 1);
       }
     }
   }

  // Update the player's position
  update() {
    // Check for a win condition
    if (this.targetPos.y === PLAYER_WIN_ROW) {
      score += WIN_SCORE;
      this.resetFunc();
    } else {
      // Check the player is not trying to move into a space occupied by a rock
      let rocks = LEVELS[level].rocks;
      for (let rock = 0; rock < rocks.length; rock++) {
        if (this.targetPos.x === rocks[rock].x && this.targetPos.y === rocks[rock].y) {
          // Keep player stationery if tyring to move into space with a rock
          this.targetPos = {...this.gridPos};
          break;
        }
      }

      // Move the player
      this.gridPos = {...this.targetPos};
      this.playerPos = gridToCoords(this.gridPos);
    }
  }

  // Draw the player sprite
  render() {
    ctx.drawImage(this.sprite, this.playerPos.x, this.playerPos.y);
  }
}

// Utility functions

// converts a grid position to canvas coordinates
function gridToCoords(gridPos) {
  return {x: gridPos.x * CELL_SIZE_X, y: gridPos.y * CELL_SIZE_Y}
}

// Converts an x coordinate to an x grid position
function xCoordToGrid(xPos) {
  return Math.floor(xPos / CELL_SIZE_X);
}

// Checks for collision between two bounding boxes
function boundingBoxCollision(box1X, box1Y, box1Width, box1Height, box2X, box2Y, box2Width, box2Height) {
  return (Math.abs(box1X - box2X) * 2 < (box1Width + box2Width)) &&
         (Math.abs(box1Y - box2Y) * 2 < (box1Height + box2Height));
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
