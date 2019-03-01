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
	var clickedPoints = [];
	var particles = [];
	var reduceVariable = 90;
	// Set radius and size for game-circle
	var r=0.8;
	var i=0.5;
	// Variables for Bacteria data
	var totBac = 10;
	var bacArr = [];
	var rAngle = 0;
	var tempXY = [];

	// Creating a WebGL Context Canvas
	var canvas = document.getElementById('gameSurface');
	var gl = canvas.getContext('webgl');
	// Creating a 2D Canvas for displaying text
	var textCanvas = document.getElementById('text');
	var ctx = textCanvas.getContext('2d')
	// Creating a 2D Canvas for particles
	var particlesCanvas = document.getElementById('particles');
	var pCtx = particlesCanvas.getContext('2d')

	// Set font for text Canvas
	ctx.font = "20px Verdana";
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

	function normalize(x1, y1, x2, y2) {
		let m = distance(x1, y1, x2, y2);
		return [(x2-x1)/m, (y2-y1)/m];
	}

	function createExplosionAtBacteria(bac){
		// Convert Bacteria(WebGL) data into canvas data
		let bacX = (bac.x + 2/75 + 1) * 300;
		let bacY = -1 * (bac.y-1) * 300 - 8;
		let r = (((bac.x + bac.r) + 2/75 + 1) * 300) - bacX;
		let num = 0;
		let pColor = bac.color;

		// Loops through the bacteria's x and y and spawn particles there
		for(let x = 0; x < r; x++){
			for(let y = 0; y < r; y++){
				//Helps decrease amount of particles
				if(num % reduceVariable == 0) {

					let ppX = bacX + x;
					let ppY = bacY + y;
					let npX = bacX - x;
					let npY = bacY - y;

					// Create a corresponding particle for each "quandrant" of the bacteria
					let particle = new Particle(ppX, ppY, 5, bac.color);
					particles.push(particle);
					particle = new Particle(npX, npY, 5, bac.color);
					particles.push(particle);
					particle = new Particle(ppX, npY, 5, bac.color);
					particles.push(particle);
					particle = new Particle(npX, ppY, 5, bac.color);
					particles.push(particle);

				}
				num++;
			}
		}
	}
	// Assign function to mouse click
	canvas.onmousedown = function(e, canvas){click(e, gameSurface);};

	// Function click
	function click(e, canvas) {
		let x = e.clientX;
		let y = e.clientY;
		let start = y;
		let hit = false;
		let ptsInc = 0;
		const rect = e.target.getBoundingClientRect();
		//Convert default canvas coords to webgl vector coords
		x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
		y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

		// Loop through all bacteria and check if you clicked within the radius of any
		// Increase score and destroy the bacteria
		for(let i in bacArr) {
			if(colliding(x, y, 0, bacArr[i].x, bacArr[i].y, bacArr[i].r)){
				ptsInc = Math.round(1/bacArr[i].r);
				createExplosionAtBacteria(bacArr[i]);
 			 	score += ptsInc;
				bacArr[i].destroy(i);
 			 	hit = true;
				clickedPoints.push({
					pts: "+" + ptsInc,
					x: e.clientX,
					y: e.clientY,
					dY: 0,
					color: "rgba(0,200,0,"
				});
			 	// Break ensures you can't click multiple bacteria at once
			 	break;
			 }
		}

		// If you click and don't hit a bacteria, your score is decreased by 20 + the total amount of times you've clicked.
		if(!hit && bacRemaining != 0) {
			missClicks ++;
			clickedPoints.push({
				pts: -20 - missClicks,
				x: e.clientX,
				y: e.clientY,
				dY: 0,
				color: "rgba(255,0,0,"
			});
			score -= (20 + missClicks);
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
						this.r += 0.0003;
					//increase alpha as bacteria grows
					this.color[3] += 0.0003;

					/* Collision Check with consuming assigning,
						 finds which bacteria are colliding and sets the larger one to consume the other */
					for(i in bacArr) {
						//Skip itself
						if(this != bacArr[i]){
							//If either 'this' or bacArr[i] are not in each other's 'consuming' array - continue.
							if(this.consuming.indexOf(bacArr[i]) == -1 && bacArr[i].consuming.indexOf(this) == -1) {
								//If 'this' and bacArr[i] are colliding add it to this bacteria with the larger radius' 'consuming' array
								if(colliding(this.x, this.y, this.r, bacArr[i].x, bacArr[i].y, bacArr[i].r)) {
									if(this.id < bacArr[i].id){
										this.consuming.push(bacArr[i]);
									}
								}
							// Else if bacArr[i] is in this.consuming, have 'this' consume bacArr[i] by moving it inside of 'this' and shrinking it's radius
						} else {
								for(i in this.consuming) {
									// Easier than typing this.consuming[i].* everytime
									let consuming = this.consuming[i];
									// If the consuming bacteria has fully entered the larger bacteria, destroy the consumed
									if(distance(this.x, this.y, consuming.x, consuming.y) <= (this.r - consuming.r) || consuming.r <= 0.0){
										consuming.destroy(bacArr.indexOf(consuming));
									} else {
										// Normalize vector in order to ensure consistent consumption. Specifically to the speed of consumption
										var dVec = normalize(this.x, this.y, consuming.x, consuming.y);
										/* While being consumed, the bacteria will
										move in the direction of the consumer,
										its radius will be shrunk and the consumer's
										will grow */
										consuming.x -= dVec[0]/(1800*consuming.r);
										consuming.y -= dVec[1]/(1800*consuming.r);
										consuming.r -= 0.0025;
										this.r += 0.01*consuming.r;
										//Increase alpha of the bacteria causing it to become darker as it consumes.
										this.color[3] += 0.001;
									}
								}
							}
						}
					}
				}
				// Draw
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

	class Particle {

		constructor(x, y, r, color) {
			this.x = x;
			this.y = y;
			this.r = r + Math.random() * 5;
			// Convert 1.0, 1.0, 1.0 rgb data to 255, 255, 255
			this.color = "rgba(" + Math.round((1*color[0]) * 255) + "," + Math.round((1*color[1]) * 255) + "," + Math.round((1*color[2]) * 255) + "," + Math.random()*0.85 + ")";
			this.speed = {
				x: -1 + Math.random() * 3,
				y: -1 + Math.random() * 3
			}
			this.life = 30 + Math.random() * 10;
			// Will be used to clean out particle array at certain times.
			//this.deltaStart = Date.now();
		}

		draw() {

			// Draw if it hasn't reached it's lifespan or if its not too small
			if(this.life > 0 && this.r > 0) {
				pCtx.beginPath();
				pCtx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
				pCtx.fillStyle = this.color;
				pCtx.fill();

				// Update data
				this.life--;
				this.r -= 0.25;
				this.x += this.speed.x;
				this.y += this.speed.y;
			}
		}
	} // End of Particle Class

	// Create and push new Bacteria objects into bacArr, then spawn each Bacteria
	for(var i = 0; i<totBac; i++){
		bacArr.push(new Bacteria(spawnedBac));
		bacArr[i].spawn();
	}

	function winCondition(){
		 if(lives > 0 && bacRemaining <= 0) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			clickedPoints = [];
			particles = [];
			ctx.fillStyle = "rgba(0, 255, 0, 1.0)";
			ctx.font = "80px Verdana";
			ctx.fillText("You win!", 300, 300);
		 	return true;
		 }
		return false;
	}

	function loseCondition(){
		if(lives<=0) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.font = "80px Verdana";
			ctx.fillStyle = "red";
			ctx.fillText("Game over", 300, 300);
			ctx.font = "40px Verdana";
			ctx.fillText("You lose...", 310, 355);
			return true;
		}
		return false;
	}

	// Game Loop
	function gameLoop() {
		// Updates the score span element in the html
		document.getElementById('scoreDisplay').innerHTML=score;
		document.getElementById('bacRemaining').innerHTML=bacRemaining;
		document.getElementById('lives').innerHTML=lives;

		if(!winCondition() && lives > 0) {
			for (let i in bacArr) {
					bacArr[i].update();
					if (loseCondition()) {
						bacRemaining = 0;
						break;
					}
				}

				// Used for displaying points awarded on clicks
				for(i in clickedPoints) {
					// Variable for change in y position of each point
					clickedPoints[i].dY--;
					// If the point's y has changed by 50, remove the point from the array
					if(clickedPoints[i].dY <= -50){
						clickedPoints.splice(i,1);
					} else {
						// Clear canvas only around specific text
						ctx.clearRect(clickedPoints[i].x - 25, clickedPoints[i].y + clickedPoints[i].dY - 20, clickedPoints[i].x + 20, clickedPoints[i].y + 20);
						// Alpha of the points approaches zero as it reaches its max change in y to simulate a fade out
						ctx.fillStyle = clickedPoints[i].color + (1.0 - (clickedPoints[i].dY * -0.02) + ")");
						// Print the points awarded and move them upwards
						ctx.fillText(clickedPoints[i].pts, clickedPoints[i].x, clickedPoints[i].y + clickedPoints[i].dY);
					}
				}

				// Loop through all particles to draw
				pCtx.clearRect(0, 0, canvas.width, canvas.height);
				for(i in particles) {
					particles[i].draw();
				}
				// Just to ensure the game over text is printed. Need to fix this mess up.
				loseCondition();
			}

		// Draw the game surface circle
		draw_circle(0,0,0.8,[0.05, 0.1, 0.05, 0.5]);
		requestAnimationFrame(gameLoop);
	}
	requestAnimationFrame(gameLoop);
}
