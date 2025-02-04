class Triangle {
  constructor() {
    this.type = 'point';
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 5.0;
    this.buffer = null;
  }

  render() {
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;

    // Set color once, and check if size or position change
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniform1f(u_Size, size);

    // Draw
    var d = this.size / 200; // delta
    this.drawTriangle([xy[0], xy[1], xy[0] + d, xy[1], xy[0], xy[1] + d]);
  }

  drawTriangle(vertices) {
    var n = 3; // The number of vertices

    // Create and bind the buffer if not created
    if (!this.buffer) {
      this.buffer = gl.createBuffer();
      if (!this.buffer) {
        console.log('Failed to create the buffer object');
        return -1;
      }
    }

    // Bind the buffer object to target and write data into the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // Draw the triangle
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }
}

function drawTriangle3D(vertices) {
  var n = 3; // The number of vertices

  // Create and bind the buffer if not created
  if (!this.buffer) {
    this.buffer = gl.createBuffer();
    if (!this.buffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
  }

  // Bind the buffer object to target and write data into the buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  // Draw the triangle
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

