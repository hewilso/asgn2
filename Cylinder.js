class Cylinder {
    constructor() {
        this.type = 'cylinder';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.segments = 34; // Number of segments to approximate circle
        this.radius = 0.25; // Radius of cylinder
        this.height = 1.0; // Height of cylinder
    }

    render() {
        var rgba = this.color;
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Draw bottom circle
        for (let i = 0; i < this.segments; i++) {
            const theta1 = (i / this.segments) * 2 * Math.PI;
            const theta2 = ((i + 1) / this.segments) * 2 * Math.PI;

            const x1 = this.radius * Math.cos(theta1);
            const y1 = this.radius * Math.sin(theta1);
            const x2 = this.radius * Math.cos(theta2);
            const y2 = this.radius * Math.sin(theta2);

            drawTriangle3D([0, 0, 0, x1, y1, 0, x2, y2, 0]);
        }

        // Draw top circle (slightly darker)
        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
        for (let i = 0; i < this.segments; i++) {
            const theta1 = (i / this.segments) * 2 * Math.PI;
            const theta2 = ((i + 1) / this.segments) * 2 * Math.PI;

            const x1 = this.radius * Math.cos(theta1);
            const y1 = this.radius * Math.sin(theta1);
            const x2 = this.radius * Math.cos(theta2);
            const y2 = this.radius * Math.sin(theta2);

            drawTriangle3D([0, 0, this.height, x1, y1, this.height, x2, y2, this.height]);
        }

        // Draw side rectangles (as triangles)
        gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
        for (let i = 0; i < this.segments; i++) {
            const theta1 = (i / this.segments) * 2 * Math.PI;
            const theta2 = ((i + 1) / this.segments) * 2 * Math.PI;
            const x1 = this.radius * Math.cos(theta1);
            const y1 = this.radius * Math.sin(theta1);
            const x2 = this.radius * Math.cos(theta2);
            const y2 = this.radius * Math.sin(theta2);

            // First triangle of rectangle
            drawTriangle3D([x1, y1, 0, x2, y2, 0, x1, y1, this.height]);
            // Second triangle of rectangle
            drawTriangle3D([x2, y2, 0, x2, y2, this.height, x1, y1, this.height]);
        }
    }
}