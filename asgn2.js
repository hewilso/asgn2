

var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`;


// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;


let canvas, gl, a_Position, u_fragColor, u_Size, u_ModelMatrix, u_GlobalRotateMatrix; // Global variables


function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}


function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Set an initial value for the matrix to identify
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// animation + shape global variables
let g_globalAngle = 0;
let g_pawAngle = 0;
let g_thighAngle = 0;
let g_noseAngle = 0;

let g_tailAngle = 0;
let g_tailAnimation = false;
let g_animation = false;
let g_thighAnimation = false;
let g_pawAnimation = false;





// Set up actions for the HTMl UI elements
function addActionsForHTMLUI() {

  // Animation off and on buttons
  document.getElementById('pawOnButton').onclick = function () { g_pawAnimation = true; };
  document.getElementById('pawOffButton').onclick = function () { g_pawAnimation = false; };

  document.getElementById('thighOnButton').onclick = function () { g_thighAnimation = true; };
  document.getElementById('thighOffButton').onclick = function () { g_thighAnimation = false; };

  document.getElementById('animationTailOffButton').onclick = function () { g_tailAnimation = false; };
  document.getElementById('animationTailOnButton').onclick = function () { g_tailAnimation = true; };

  // Joint sliders and camera slider
  document.getElementById('pawSlide').addEventListener('mousemove', function () { g_pawAngle = this.value;  renderScene(); });
  document.getElementById('thighSlide').addEventListener('mousemove', function () { g_thighAngle = this.value; renderScene(); });
  document.getElementById('tailSlide').addEventListener('mousemove', function () { g_tailAngle = this.value; renderScene(); });
  document.getElementById('angleSlide').addEventListener('mousemove', function () { g_globalAngle = this.value; renderScene(); });

}


function main() {
  // Set up canvas and gl variables
  setupWebGL();

  // Set up GLSL shader progress and other GLSL variables 
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHTMLUI();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Render
  renderScene();
  requestAnimationFrame(tick);
}


var g_startTime = performance.now();
var g_seconds = performance.now() / 1000.0 - g_startTime;

// the top level design of this was provided by claude ai. 
class FPS {
  constructor() {
      this.startTime = performance.now();
      this.frameCount = 0;
      this.lastLogTime = this.startTime;
  }
  update() {
      this.frameCount++;
      const currentTime = performance.now();
            if (currentTime - this.lastLogTime >= 1000) {
          const fps = this.frameCount * 1000 / (currentTime - this.lastLogTime);
                    sendTextToHTML(
              `ms: ${Math.floor(currentTime - this.startTime)} ` + 
              `fps: ${Math.floor(fps)}`, 
              "numdot"
          );
          this.frameCount = 0;
          this.lastLogTime = currentTime;
      }
  }
}
const fpsMeter = new FPS();

// Usage
// Called by browser repeatedly whenever its time
function tick() {
  
  updateAnimationAngles();
  g_seconds = performance.now() / 1000.0 - g_startTime;

  // Draw everything
  renderScene();
  fpsMeter.update();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}


// Update the angles of everything if currently animated
function updateAnimationAngles() {
  if (g_pawAnimation === true) {
    g_pawAngle = 10*Math.sin(g_seconds);
  }
  if (g_thighAnimation === true) {
  
    g_thighAngle = 10*Math.sin(g_seconds);
    g_pawAngle = g_thighAngle;
  }
  if (g_thighAnimation === false){}
 
  if (g_tailAnimation === true) {
    g_tailAngle = (60 * Math.cos(g_seconds)); 
  }
}


var g_shapesList = [];

function renderScene() {
  // Check the time at the start of the function
  var startTime = performance.now();

  // Pass the matrix to u_ModelMatrix attribute
  // Perform rendering
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  renderBody();

}

function renderLeg(x, y, z, thighColor, pawColor, thighAngle, pawAngle) {
  // Render thigh
  var thigh = new Cube();
  thigh.color = thighColor;
  thigh.matrix.setTranslate(x, y, z);
  thigh.matrix.rotate(-thighAngle, 0, 0);
  thigh.matrix.scale(0.5, -0.5, 0.5);
  var thighCoordinatesMat = new Matrix4(thigh.matrix);
  thigh.matrix.scale(0.25, 0.75, 0.25);
  thigh.matrix.translate(-0.5, 0, 0);
  thigh.render();

  // Render paw
  var paw = new Cube();
  paw.color = pawColor;
  paw.matrix = thighCoordinatesMat;
  paw.matrix.translate(0, 0.65, 0);
  paw.matrix.rotate(-pawAngle, 0, 0, 1);
  paw.matrix.scale(0.20, 0.25, 0.20);
  paw.matrix.translate(-0.5, 0.45, -0.001);
  paw.render();
}


function renderBody() {


  // Render body
  var body = new Cube();
  body.color = [0.95, 0.98, 0.98, 1];
  body.matrix.translate(-0.25, -0.025, 0.0);
  body.matrix.rotate(0, 1, 0, 0);
  body.matrix.scale(0.7, 0.5, 0.7);
  body.render();

  // Render legs
  renderLeg(-0.12, 0, 0.0, [0.95, 0.98, 0.98, 1], [0.66, 0.66, 0.66, 1], g_thighAngle, g_pawAngle);
  renderLeg(-0.12, 0, 0.5, [0.95, 0.98, 0.98, 1], [0.66, 0.66, 0.66, 1], g_thighAngle, g_pawAngle);
  renderLeg(0.25, 0, 0.0, [0.95, 0.98, 0.98, 1], [0.66, 0.66, 0.66, 1], g_thighAngle, g_pawAngle);
  renderLeg(0.25, 0, 0.5, [0.95, 0.98, 0.98, 1], [0.66, 0.66, 0.66, 1], g_thighAngle, g_pawAngle);

  // Render head
  var head = new Cube();
  head.color = [0.83, 0.83, 0.83, 1];
  head.matrix.translate(-0.5, 0.5, 0.15);
  head.matrix.scale(0.25, 0.25, 0.25);
  head.render();

  // Render tail
  var tail = new Cube();
  tail.color = [0.66, 0.66, 0.66, 1];
  tail.matrix.translate(0.45, 0.5, 0.15);
  tail.matrix.rotate(-0.75, 1, 0, 0);
  tail.matrix.rotate(-g_tailAngle, 0, 0);
  tail.matrix.scale(0.2, 0.4, 0.2);
  tail.render();

  var nose = new Cylinder();
  
  //saddlebrown smth smth
  nose.color = [0.54, 0.27, 0.074, 1];
  //test.matrix.rotate(90, 0, 1, 0);
  nose.matrix.translate(-0.65, 0.65, 0.27);
  nose.matrix.scale(0.15, 0.15, 0.15);
  nose.matrix.rotate(90, 0, 1, 0);
  nose.render();
}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get: " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}