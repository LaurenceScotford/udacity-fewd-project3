/*
  app.js - Game logic for Jump!
*/
var gameModel = {
  level: 0,         // Current level
  locked: false,    // Indicates if current level is locked
  allEnemies: [],   // References enemy rows for current level
  player: null,     // References player object
  star: null,       // References star object
  score: null,      // References score object
  lives: null,      // References lives object
  statusText: null, // References statusText object
  grid: [],         // References all static entities
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
    this._playerState = PL_STATE_ANIM;
    this._playerAnim = PL_START_ANIM;
    this._animPtr = null;
    this._animTimer = 0;
    this.gridPos = {x: PLAYER_START_X, y: PLAYER_START_Y};
    this.targetPos = {...this.gridPos};
    this.playerPos = gridToCoords(this.gridPos);
    this._playerAngle = 0;
    this._rotation = 0;
    this._speed = 0;
    this._travelling = false;
  }

  // Handle input from the player
  handleInput(allowedKeys) {
    if (this._playerState === PL_STATE_PLAY) {
      // Adjust player position on grid based on keypress
      switch(allowedKeys) {
        case 'left':
          this.targetPos.x = this.gridPos.x > 0 ? this.gridPos.x - 1 : this.gridPos.x;
          this._travelling = false;
          break;
        case 'up':
          this.targetPos.y = this.gridPos.y > 0 ? this.gridPos.y - 1 : this.gridPos.y;
          this._travelling = false;
          break;
        case 'down':
          let lowestRow = key.isLocked() ? PLAYER_WIN_ROW - 1 : GRID_ROWS - 1;
          this.targetPos.y = this.gridPos.y < lowestRow ? this.gridPos.y + 1 : this.gridPos.y;
          this._travelling = false;
          break;
        case 'right':
          this.targetPos.x = this.targetPos.x < GRID_COLS - 1 ? this.gridPos.x + 1 : this.gridPos.x;
          this._travelling = false;
      }
    }
  }

  /*
   * This method detects collisions between the player and enemy sprites.
   * If a collision is detected then the collided function is called in app.js
   */
   detectCollisions() {
    if (this._playerState === PL_STATE_PLAY) {
       this._travelling = false;
       for (let enemy in gameModel.allEnemies) {
         let theEnemy = gameModel.allEnemies[enemy];
         if (theEnemy && theEnemy.hasEnemyAt(this.playerPos.x + HALF_SPRITE_WIDTH, this.playerPos.y + PLAYER_Y_OFFSET + PLAYER_HEIGHT / 2,
             PLAYER_WIDTH, PLAYER_HEIGHT)) {
           if (theEnemy.getType() === LILYPAD_SPRITE) {
             this._travelling = true;
           } else {
             gameModel.lives.loseLife();
             this._playerState = PL_STATE_ANIM;
             this._playerAnim = PL_DEATH_ANIM;
             break;
           }
         }
       }
     }
     if (this._playerState === PL_STATE_PLAY && LEVELS[gameModel.level].rows[this.targetPos.y] === BLOCK_WATER && !this._travelling) {
         // Player has drowned
         gameModel.lives.loseLife();
         this._playerState = PL_STATE_ANIM;
         this._playerAnim = PL_DEATH_ANIM;
     }
   }

   /*
    * This method detects collisions between the player and a pickup.
    * If a collision is detected then action is taken appropriate to the pick-up type
    * and the pickup is destroyed
    */
   detectPickups() {
     if (this._playerState === PL_STATE_PLAY) {
       let gridContent = gameModel.grid[this.gridPos.y][this.gridPos.x];
       if (gridContent instanceof Pickup) {
         switch(gridContent.getType()) {
           case HEART:
            gameModel.lives.gainLife();
            break;
          case GEM_BLUE:
            gameModel.score.addScore(BLUE_SCORE);
            break;
          case GEM_GREEN:
            gameModel.score.addScore(GREEN_SCORE);
            break;
          case GEM_ORANGE:
            gameModel.score.addScore(ORANGE_SCORE);
            break;
         }
         gameModel.grid[this.gridPos.y][this.gridPos.x] = null;
       }

       // Now check if the player has picked up the key
       key.tryUnlock(this.gridPos.x, this.gridPos.y);
     }
   }

  // Update the player's position
  update(dt) {
    if (this._playerState === PL_STATE_PLAY) {
      // Check for a win condition
      if (this.targetPos.y === PLAYER_WIN_ROW) {
        gameModel.score.addScore(gameModel.star.claimAt(this.gridPos.x) ? STAR_SCORE : WIN_SCORE);
        this._playerState = PL_STATE_ANIM;
        this._playerAnim = PL_END_ANIM;
      } else if (gameModel.grid[this.targetPos.y][this.targetPos.x] instanceof Rock) {
        // Player is trying to move into a space occupied by a rock
        this.targetPos = {...this.gridPos};
      }
      // Move the player
      if (this._travelling) {
        let lilypad = LEVELS[gameModel.level].enemies[this.gridPos.y - 1];
        let movement = lilypad.speed * dt;
        movement = lilypad.dir === LEFT ? -movement : movement;
        this.playerPos.x += movement;
        if (this.playerPos.x < 0) {
          this.playerPos.x = 0;
        } else if (this.playerPos.x > (GRID_COLS - 1) * CELL_SIZE_X) {
          this.playerPos.x = (GRID_COLS - 1) * CELL_SIZE_X;
        }
        this.gridPos.x = xGridFromCoord(this.playerPos.x);
        this.targetPos.x = this.gridPos.x;
      } else {
        this.gridPos = {...this.targetPos};
        this.playerPos = gridToCoords(this.gridPos);
      }
    } else {
      // If we got here, were in an animation state, so run the animation
      // are we at the start of an animation?
      if (this._animPtr === null) {
        this._animPtr = 0;
        this._startAnimStep();
      }
      let maxMovement = this._speed * dt;
      let end = this._playerAnim[this._animPtr].end;
      this.playerPos.x = this._moveSprite(end.x, this.playerPos.x, maxMovement);
      this.playerPos.y = this._moveSprite(end.y, this.playerPos.y, maxMovement);
      this._playerAngle += this._rotation * dt;
      if ((end.x === null || this.playerPos.x === end.x) && (end.y === null || this.playerPos.y === end.y)) {
        if (++this._animPtr === this._playerAnim.length) {
          // We've reached the end of the animation, so take an appropriate action
          this._animPtr = null;
          switch(this._playerAnim) {
            case PL_START_ANIM:
              this._playerState = PL_STATE_PLAY; // Resume normal play state
              break;
            case PL_DEATH_ANIM:
              if (gameModel.lives.hasLives()) {
                  this.resetPlayer();  // Reset player only
              }
              else {
                this.resetFunc(false);
              }
              break;
            case PL_END_ANIM:
              this.resetFunc(false); // Restart with level up TODO: Change to true once levels created
              break;
          }
        } else {
          this._startAnimStep();
        }
      }
    }
  }

  _startAnimStep() {
    let nextStep = this._playerAnim[this._animPtr];
    this._rotation = nextStep.rotation.spinRate;
    this._playerAngle = nextStep.rotation.angle;
    this._speed = nextStep.speed;
    let start = nextStep.start;
    this.playerPos.x = start.x ? start.x : this.playerPos.x;
    this.playerPos.y = start.y ? start.y : this.playerPos.y;
  }

  _moveSprite(target, currentPos, maxDistance) {
    let finalPos = currentPos;
    if (target !== null) {
      let remainingDist = target - currentPos;
      maxDistance *= Math.sign(remainingDist);
      finalPos = currentPos + (Math.abs(remainingDist) > Math.abs(maxDistance) ? maxDistance : remainingDist);
    }
    return finalPos;
  }

  // Draw the player sprite
  render() {
    ctx.save();
    ctx.translate(this.playerPos.x + HALF_SPRITE_WIDTH, this.playerPos.y + PLAYER_Y_CENTRE);
    ctx.rotate(this._playerAngle * Math.PI / 180);
    ctx.drawImage(this.sprite, -HALF_SPRITE_WIDTH, -PLAYER_Y_CENTRE);
    ctx.restore();
  }

  isAt(x, y) {
    return this.gridPos.x === x && this.gridPos.y === y;
  }
}

