/*
  app.js - Holds the game model, where global game objects are held and the classes for
  the game objects, plus some utility functions.
*/

const gameModel = {
  level: 0,         // Current level
  locked: false,    // Indicates if current level is locked
  allEnemies: [],   // References enemy rows for current level
  player: null,     // References player object
  star: null,       // References star object
  key: null,        // Refernces key object
  score: null,      // References score object
  lives: null,      // References lives object
  statusText: null, // References statusText object
  grid: [],         // References all static entities
}

// The player character
class Player {
  constructor() {
    this._sprite = Resources.get(PLAYER_SPRITE);
    this.resetPlayer();
  }

  // Sets a callback function the player uses to request a level reset,
  // e.g. after reaaching the end of the level or dying.
  setReset(resetFunc) {
    this.resetFunc = resetFunc;
  }

  // Repors the player's pixel level location as an object with x and y members
  whereAreYou() {
    return {...this._playerPos};
  }

  // Reset the player to its starting state
  resetPlayer() {
    this._playerState = PL_STATE_ANIM;  // Indicates if player is in an animation or playable state
    this._playerAnim = PL_START_ANIM; // The currently running animation
    this._animPtr = null;  // A pointer to the current animation step
    this._gridPos = {x: PLAYER_START_X, y: PLAYER_START_Y}; // Player location on grid
    this._targetPos = {...this._gridPos}; // Where the player is trying to get to on the grid
    this._playerPos = gridToCoords(this._gridPos); // The pixel precision location of the player sprite
    this._playerAngle = 0;  // The current angle of the player sprite
    this._rotation = 0; // The current rotation rate and direction of the player sprite
    this._speed = 0;  // The current speed of the player sprite
    this._travelling = false; // Indicates if the player is travelling on a lilypad
  }

  // Handle input from the player
  handleInput(allowedKeys) {
    if (this._playerState === PL_STATE_PLAY) {
      // Adjust player position on grid based on keypress
      switch(allowedKeys) {
        case 'left':
          this._targetPos.x = this._gridPos.x > 0 ? this._gridPos.x - 1 : this._gridPos.x;
          this._travelling = false;
          break;
        case 'up':
          this._targetPos.y = this._gridPos.y > 0 ? this._gridPos.y - 1 : this._gridPos.y;
          this._travelling = false;
          break;
        case 'down':
          // Some levels are initially locked and the win row will be inaccessible
          let lowestRow = gameModel.key.isLocked() ? PLAYER_WIN_ROW - 1 : GRID_ROWS - 1;
          this._targetPos.y = this._gridPos.y < lowestRow ? this._gridPos.y + 1 : this._gridPos.y;
          this._travelling = false;
          break;
        case 'right':
          this._targetPos.x = this._targetPos.x < GRID_COLS - 1 ? this._gridPos.x + 1 : this._gridPos.x;
          this._travelling = false;
      }
    }
    // If debug is switched on and enter has been hit, then go straight to the next level
    if (DEBUG && allowedKeys === 'advance') {
      this.resetFunc(true);
    }
  }

  /*
   * This method detects collisions between the player and enemy sprites
   * Although strictly speaking only bugs are enemies, lilypads also use this class
   */
   detectCollisions() {
    if (this._playerState === PL_STATE_PLAY) {
      // Check for a win condition (player has reached bottom row
      if (this._gridPos.y === PLAYER_WIN_ROW) {
        gameModel.score.addScore(gameModel.star.claimAt(this._gridPos.x) ? STAR_SCORE : WIN_SCORE);
        this._playerState = PL_STATE_ANIM;
        this._playerAnim = PL_END_ANIM;
      } else {
        this._travelling = false;
        // Cycle through all enemy rows
        for (let enemy = 0; enemy < gameModel.allEnemies.length; enemy++) {
          let theEnemy = gameModel.allEnemies[enemy];
          /// Check if the current row has an enemy overlapping the player sprite
          if (theEnemy && theEnemy.hasEnemyAt(this._playerPos.x + HALF_SPRITE_WIDTH, this._playerPos.y + PLAYER_Y_OFFSET + PLAYER_HEIGHT / 2,
              PLAYER_WIDTH, PLAYER_HEIGHT)) {
            // If a collision is found, check if it's with a lilypad
            if (theEnemy.getType() === LILYPAD_SPRITE) {
              // If so, indicate player is now travelling on a lilypad
              this._travelling = true;
            } else {
              // Otherwise, it's a bug, so kill the player
              gameModel.lives.loseLife();
              this._playerState = PL_STATE_ANIM;
              this._playerAnim = PL_DEATH_ANIM;
              break;
            }
          }
        }
      }
      // Check if the player is in a water row when not travelling on a lilypad
      if (this._playerState === PL_STATE_PLAY && LEVELS[gameModel.level].rows[this._targetPos.y] === BLOCK_WATER && !this._travelling) {
          // Player has drowned
          gameModel.lives.loseLife();
          this._playerState = PL_STATE_ANIM;
          this._playerAnim = PL_DEATH_ANIM;
       }
     }
   }

