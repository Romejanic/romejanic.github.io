#version 300 es
precision highp float;

layout(location = 0) in vec3 vertex;
layout(location = 1) in vec2 texCoords;
layout(location = 2) in vec3 normal;

uniform mat4 projMat;
uniform mat4 viewMat;
uniform mat4 modelMat;

out vec3 v_pos;
out vec2 v_uv;
out vec3 v_n;

void main() {
	vec4 worldPos = modelMat * vec4(vertex, 1.);
	gl_Position = projMat * viewMat * worldPos;
	
	v_pos = worldPos.xyz;
	v_uv = texCoords;
	v_n = (modelMat * vec4(normal, 0.)).xyz;
}