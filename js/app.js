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
        let lowestRow = key.isLocked() ? PLAYER_WIN_ROW - 1 : GRID_ROWS - 1;
        this.targetPos.y = this.gridPos.y < lowestRow ? this.gridPos.y + 1 : this.gridPos.y;
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
             lives.loseLife();
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
       let pType = pickups[pickup].tryPickup(this.gridPos.x, this.gridPos.y);
       if (pType !== null) {
         switch(pType) {
           case HEART:
            lives.gainLife();
            break;
          case GEM_BLUE:
            score.addScore(BLUE_SCORE);
            break;
          case GEM_GREEN:
            score.addScore(GREEN_SCORE);
            break;
          case GEM_ORANGE:
            score.addScore(ORANGE_SCORE);
            break;
         }
         pickups.splice(pickup, 1);
       }
     }

     // Now check if the player has picked up the key
     key.tryUnlock(this.gridPos.x, this.gridPos.y);
   }

  // Update the player's position
  update() {
    // Check for a win condition
    if (this.targetPos.y === PLAYER_WIN_ROW) {
      score.addScore(WIN_SCORE);
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

class Score {
  constructor() {
    this._score = 0;
    this._targetScore = 0;
    this._timeSinceUpdate = 0;
  }

  addScore(score) {
    this._targetScore += score;
  }

  render() {
    ctx.save();
    ctx.font = GUI_FONT;
    ctx.fillText(SCORE_TEXT + this._score, SCORE_X, SCORE_Y);
    ctx.restore();
  }

  update(dt) {
    this._timeSinceUpdate += dt;
    if (this._timeSinceUpdate >= SCORE_DELAY) {
      this._score += (this._score < this._targetScore);
      this._timeSinceUpdate = 0;
    }
  }
}

class Lives {
  constructor() {
    this._lives = START_LIVES;
  }

  gainLife() {
    this._lives++;
  }

  loseLife() {
    if (this._lives > 0) {
      this._lives--;
    }

    return this._lives === 0;
  }

  render() {
    ctx.save();
    ctx.font = GUI_FONT;
    ctx.fillText(LIVES_TEXT + this._lives, LIVES_X, LIVES_Y);
    ctx.restore();
  }
}

class Key {
  constructor() {
    this._locked = false;

    let keyInfo = LEVELS[level].key;

    if (keyInfo !== null) {
        this._locked = true;
        this._x = keyInfo.x;
        this._y = keyInfo.y;
    }
  }

  isLocked() {
    return this._locked;
  }

  tryUnlock(x, y) {
    if (this._x === x && this._y === y) {
      this._locked = false;
    }
  }

  render() {
    if (this._locked) {
      // If the level is currently locked, draw the key...
      ctx.drawImage(Resources.get(KEY), this._x * CELL_SIZE_X, this._y * CELL_SIZE_Y);
    }
  }
}

class Pickup {
  constructor(type, x, y) {
    this._type = type;
    this._x = x;
    this._y = y;
  }

  tryPickup(x, y) {
    return this._x === x && this._y === y ? this._type : null;
  }

  render() {
    ctx.drawImage(Resources.get(this._type), this._x * CELL_SIZE_X, this._y * CELL_SIZE_Y);
  }

  static genPickups() {
    pickups = [];

    let puInfo = LEVELS[level].pickups;

    for(let pickup = 0; pickup < puInfo.length; pickup++) {
      pickups.push(new Pickup(puInfo[pickup].type, puInfo[pickup].x, puInfo[pickup].y));
    }
  }
}

// Utility functions

// converts a grid position to canvas coordinates
function gridToCoords(gridPos) {
  return {x: gridPos.x * CELL_SIZE_X, y: gridPos.y * CELL_SIZE_Y}
}

// Checks for collision between two bounding boxes
function boundingBoxCollision(box1X, box1Y, box1Width, box1Height, box2X, box2Y, box2Width, box2Height) {
  return (Math.abs(box1X - box2X) * 2 < (box1Width + box2Width)) &&
         (Math.abs(box1Y - box2Y) * 2 < (box1Height + box2Height));
}