   /*
    * This method detects collisions between the player and a pickup.
    * If a collision is detected then action is taken appropriate to the pick-up type
    * and the pickup is destroyed
    */
   detectPickups() {
     if (this._playerState === PL_STATE_PLAY) {
       let gridContent = gameModel.grid[this._gridPos.y][this._gridPos.x];
       if (gridContent instanceof Pickup) {
         switch(gridContent.getType()) {
           case HEART:
            // Extra life
            gameModel.lives.gainLife();
            break;
          case GEM_BLUE:
            // Small bonus score
            gameModel.score.addScore(BLUE_SCORE);
            break;
          case GEM_GREEN:
            // Medium bonus score
            gameModel.score.addScore(GREEN_SCORE);
            break;
          case GEM_ORANGE:
            // Big bonus score
            gameModel.score.addScore(ORANGE_SCORE);
            break;
         }
         // Remove the collected pickup ftom the game grid
         gameModel.grid[this._gridPos.y][this._gridPos.x] = null;
       }

       // Now check if the player has picked up the key
       // This will unlock the level
       gameModel.key.tryUnlock(this._gridPos.x, this._gridPos.y);
     }
   }

  // Update the player's position. NOTE dt is not used for normal movement
  // but is used during animation states
  update(dt) {
    // If we're in a play, rather than an animation state
    if (this._playerState === PL_STATE_PLAY) {
      if (gameModel.grid[this._targetPos.y][this._targetPos.x] instanceof Rock) {
        // Player is trying to move into a space occupied by a rock,
        // so don't let them moves there
        this._targetPos = {...this._gridPos};
      }
      // Move the player
      if (this._travelling) {
        // If we're on a lilypad, move the player in the same direction
        // and at the same rate as the lilypad
        let lilypad = LEVELS[gameModel.level].enemies[this._gridPos.y - 1];
        let movement = lilypad.speed * dt;
        movement = lilypad.dir === LEFT ? -movement : movement;
        this._playerPos.x += movement;
        // Constrain movement so player can't be carried off screen
        if (this._playerPos.x < 0) {
          this._playerPos.x = 0;
        } else if (this._playerPos.x > (GRID_COLS - 1) * CELL_SIZE_X) {
          this._playerPos.x = (GRID_COLS - 1) * CELL_SIZE_X;
        }
        // Update player's position on grid
        this._gridPos.x = xGridFromCoord(this._playerPos.x);
        this._targetPos.x = this._gridPos.x;
      } else {
        // Otherwise it's a normal movement, so go to the target position
        this._gridPos = {...this._targetPos};
        this._playerPos = gridToCoords(this._gridPos);
      }
    } else {
      // If we got here, we're in an animation state, so run the animation
      if (this._animPtr === null) {
        // If the animation hasn't started yet, set up the first anim step
        this._animPtr = 0;
        this._startAnimStep();
      }
      // Move the sprite according to the animation step target and the elapsed time
      // since the last updates
      let maxMovement = this._speed * dt;
      let end = this._playerAnim[this._animPtr].end;
      this._playerPos.x = this._moveSprite(end.x, this._playerPos.x, maxMovement);
      this._playerPos.y = this._moveSprite(end.y, this._playerPos.y, maxMovement);
      // If the player is spinning, adjust the angle
      this._playerAngle += this._rotation * dt;
      if ((end.x === null || this._playerPos.x === end.x) && (end.y === null || this._playerPos.y === end.y)) {
        if (++this._animPtr === this._playerAnim.length) {
          // We've reached the end of the animation, so take an appropriate action
          this._animPtr = null;
          switch(this._playerAnim) {
            case PL_START_ANIM:
              this._playerState = PL_STATE_PLAY; // Beginning of level - resume normal play state
              break;
            case PL_DEATH_ANIM:
              if (gameModel.lives.hasLives()) {
                  this.resetPlayer();  // Player died but has lives left - Reset player only
              }
              else {
                this.resetFunc(false); // Player dies and is out of lives, so restart
              }
              break;
            case PL_END_ANIM:
              this.resetFunc(true); // Player completed level - Restart with level up
              break;
          }
        } else {
          // Otherwise, ste up the next animation step
          this._startAnimStep();
        }
      }
    }
  }

