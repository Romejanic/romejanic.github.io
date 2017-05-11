var terrainVertexCount = 512;
var terrainSize = 1000;
var terrainHeight = 10;
var terrainNoiseScale = 7.5;

var terrainHeights = [];

function generateTerrain(gl) {
	noise.seed(Date.now());

	var vertices = [];
	var texCoords = [];
	var normals = [];
	var indices = [];
	
	var offset = -terrainSize / 2;
	
	var vc = terrainVertexCount - 1;
	var h;
	for(var z = 0; z < terrainVertexCount; z++) {
		var heightArray = [];
		for(var x = 0; x < terrainVertexCount; x++) {
			var px = x / vc;
			var pz = z / vc;
			var wx = offset + px * terrainSize;
			var wz = offset + pz * terrainSize;
			h = getHeight(wx, wz);
			heightArray.push(h);
			vertices.push(wx);
			vertices.push(h);
			vertices.push(wz);
			texCoords.push(px);
			texCoords.push(pz);
			var n = genNormals(wx, wz);
			normals.push(n[0]);
			normals.push(n[1]);
			normals.push(n[2]);
		}
		terrainHeights.push(heightArray);
	}
	for(var z = 0; z < vc; z++) {
		for(var x = 0; x < vc; x++) {
			var tl = (z*terrainVertexCount)+x;
			var tr = tl + 1;
			var bl = ((z+1)*terrainVertexCount)+x;
			var br = bl + 1;
			
			indices.push(tl);
			indices.push(bl);
			indices.push(tr);
			indices.push(tr);
			indices.push(bl);
			indices.push(br);
		}
	}
	
	return new VAOBuilder(gl)
	.addAttribute(0, 3, vertices)
	.addAttribute(1, 2, texCoords)
	.addAttribute(2, 3, normals)
	.addIndices(indices)
	.addShader("terrain").create();
}

function getHeight(x, z) {
	var xs = x / terrainNoiseScale;
	var zs = z / terrainNoiseScale;
	return noise.perlin2(xs, zs) * noise.simplex2(xs/6, zs/6) * terrainHeight;
}

function getTerrainHeight(x, z) {
	var gridSize = terrainSize / (terrainHeights.length-1);
	var gridX = Math.floor(x / gridSize);
	var gridZ = Math.floor(z / gridSize);
	if(gridX >= terrainHeights.length-1 || gridZ >= terrainHeights.length-1 || gridX < 0 || gridZ < 0) {
		return 0;
	}
	var xCoord = (x % gridSize) / gridSize;
	var zCoord = (z % gridSize) / gridSize;
	var height = 0;
	if(xCoord <= (1 - zCoord)) {
		height = interpolateY(
			[0, terrainHeights[gridZ][gridX], 0],
			[1, terrainHeights[gridZ][gridX+1], 0],
			[0, terrainHeights[gridZ+1][gridX], 1],
			[xCoord, zCoord]);
	} else {
		height = interpolateY(
			[1, terrainHeights[gridZ][gridX+1], 0],
			[1, terrainHeights[gridZ+1][gridX+1], 1]
			[0, terrainHeights[gridZ+1][gridX], 1],
			[xCoord, zCoord]);
	}
	return height;
}

function interpolateY(v1, v2, v3, p) {
	var d = (v2[2] - v3[2]) * (v1[0] - v3[0]) + (v3[0] - v2[0]) * (v1[2] - v3[2]);
	var a = ((v2[2] - v3[2]) * (p[0] - v3[0]) + (v3[0] - v2[0]) * (p[1] - v3[2])) / d;
	var b = ((v3[2] - v1[2]) * (p[0] - v3[0]) + (v1[0] - v3[0]) * (p[1] - v3[2])) / d;
	var c = 1 - a - b;
	return a * v1[1] + b * v2[1] + c * v3[1];
}

function genNormals(x, z) {
	var t = getHeight(x, z-1);
	var b = getHeight(x, z+1);
	var l = getHeight(x-1, z);
	var r = getHeight(x+1, z);
	return vec3.normalize(vec3.create(), [l-r, 2, t-b]);
}