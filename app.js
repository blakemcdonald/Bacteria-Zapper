var vertexShaderCode = [
'attribute vec4 vertPosition;',
'',
'void main() {',
'  gl_Position = vertPosition;',
'  gl_PointSize = 10.0;',
'}'
].join('\n');

var fragmentShaderCode = [
  'precision mediump float;',
  'uniform vec4 fColor;',
  '',
  'void main()',
  '{',
  ' gl_FragColor = fColor;',
  '}'
].join('\n');

var main = function() {

  //Retrieve canvas
  var canvas = document.getElementById('game-surface');

  //Get rendering context for webgl
  var gl = canvas.getContext('webgl');

  //Error Check for getting context
  if(!gl) {
    console.log("WebGL not supported, falling back on experimental-WebGL");
    gl = canvas.getContext('experimental-webgl');
  }
  //I don't know what browser you'd be using to get this error, I don't even known if the alert would go through on such a browser!
  if(!gl) {
    alert('Your browser does not support WebGL');
  }

  console.log("There's a lot to get done!");
}
