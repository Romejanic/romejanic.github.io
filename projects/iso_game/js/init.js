var viewportCtx;
var initBackground;

var assetsLoaded = false;

var webglOpacity = 0;
var webglInitialized;
var webglError;

function init() {
	viewportCtx = document.getElementById("viewportCanvas").getContext("2d");
	initBackground = document.getElementById("background-img");
	
	$(viewportCtx.canvas).mousemove(function(e){
		mouseX = e.pageX, mouseY = e.pageY; 
	});
	
	loadAssets(function(){
		assetsLoaded = true;
		initWebGL();
	});
	requestAnimationFrame(draw);
}

function draw() {
	resizeCanvas();
	var canvasW = viewportCtx.canvas.width, canvasH = viewportCtx.canvas.height;
	
	if(!webglInitialized || webglOpacity < 1) {
		viewportCtx.drawImage(initBackground, 
			0, 0, initBackground.width, initBackground.height,
			0, 0, viewportCtx.canvas.width, viewportCtx.canvas.height);
	}
	
	if(!webglInitialized) {
		if(!webglError) {
			var w = 400, h = 150;
			var x = (canvasW-w)/2, y = (canvasH-h)/2;
	
			viewportCtx.fillStyle = "green";
			viewportCtx.roundRect(x, y, w, h, 15.0).fill();
	
			viewportCtx.font = "50px Arial";
			viewportCtx.fillStyle = "white";
			viewportCtx.fillTextCentered("Loading", canvasW/2, y + 45);
			viewportCtx.font = "15px Arial";
			if(!assetsLoaded) {
				var assetsLoaded = Math.max(nextAssetToLoad, 0);
				var assetCount   = assetsToLoad.length;
				var assetCurrPath = assetsLoaded < assetCount ? assetsToLoad[assetsLoaded].path : "";
				if(assetCurrPath.indexOf("/") > -1) {
					assetCurrPath = assetCurrPath.substring(assetCurrPath.indexOf("/")).hashCode();
				}
	
				viewportCtx.fillTextCentered("Loading assets: " + assetsLoaded + "/" + assetCount, canvasW/2, canvasH/2+10);
				viewportCtx.fillTextCentered(assetCurrPath, canvasW/2, canvasH/2+25);
	
				var progress = Math.min(Math.max(assetsLoaded / assetCount, 0), 1);
				viewportCtx.fillStyle = "gray";
				viewportCtx.fillRect(x+10, canvasH/2+30, w-20, 20);
				viewportCtx.fillStyle = "lime";
				viewportCtx.fillRect(x+10, canvasH/2+30, (w-20)*progress, 20);
			} else {
				viewportCtx.fillTextCentered("Starting game...", canvasW/2, canvasH/2+10);	
			}
		} else {
			var w = 400, h = 120;
			var x = (canvasW-w)/2, y = (canvasH-h)/2;
	
			viewportCtx.fillStyle = "red";
			viewportCtx.roundRect(x, y, w, h, 15.0).fill();
			
			viewportCtx.font = "50px Arial";
			viewportCtx.fillStyle = "white";
			viewportCtx.fillTextCentered("Error!", canvasW/2, y + 45);
			
			viewportCtx.font = "15px Arial";
			viewportCtx.fillTextCentered("Error starting game!", canvasW/2, canvasH/2+20);
			viewportCtx.fillTextCentered(webglError, canvasW/2, canvasH/2+35);
		}
	} else {
		gl.canvas.width = canvasW, gl.canvas.height = canvasH;
		viewportCtx.globalAlpha = webglOpacity;
		viewportCtx.drawImage(gl.canvas, 0, 0);
		viewportCtx.globalAlpha = 1.0;
		
		if(webglOpacity < 1) {
			webglOpacity = Math.min(webglOpacity + (1/60), 1);
		} else {
			drawGUI(viewportCtx);
		}
	}
	
	requestAnimationFrame(draw);
}

function resizeCanvas() {
	viewportCtx.canvas.width = viewportCtx.canvas.offsetWidth;
	viewportCtx.canvas.height = viewportCtx.canvas.offsetHeight;
	viewportCtx.clearRect(0, 0, viewportCtx.canvas.width, viewportCtx.canvas.height);
}

window.onload = init;