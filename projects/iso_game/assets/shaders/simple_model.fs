#version 300 es
precision highp float;

in vec3 v_pos;
in vec2 v_uv;
in vec3 v_n;
in vec3 v_eye;
in vec3 v_sc;

uniform sampler2D diffuseTex;

uniform vec3 lightColor;
uniform vec3 lightDir;
uniform sampler2D shadowmap;

out vec4 fragColor;

void main() {
	vec3 n = normalize(v_n);
	vec3 r = normalize(-reflect(normalize(v_eye), n));
	
	float shadow = 1.;
	if(texture(shadowmap, v_sc.xy).r < (v_sc.z-.003)) {
		shadow = 0.;
	}
	
	float d = max(dot(lightDir,n)*shadow,.15);
	float s = pow(max(dot(lightDir,r)*shadow,0.),30.);
	
	vec4 tex = texture(diffuseTex, v_uv);
	fragColor.xyz = tex.xyz * (lightColor * d) + (lightColor * s);
	fragColor.w = tex.w;
}