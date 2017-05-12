#version 300 es
precision highp float;

in vec2 uv;

uniform sampler2D color;

out vec4 fragColor;

void main() {
	fragColor = texture(color, uv);
}