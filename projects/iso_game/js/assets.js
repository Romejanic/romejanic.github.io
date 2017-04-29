var assetsToLoad = [
// models
{
	name: "tree_1",
	path: "assets/models/tree_1.obj",
	type: "model"
},

// textures
{
	name: "tree_1_d",
	path: "assets/textures/tree_1_d.png",
	type: "texture"
},

// shaders
{
	name: "terrain_vs",
	path: "assets/shaders/terrain.vs",
	type: "shader"
},
{
	name: "terrain_fs",
	path: "assets/shaders/terrain.fs",
	type: "shader"
},
{
	name: "simple_model_vs",
	path: "assets/shaders/simple_model.vs",
	type: "shader"
},
{
	name: "simple_model_fs",
	path: "assets/shaders/simple_model.fs",
	type: "shader"
},
{
	name: "shadow_vs",
	path: "assets/shaders/shadow.vs",
	type: "shader"
},
{
	name: "shadow_fs",
	path: "assets/shaders/shadow.fs",
	type: "shader"
}
];
var nextAssetToLoad = -1;

var assets = new Map();
var loader;
var callback;

function loadAssets(onfinish) {
	callback = onfinish;
	nextAssetToLoad = 0;
	loader = document.createElement("div");
	
	assetsToLoad.forEach(function(asset){
		asset.displayHash = md5(asset.path);
	});
	loadNextAsset();
}

function loadNextAsset() {
	if(nextAssetToLoad >= assetsToLoad.length) {
		callback();
		return;
	}
	var asset = assetsToLoad[nextAssetToLoad];
	if(asset.type == "texture") {
		var image = new Image();
		image.onload = function() {
			nextAssetToLoad++;
			assets.set(asset.name, this);
			
			loadNextAsset();
		};
		image.src = asset.path;
	} else {
		$(loader).load(asset.path, function() {
			nextAssetToLoad++;
			assets.set(asset.name, $(this).text());
		
			loadNextAsset();
		});
	}
}