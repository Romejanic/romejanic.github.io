// Thnx Grumdrig!
// Source: http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x+r, y);
  this.arcTo(x+w, y,   x+w, y+h, r);
  this.arcTo(x+w, y+h, x,   y+h, r);
  this.arcTo(x,   y+h, x,   y,   r);
  this.arcTo(x,   y,   x+w, y,   r);
  this.closePath();
  return this;
}

CanvasRenderingContext2D.prototype.fillTextCentered = function(text, x, y) {
	var hw = this.measureText(text).width / 2;
	this.fillText(text, x - hw, y);
}

mat4.rotateDegrees = function(out, mat, rotation) {
	this.rotateX(out, mat, glMatrix.toRadian(rotation[0]));
	this.rotateY(out, mat, glMatrix.toRadian(rotation[1]));
	this.rotateZ(out, mat, glMatrix.toRadian(rotation[2]));
};

// Thnx Arthur Schreiber!
// Source: http://nokarma.org/2011/02/27/javascript-game-development-keyboard-input/
var Key = {
  _pressed: {},

  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  
  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },
  
  onKeydown: function(event) {
    this._pressed[event.keyCode] = true;
  },
  
  onKeyup: function(event) {
    delete this._pressed[event.keyCode];
  }
};
window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);