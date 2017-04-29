#version 300 es
precision highp float;

in vec3 v_pos;
in vec2 v_uv;
in vec3 v_n;
in vec3 v_eye;

uniform sampler2D diffuseTex;

uniform vec3 lightColor;
uniform vec3 lightDir;

out vec4 fragColor;

void main() {
	vec3 n = normalize(v_n);
	vec3 r = normalize(-reflect(normalize(v_eye), n));
	
	float d = max(dot(lightDir,n),0.);
	float s = pow(max(dot(lightDir,r),0.),30.);
	
	vec4 tex = texture(diffuseTex, v_uv);
	fragColor.xyz = tex.xyz * (lightColor * d) + (lightColor * s);
	fragColor.w = tex.w;
}