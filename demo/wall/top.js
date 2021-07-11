twaver.Top = function (id, wall) {
	this.walls = new Map();
	twaver.Top.superClass.constructor.call(this, id);
};

twaver.Util.ext(twaver.Top, twaver.ShapeNode, {
	_split: 1 / 3,
	_cubeAngle: Math.PI / 6,
	getVectorUIClass: function () {
		return twaver.TopUI;
	},
});

twaver.TopUI = function (network, element) {
	twaver.TopUI.superClass.constructor.call(this, network, element);
};

twaver.Util.ext(twaver.TopUI, twaver.vector.ShapeNodeUI, {
	paintBody: function (ctx) {
		if (this.curInterval) {
			clearInterval(this.curInterval);
		}
		var type = this.getStyle("body.type");
		if (type === "default") {
			this.drawDefaultBody(ctx);
		} else if (type === "vector") {
			this.drawVectorBody(ctx);
		} else if (type === "default.vector") {
			this.drawVectorBody(ctx);
			this.drawDefaultBody(ctx);
		} else if (type === "vector.default") {
			this.drawDefaultBody(ctx);
			this.drawVectorBody(ctx);
		}
		if (this._outerColor && this.getStyle("outer.style") === "border") {
			this.drawOuterBorder(ctx);
		}
		if (
			this.getStyle("select.style") === "border" &&
			this._network.isSelected(this._element)
		) {
			this.drawSelectBorder(ctx);
		}
	},

	drawVectorBody: function (ctx) {
		twaver.TopUI.super.drawVectorBody(ctx);
	},
});
