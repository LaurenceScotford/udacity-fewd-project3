/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
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

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas element's height/width and add it to the DOM.
     */

     var doc = global.document,
        win = global.window;

        // create visible canvas
      global.canvas = doc.createElement('canvas');
      global.ctx = canvas.getContext('2d');
      global.lastTime;
      global.level;
      global.lives;
      global.pickups;
      global.locked;

      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      ctx.font = FONT;
      doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / ONE_SECOND;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        // detect collisions between player and enemy sprites
        player.detectCollisions();

        // detect detectPickups
        player.detectPickups();

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
        player = new Player();
        // Set the reset function that the player should call when it collides with an enemy or reaches the target zone
        player.setReset(reset);

        // Create new object to hold the score
        score = new Score();

        level = 0;
        lives = 5;
        reset(false);
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        score.update(dt);
        updateEntities(dt);
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update();
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
        let rowImages = LEVELS[level].rows,
          row, col;

        // Before drawing, clear existing canvas
       ctx.clearRect(0,0,canvas.width,canvas.height);

        // Draw the score and lives
        ctx.fillText(SCORE_TEXT + score.getScore(), SCORE_X, SCORE_Y);
        ctx.fillText(LIVES_TEXT + lives, LIVES_X, LIVES_Y);


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

        if (locked) {

          // If the level is currently locked, draw the key...
          let key = LEVELS[level].key
          ctx.drawImage(Resources.get(KEY), key.x * CELL_SIZE_X, key.y * CELL_SIZE_Y);

          // ... and the locked blocks in the final row
          for (col = 0; col < GRID_COLS; col++) {
            ctx.drawImage(Resources.get(BLOCK_LOCKED), col * CELL_SIZE_X, PLAYER_WIN_ROW * CELL_SIZE_Y);
          }
        }
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        player.render();

        pickups.forEach(function(pickup) {
          ctx.drawImage(Resources.get(pickup.type), pickup.x * CELL_SIZE_X, pickup.y * CELL_SIZE_Y);
        });

        // Render rocks
        let rocks = LEVELS[level].rocks;
        for (let rock = 0; rock < rocks.length; rock++) {
          ctx.drawImage(Resources.get(ROCK), rocks[rock].x * CELL_SIZE_X, rocks[rock].y * CELL_SIZE_Y);
        }
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset(levelUp) {
        // If we're levelling up, go to the next level
        if (levelUp) {
          level++;
        }

        // Create mutable array of pickups for current level
        pickups = [...LEVELS[level].pickups];

        // Set locked status
        locked = LEVELS[level].key !== null ? true : false;

        // Create enemies for this level
        Enemy.genEnemies();

        // Reset player to start position and state
        player.resetPlayer();
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
        KEY,
        ENEMY_SPRITE,
        PLAYER_SPRITE
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
