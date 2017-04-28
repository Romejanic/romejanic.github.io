var gl;

var projMat = mat4.create();
var viewMat = mat4.create();
var cameraPos = [0, 3, 5];
var focusPos  = [0, 0, 0];
var viewSize = 25.0;

var terrainVAO;
var buildingVAO;

var startTime;

function initWebGL() {
	var canvas = document.createElement("canvas");
	gl = canvas.getContext("webgl2");
	if(!gl) {
		gl = canvas.getContext("experimental-webgl2");
		console.warn("Core WebGL 2 not found! Falling back on experimental...");
	}
	if(!gl) {
		webglError = "WebGL 2 not found or couldn't be initialised!";
		console.error("ERROR: " + webglError);
		return;
	}
	
	Shader.getShaderFile = function(fileName, fileType) {
		var path = fileName + "." + fileType;
		if(!assets.has(path)) {
			console.error("Shader " + path + " not found!");
			return null;
		}
		return assets.get(path).trim();
	};
	
	initGL();
}

function initGL() {
	gl.clearColor(0.4, 0.6, 0.9, 1.0);
	
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.depthFunc(gl.LEQUAL);
	gl.cullFace(gl.BACK);
	
	terrainVAO = generateTerrain(gl);
	
	buildingVAO = obj.loadModel(gl, "suzanne", "simple_model");
	buildingVAO.position = [0, 3, 0];
	buildingVAO.modelMat = mat4.create();
	
	requestAnimationFrame(render);
	startTime = Date.now();
}

function render() {
	var w = gl.canvas.width, h = gl.canvas.height;
	var t = (Date.now()-startTime)/1000;
	calcMatrices(w, h, t);
	
	gl.viewport(0, 0, w, h);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	terrainVAO.shader.bind();
	terrainVAO.shader.setMat4("projMat", projMat);
	terrainVAO.shader.setMat4("viewMat", viewMat);
	terrainVAO.render();

	buildingVAO.shader.bind();
	buildingVAO.shader.setMat4("projMat", projMat);
	buildingVAO.shader.setMat4("viewMat", viewMat);
	buildingVAO.shader.setMat4("modelMat", mat4.create());
	buildingVAO.render();

	requestAnimationFrame(render);
	if(!webglInitialized) {
		webglInitialized = true;
	}
}

function calcMatrices(w, h, t) {
	var viewAspect = w / h;
	mat4.ortho(projMat, -viewSize * viewAspect, viewSize * viewAspect, -viewSize, viewSize, -1000, 1000);
	//mat4.perspective(projMat, glMatrix.toRadian(70.0), w/h, 0.1, 1000.0);
	
	vec3.set(cameraPos, focusPos[0], focusPos[1] + 10, focusPos[2] + 25);
	
	mat4.identity(viewMat);
	mat4.rotateX(viewMat, viewMat, glMatrix.toRadian(45.0));
	mat4.rotateY(viewMat, viewMat, glMatrix.toRadian(-45.0));
	mat4.translate(viewMat, viewMat, vec3.negate(vec3.create(), cameraPos));
	//mat4.lookAt(viewMat, cameraPos, [0, 0, 0], [0, 1, 0]);
	
	var scale = 3;
	mat4.identity(buildingVAO.modelMat);
	mat4.translate(buildingVAO.modelMat, buildingVAO.modelMat, buildingVAO.position);
	mat4.rotateY(buildingVAO.modelMat, buildingVAO.modelMat, glMatrix.toRadian(t * 45.0));
	mat4.scale(buildingVAO.modelMat, buildingVAO.modelMat, [scale,scale,scale]);
}