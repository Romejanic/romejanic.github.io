var postProcessFBO;
var postProcessTex;
var postProcessVAO;

var postProcessBlitFBO;
var postProcessBlitTex;

var postEffects = [
{
	name: "bloom",
	usesDepth: false
}
];

function loadPostProcessing(gl) {
	var floatingPointSupported = true;
	if(!gl.getExtension("EXT_color_buffer_float")) {
		console.warn("WebGL: EXT_color_buffer_float not supported! HDR rendering not possible!");
		floatingPointSupported = false;
	} else {
		console.log("WebGL: Floating point textures supported!");
	}

	postProcessFBO = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, postProcessFBO);
	postProcessTex = createColorTex(gl, floatingPointSupported);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, postProcessTex, 0);
	
	var postProcessDepthBuf = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, postProcessDepthBuf);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, gl.canvas.width, gl.canvas.height);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, postProcessDepthBuf);
	gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
	
	var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	if(status != gl.FRAMEBUFFER_COMPLETE) {
		console.error("Main framebuffer incomplete! Status " + status);
		webglError = "Failure while initialising WebGL!";
		return false;
	}
	
	postProcessBlitFBO = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, postProcessBlitFBO);
	postProcessBlitTex = createColorTex(gl, floatingPointSupported);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, postProcessBlitTex, 0);
	
	var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);
	if(status != gl.FRAMEBUFFER_COMPLETE) {
		console.error("Main framebuffer incomplete! Status " + status);
		webglError = "Failure while initialising WebGL!";
		return false;
	}
	
	var vertices = [
	-1.0,  1.0,
	 1.0, -1.0,
	-1.0, -1.0,
	 1.0,  1.0
	];
	var texCoords = [
	 0.0, 1.0,
	 1.0, 0.0,
	 0.0, 0.0,
	 1.0, 1.0
	];
	var indices = [
	0, 2, 1,
	0, 1, 3
	];
	postProcessVAO = new VAOBuilder(gl)
	.addAttribute(0, 2, vertices)
	.addAttribute(1, 2, texCoords)
	.addIndices(indices)
	.addShader("post_pass").create();

	postEffects.forEach(function(post){
		post.shader = Shader.loadShaderProgram(gl, "post_" + post.name);
	});
	return true;
}

function doPostProcessing() {
	gl.disable(gl.DEPTH_TEST);
	blitFramebuffers();

	postProcessVAO.overrideShader = true;
	postEffects.forEach(function(post){
		post.shader.bind();
		bindColorTexture(post.shader);
		if(post.usesDepth) {
			// TODO: depth texture support
		}
		postProcessVAO.render();
		blitFramebuffers();
	});
	gl.useProgram(null);
}

function passToScreen() {
	postProcessVAO.overrideShader = false;
	postProcessVAO.shader.bind();
	bindColorTexture(postProcessVAO.shader);
	postProcessVAO.render();
	
	gl.enable(gl.DEPTH_TEST);
}

function bindColorTexture(shader) {
	shader.setInt("color", 0);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, postProcessBlitTex);
}

function blitFramebuffers() {
	gl.bindFramebuffer(gl.READ_FRAMEBUFFER, postProcessFBO);
	gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, postProcessBlitFBO);
	gl.blitFramebuffer(0, 0, gl.canvas.width, gl.canvas.height,
					   0, 0, gl.canvas.width, gl.canvas.height,
					   gl.COLOR_BUFFER_BIT, gl.NEAREST);
	gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
	gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, postProcessFBO);
}

function createColorTex(gl, isFloat) {
	var t = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, t);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texImage2D(gl.TEXTURE_2D, 0, isFloat ? gl.RGBA32F : gl.RGBA, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, isFloat ? gl.FLOAT : gl.UNSIGNED_BYTE, null);
	return t;
}