/*
  Bacteria-Zapper
  Panteli Marinis - 0571213
  Blake McDonald - 0575698
  COMP-4471-Computer Graphics
  Lakehead University
*/

var main = function() {

	// Game's main variables
	var score = 0;
	var missClicks = 0;
	var winKillAmt = 15;
	var bacRemaining = winKillAmt;
	var lives = 2;
	var spawnedBac = 0;

	// Variables for calculating fps
	var filterStrength = 20;
	var frameTime = 0, lastloop = new Date, thisLoop;

	// Creating a WebGL Context Canvas and also a 2D Context Canvas for displaying text
	var canvas = document.getElementById('gameSurface');
	var gl = canvas.getContext('webgl');

	var textCanvas = document.getElementById('text');
	var ctx = textCanvas.getContext('2d')
	ctx.font = "80px Verdana";
	ctx.textAlign = "center";

	// Vertex and fragement shader source
	var vertCode = [
		'attribute vec3 coordinates;',
		'',
		'void main() {',
		'	gl_Position = vec4(coordinates, 1.0);',
		'}'
	].join('\n');

	var fragCode = [
	  'precision mediump float;',
	  'uniform vec4 fColor;',
	  '',
	  'void main()',
	  '{',
	  ' gl_FragColor = fColor;',
	  '}'
	].join('\n');

	// Create an empty buffer object
	var vertex_buffer = gl.createBuffer();

	// Set the view port
	gl.viewport(0,0,canvas.width,canvas.height);

	// Bind appropriate array buffer to it
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

	// Enable the depth test
	gl.enable(gl.DEPTH_TEST);

	// Create vertex and fragment shader objects
	var vertShader = gl.createShader(gl.VERTEX_SHADER);
	var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

	// Shaders
	// Attach vertex shader source code and compile
	gl.shaderSource(vertShader, vertCode);
	gl.compileShader(vertShader);

	// Attach fragment shader source code and compile
	gl.shaderSource(fragShader, fragCode);
	gl.compileShader(fragShader);

	// Create shader program
	var shaderProgram = gl.createProgram();

	// Attach the vertex and fragment shader
	gl.attachShader(shaderProgram, vertShader);
	gl.attachShader(shaderProgram, fragShader);

	// Link and use
	gl.linkProgram(shaderProgram);
	gl.useProgram(shaderProgram);

	// Get the attribute and uniform location
	var coord = gl.getAttribLocation(shaderProgram, "coordinates");
	var fColor = gl.getUniformLocation(shaderProgram, "fColor");

	// Point an attribute to the currently bound VBO and enable the attribute
	gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(coord);

	function draw_circle(x,y,r,color) {

		// For storing the produces vertices
		var vertices = [];

		// Prepare vertices
		for (let i = 1; i <= 360; i++) {
			var y1 = r*Math.sin(i)+y;
			var x1 = r*Math.cos(i)+x;

			var y2 = r*Math.sin(i+1)+y;
			var x2 = r*Math.cos(i+1)+x;

			vertices.push(x);
			vertices.push(y);
			vertices.push(0);

			vertices.push(x1);
			vertices.push(y1);
			vertices.push(0);

			vertices.push(x2);
			vertices.push(y2);
			vertices.push(0);
		}

		// Pass the vertex data to the buffer
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

		// Clear the buffer, then bind the vertex buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

		// Pass color data to uniform fColor
		gl.uniform4f(fColor, color[0], color[1], color[2], color[3]);

		// Drawing triangles
		gl.clearColor(0, 1, 0, 0.9);
		// Draw the triangle 360*3, 3 layers of vertices (disk)
		gl.drawArrays(gl.TRIANGLES, 0, 360*3);

	}

	// Uses radius and distance to determine if two objects are colliding
	function colliding(x1, y1, r1, x2, y2, r2) {
		var xDist = x2-x1;
		var yDist = y2-y1;
		var totDist = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));

		if(distance(x1, y1, x2, y2) - (r1+r2) < 0) {
			return true;
		}

		return false;
	}

	// Pythagorean theorem
	function distance(x1, y1, x2, y2) {
		var xDist = x2-x1;
		var yDist = y2-y1;
		return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
	}

	// Assign function to mouse click
	canvas.onmousedown = function(e, canvas){click(e, gameSurface);};

	// Function click
	function click(e, canvas) {
		var x = e.clientX;
		var y = e.clientY;
		var hit = false;
		var rect = e.target.getBoundingClientRect();
		//Convert default canvas coords to webgl vector coords
		x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
		y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

		// Loop through all bacteria and check if you clicked within the radius of any
		// Increase score and destroy the bacteria
		for(let i in bacArr) {
			if(colliding(x, y, 0, bacArr[i].x, bacArr[i].y, bacArr[i].r)){
 			 	score = Math.round(score + (1/bacArr[i].r));
				bacArr[i].destroy(i);
 			 	hit = true;
				// Break ensures you can't click multiple bacteria at once
				break;
			}
		}

		// If you click and don't hit a bacteria, your score is decreased by 20 + the total amount of times you've clicked.
		if(!hit) {
			score -= (20 + missClicks);
			missClicks ++;
		}
	}

	// Randomly sets the passed number to a negative or positive, returns the new(or same) number
	function randomSign(n){
		if(Math.random() >= 0.5){
			n = n*-1;
		}
		return n;
	}

	// Class for storing data about each Bacteria
	class Bacteria {

		constructor(id) {
			this.id = id;
			this.consuming = [];
		}

		spawn() {

			// get new random data for determining x and y
			this.getNewRandomTrigData();

			// get new x and y values along the game circle
			this.getCircPoints();

			// Variable to ensure no infinite loop is created
			var attempt = 0;

			// Loop through all Bacteria to ensure no collision on spawn
			for (var i = 0; i < bacArr.length; i++) {
				// Error check to not break the game if the bacteria cover the whole game surface.
				if(attempt > 500) {
					console.log("No area for new bacteria to spawn");
					break;
				}

				// If theres a collision with a specific object, the variables need to be randomized again
				// Also need to set i = -1 to ensure it loops through all bacteria again
				if (colliding(this.x, this.y, 0.06, bacArr[i].x, bacArr[i].y, bacArr[i].r)) {
					this.getNewRandomTrigData();
					this.getCircPoints();
					attempt++;
					i = -1;
				}
			}

			// Store new data for each Bacteria
			this.r = 0.06;
			// times by 0.65 to ensure the bacteria isn't as light as the canvas
			this.color = [Math.random() * (0.65), Math.random() * (0.65), Math.random() * (0.65), 0.75];
			this.alive = true;
			this.consuming = [];
			spawnedBac++;
		}

		update() {

			if(this.alive) {
				// If a certain threshold (r=0.3) destroy the bacteria and decrease player's lives
				if(this.r > 0.3) {
					lives--;
					this.destroy(bacArr.indexOf(this));
				} else {
					// Increase the size of each bacteria by 0.0003 each tick
					// Bacteria grow faster when a certain score threshold is met
					if (score > 400) {
						this.r += 0.0005;
					} else if (score > 1000) {
						this.r += 0.0008;
					} else if (score > 2000) {
						this.r += 0.0014;
					} else {
						this.r += 0.0003;
					}

					/* Collision Check with consuming assigning,
						 finds which bacteria are colliding and sets the larger one to consume the other */
					for(i in bacArr) {
						if(this != bacArr[i]){
							if(this.consuming.indexOf(bacArr[i]) == -1 && bacArr[i].consuming.indexOf(this) == -1) {
								if(colliding(this.x, this.y, this.r, bacArr[i].x, bacArr[i].y, bacArr[i].r)) {
									if(this.id < bacArr[i].id){
										this.consuming.push(bacArr[i]);
									}
								}
							} else {
								for(i in this.consuming){
									// Easier than typing this.consuming[i].* everytime
									let consuming = this.consuming[i];
									if(distance(this.x, this.y, consuming.x, consuming.y) <= (this.r - consuming.r)){
										consuming.destroy(bacArr.indexOf(consuming));
									} else {
										var xDiff = this.x - consuming.x;
										var yDiff = this.y - consuming.y;
										/* While being consumed, the bacteria will
										move in the direction of the consumer,
										its radius will be shrunk and the consumer's
										will grow */
										consuming.x += xDiff/100;
										consuming.y += yDiff/100;
										consuming.r -= 0.002;
										this.r += 0.00065;
										//Increase alpha of the bacteria causing it to become darker as it consumes.
										this.color[3] += 0.001;

									}
								}
							}
						}
					}
				}
				// Draw
				// Converts wegbl coords to canvas coords
				// var tx = (this.x + 8/300 + 1) * 300;
				// var ty = -1 * (this.y-1) * 300 - 8;
				draw_circle(this.x, this.y, this.r, this.color);
			}
		}

		destroy(index) {
			// Set radius to zero to open up more potential respawn points
			this.r = 0;
			this.x = 0;
			this.y = 0;
			this.alive = false;
			bacRemaining--;

			// Destroy any other bacteria being consumed
			for(i in this.consuming) {
				this.consuming[i].destroy(bacArr.indexOf(this.consuming[i]));
			}

			// Remove destroyed bacteria from any other Bacteria.consuming arrays
			for(i in bacArr) {
				if(bacArr[i].consuming.indexOf(this) != -1) {
					bacArr[i].consuming.splice(bacArr[i].consuming.indexOf(this), 1);
				}
			}

			// Reset array for this bacteria
			this.consuming = [];

			// Remove destroyed bacteria from the bacteria array in order to spawn new ones
			bacArr.splice(index,1);

			// Spawn new bacteria
			if(bacRemaining >= totBac) {
				bacArr.push(new Bacteria(spawnedBac));
				bacArr[totBac-1].spawn();
			}
		}

		// Get random values for variables determining x and y coordinates
		getNewRandomTrigData() {
			this.angle = Math.random();
			this.spawnRadX = randomSign(0.8);
			this.spawnRadY = randomSign(0.8);
			if(Math.random() >= 0.5) {
				this.trig = "sin";
			} else {
				this.trig = "cos";
			}
		}

		getCircPoints() {
			var tempX, tempY;
			// Allows for posibility to spawn along any point of the circumference
			if (this.trig == "sin") {
				this.x = this.spawnRadX*Math.sin(this.angle);
				this.y = this.spawnRadY*Math.cos(this.angle);
			} else {
				this.x = this.spawnRadX*Math.cos(this.angle);
				this.y = this.spawnRadY*Math.sin(this.angle);
			}
		}
	} // End of Bacteria class

	// Set radius and size for game-circle
	var r=0.8;
	var i=0.5;

	// Radius for bacteria
	var size=0.06;

	// Variables for Bacteria data
	var totBac = 10;
	var bacArr = [];
	var rAngle = 0;
	var tempXY = [];

	// Create and push new Bacteria objects into bacArr, then spawn each Bacteria
	for(var i = 0; i<totBac; i++){
		bacArr.push(new Bacteria(spawnedBac));
		bacArr[i].spawn();
	}

	function winCondition(){
		 if(lives > 0 && bacRemaining <= 0) {
			ctx.fillText("You win!", 300, 300);
		 	return true;
		 }
		return false;
	}

	function loseCondition(){
		if(lives<=0) {
			ctx.fillText("Game over", 300, 300);
			ctx.font = "40px Verdana";
			ctx.fillText("You lose...", 310, 355);
			return true;
		}
		return false;
	}

	var timer = setInterval(function(){
		// Updates the score span element in the html
		document.getElementById('scoreDisplay').innerHTML=score;
		document.getElementById('bacRemaining').innerHTML=bacRemaining;
		document.getElementById('lives').innerHTML=lives;
		timer++;

		if(!winCondition() && lives > 0) {
			for (let i in bacArr) {
					bacArr[i].update();

					if (loseCondition()) {
						bacRemaining = 0;
						break;
					}
				}
			}

		// Draw the game surface circle
		draw_circle(0,0,0.8,[0.05, 0.1, 0.05, 0.5]);

		// Information for FPS
		var thisFrameTime = (thisLoop = new Date) - lastloop;
		frameTime += (thisFrameTime - frameTime) / filterStrength;
		lastloop = thisLoop;

	}, 1000/60);

	// Displays the FPS to the fps span within the html
	var fpsOut = document.getElementById("fps");
	setInterval(function(){
		fpsOut.innerHTML = (1000/frameTime).toFixed(1) + "fps";
	}, 1000);
}
