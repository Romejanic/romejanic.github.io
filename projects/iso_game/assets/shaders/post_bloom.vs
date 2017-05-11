#version 300 es
precision highp float;

layout(location = 0) in vec2 vertex;
layout(location = 1) in vec2 texCoords;

out vec2 uv;

void main() {
	gl_Position = vec4(vertex, 0., 1.);
	uv = texCoords;
}