// Enemies our player must avoid
class Enemy {
  constructor(row, eRow) {
    this.row = row;
    this.offset = 0;  // Initial drawing position for row
    this.dir = eRow.dir;
    this.speed = eRow.speed;
    this.pattern = eRow.pattern;
    this._type = eRow.type;
    this.sprite = Resources.get(eRow.type);
  }

  getType() {
    return this._type;
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
    gameModel.allEnemies = [];

    // Create the sprite patterns for the enemies
    for (let row = 0; row < NUM_ENEMY_ROWS; row++) {
      let eRow = LEVELS[gameModel.level].enemies[row];
      if (eRow !== null) {
        // If there are enemies on this row, create a new Enemy row
        gameModel.allEnemies.push(new Enemy(row + ENEMY_ROW_OFFSET, eRow));
      } else {
        gameModel.allEnemies.push(null);
      }
    }
  }
}

class Key {
  constructor() {
    this._locked = false;
    this._x = null;
    this._y = null;

    let keyInfo = LEVELS[gameModel.level].key;

    if (keyInfo !== null) {
        this._locked = true;
        this._x = keyInfo.x;
        this._y = keyInfo.y;
        gameModel.grid[this._y][this._x] = this;
      }
  }

  isLocked() {
    return this._locked;
  }

  tryUnlock(x, y) {
    if (this._x === x && this._y === y) {
      this._locked = false;
      gameModel.grid[this._y][this._x] = undefined;
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

  getType(x, y) {
    return this._type;
  }

  render() {
    ctx.drawImage(Resources.get(this._type), this._x * CELL_SIZE_X, this._y * CELL_SIZE_Y);
  }

  static genPickups() {
    let puInfo = LEVELS[gameModel.level].pickups;

    for(let pickup = 0; pickup < puInfo.length; pickup++) {
      let x = puInfo[pickup].x;
      let y = puInfo[pickup].y;
      gameModel.grid[y][x] = new Pickup(puInfo[pickup].type, x, y);
    }
  }
}

class Rock {
  constructor(x, y) {
    this._x = x;
    this._y = y;
  }

  rockAt(x, y) {
    return this._x === x && this._y === y;
  }

  render() {
    ctx.drawImage(Resources.get(ROCK), this._x * CELL_SIZE_X, this._y * CELL_SIZE_Y);
  }

  static genRocks() {
    let rockInfo = LEVELS[gameModel.level].rocks;

    for(let rock = 0; rock < rockInfo.length; rock++) {
      let x = rockInfo[rock].x;
      let y = rockInfo[rock].y;
      gameModel.grid[y][x] =  new Rock(x, y);
    }
  }
}

class Star {
  constructor() {
    this._position = {x: Math.floor(Math.random() * GRID_COLS), y: PLAYER_WIN_ROW};
    this._timeSinceStart = 0;
    this._alpha = ALPHA_FULL;
    this._available = true;
  }

  claimAt(col) {
    let claimed = false
    if (this._available && this._position.x === col) {
      this._available = false;
      this._alpha = 0;
      claimed = true;
    }
    return claimed;
  }

  update(dt) {
    if (this._available) {
      this._timeSinceStart += dt;
      let maxTime = STAR_BASE_TIME - STAR_TIME_DEDUCT * gameModel.level;
      let timeRemaining = maxTime - this._timeSinceStart;
      if (timeRemaining <= STAR_FADE_TIME) {
        this._alpha = timeRemaining / STAR_FADE_TIME;
      }
      if (timeRemaining <= 0) {
        this._available = false;
        this._alpha = 0;
      }
    }
  }

  render() {
    if (this._available) {
      let position = gridToCoords(this._position);
      ctx.save();
      ctx.globalAlpha = this._alpha;
      ctx.drawImage(Resources.get(STAR), position.x, position.y);
      ctx.restore();
    }
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

  hasLives() {
    return this._lives > 0;
  }

  render() {
    ctx.save();
    ctx.font = GUI_FONT;
    ctx.fillText(LIVES_TEXT + this._lives, LIVES_X, LIVES_Y);
    ctx.restore();
  }
}

class StatusText {
  constructor() {
    this._text = '';
    this._timer = 0;
    this._alpha = 0;
    this._fadeTimer = 0;
  }

  setText(text, time) {
    this._text = text;
    this._timer = time;
    this._alpha = ALPHA_FULL;
  }

  render() {
    if (this._alpha > 0) {
      ctx.save();
      ctx.textAlign = "center";
      ctx.font = STATUS_FONT;
      ctx.fillStyle = STATUS_TEXT_FILL + this._alpha + ")";
      ctx.strokeStyle = STATUS_TEXT_STROKE + this._alpha + ")";
      ctx.lineWidth = STATUS_TEXT_LINE_WIDTH;
      ctx.fillText(this._text, STATUS_TEXT_X, STATUS_TEXT_Y);
      ctx.strokeText(this._text, STATUS_TEXT_X, STATUS_TEXT_Y);
      ctx.restore();
    }
  }

  update(dt) {
    if (this._timer > 0) {
      let newTime = this._timer - dt;
      this._timer = (newTime > 0 ? newTime : 0);
    } else if (this._alpha > 0) {
      this._fadeTimer += dt;
      if (this._fadeTimer >= TEXT_FADE_DELAY) {
        this._alpha -= TEXT_ALPHA_FADE_AMOUNT;
        this._fadeTimer = 0;
      }
    }
  }
}

// Utility functions

function xGridFromCoord(xCoord) {
  return Math.round(xCoord / CELL_SIZE_X);
}

// converts a grid position to canvas coordinates
function gridToCoords(gridPos) {
  return {x: gridPos.x * CELL_SIZE_X, y: gridPos.y * CELL_SIZE_Y}
}

// Checks for collision between two bounding boxes
function boundingBoxCollision(box1X, box1Y, box1Width, box1Height, box2X, box2Y, box2Width, box2Height) {
  return (Math.abs(box1X - box2X) * 2 < (box1Width + box2Width)) &&
         (Math.abs(box1Y - box2Y) * 2 < (box1Height + box2Height));
}
