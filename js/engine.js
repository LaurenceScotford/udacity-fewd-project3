/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on the player, enemy and otheer game objects (defined in app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine makes the canvas' context (ctx) object globally available to make
 * writing app.js a little simpler to work with.
 */

const Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas element's height/width and add it to the DOM.
     */

     const doc = global.document,
        win = global.window;

        // create visible canvas
      global.canvas = doc.createElement('canvas');
      global.ctx = canvas.getContext('2d');
      global.lastTime;

      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if the game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        const now = Date.now(),
            dt = (now - lastTime) / ONE_SECOND;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        // detect collisions between player and enemy sprites
        gameModel.player.detectCollisions();

        // detect Pickups the player can collect
        gameModel.player.detectPickups();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);

    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
      gameModel.level = 0;

      gameModel.player = new Player();

      // Set the reset callback that the player should call when it collides with an
      // enemy or reaches the target zone
      gameModel.player.setReset(reset);

      // This listens for key presses and sends the keys to the
      // Player.handleInput() method.
      document.addEventListener('keyup', function(e) {
          const allowedKeys = {
              37: 'left',
              38: 'up',
              39: 'right',
              40: 'down'
          };

          // If debug mode is switched on, you can advance to the next level
          // using the Return key
          if (DEBUG) {
            allowedKeys[13] = 'advance';
          }

          gameModel.player.handleInput(allowedKeys[e.keyCode]);
      });

      // Create new objects to hold GUI elements
      gameModel.score = new Score();
      gameModel.lives = new Lives();
      gameModel.statusText = new StatusText();

      reset(false);
      lastTime = Date.now();
      main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which need to update entity's data.
     */
    function update(dt) {
        gameModel.score.update(dt);
        gameModel.statusText.update(dt);
        updateEntities(dt);
    }

    /* This is called by the update function and loops through all of the
     * objects within the allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for the star
     * and player objects. These update methods focus purely on updating
     * the data/properties related to the object. Drawing is done in
     * render methods.
     */
    function updateEntities(dt) {
        gameModel.allEnemies.forEach(function(enemy) {
            if (enemy) {
                enemy.update(dt);
            }
        });
        gameModel.star.update(dt);
        gameModel.player.update(dt);
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        let rowImages = LEVELS[gameModel.level].rows,
          row, col;

        // Before drawing, clear existing canvas
       ctx.clearRect(0,0,canvas.width,canvas.height);

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < GRID_ROWS; row++) {
            for (col = 0; col < GRID_COLS; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * CELL_SIZE_X, row * CELL_SIZE_Y);
            }
        }
        renderEntities();

        // If the level is currently locked, draw the locked blocks in the final row
        // Note these blocks must be drawn after all entities other than the star to preserve
        // z ordering
        if (gameModel.key.isLocked()) {
          for (col = 0; col < GRID_COLS; col++) {
            ctx.drawImage(Resources.get(BLOCK_LOCKED), col * CELL_SIZE_X, PLAYER_WIN_ROW * CELL_SIZE_Y);
          }
        }

        // Render the star on the final row
        gameModel.star.render();

        // Render the GUI elements
        gameModel.score.render();
        gameModel.lives.render();
        gameModel.statusText.render();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions defined
     * on the enemy, player and other entities within app.js
     */
    function renderEntities() {
      // Loop through each row of grid from top to bottom
      for (row = 0; row < GRID_ROWS; row++) {
        // If there are enemies on this row, render them
        if (gameModel.allEnemies[row]) {
          gameModel.allEnemies[row].render();
        }

        // Now loop through each column, rendering other entities
        for (col = 0; col < GRID_COLS; col++) {
          if (gameModel.grid[row][col]) {
            gameModel.grid[row][col].render();
          }
          // If the payer is at the current location, render them now
          if (gameModel.player.isAt(col, row)) {
            gameModel.player.render();
          }
        }
      }
    }

    /* This function is called whenever a level needs to be reset. The parameter is set
     * to true if the next level is to be started, or false if the current level is to be
     * reset.
     */
    function reset(levelUp) {
        // Check if the player is out of lives, if, so reset engine
        if (!gameModel.lives.hasLives()) {
          gameModel.level = 0;
          gameModel.lives = new Lives();
          gameModel.score = new Score();
        }

        // If we're levelling up, go to the next level
        if (levelUp) {
          gameModel.level++;
          // If player has defeated all the levels, wrap back to level 1
          if (gameModel.level ==+ LEVELS.length) {
            gameModel.level = 0;
          }
        }

        // If we're starting a new level, show the level number to the player
        if (levelUp || gameModel.level === 0) {
          gameModel.statusText.setText(LEVEL_TEXT + (gameModel.level + 1), LEVEL_TEXT_TIME)
        }

        // initialise a new grid map for this level
        gameModel.grid = [];
        for (let row = 0; row < GRID_ROWS; row++) {
          gameModel.grid[row] = [];
          for (let col = 0; col < GRID_COLS; col++) {
            gameModel.grid[row][col] = null;
          }
        }

        // Create array of rocks for current level
        Rock.genRocks();

        // Create array of pickups for current level
        Pickup.genPickups();

        // Create new key object to control level locking
        gameModel.key = new Key();

        // Create enemies for this level
        Enemy.genEnemies();

        // Create a new star object for this level
        gameModel.star = new Star();

        // Reset player to start position and state
        gameModel.player.resetPlayer();
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        BLOCK_STONE,
        BLOCK_WATER,
        BLOCK_GRASS,
        BLOCK_FLAG,
        BLOCK_LOCKED,
        ROCK,
        HEART,
        GEM_BLUE,
        GEM_GREEN,
        GEM_ORANGE,
        STAR,
        KEY,
        ENEMY_SPRITE,
        LILYPAD_SPRITE,
        PLAYER_SPRITE
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
