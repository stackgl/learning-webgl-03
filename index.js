var canvas   = document.body.appendChild(document.createElement('canvas'))
var clear    = require('gl-clear')({ color: [0, 0, 0, 1] })
var gl       = require('gl-context')(canvas, render)
var now      = require('right-now')
var glBuffer = require('gl-buffer')
var mat4     = require('gl-mat4')
var glslify  = require('glslify')

var shader = glslify({
  frag: './shader.frag',
  vert: './shader.vert'
})(gl)

shader.attributes.aPosition.location = 0
shader.attributes.aColor.location = 1

var triangleMatrix   = mat4.create()
var squareMatrix     = mat4.create()
var projectionMatrix = mat4.create()

var triangle = {
  vertices: glBuffer(gl, new Float32Array([
    +0.0, +1.0, +0.0,
    -1.0, -1.0, +0.0,
    +1.0, -1.0, +0.0
  ])),
  colors: glBuffer(gl, new Float32Array([
    +1.0, +0.0, +0.0,
    +0.0, +1.0, +0.0,
    +0.0, +0.0, +1.0
  ])),
  length: 3
}

var square = {
  vertices: glBuffer(gl, new Float32Array([
    +1.0, +1.0, +0.0,
    -1.0, +1.0, +0.0,
    +1.0, -1.0, +0.0,
    -1.0, -1.0, +0.0
  ])),
  colors: glBuffer(gl, new Float32Array([
    +0.5, +0.5, +1.0,
    +0.5, +0.5, +1.0,
    +0.5, +0.5, +1.0,
    +0.5, +0.5, +1.0
  ])),
  length: 4
}

var currTime = now()
var lastTime = now()
var rSquare  = 0.5
var rTri     = 0.5
var elapsed  = 0

function animate() {
  currTime = now()
  elapsed  = currTime - lastTime

  lastTime = currTime
  rTri += (90 * elapsed) / 15000
  rSquare += (75 * elapsed) / 15000
}

function render() {
  var width = gl.drawingBufferWidth
  var height = gl.drawingBufferHeight

  animate()

  // Clear the screen and set the viewport before
  // drawing anything
  clear(gl)
  gl.viewport(0, 0, width, height)

  // Calculate projection matrix
  mat4.perspective(projectionMatrix, Math.PI / 4, width / height, 0.1, 100)
  // Calculate triangle's modelView matrix
  mat4.identity(triangleMatrix)
  mat4.translate(triangleMatrix, triangleMatrix, [-1.5, 0, -7])
  mat4.rotate(triangleMatrix, triangleMatrix, rTri, [0, 1, 0])
  // Calculate squares's modelView matrix
  mat4.identity(squareMatrix)
  mat4.translate(squareMatrix, squareMatrix, [1.5, 0, -7])
  mat4.rotate(squareMatrix, squareMatrix, rSquare, [1, 0, 0])

  // Bind the shader
  shader.bind()
  shader.uniforms.uProjection = projectionMatrix

  // Draw the triangle
  shader.uniforms.uModelView = triangleMatrix
  triangle.vertices.bind()
  shader.attributes.aPosition.pointer()
  triangle.colors.bind()
  shader.attributes.aColor.pointer()
  gl.drawArrays(gl.TRIANGLES, 0, triangle.length)

  // Draw the square
  shader.uniforms.uModelView = squareMatrix
  square.vertices.bind()
  shader.attributes.aPosition.pointer()
  square.colors.bind()
  shader.attributes.aColor.pointer()
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}

// Resize the canvas to fit the screen
window.addEventListener('resize'
  , require('canvas-fit')(canvas)
  , false
)
