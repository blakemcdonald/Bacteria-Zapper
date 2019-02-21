/*
  Bacteria-Zapper
  Panteli Marinis - 0571213
  Blake McDonald - 0575698
  COMP-4471-Computer Graphics
  Lakehead University
*/

var main = function() {
	//Game's main variables
	var score = 0;
	var numKilledBac = 0;
	var missClicks = 0;
	var winKillAmt = 200;

	//Variables for calculating fps
	var filterStrength = 20;
	var frameTime = 0, lastloop = new Date, thisLoop;

	/*======= Creating a canvas variable =========*/
	var canvas = document.getElementById('myCanvas');
	var gl = canvas.getContext('webgl');

	function draw_circle(x,y,r,color) {

		/*======= Defining and storing the geometry ======*/
		var vertices = []

		// prepare vertices
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

		// Create an empty buffer object
		var vertex_buffer = gl.createBuffer();

		// Bind appropriate array buffer to it
		gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

		// Pass the vertex data to the buffer
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

		 // Unbind the buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

	/*=================== Shaders ====================*/

		// Vertex shader source code
		var vertCode =
			'attribute vec3 coordinates;' +
			'void main(void) {' +
			   ' gl_Position = vec4(coordinates, 1.0);' +
			'}';

		// Create a vertex shader object
		var vertShader = gl.createShader(gl.VERTEX_SHADER);

		// Attach vertex shader source code
		gl.shaderSource(vertShader, vertCode);

		// Compile the vertex shader
		gl.compileShader(vertShader);
		// Fragment shader source code
		var fragCode =
			'void main(void) {' +
			   'gl_FragColor = vec4('+color+');' +
			'}';

		// Create fragment shader object
		var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

		// Attach fragment shader source code
		gl.shaderSource(fragShader, fragCode);

		// Compile the fragmentt shader
		gl.compileShader(fragShader);

		// Create a shader program object to store
		// the combined shader program
		var shaderProgram = gl.createProgram();

		// Attach a vertex shader
		gl.attachShader(shaderProgram, vertShader);

		// Attach a fragment shader
		gl.attachShader(shaderProgram, fragShader);

		// Link both the programs
		gl.linkProgram(shaderProgram);

		// Use the combined shader program object
		gl.useProgram(shaderProgram);

	/*======= Associating shaders to buffer objects ======*/

		// Bind vertex buffer object
		gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

		// Get the attribute location
		var coord = gl.getAttribLocation(shaderProgram, "coordinates");

		// Point an attribute to the currently bound VBO
		gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);

		// Enable the attribute
		gl.enableVertexAttribArray(coord);

	/*============ Drawing the triangle =============*/

		// Clear the canvas
		gl.clearColor(0, 1, 0, 0.9);

		// Enable the depth test
		gl.enable(gl.DEPTH_TEST);

		// Clear the color and depth buffer
		//gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// Set the view port
		gl.viewport(0,0,canvas.width,canvas.height);

		// Draw the triangle 360*3, 3 layers of vertices (disk)
		gl.drawArrays(gl.TRIANGLES, 0, 360*3);

		// POINTS, LINE_STRIP, LINE_LOOP, LINES,
		// TRIANGLE_STRIP,TRIANGLE_FAN, TRIANGLES

	}	// end function draw_circle

	//Returns a random RGBA value
	function randomColor() {
		// times by 0.65 to ensure the bacteria isn't as light as the canvas
		var r = (Math.random() * (0.65)).toFixed(2);
		var g = (Math.random() * (0.65)).toFixed(2);
		var b = (Math.random() * (0.65)).toFixed(2);

		return [r,g,b,0.75];
	}

	function colliding(x1,y1,r1,x2,y2,r2) {
		var xDist = x2-x1;
		var yDist = y2-y1;
		var totDist = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));

		if(totDist - (r1+r2) < 0) {
			return true;
		}

		return false;
	}

	//Function for obtaining an array of [x,y] for points along the 'game- circle'
	function randomCircPoints() {

			//Set a random angle for the x and y to be calculated with sin and cos
			var a = Math.random();
			//Array to return
			var retArr = [];

			/*With a 50% chance to swap which axis calculates with which trig function,
				it ensures that all possible points along the circumference of the 'game-
				circle' have a chance of spawning a bacteria.

				For some reason not all points of the circumference can be calculated
				by always using sine for x and cosine for y. I'm not sure why it happens
				like this, but for now this spaghetti will do.

				The random sign infront of the "r" variable, corresponding to the radius
				of the 'game-circle', furthers the posibility for bacteria to spawn in any
				'quadrant' of the 'game-circle'
			*/
			if (Math.random() >= 0.5) {
				retArr.push(randomSign(r)*Math.sin(a));
				retArr.push(randomSign(r)*Math.cos(a));
			} else {
				retArr.push(randomSign(r)*Math.cos(a));
				retArr.push(randomSign(r)*Math.sin(a));
			}

			return retArr;
	}
	//Assign function to mouse click
	canvas.onmousedown = function(e, canvas){click(e, myCanvas);};

	//Function click
	function click(e, canvas) {
		var x = e.clientX;
		var y = e.clientY;
		var hit = false;
		var rect = e.target.getBoundingClientRect();

		//Convert default canvas coords to webgl vector coords
		x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
		y = (canvas.height/2 - (y - rect.top))/(canvas.height/2)

		//Loop through all bacteria and check if you clicked within the radius of any
		//Increase score and destroy the bacteria
		for(let i in bacArr) {
			if(colliding(x, y, 0, bacArr[i].x, bacArr[i].y, bacArr[i].r)){
				numKilledBac++;
 			 	score = Math.round(score + (1/bacArr[i].r));					//Awards a higher score for clicking the bacteria faster (the smaller the bacteria, the larger the score bonus)
 			 	bacArr[i].destroy();
 			 	hit = true;
			}
		}

		//If you click and don't hit a bacteria, your score is decreased by 20 + the total amount of times you've clicked.
		if(!hit) {
			score -= (20 + missClicks);
			missClicks ++;
		}
	}

	//Randomly sets the passed number to a negative or positive, returns the new(or same) number
	function randomSign(n){
		if(Math.random() >= 0.5){
			n = n*-1;
		}
		return n;
	}

	//Class for storing data about each Bacteria
	class Bacteria {
		constructor(id) {
			this.id = id;
		}

		//Used to increase the size of the bacteria
		increaseSize(r) {
			this.r += r;
		}

		//Sets the alive variable to false to tell the program to not draw the circle
		destroy() {
			//Set radius to zero to open up more potential respawn points
			this.r = 0;
			this.alive = false;
		}

		//Resets the alive/radius variable to true/0.1 and generates a new point for the bacteria to spawn at
		spawn() {
			var tempXY = randomCircPoints();
			var attempt = 0;

				if(this.id != 0) {
					for (var i = 0; i < bacArr.length; i++) {
						//Error check to not break the game if the bacteria cover the whole game surface.
						if(attempt > 500) {
							console.log("No area for new bacteria to spawn");
							break;
						}

						if (colliding(tempXY[0], tempXY[1], 0.1, bacArr[i].x, bacArr[i].y, bacArr[i].r)) {
							tempXY = randomCircPoints();
							attempt++;
							i = -1;
						}
					}
				}
				this.x = tempXY[0];
				this.y = tempXY[1];
				this.r = 0.1;
				this.color = randomColor();
				this.alive = true;
		 }
	}

	// Set radius and size for game-circle
	var r=0.8;
	var i=0.5;

	//Radius for bacteria
	var size=0.1;

	//Variables for Bacteria data
	var totBac = 10;
	var bacArr = [];
	var rAngle = 0;
	var tempXY = [];

	//Create and push new Bacteria objects into bacArr, then spawn each Bacteria
	for(var i = 0; i<totBac; i++){
		bacArr.push(new Bacteria(i));
		bacArr[i].spawn();
	}

	var timer = setInterval(function(){
		//Updates the score span element in the html
		document.getElementById('scoreDisplay').innerHTML=score;

		timer++;

		//Loop through all bacteria objects, use their data to draw to canvas
		//Increase the size of each bacteria by 0.005 each tick
		for (let i in bacArr) {
			if (bacArr[i].alive) {
				draw_circle(bacArr[i].x,bacArr[i].y,bacArr[i].r,bacArr[i].color);
			} else if ( numKilledBac < (winKillAmt-totBac)) {
				bacArr[i].spawn();
			}

			if (score > 400) {
				bacArr[i].increaseSize(0.0005);
			} else if (score > 1000) {
				bacArr[i].increaseSize(0.0008);
			} else if (score > 2000) {
				bacArr[i].increaseSize(0.0014);
			} else {
				bacArr[i].increaseSize(0.0003);
			}
		}

		// Draw the game surface circle
		draw_circle(0,0,0.8,'0.0, 0.5, 0.0, 0.5');

		//Information for FPS
		var thisFrameTime = (thisLoop = new Date) - lastloop;
		frameTime += (thisFrameTime - frameTime) / filterStrength;
		lastloop = thisLoop;

	} ,	1000/60);

	//Displays the FPS to the fps span within the html
	var fpsOut = document.getElementById("fps");
	setInterval(function(){
		//console.log();
		fpsOut.innerHTML = (1000/frameTime).toFixed(1) + "fps";
	},1000);

}
