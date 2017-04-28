var terrainVertexCount = 512;
var terrainSize = 1000;
var terrainHeight = 10;
var terrainNoiseScale = 7.5;

function generateTerrain(gl) {
	noise.seed(Date.now());

	var vertices = [];
	var texCoords = [];
	var indices = [];
	
	var offset = -terrainSize / 2;
	
	var vc = terrainVertexCount - 1;
	for(var z = 0; z < terrainVertexCount; z++) {
		for(var x = 0; x < terrainVertexCount; x++) {
			var px = x / vc;
			var pz = z / vc;
			var wx = offset + px * terrainSize;
			var wz = offset + pz * terrainSize;
			vertices.push(wx);
			vertices.push(getHeight(wx, wz));
			vertices.push(wz);
			texCoords.push(px);
			texCoords.push(pz);
		}
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
	.addIndices(indices)
	.addShader("terrain").create();
}

function getHeight(x, z) {
	var xs = x / terrainNoiseScale;
	var zs = z / terrainNoiseScale;
	return noise.perlin2(xs, zs) * noise.simplex2(xs/6, zs/6) * terrainHeight;
}