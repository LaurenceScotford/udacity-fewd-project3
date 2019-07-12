# Udacity Front-End Web Developer Nanodegree
## Project 3 - Classic Arcade Game Clone
This project is a real-time HTML5 game, loosely based on the arcade classic Frogger.

To play the game, the player must use the arrow keys to guide the player character from the top row of the playfield to the bottom row.

While doing this, they must avoid hazards:

- Enemy bugs that travel across the playfield.
- Water that spans the playfield

Water can be safely crossed by stepping onto giant lilypads that float along on top of the water.

Some levels have items that the player can collect:

- Gems - Blue: 5 points, Green; 10 points, Orange: 20 points
- Heart - Grants an extra life

The player also earns 50 points when they reach the bottom of the playfield and win a level. This can be boosted to 200 points if they end the level on the square with a star. The star only lasts for a short amount of time, so the player must reach it quickly to earn this points boost.

Some levels have a locked barrier that prevents the player from reaching the bottom of the playfield. To unlock the barrier the player must first collect a key.

This version of the game has 10 example levels and 5 lives to give you a good chance to see each level. If you win level 10, the game loops back to level 1 but you retain your current score and lives.

### Developer notes
This game was built upon the basic game loop engine and graphics set supplied by Udacity, both of which have been modified by me. The rest of this document outlines my design and development approach.

#### Player
As the supplied images show the character facing forward only, I decided to create a game in which the player travels down the playfield rather than bottom to top, as this was a better fit with the images.

The player hops directly from one grid position to another when moving.
The exception to this is when the player is travelling on a lilypad. In this case the horizontal movement is at a pixel level. This does mean, when the player jumps off the lilypad they are unlikely to be exactly aligned to a grid position, but the game moves them into the nearest position, so it looks like a diagonal jump in many cases.

I added a simple animation system for the player character, which you can see:
- when the player character drops onto the playfield at the start of a level
- when the player character dies and spins off the screen
- when the player character jumps for joy on winning a level

#### Enemies
Rather than having a separate object for each enemy, I have one object for each row of enemies. This makes sense because the enemies in a row move in a synchronised way. I did originally have a single enemy object and a system for randomly generating enemies, but this resulted in a less playable game.

Although lilypads are not strictly enemies (it's the water under them that's dangerous), I used the Enemy class for them because they move in the same way and I need to detect collisions with them in the same way (it's just the outcome of collisions that's different).

Collision detection is a simple bounding box system, for speed. Because sprites are always aligned vertically to the grid, this works well enough generally.

#### Grid set up and rendering
Although this is a 2D game, the way the sprites are designed suggested a sort of 2.5D view where sprites on one row can overlap the row above. This means it's important to maintain z-ordering. To do this, rather than just having collections of objects and rendering them in order of object type, static objects, e.g. collectibles, star, key etc are all stored in a single 2D array. The render sequence is then as follows:

- Loop through the level data indicating which background blocks to use and draw these.
- Loop through the grid from top to bottom:
 - if a row has enemies, render these First
 - Now loop through each column from left to right and render any static entity at that location
 - If the player is at the current location, ender the player at this point
- If the level is locked, draw the locked blocks on the bottom row over the normal blocks
- Finally render the star in the bottom row

This sequence ensures that z-ordering is preserved, for example, if the player moves into a position that is partially obscured by a rock in the next row down, the player sprite will be partially obscured by that rock.

#### Star
The star was a graphic I hadn't used and I wanted to do something interesting with it. I came up with the idea of it being something that gives you a bonus if you land on it at the end of a level (which can be tricky on some of the harder levels). Initially I had it randomly moving to different locations on the final row, but it was distracting having it shift around while playing, so instead I made it a time-based challenge. It selects a random column to occupy but it only stays there for a short time, so you have to be quick to grab it.

A side effect that soon became apparent is that, if the level has one or more rocks on the penultimate row, the star can end up being inaccessible. To get round this, it selects a column at random and checks for the presence of a rock, shifting to the next column repeatedly until it finds one that isn't blocked.

#### GUI features
I added some GUI features to improve the game:
- At the start of the level, the level number appears briefly floating over the playfield before fading away.
- Whenever the player earns points, the points earned appear over the player character and quickly float and fade away.
- The score display counts up to add the new points rather then simply adding them all instantly

#### Level and animation data
These are stored as well-documented objects in an array in the constants.js file, which makes adding to them or changing them very simple.

#### Potential improvements
Some improvements that could be made, given time:
- Replace the bounding box collision detection with a hybrid bounding box/pixel data collision detection to make collisions pixel accurate
- Slide, rather than jump the player character between locations and add some animation in. Could also add side and back views so player is always facing direction of movement.
- Improve the way lilypads are handled. At the moment if the player collide with a lilypad then they are deemed to be on the lilypad, so it's possible to ride a lilypad clinging to its very edge, which looks odd. This could be changes so that the player has to have their centre over the lilypad to stay on it. This would work best if combined with a splashing/drowning animation.
- Allow for longer, possibly scrolling, playfields.
- Allow the player to select from the different character sprites supplied. Perhaps some of these could have special abilities, e.g. the cat character has extra lives but doesn't get collectibles.
- Add more levels, above the initial 10 I've created.
- Add instructions (or an attract mode) and win/lose screens.
