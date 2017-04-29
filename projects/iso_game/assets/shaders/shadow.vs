#version 300 es
precision highp float;

layout(location = 0) in vec3 vertex;

uniform mat4 shadowProj;
uniform mat4 shadowView;
uniform mat4 modelMat;

void main() {
	gl_Position = shadowProj * shadowView * modelMat * vec4(vertex, 1.);
}