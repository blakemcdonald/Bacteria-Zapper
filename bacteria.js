/*
  Bacteria-Zapper
  Panteli Marinis - 0571213
  Blake McDonald - 0575698
  COMP-4471-Computer Graphics
  Lakehead University
*/

function draw_circle(x,y,r,color) {
/*======= Creating a canvas variable =========*/

	var canvas = document.getElementById('myCanvas');
	var gl = canvas.getContext('experimental-webgl');

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
	//If the distance of your click is less than or equal to the position

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
}// end function draw_circle

//Randomly sets the passed number to a negative or positive, returns the new(or same) number
function randomSign(n){
	if(Math.random() >= 0.5){
		n = n*-1;
	}
	return n;
}

class Bacteria {
	constructor(x,y,r,id) {
		this.r = r;
		this.x = x;
		this.y = y;
		this.id = id;
	}

	setSize(r) {
		this.r = r;
	}

	increaseSize(r) {
		this.r += r;
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
var tempX = 0;
var tempY = 0;

//Create and push bacteria objects into an array
for(var i = 0; i<totBac; i++){

	//Set a random angle for the x and y to be calculated with sin and cos
	rAngle = Math.random();

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
		tempX = randomSign(r)*Math.sin(rAngle);
		tempY = randomSign(r)*Math.cos(rAngle);
	} else {
		tempX = randomSign(r)*Math.cos(rAngle);
		tempY = randomSign(r)*Math.sin(rAngle);
	}

	//Create and then push a Bacteria object into bacArr
	bacArr.push(new Bacteria(tempX, tempY, 0.1, i));
}

var timer = setInterval(function(){

	document.getElementById('timerDisplay').innerHTML=timer;

	timer++;

	//Loop through all bacteria objects, use their data to draw to canvas
	//Increase the size of each bacteria by 0.005 each tick
	for (let i in bacArr) {
		draw_circle(bacArr[i].x,bacArr[i].y,bacArr[i].r,'0.5, 0, 0, 0.5');
		bacArr[i].increaseSize(0.005);
	}

	//For now, just reset timer and bacteria size after 20 seconds
	if(timer > 20) {
		timer=0;
		for (let i in bacArr) {
			bacArr[i].setSize(0.1);
		}
	}

	// Draw the game surface disk
	draw_circle(0,0,0.8,'0.0, 0.5, 0.0, 0.5');
} ,	600); // 1000 = 1s, 600= slightly faster
