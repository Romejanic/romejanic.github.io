#version 300 es
precision highp float;

in vec3 v_pos;
in vec2 v_uv;

out vec4 fragColor;

const vec3 lightDir = normalize(vec3(45.,30.,45.));

void main() {
	vec3 n = normalize(-cross(dFdy(v_pos), dFdx(v_pos)));
	
	float d = max(dot(lightDir,n),.15);
	fragColor.xyz = vec3(.2,1.,.2) * d;
	fragColor.w = 1.;
}