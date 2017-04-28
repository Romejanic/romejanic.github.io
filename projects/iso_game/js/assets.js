var assetsToLoad = [
{
	name: "terrain.vs",
	path: "assets/shaders/terrain.vs",
	type: "shader"
},
{
	name: "terrain.fs",
	path: "assets/shaders/terrain.fs",
	type: "shader"
},
{
	name: "simple_model.vs",
	path: "assets/shaders/simple_model.vs",
	type: "shader"
},
{
	name: "simple_model.fs",
	path: "assets/shaders/simple_model.fs",
	type: "shader"
},
{
	name: "suzanne",
	path: "assets/models/suzanne.obj",
	type: "model"
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
	
	loadNextAsset();
}

function loadNextAsset() {
	if(nextAssetToLoad >= assetsToLoad.length) {
		callback();
		return;
	}
	var asset = assetsToLoad[nextAssetToLoad];
	$(loader).load(asset.path, function() {
		nextAssetToLoad++;
		assets.set(asset.name, $(this).text());
		
		loadNextAsset();
	});
}