var game = {};

var scene = new Scene();
var camera = new Camera();
var sun = new Light([1, 1, 1], [45, 30, 10]);
var player;

game.init = function() {
	camera.rotation   = [-45.0, 45.0, 0.0];
	camera.orthoScale = 15.0;
	
	sun.initShadowmap(gl);
	
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
	
	player = new GameObject();
	player.position = [0, getHeight(0, 0), 0];
	player.setModel(obj.loadModel(gl, "player", "simple_model"));
	var playerTex = loadTexture("player_d");
	playerTex.uniformName = "diffuseTex";
	player.modelTextures = [playerTex];
	player.clipDistance = -1;
	scene.addObject(player);
}

game.update = function() {
	var moveSpeed = 1/10;
	var turnSpeed = 3;
	if(Key.isDown(Key.UP)) {
		var a = glMatrix.toRadian(player.rotation[1]);
		var c = Math.cos(a), s = Math.sin(a);
		player.position[0] -= c * moveSpeed;
		player.position[2] += s * moveSpeed;
		player.position[1]  = getHeight(player.position[0], player.position[2]);
	}
	if(Key.isDown(Key.DOWN)) {
		var a = glMatrix.toRadian(player.rotation[1]);
		var c = Math.cos(a), s = Math.sin(a);
		player.position[0] += c * moveSpeed;
		player.position[2] -= s * moveSpeed;
		player.position[1]  = getHeight(player.position[0], player.position[2]);
	}
	if(Key.isDown(Key.LEFT)) {
		player.rotation[1] += turnSpeed;
	}
	if(Key.isDown(Key.RIGHT)) {
		player.rotation[1] -= turnSpeed;
	}
}