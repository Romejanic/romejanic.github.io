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
			if(val.clipDistance && val.clipDistance > -1 &&
				vec3.distance(camera.clipPosition ? camera.clipPosition : camera.position, val.position) > val.clipDistance) {
				return;
			}
			val.model.shader.bind();
			camera.applyToShader(val.model.shader);
			sun.applyToShader(val.model.shader);
			val.model.shader.setMat4("modelMat", val.modelMat);
			if(val.modelTextures) {
				var texUnit = 0;
				val.modelTextures.forEach(function(tex){
					val.model.shader.setInt(tex.uniformName, texUnit);
					gl.activeTexture(gl.TEXTURE0 + texUnit);
					gl.bindTexture(gl.TEXTURE_2D, tex);
					texUnit++;
				});
			}
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

Light.prototype.applyToShader = function(shader) {
	shader.setVec3("lightColor", this.color);
	shader.setVec3("lightDir", vec3.normalize(vec3.create(), this.direction));
}