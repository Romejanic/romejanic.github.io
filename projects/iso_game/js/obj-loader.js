var obj = {};

obj.loadModel = function(gl, modelName, shaderName) {
	if(!assets.has(modelName)) {
		console.error("OBJ Error: model " + modelName + " not found in assets!");
		return;
	}
	var modelSource = assets.get(modelName);
	
	var ov = [];
	var ot = [];
	var on = [];
	var v = [];
	var t = [];
	var n = [];
	var i = [];
	
	modelSource.split("\n").forEach(function(line) {
		if(line.trim().length <= 0 || line.startsWith("#")) {
			return;
		}
		var parts = line.split(" ");
		if(parts[0] == "v") {
			ov.push(parseFloat(parts[1]));
			ov.push(parseFloat(parts[2]));
			ov.push(parseFloat(parts[3]));
		} else if(parts[0] == "vt") {
			ot.push(parseFloat(parts[1]));
			ot.push(parseFloat(parts[2]));
		} else if(parts[0] == "vn") {
			on.push(parseFloat(parts[1]));
			on.push(parseFloat(parts[2]));
			on.push(parseFloat(parts[3]));
		} else if(parts[0] == "f") {
			for(var j = 0; j < 3; j++) {
				var face = parts[j].split("/");
				
				var vi = parseInt(face[0])-1;
				var ti = parseInt(face[1])-1;
				var ni = parseInt(face[2])-1;
				
				i.push(v.length / 3);
				v.push(ov[vi*3]); v.push(ov[vi*3+1]); v.push(ov[vi*3+2]);
				t.push(ot[ti*2]); t.push(ot[ti*2+1]);
				n.push(on[ni*3]); n.push(on[ni*3+1]); n.push(on[ni*3+2]);
			}
		}
	});
	
	return new VAOBuilder(gl)
	.addAttribute(0, 3, v)
	.addAttribute(1, 2, t)
	.addAttribute(2, 3, n)
	.addIndices(i)
	.addShader(shaderName).create();
}