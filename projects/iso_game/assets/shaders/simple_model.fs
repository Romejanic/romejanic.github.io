#version 300 es
precision highp float;

in vec3 v_pos;
in vec2 v_uv;
in vec3 v_n;

out vec4 fragColor;

void main() {
	vec3 n = normalize(v_n);
	
	fragColor = vec4(n, 1.);
}