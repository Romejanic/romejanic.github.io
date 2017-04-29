#version 300 es
precision highp float;

layout(location = 0) in vec3 vertex;
layout(location = 1) in vec2 texCoords;

uniform mat4 projMat;
uniform mat4 viewMat;
uniform mat4 shadowProj;
uniform mat4 shadowView;

out vec3 v_pos;
out vec2 v_uv;
out vec3 v_sc;

void main() {
	vec4 worldPos = vec4(vertex, 1.);
	gl_Position = projMat * viewMat * worldPos;
	
	v_pos = worldPos.xyz;
	v_uv = texCoords;
	
	vec4 shadowCoords = shadowProj * shadowView * worldPos;
	v_sc = (shadowCoords.xyz/shadowCoords.w) * .5 + .5;
}