  // This private method sets up a new animation step
  _startAnimStep() {
    let nextStep = this._playerAnim[this._animPtr];
    this._rotation = nextStep.rotation.spinRate;
    this._playerAngle = nextStep.rotation.angle;
    this._speed = nextStep.speed;
    let start = nextStep.start;
    this._playerPos.x = start.x ? start.x : this._playerPos.x;
    this._playerPos.y = start.y ? start.y : this._playerPos.y;
  }

  // This private method calculates the correct distance to move either an x or y parameter
  // towards the target
  _moveSprite(target, currentPos, maxDistance) {
    let finalPos = currentPos;
    // Only update if the animation step specifies this value is changed
    if (target !== null) {
      // Set either the maximum distance allowed since the last frame or the remaining
      // distance to the target, whichever is smallest
      let remainingDist = target - currentPos;
      maxDistance *= Math.sign(remainingDist);
      finalPos = currentPos + (Math.abs(remainingDist) > Math.abs(maxDistance) ? maxDistance : remainingDist);
    }
    return finalPos;
  }

  // Draw the player sprite
  render() {
    ctx.save();
    ctx.translate(this._playerPos.x + HALF_SPRITE_WIDTH, this._playerPos.y + PLAYER_Y_CENTRE);
    ctx.rotate(this._playerAngle * Math.PI / 180);
    ctx.drawImage(this._sprite, -HALF_SPRITE_WIDTH, -PLAYER_Y_CENTRE);
    ctx.restore();
  }

  // Returns true if the player is loated at the specified grid position
  isAt(x, y) {
    return this._gridPos.x === x && this._gridPos.y === y;
  }
}

// Enemies our player must avoid. This class is also used by the lilypads that the
// player uses to cross water
class Enemy {
  constructor(row, eRow) {
    this._row = row;   // Row on the grid this enemy row will occupy
    this._offset = 0;  // Initial drawing position for row (pixels)
    this._dir = eRow.dir; // A reference to the level data for this enemy row
    this._speed = eRow.speed; // The speed of the enemies in pixels per second
    this._pattern = eRow.pattern; // The pattern of the enemies (number and spacing)
    this._type = eRow.type; // The type of enemy (bugs or lilypads)
    this._sprite = Resources.get(eRow.type);
  }

  // Returns the enemy type, either ENEMY_SPRITE or LILYPAD_SPRITE
  getType() {
    return this._type;
  }

  // Update the enemy's position, required method for game
  // Parameter: dt, a time delta between ticks
  update(dt) {
    // Multiplies any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    let distance = this._speed * dt;
    if (this._dir === LEFT) {
      this._offset -= distance;
      if (this._offset < 0) {
        this._offset += GRID_COLS * CELL_SIZE_X - 1;
      }
    } else {
      this._offset += distance;
      if (this._offset > GRID_COLS * CELL_SIZE_X - 1) {
        this._offset -= GRID_COLS * CELL_SIZE_X - 1;
      }
    }
  }

