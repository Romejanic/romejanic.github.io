function Scene() {
	this.objects = new Array();
}

Scene.prototype.addObject = function(object) {
	if(!object) {
		return;
	}
	this.objects.push(object);
}

Scene.prototype.calculateMatrices = function() {
	this.objects.forEach(function(val){
		if(val.modelMat) {
			val.culled = val.clipDistance && val.clipDistance > -1 &&
			vec3.distance(camera.clipPosition ? camera.clipPosition : camera.position, val.position) > val.clipDistance;
			if(val.culled) {
				return;
			}
			mat4.identity(val.modelMat);
			mat4.translate(val.modelMat, val.modelMat, val.position);
			mat4.rotateDegrees(val.modelMat, val.modelMat, val.rotation);
			mat4.scale(val.modelMat, val.modelMat, val.scale);
		}
	});
};

Scene.prototype.render = function(camera) {
	this.objects.forEach(function(val){
		if(val.model) {
			if(val.culled) {
				return;
			}
			if(!sun.drawingShadows) {
				val.model.shader.bind();
				camera.applyToShader(val.model.shader);
				sun.applyToShader(val.model.shader);
				val.model.shader.setMat4("modelMat", val.modelMat);
			} else {
				shadowShader.setMat4("modelMat", val.modelMat);
			}
			if(val.modelTextures && !sun.drawingShadows) {
				var texUnit = 0;
				val.modelTextures.forEach(function(tex){
					val.model.shader.setInt(tex.uniformName, texUnit);
					gl.activeTexture(gl.TEXTURE0 + texUnit);
					gl.bindTexture(gl.TEXTURE_2D, tex);
					texUnit++;
				});
			}
			val.model.overrideShader = sun.drawingShadows;
			val.model.render();
		}
	});
};

function GameObject() {
	this.position = [0.0, 0.0, 0.0];
	this.rotation = [0.0, 0.0, 0.0];
	this.scale    = [1.0, 1.0, 1.0];
}

GameObject.prototype.setModel = function(model) {
	if(!this.model) {
		this.modelMat = mat4.create();
	}
	if(!this.clipDistance) {
		this.clipDistance = 50.0;
		this.culled = false;
	}
	this.model = model;
};

function Camera() {
	this.position = [0, 0, 0];
	this.rotation = [0, 0, 0];
	
	this.orthoScale = 10.0;
}

Camera.prototype.calculateMatrices = function(width, height) {
	if(!this.projMat) {
		this.projMat = mat4.create();
	}
	if(!this.viewMat) {
		this.viewMat = mat4.create();
	}
	
	var viewAspect = width / height;
	mat4.ortho(this.projMat, -this.orthoScale * viewAspect, this.orthoScale * viewAspect, -this.orthoScale, this.orthoScale, -1000, 1000);
	//mat4.perspective(this.projMat, glMatrix.toRadian(70.0), viewAspect, 0.1, 1000.0);
	
	mat4.identity(this.viewMat);
	mat4.rotateDegrees(this.viewMat, this.viewMat, vec3.negate(vec3.create(), this.rotation));
	mat4.translate(this.viewMat, this.viewMat, vec3.negate(vec3.create(), this.position));
};

Camera.prototype.applyToShader = function(shader) {
	if(this.projMat) shader.setMat4("projMat", this.projMat);
	if(this.viewMat) shader.setMat4("viewMat", this.viewMat);
	shader.setVec3("cameraPos", this.position);
};

function Light(color, direction) {
	this.color = color;
	this.direction = direction;
}

Light.prototype.initShadowmap = function(gl) {
	this.shadowFBO = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowFBO);
	
	this.shadowRes = 2048;
	this.shadowDst = 50;
	
	this.shadowTex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, this.shadowTex);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, this.shadowRes, this.shadowRes, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.shadowTex, 0);
	
	gl.drawBuffers([gl.NONE]);
	var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
	
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	
	if(status != gl.FRAMEBUFFER_COMPLETE) {
		console.error("Shadowmap framebuffer is incomplete!");
		gl.deleteFramebuffer(this.shadowFBO);
		gl.deleteTexture(this.shadowTex);
		
		return;
	}
	
	this.shadowProj = mat4.create();
	this.shadowView = mat4.create();
	this.hasShadowmap = true;
	this.drawingShadows = false;
};

Light.prototype.calculateMatrices = function(camera) {
	if(!this.hasShadowmap) {
		return;
	}
	mat4.ortho(this.shadowProj, -this.shadowDst, this.shadowDst, -this.shadowDst, this.shadowDst, -75, 75);
	
	var shadowPos = [camera.position[0], 0, camera.position[2]];
	var shadowDir = vec3.normalize(vec3.create(), this.direction);
	mat4.lookAt(this.shadowView, vec3.add(vec3.create(), shadowPos, shadowDir), shadowPos, [0, 1, 0]);
};

Light.prototype.applyToShader = function(shader) {
	if(!this.drawingShadows) {
		shader.setVec3("lightColor", this.color);
		shader.setVec3("lightDir", vec3.normalize(vec3.create(), this.direction));
	}
	if(this.hasShadowmap) {
		shader.setMat4("shadowProj", this.shadowProj);
		shader.setMat4("shadowView", this.shadowView);
		
		if(!this.drawingShadows) {
			shader.setInt("shadowmap", 5);
			gl.activeTexture(gl.TEXTURE5);
			gl.bindTexture(gl.TEXTURE_2D, this.shadowTex);
		}
	}
}