#version 300 es
precision highp float;

in vec3 v_pos;
flat in vec3 v_n;
in vec2 v_uv;
in vec3 v_sc;

uniform vec3 lightColor;
uniform vec3 lightDir;
uniform sampler2D shadowmap;

out vec4 fragColor;

void main() {
	//vec3 n = normalize(-cross(dFdy(v_pos), dFdx(v_pos)));
	vec3 n = normalize(v_n);
	
	float shadow = 1.;
	if(texture(shadowmap, v_sc.xy).r < (v_sc.z-.01)) {
		shadow = 0.;
	}
	
	float d = max(dot(lightDir,n)*shadow,.15);
	fragColor.xyz = vec3(.2,1.,.2) * (lightColor * d);
	fragColor.w = 1.;
}