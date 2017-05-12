function VAO(gl, vao, elementCount, attribs, shader) {
	this.gl = gl;
	this.vao = vao;
	this.elementCount = elementCount;
	this.attribs = attribs;
	this.shader = shader;
	
	this.overrideShader = false;
}

VAO.prototype.render = function() {
	var gl = this.gl;
	if(!this.overrideShader) {
		this.shader.bind();
	}
	gl.bindVertexArray(this.vao);
	this.attribs.forEach(function(attrib){
		gl.enableVertexAttribArray(attrib);
	});
	gl.drawElements(gl.TRIANGLES, this.elementCount, gl.UNSIGNED_INT, 0);
	this.attribs.forEach(function(attrib){
		gl.disableVertexAttribArray(attrib);
	});
	gl.bindVertexArray(null);
	if(!this.overrideShader) {
		this.shader.unbind();
	}
};

function VAOBuilder(gl) {
	this.gl = gl;
	this.vao = gl.createVertexArray();
	
	this.elementCount = -1;
	this.attribs = new Array();
	this.shader = null;
	
	gl.bindVertexArray(this.vao);
}

VAOBuilder.prototype.addAttribute = function(location, size, data) {
	if(this.attribs.indexOf(location) > -1) {
		console.error("Attribute " + location + " already assigned!");
		return this;
	}
	var gl = this.gl;
	var vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
	this.attribs.push(location);
	return this;
};

VAOBuilder.prototype.addIndices = function(indices) {
	if(this.elementCount > -1) {
		console.error("Indices already assigned!");
		return this;
	}
	var gl = this.gl;
	var vbo = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);
	
	this.elementCount = indices.length;
	return this;
};

VAOBuilder.prototype.addShader = function(shader) {
	if(this.shader) {
		console.error("Shader program already assigned!");
		return;
	}
	this.shader = Shader.loadShaderProgram(this.gl, shader);
	return this;
};

VAOBuilder.prototype.create = function() {
	this.gl.bindVertexArray(null);
	
	if(!this.vao) {
		console.error("Invalid VAO!");
		return null;
	}
	if(this.attribs.length <= 0) {
		console.error("No attributes added!");
		return null;
	}
	if(this.elementCount < 0) {
		console.error("No indices added!");
		return null;
	}
	if(!this.shader) {
		console.error("No shader program added!");
		return null;
	}
	
	return new VAO(this.gl, this.vao, this.elementCount, this.attribs, this.shader);
};

Shader.shaderCache = new Map();

function Shader(gl, name, program) {
	this.gl = gl;
	this.name = name;
	this.program = program;
	
	this.uniformCache = new Map();
}

Shader.prototype.bind = function(){
	this.gl.useProgram(this.program);
};

Shader.prototype.unbind = function(){
	this.gl.useProgram(null);
};

Shader.prototype.getUniformLocation = function(name) {
	if(this.uniformCache.has(name)) {
		return this.uniformCache.get(name);
	}
	var loc = this.gl.getUniformLocation(this.program, name);
	this.uniformCache.set(name, loc);
	if(!loc) {
		console.warn("Uniform variable " + name + " not found in shader program " + this.name);
	}
	return loc;
};

Shader.prototype.setFloat = function(name, value) {
	var loc = this.getUniformLocation(name);
	if(loc) { gl.uniform1f(loc, value); }
};

Shader.prototype.setInt = function(name, value) {
	var loc = this.getUniformLocation(name);
	if(loc) { gl.uniform1i(loc, value); }
};

Shader.prototype.setMat4 = function(name, value) {
	var loc = this.getUniformLocation(name);
	if(loc) { gl.uniformMatrix4fv(loc, false, value); }
};

Shader.prototype.setMat3 = function(name, value) {
	var loc = this.getUniformLocation(name);
	if(loc) { gl.uniformMatrix3fv(loc, false, value); }
};

Shader.prototype.setMat2 = function(name, value) {
	var loc = this.getUniformLocation(name);
	if(loc) { gl.uniformMatrix2fv(loc, false, value); }
};

Shader.prototype.setVec4 = function(name, value) {
	var loc = this.getUniformLocation(name);
	if(loc) { gl.uniform4fv(loc, value); }
};

Shader.prototype.setVec3 = function(name, value) {
	var loc = this.getUniformLocation(name);
	if(loc) { gl.uniform3fv(loc, value); }
};

Shader.prototype.setVec2 = function(name, value) {
	var loc = this.getUniformLocation(name);
	if(loc) { gl.uniform2fv(loc, value); }
};

Shader.loadShaderProgram = function(gl, shaderName) {
	if(Shader.shaderCache.has(shaderName)) {
		return Shader.shaderCache.get(shaderName);
	}
	var program = gl.createProgram();
	var vs = Shader.loadShader(gl, shaderName, "vs", gl.VERTEX_SHADER);
	var fs = Shader.loadShader(gl, shaderName, "fs", gl.FRAGMENT_SHADER);
	
	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	gl.linkProgram(program);
	if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		var log = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		gl.deleteShader(vs);
		gl.deleteShader(fs);
		console.error("Program link failed!\n" + log);
		return null;
	}
	
	gl.detachShader(program, vs);
	gl.detachShader(program, fs);
	gl.deleteShader(vs);
	gl.deleteShader(fs);
	
	var shader = new Shader(gl, shaderName, program);
	Shader.shaderCache.set(shaderName, shader);
	return shader;
};

Shader.loadShader = function(gl, name, fileType, shaderType) {
	var shader = gl.createShader(shaderType);
	gl.shaderSource(shader, Shader.getShaderFile(name, fileType));
	gl.compileShader(shader);
	if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		var log = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		console.error("Shader " + name + "_" + fileType + " failed to compile!\n" + log);
		return null;
	}
	return shader;
};

Shader.getShaderFile = function(fileName, fileType) {
	var i = fileName + "_" + fileType;
	var e = document.getElementById(i);
	if(!e) {
		console.error("Shader script " + i + " not found! Create one in your header!");
		return null;
	}
	return e.text.trim();
};