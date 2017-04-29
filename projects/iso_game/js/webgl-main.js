var gl;

var focusPos  = [0, 0, 0];

var scene = new Scene();
var camera = new Camera();
var sun = new Light([1, 1, 1], [45, 30, 45]);

var shadowShader;

var startTime;

function initWebGL() {
	var contextOps = {antialias: false};
	var canvas = document.createElement("canvas");
	gl = canvas.getContext("webgl2", contextOps);
	if(!gl) {
		gl = canvas.getContext("experimental-webgl2", contextOps);
		console.warn("Core WebGL 2 not found! Falling back on experimental...");
	}
	if(!gl) {
		webglError = "WebGL 2 not found or couldn't be initialised!";
		console.error("ERROR: " + webglError);
		return;
	}
	
	Shader.getShaderFile = function(fileName, fileType) {
		var path = fileName + "_" + fileType;
		if(!assets.has(path)) {
			console.error("Shader " + path + " not found!");
			return null;
		}
		return assets.get(path).trim();
	};
	
	initGL();
	setInterval(updateGame, 1/60 * 1000);
}

function initGL() {
	gl.clearColor(0.4, 0.6, 0.9, 1.0);
	
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.depthFunc(gl.LEQUAL);
	gl.cullFace(gl.BACK);
	
	camera.rotation   = [-45.0, 45.0, 0.0];
	camera.orthoScale = 25.0;
	
	sun.initShadowmap(gl);
	shadowShader = Shader.loadShaderProgram(gl, "shadow");
	
	var terrain = new GameObject();
	terrain.setModel(generateTerrain(gl));
	terrain.clipDistance = -1;
	scene.addObject(terrain);
	
	var treeVAO = obj.loadModel(gl, "tree_1", "simple_model");
	var treeTex = loadTexture("tree_1_d");
	treeTex.uniformName = "diffuseTex";
	
	var x, y, z, r, s, clipDist = camera.orthoScale * 3, off = -terrainSize / 2;
	for(var i = 0; i < 6000; i++) {
		var tree = new GameObject();
		
		x = off + terrainSize * Math.random();
		z = off + terrainSize * Math.random();
		y = getHeight(x, z) - 0.5;
		r = 360 * Math.random();
		s = 0.9 + 0.6 * Math.random();
		
		vec3.set(tree.position, x, y, z);
		vec3.set(tree.rotation, 0, r, 0);
		vec3.set(tree.scale, s, s, s);
		
		tree.setModel(treeVAO);
		tree.clipDistance = clipDist;
		tree.modelTextures = [treeTex];
		scene.addObject(tree);
	}
	
	requestAnimationFrame(render);
	startTime = Date.now();
}

function render() {
	var w = gl.canvas.width, h = gl.canvas.height;
	var t = (Date.now()-startTime)/1000;
	calcMatrices(w, h, t);
	
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, sun.shadowFBO);
	gl.viewport(0, 0, sun.shadowRes, sun.shadowRes);
	gl.clear(gl.DEPTH_BUFFER_BIT);
	sun.drawingShadows = true;
	
	shadowShader.bind();
	sun.applyToShader(shadowShader);
	scene.render(camera);
	shadowShader.unbind();
	
	sun.drawingShadows = false;
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	
	gl.viewport(0, 0, w, h);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	scene.render(camera);

	requestAnimationFrame(render);
	if(!webglInitialized) {
		webglInitialized = true;
	}
}

function updateGame() {
	var speed = 1/5;
	if(Key.isDown(Key.UP)) {
		focusPos[0] -= speed;
	}
	if(Key.isDown(Key.DOWN)) {
		focusPos[0] += speed;
	}
	if(Key.isDown(Key.LEFT)) {
		focusPos[2] += speed;
	}
	if(Key.isDown(Key.RIGHT)) {
		focusPos[2] -= speed;
	}
}

function loadTexture(textureName) {
	if(!assets.has(textureName)) {
		console.error("Texture " + textureName + " not loaded!");
		return null;
	}
	var texImage = assets.get(textureName);
	var tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, texImage.width, texImage.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, texImage);
	gl.bindTexture(gl.TEXTURE_2D, null);
	return tex;
}

function calcMatrices(w, h, t) {
	vec3.set(camera.position, focusPos[0], focusPos[1] + 10, focusPos[2] + 25);
	
	camera.calculateMatrices(w, h);
	scene.calculateMatrices();
	sun.calculateMatrices(camera);
}