
// panteli marinis - 0571213
// bacteria game

function draw_circle(x,y,r,color) {
/*======= Creating a canvas =========*/

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

	//document.getElementById("time").value = time;
	//time=time+1;
	//t = setTimeout(timedCount, 1000);
	/*function timer()
	{
		var sec=0;
		var timer = setInterval(function(){
			document.getElementById('timerDisplay').innerHTML='00:'+sec;
			sec++;
		},1000);
		
	}*/
}// end function draw_circle

// set radius, angle, seconds.
var r=0.8;
var i=0.5;
var size=0.1;
var timer = setInterval(function(){
		
	document.getElementById('timerDisplay').innerHTML=timer;
	timer++;
	// use a for loop eventually 
	if (timer >=5){draw_circle(-r*Math.cos(i),r*Math.sin(i),size,'0.5, 0, 0, 0.5');size=size+0.002;} // red
	if (timer >= 10){draw_circle(-r*Math.sin(i),r*Math.cos(i),size,'2, 2, 0, 0.5');} //yellow
	if (timer >= 15){draw_circle(r*Math.sin(i),r*Math.cos(i),size,'0, 0, 0.5, 0.5');} //blue
	if (timer >= 20){draw_circle(r*Math.cos(i),r*Math.sin(i),size,'0, 1, 0.5, 0.5');} // teal
	if (timer >= 22){draw_circle(r*Math.cos(i),-r*Math.sin(i),size,'1, 0, 0.5, 0.5');} // purpleish
	if (timer >= 25){draw_circle(r*Math.sin(i),-r*Math.cos(i),size,'0.9, 0.18, 1.42, 0.5');}// pinkish
	if (timer >= 30){draw_circle(-r*Math.sin(i),-r*Math.cos(i),size,'0.5, 0.2, 0.1, 0.5');} // orange
	if (timer >= 31){draw_circle(-r*Math.cos(i),-r*Math.sin(i),size,'0, 0.2, 0.1, 0.5');} //green

	if (timer >= 33){draw_circle(r*Math.sin(0),r*Math.cos(0),size,'0.3, 0, 0, 0.5');} // 12
	if (timer >= 34){draw_circle(r*Math.cos(0),-r*Math.sin(0),size,'0.4, 0.3, 0, 0.5');} // 3
	if (timer >= 35){draw_circle(-r*Math.sin(0),-r*Math.cos(0),size,'0.2, 0, 0.5, 0.5');} // 6
	if (timer >= 36){draw_circle(-r*Math.cos(0),r*Math.sin(0),size,'0, 0.2, 0.3, 0.5');} // 9
	
	if (timer>=40){timer=0;}
	
	// drawing disk
	draw_circle(0,0,0.8,'0.0, 0.5, 0.0, 0.5');
} ,	600); // 1000 = 1s, 600= slightly faster 





/*
	// drawing bacteria (angles)
	draw_circle(-r*Math.cos(i),r*Math.sin(i),0.1,'0.5, 0, 0, 0.5'); // red
	draw_circle(-r*Math.sin(i),r*Math.cos(i),0.1,'2, 2, 0, 0.5'); //yellow
	draw_circle(r*Math.cos(i),r*Math.sin(i),0.1,'0, 0, 0.5, 0.5'); //teal
	draw_circle(r*Math.sin(i),r*Math.cos(i),0.1,'0, 1, 0.5, 0.5'); // light blue
	draw_circle(r*Math.cos(i),-r*Math.sin(i),0.1,'1, 0, 0.5, 0.5'); // purpleish
	draw_circle(r*Math.sin(i),-r*Math.cos(i),0.1,'0.9, 0.18, 1.42, 0.5'); // pinkish
	draw_circle(-r*Math.cos(i),-r*Math.sin(i),0.1,'0.5, 0.2, 0.1, 0.5'); // orange
	draw_circle(-r*Math.sin(i),-r*Math.cos(i),0.1,'0, 0.2, 0.1, 0.5'); //green
}// Drawing bacteria on x,y axis
if (sec >=20){
	draw_circle(r*Math.sin(0),r*Math.cos(0),0.1,'0.3, 0, 0, 0.5'); // 12
	draw_circle(r*Math.cos(0),-r*Math.sin(0),0.1,'0.4, 0.3, 0, 0.5'); // 3
	draw_circle(-r*Math.sin(0),-r*Math.cos(0),0.1,'0.2, 0, 0.5, 0.5'); // 6
	draw_circle(-r*Math.cos(0),r*Math.sin(0),0.1,'0, 0.2, 0.3, 0.5'); // 9
} 
*/
