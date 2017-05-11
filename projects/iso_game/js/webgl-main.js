var gl;
var shadowShader;

var startTime;
var updateInterval;

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
	
	if(gl.getExtension("EXT_texture_filter_anisotropic")) {
		console.log("WebGL: Anisotropic filtering supported!");
	}
	
	gl.canvas.width = viewportCtx.canvas.width;
	gl.canvas.height = viewportCtx.canvas.height;
	if(initGL()) {
		setInterval(game.update, 1/60 * 1000);
	}
}

function initGL() {
	gl.clearColor(3.0, 3.0, 3.0, 1.0);
	
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.depthFunc(gl.LEQUAL);
	gl.cullFace(gl.BACK);
	
	shadowShader = Shader.loadShaderProgram(gl, "shadow");
	
	if(!loadPostProcessing(gl)) {
		return false;
	}
	game.init();
	
	requestAnimationFrame(render);
	startTime = Date.now();
	return true;
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
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, postProcessFBO);
	
	gl.viewport(0, 0, w, h);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	scene.render(camera);
	doPostProcessing();
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.clear(gl.COLOR_BUFFER_BIT);
	passToScreen();

	requestAnimationFrame(render);
	if(!webglInitialized) {
		webglInitialized = true;
	}
}

function loadTexture(textureName) {
	if(!assets.has(textureName)) {
		console.error("Texture " + textureName + " not loaded!");
		return null;
	}
	var texImage = assets.get(textureName);
	var tex = gl.createTexture();
	var aniso = gl.getExtension("EXT_texture_filter_anisotropic");
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	if(aniso) {
		var anisoLevel = Math.min(4, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT));
		gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, anisoLevel);
	}
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, texImage.width, texImage.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, texImage);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.bindTexture(gl.TEXTURE_2D, null);
	return tex;
}

function calcMatrices(w, h, t) {
	vec3.set(camera.position, player.position[0], player.position[1], player.position[2] + 5);
	
	camera.calculateMatrices(w, h);
	scene.calculateMatrices();
	sun.calculateMatrices(camera);
}