  // Draw a row of enemies on the screen
  render() {
    for (let enemy = 0; enemy < this._pattern.length; enemy++) {
      // Calulate position of enemy based on pattern data and row
      let enemyXPos = this._pattern[enemy] * CELL_SIZE_X + this._offset;
      let enemyYPos = this._row * CELL_SIZE_Y;
      // Draw enemy
      this._drawEnemy(enemyXPos, enemyYPos);
      // If enemy has wrapped, draw right side of enemy at beginning of row
      enemyXPos -= GRID_COLS * CELL_SIZE_X - 1;
      if (enemyXPos + CELL_SIZE_X >= 0) {
        this._drawEnemy(enemyXPos, enemyYPos);
      }
    }
  }

  // This private method draws an individual enemy
  _drawEnemy(x, y) {
    ctx.save();
    ctx.translate(x + HALF_SPRITE_WIDTH, y);
    if (this._dir === LEFT) {
      ctx.scale(-1,1);
    }
    ctx.drawImage(this._sprite, -HALF_SPRITE_WIDTH, 0);
    ctx.restore();
  }

  // Returns true if an enemy sprite currently intersects the box described by the parameters
  hasEnemyAt(x, y, width, height) {
    for(let enemy = 0; enemy < this._pattern.length; enemy++) {
      let enemyXPos = this._pattern[enemy] * CELL_SIZE_X + this._offset + HALF_SPRITE_WIDTH;
      let enemyYPos = this._row * CELL_SIZE_Y + ENEMY_Y_OFFSET + ENEMY_HEIGHT / 2;
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


  // This class factory function generates new enemy rows at the start of a level
  static genEnemies() {
    // Remove any enemies previously created
    gameModel.allEnemies = [];

    // Create the sprite patterns for the enemies
    for (let row = 0; row < LEVELS[gameModel.level].enemies.length; row++) {
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

// Represents the locked state of the level and the status of the key, if any
class Key {
  constructor() {
    this._locked = false;
    this._x = null;
    this._y = null;

    let keyInfo = LEVELS[gameModel.level].key;

    // If a key is present, add it to the grid
    if (keyInfo !== null) {
        this._locked = true;
        this._x = keyInfo.x;
        this._y = keyInfo.y;
        gameModel.grid[this._y][this._x] = this;
      }
  }

  // Retruns true if the level is currently locked
  isLocked() {
    return this._locked;
  }

  // If the key is present at the supplied grid location, unlock the level and
  // remove the key from the game grid
  tryUnlock(x, y) {
    if (this._x === x && this._y === y) {
      this._locked = false;
      gameModel.grid[this._y][this._x] = undefined;
    }
  }

  // Draw the key if the level is currently locked
  render() {
    if (this._locked) {
      // If the level is currently locked, draw the key...
      ctx.drawImage(Resources.get(KEY), this._x * CELL_SIZE_X, this._y * CELL_SIZE_Y);
    }
  }
}

// Represents pickups the player can collect (hearts for extra lives and gems for
// bonus points)
class Pickup {
  constructor(type, x, y) {
    this._type = type;
    this._x = x;
    this._y = y;
  }

  // Returns the type of pickup this object represnts
  getType() {
    return this._type;
  }

  // Draw this pickup
  render() {
    ctx.drawImage(Resources.get(this._type), this._x * CELL_SIZE_X, this._y * CELL_SIZE_Y);
  }

  // Class factory function to create new pickups for a level and place them in the
  // game grid
  static genPickups() {
    let puInfo = LEVELS[gameModel.level].pickups;

    for(let pickup = 0; pickup < puInfo.length; pickup++) {
      let x = puInfo[pickup].x;
      let y = puInfo[pickup].y;
      gameModel.grid[y][x] = new Pickup(puInfo[pickup].type, x, y);
    }
  }
}

// Represents rocks in the level that restrict the playe's movement
class Rock {
  constructor(x, y) {
    this._x = x;
    this._y = y;
  }

  // Returns true if this rock is located at the given grid position
  rockAt(x, y) {
    return this._x === x && this._y === y;
  }

  // Draw this rock
  render() {
    ctx.drawImage(Resources.get(ROCK), this._x * CELL_SIZE_X, this._y * CELL_SIZE_Y);
  }

  // A class factory function that creates the rocks for a level and adds them to the
  // game grid
  static genRocks() {
    let rockInfo = LEVELS[gameModel.level].rocks;

    for(let rock = 0; rock < rockInfo.length; rock++) {
      let x = rockInfo[rock].x;
      let y = rockInfo[rock].y;
      gameModel.grid[y][x] =  new Rock(x, y);
    }
  }
}

// Represents the star that appears temporarily on the bottom row of a level and
// increases the points the player earns for completing the level if they collect
// it before it disappears
class Star {
  constructor() {
    // Select a random grid column
    let randCol = Math.floor(Math.random() * GRID_COLS);
    // If that column is blocked by a rock, select new columns until an unblocked
    // location is found (note this can result in an infinite loop if the penultimate row
    // is completely filled with rocks, but the player would also never be able to
    // complete a level with that design, so it should be avoided)
    while (gameModel.grid[PLAYER_WIN_ROW - 1][randCol] instanceof Rock) {
      randCol = randCol === 0 ? GRID_COLS - 1 : randCol - 1;
    }
    this._position = {x: randCol, y: PLAYER_WIN_ROW};
    this._timeSinceStart = 0;
    this._alpha = ALPHA_FULL;
    this._available = true;
  }

  // If the star is available and located at the specified column position,
  // remove the star from the game and return true
  claimAt(col) {
    let claimed = false
    if (this._available && this._position.x === col) {
      this._available = false;
      this._alpha = 0;
      claimed = true;
    }
    return claimed;
  }

  // Update the star's state based on the elapsed time
  update(dt) {
    if (this._available) {
      // Keep track of how long the star has existed
      this._timeSinceStart += dt;
      let maxTime = STAR_BASE_TIME - STAR_TIME_DEDUCT * gameModel.level;
      let timeRemaining = maxTime - this._timeSinceStart;
      // If the star is reaching the end of it's life, fade it
      if (timeRemaining <= STAR_FADE_TIME) {
        this._alpha = timeRemaining / STAR_FADE_TIME;
      }
      // If the star has expired, remove it from the game
      if (timeRemaining <= 0) {
        this._available = false;
        this._alpha = 0;
      }
    }
  }

  // Draw the star
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

// Represnts the player's score
class Score {
  constructor() {
    this._score = 0;  // Score currently shown on GUI
    this._targetScore = 0;  // The total current accumulated points
    this._timeSinceScoreUpdate = 0; // The time since the score on the GUI was updated
    this._pointsDisplay = []; // Array holding points animations
  }

  // Method used to add an amount (acore) to the player's score
  addScore(score) {
    // Add it to the target score first (the score on the GUI will animate to reach this)
    this._targetScore += score;
    // Creat a points animation to start at the player's current position
    let playerPos = gameModel.player.whereAreYou();
    this._pointsDisplay.push(
      {points: score, timeLeft: POINTS_DISPLAY_TIME, alpha: ALPHA_FULL,
       x: playerPos.x + HALF_SPRITE_WIDTH, y: playerPos.y + PLAYER_Y_OFFSET}
    );
  }

  // Draw the points on the GUI and any running points animations
  render() {
    ctx.save();
    ctx.font = GUI_FONT;
    // Draw the score on the GUI first
    ctx.fillText(SCORE_TEXT + this._score, SCORE_X, SCORE_Y);
    // If there are any points animations running...
    if (this._pointsDisplay.length > 0) {
      ctx.textAlign = 'center';
      ctx.font = POINTS_FONT;
      ctx.lineWidth = POINTS_TEXT_LINE_WIDTH;
      // Loop through all points animations drawing them at the current position and
      // translucency
      for (let nextPoints = 0; nextPoints < this._pointsDisplay.length; nextPoints++) {
        let thePoints = this._pointsDisplay[nextPoints];
        ctx.fillStyle = POINTS_TEXT_FILL + thePoints.alpha + ')';
        ctx.strokeStyle = POINTS_TEXT_STROKE + thePoints.alpha + ')';
        ctx.fillText(thePoints.points, thePoints.x, thePoints.y);
        ctx.strokeText(thePoints.points, thePoints.x, thePoints.y);
      }
    }
    ctx.restore();
  }

  // Updates the score shown on the GUI and any points animations based on time elapsed
  // since last frame
  update(dt) {
    this._timeSinceScoreUpdate += dt;
    // Track score on GUI towards the target score (has the effect of showing the GUI Score
    // count up to reach the current total)
    if (this._timeSinceScoreUpdate >= SCORE_DELAY) {
      this._score += (this._score < this._targetScore);
      this._timeSinceScoreUpdate = 0;
    }
    // If there are any running points animations...
    if (this._pointsDisplay.length > 0) {
      // Cycle through all points animations
      for (let nextPoints = this._pointsDisplay.length - 1; nextPoints >= 0; nextPoints--) {
        let thePoints = this._pointsDisplay[nextPoints];
        thePoints.timeLeft -= dt;
        if (thePoints.timeLeft <= 0) {
          // This animation has ended, so remove it
          this._pointsDisplay.splice(nextPoints, 1);
        } else {
          // Fade out and move the points display upwards based on the elapsed time
          thePoints.alpha = thePoints.timeLeft / POINTS_DISPLAY_TIME;
          thePoints.y -= POINTS_SPEED * dt;
        }
      }
    }
  }
}

// Represents the player's lives
class Lives {
  constructor() {
    this._lives = START_LIVES;
  }

  // Called to add an extra life
  gainLife() {
    this._lives++;
  }

  // Called to lose a life - returns true if all lives now lost
  loseLife() {
    if (this._lives > 0) {
      this._lives--;
    }

    return this._lives === 0;
  }

  // Returns true if the player has lives remaining
  hasLives() {
    return this._lives > 0;
  }

  // Draw the lives on the GUI
  render() {
    ctx.save();
    ctx.font = GUI_FONT;
    ctx.fillText(LIVES_TEXT + this._lives, LIVES_X, LIVES_Y);
    ctx.restore();
  }
}

// Represents the status text shown over the game board
class StatusText {
  constructor() {
    this._text = '';      // Text to display
    this._timer = 0;      // Time left before fade out
    this._alpha = 0;      // Current fade level
    this._fadeTimer = 0;  // Controls rate of fade
  }

  // Set a new status text
  setText(text, time) {
    this._text = text;
    this._timer = time;
    this._alpha = ALPHA_FULL;
  }

  // Draw the status text
  render() {
    if (this._alpha > 0) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = STATUS_FONT;
      ctx.fillStyle = STATUS_TEXT_FILL + this._alpha + ')';
      ctx.strokeStyle = STATUS_TEXT_STROKE + this._alpha + ')';
      ctx.lineWidth = STATUS_TEXT_LINE_WIDTH;
      ctx.fillText(this._text, STATUS_TEXT_X, STATUS_TEXT_Y);
      ctx.strokeText(this._text, STATUS_TEXT_X, STATUS_TEXT_Y);
      ctx.restore();
    }
  }

  // Update the status text based on elapsed time
  update(dt) {
    // Calculate time remaining before fade
    if (this._timer > 0) {
      let newTime = this._timer - dt;
      this._timer = (newTime > 0 ? newTime : 0);
    } else if (this._alpha > 0) {
      // Adjust current fade level if fading
      this._fadeTimer += dt;
      if (this._fadeTimer >= TEXT_FADE_DELAY) {
        this._alpha -= TEXT_ALPHA_FADE_AMOUNT;
        this._fadeTimer = 0;
      }
    }
  }
}

// Utility functions

// Returns the nearest grid location that corresponds to the current pixel x value
function xGridFromCoord(xCoord) {
  return Math.round(xCoord / CELL_SIZE_X);
}

// converts a grid position to pixel level canvas coordinates
// Expects an object with x and y values and returns an object with x and y values
function gridToCoords(gridPos) {
  return {x: gridPos.x * CELL_SIZE_X, y: gridPos.y * CELL_SIZE_Y}
}

// Returns true if the two bounding boxes descibed by the paramaters intersect
function boundingBoxCollision(box1X, box1Y, box1Width, box1Height, box2X, box2Y, box2Width, box2Height) {
  return (Math.abs(box1X - box2X) * 2 < (box1Width + box2Width)) &&
         (Math.abs(box1Y - box2Y) * 2 < (box1Height + box2Height));
}
