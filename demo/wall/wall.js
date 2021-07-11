twaver.Wall = function (id, wall) {
	this._scaleX = 0.1;
	this._scaleY = 0.1;
	this._isbool = false;
	this.neighbor = null;
	this.neighbors = new Map();
	this.bools = {};

	twaver.Wall.superClass.constructor.call(this, id);

	// debug container
	/* let group = (this.group = new twaver.Group("Group " + id));
	group.s({
		"group.shape": "roundrect",
		"group.shape.roundrect.radius": 0,
		"group.fill": false,
		"group.deep": 10,
		"group.fill.color": "rgba(100,0,0,0.1)",
		"group.outline.width": 1,
		"group.outline.color": "#6F6F6F",
	});
	this.group.setLayerId(this._id);
	this.group.setExpanded(true);
	this.group.addChild(this); */

	this.wall = wall;
	this.originData = {
		p1: wall.coordinates[0],
		p2: wall.coordinates[1],
		width: wall.width,
	};
	this._obb();
	let points = new twaver.List();
	this._obbpoints.forEach((data) => {
		points.add({
			x: data.x,
			y: data.y,
		});
	});
	this.setPoints(points);
	this.s("vector.fill.color", "rgba(0,0,0,0.0)");
	this.s("vector.outline.width", 1);
	this.s("vector.outline.color", "rgba(0,0,0,1.0)");
	this.s("label.position", "center");
	this.s("shapenode.closed", true);
	this.s("body.type", "default");
	this.setName("wall" + id);
	this.generatePolyData();
};

twaver.Util.ext(twaver.Wall, twaver.ShapeNode, {
	_split: 1 / 3,
	_cubeAngle: Math.PI / 6,
	getVectorUIClass: function () {
		return twaver.WallUI;
	},
	/**
	 * obb 表达方式
	 **/
	_obb() {
		let p1 = new THREE.Vector3(
				this.originData.p1[0],
				0,
				this.originData.p1[1]
			),
			p2 = new THREE.Vector3(
				this.originData.p2[0],
				0,
				this.originData.p2[1]
			);
		let result = this._GetFourPointsByTwoPointAndWidth(
			p1,
			p2,
			this.originData.width
		);
		this._obbpoints = [];
		result.forEach((point) => {
			this._obbpoints.push({
				x: point.x * this._scaleX,
				y: point.z * this._scaleY,
			});
		});
		return this._obbpoints;
	},
	_GetFourPointsByTwoPointAndWidth(
		startPoint,
		endPoint,
		meshWidth,
		PreStartPont,
		PostEndPoint
	) {
		let startVerticalDir;
		let endVerticalDir;
		let lineWidth = 3.0;
		if (meshWidth) {
			lineWidth = meshWidth / 2.0;
		}
		const dir_start_to_end = endPoint.clone().sub(startPoint).normalize();
		const dir_end_to_start = startPoint.clone().sub(endPoint).normalize();
		var dirVertical = new THREE.Vector3(
			dir_start_to_end.z * -1,
			0.0,
			dir_start_to_end.x
		);
		if (PreStartPont) {
			const dir_preStart = PreStartPont.clone()
				.sub(startPoint)
				.normalize();
			const extend_angle = dir_preStart.angleTo(dir_start_to_end);

			if (
				extend_angle > Math.PI * 0.95 ||
				extend_angle < Math.PI * 0.05
			) {
				startVerticalDir = dirVertical;
			} else {
				dir_preStart.add(dir_start_to_end).normalize();
				const angle = dir_preStart.angleTo(dir_start_to_end);
				//console.log(angle)
				let va = Math.sin(angle);
				dir_preStart.multiplyScalar(1.0 / va);
				startVerticalDir = dir_preStart;
			}
		} else {
			startVerticalDir = dirVertical;
		}
		const test_Dir_start = startVerticalDir
			.clone()
			.normalize()
			.cross(dir_start_to_end.normalize());
		if (PostEndPoint) {
			let dir1 = PostEndPoint.clone().sub(endPoint);
			//console.log(dir1);
			dir1.normalize();

			let dirOld = startPoint.clone().sub(endPoint);
			dirOld.normalize();

			const extend_angle = dirOld.angleTo(dir1);
			if (
				extend_angle > Math.PI * 0.95 ||
				extend_angle < Math.PI * 0.05
			) {
				endVerticalDir = dirVertical;
			} else {
				dir1.add(dirOld).normalize();
				const angle = dir1.angleTo(dir_start_to_end);
				//console.log(angle)
				let va = Math.sin(angle);
				dir1.multiplyScalar(1.0 / va);
				endVerticalDir = dir1;
				//console.log(endVerticalDir);
			}
		} else {
			endVerticalDir = dirVertical;
		}

		const test_Dir_end = endVerticalDir
			.clone()
			.normalize()
			.cross(dir_start_to_end.normalize());
		const v1 = startPoint
			.clone()
			.add(startVerticalDir.clone().multiplyScalar(lineWidth));
		const v2 = startPoint
			.clone()
			.sub(startVerticalDir.clone().multiplyScalar(lineWidth));
		const v4 = endPoint
			.clone()
			.add(endVerticalDir.clone().multiplyScalar(lineWidth));
		const v3 = endPoint
			.clone()
			.sub(endVerticalDir.clone().multiplyScalar(lineWidth));
		const result = test_Dir_end.y * test_Dir_start.y;
		if (result > 0.0) {
			return [v1, v2, v3, v4];
		} else {
			return [v1, v2, v4, v3];
		}
	},
	/**
	 * 生成poly data，用于bool运算
	 */
	generatePolyData() {
		let poly = {
			regions: [],
			inverted: false,
			id: this._id,
		};
		let regions = [];
		this._obbpoints.forEach((obb) => {
			regions.push([obb.x, obb.y]);
		});
		poly.regions.push(regions);
		this.poly = poly;
		this.regions = regions;
	},
	// 预处理
	preprocessing() {
		let neighbor = this.neighbor;
		let obbpoints = this._obbpoints;
		let obbpoints2 = neighbor._obbpoints;
		/**
		 * 1. 角点在内部的时候，直接使用2d原始几何数据
		 * 2. 十字相交的时候，直接打断  -->
		 * */
	},
	// 后处理
	postprocessing() {},

	/**
	 * 相交判断
	 * @param {}} wall
	 * @returns
	 */
	intersection(wall) {
		this.neighbor = wall;
		let obb1 = this._obbpoints;
		let obb2 = wall._obbpoints;
		let intersection = $Intersection.intersectPolygonPolygon(obb1, obb2);
		if (intersection.status === "Intersection") {
			this.preprocessing();
		}
		return intersection.status === "Intersection";
	},

	/**
	 *
	 */
	addNeighbor(neighbor) {
		this.neighbors.set(neighbor._id, neighbor);
	},

	getNeighbors() {
		console.log(this.neighbors);
		return this.neighbors;
	},

	/**
	 * 做bool运算： wall
	 */
	boolwall(wall) {
		this.booldatas = {};
		this.booldatas.intersect = PolyBool.intersect(this.poly, wall.poly);
		this.booldatas.union = PolyBool.union(this.poly, wall.poly);
		this.booldatas.difference = PolyBool.difference(this.poly, wall.poly);
		this.booldatas.differenceRev = PolyBool.differenceRev(
			this.poly,
			wall.poly
		);
		this.booldatas.xor = PolyBool.xor(this.poly, wall.poly);
		console.log(this.booldatas);
		this._isbool = true;
	},

	/**
	 * 做bool运算: walls
	 */
	boolwalls(walls) {
		this.booldatas = {};
		if (walls.length === 0) return;
		let poly = { regions: [], inverted: false };
		walls.forEach((wall) => {
			poly.regions.push(wall.regions);
		});
		if (poly.regions.length === 0) return;
		this.booldatas.intersect = PolyBool.intersect(this.poly, poly);
		this.booldatas.union = PolyBool.union(this.poly, poly);
		this.booldatas.difference = PolyBool.difference(this.poly, poly);
		this.booldatas.differenceRev = PolyBool.differenceRev(this.poly, poly);
		this.booldatas.xor = PolyBool.xor(this.poly, poly);
		console.log(this.booldatas);
		this._isbool = true;
	},

	/**
	 * 特殊点需要持续优化
	 * 1. 十字相交，直接打断，--> difference
	 * 2. 内部相交，不打断 --> 一个使用原四点表示，一个用difference数据
	 * 3. 倾斜端点相交：需要预处理
	 * 4. 垂直端点相交：需要预处理
	 * 5. 倾斜相交：
	 */
	get2DPoints() {},

	/**
	 * union 数据
	 */
	get3DPoints() {},

	drawBool(box) {
		this.drawDifference(box);
		this.drawIntersect(box);
		this.drawUnion(box);
		this.drawXor(box);
		this.drawDifferenceRev(box);
	},

	drawUnion(box) {
		this.bools.unions = new twaver.Dummy();

		let union = this.booldatas.union && this.booldatas.union.regions;
		if (!union) {
			console.log("no union!");
			return;
		}
		union.forEach((un) => {
			let child = new twaver.ShapeNode();
			child.setName(this._id + "union");
			let points = new twaver.List();
			un.forEach((u) => {
				points.add({
					x: u[0],
					y: u[1],
				});
			});
			child.setPoints(points);
			child.s("vector.fill.color", "rgba(0,255,255,0.1)");
			child.s("vector.outline.width", 1);
			child.s("vector.outline.color", "rgba(0,255,255,1.0)");
			child.s("label.position", "center");
			child.s("shapenode.closed", true);
			child.s("body.type", "default");
			box.add(child);
			this.bools.unions.addChild(child);
			this.group && this.group.addChild(this.bools.unions);
		});
		this.bools.unions.toChildren().forEach((child) => {
			child.setVisible(false);
		});
	},

	drawIntersect() {
		this.bools.intersects = new twaver.Dummy();
		let intersect =
			this.booldatas.intersect && this.booldatas.intersect.regions;
		if (!intersect) {
			console.log("no intersect!");
			return;
		}
		intersect.forEach((un) => {
			let child = new twaver.ShapeNode();
			child.setName(this._id + "intersect");
			let points = new twaver.List();
			un.forEach((u) => {
				points.add({
					x: u[0],
					y: u[1],
				});
			});
			child.setPoints(points);
			child.s("vector.fill.color", "rgba(0,255,0,0.5)");
			child.s("vector.outline.width", 1);
			child.s("vector.outline.color", "rgba(0,255,0,1.0)");
			child.s("label.position", "center");
			child.s("shapenode.closed", true);
			child.s("body.type", "default");
			box.add(child);
			this.bools.intersects.addChild(child);
			this.group && this.group.addChild(this.bools.intersects);
		});
		this.bools.intersects.toChildren().forEach((child) => {
			child.setVisible(false);
		});
	},

	drawDifference() {
		this.bools.differences = new twaver.Dummy();
		let difference =
			this.booldatas.difference && this.booldatas.difference.regions;
		if (!difference) {
			console.log("no difference!");
			return;
		}
		difference.forEach((un) => {
			let child = new twaver.ShapeNode();
			child.setName(this._id + "difference");
			let points = new twaver.List();
			un.forEach((u) => {
				points.add({
					x: u[0],
					y: u[1],
				});
			});
			child.setPoints(points);
			child.s("vector.fill.color", "rgba(255,0,0,0.1)");
			child.s("vector.outline.width", 1);
			child.s("vector.outline.color", "rgba(255,0,0,1.0)");
			child.s("label.position", "center");
			child.s("shapenode.closed", true);
			child.s("body.type", "default");
			box.add(child);
			this.bools.differences.addChild(child);
			this.group && this.group.addChild(this.bools.differences);
		});
		this.bools.differences.toChildren().forEach((child) => {
			child.setVisible(false);
		});
	},

	drawDifferenceRev() {
		this.bools.differenceRevs = new twaver.Dummy();
		let differenceRev =
			this.booldatas.differenceRev &&
			this.booldatas.differenceRev.regions;
		if (!differenceRev) {
			console.log("no differenceRev!");
			return;
		}
		differenceRev.forEach((un) => {
			let child = new twaver.ShapeNode();
			child.setName(this._id + "differenceRev");
			let points = new twaver.List();
			un.forEach((u) => {
				points.add({
					x: u[0],
					y: u[1],
				});
			});
			child.setPoints(points);
			child.s("vector.fill.color", "rgba(0,255,255,0.1)");
			child.s("vector.outline.width", 1);
			child.s("vector.outline.color", "rgba(0,255,255,1.0)");
			child.s("label.position", "center");
			child.s("shapenode.closed", true);
			child.s("body.type", "default");
			box.add(child);
			this.bools.differenceRevs.addChild(child);
			this.group && this.group.addChild(this.bools.differenceRevs);
		});
		this.bools.differenceRevs.toChildren().forEach((child) => {
			child.setVisible(false);
		});
	},

	drawXor() {
		this.bools.xors = new twaver.Dummy();
		let xor = this.booldatas.xor && this.booldatas.xor.regions;
		if (!xor) {
			console.log("no xor!");
			return;
		}
		xor.forEach((un) => {
			let child = new twaver.ShapeNode();
			child.setName(this._id + "xor");
			let points = new twaver.List();
			un.forEach((u) => {
				points.add({
					x: u[0],
					y: u[1],
				});
			});
			child.setPoints(points);
			child.s("vector.fill.color", "rgba(0,255,255,0.1)");
			child.s("vector.outline.width", 1);
			child.s("vector.outline.color", "rgba(0,255,255,1.0)");
			child.s("label.position", "center");
			child.s("shapenode.closed", true);
			child.s("body.type", "default");
			box.add(child);
			this.bools.xors.addChild(child);
			this.group && this.group.addChild(this.bools.xors);
		});
		this.bools.xors.toChildren().forEach((child) => {
			child.setVisible(false);
		});
	},
	setControl(control) {
		if (this.bools.unions) {
			this.bools.unions.toChildren().forEach((child) => {
				child.setVisible(control.draw.union);
			});
		}
		if (this.bools.differences) {
			this.bools.differences.toChildren().forEach((child) => {
				child.setVisible(control.draw.difference);
			});
		}
		if (this.bools.differenceRevs) {
			this.bools.differenceRevs.toChildren().forEach((child) => {
				child.setVisible(control.draw.differenceRev);
			});
		}
		if (this.bools.xors) {
			this.bools.xors.toChildren().forEach((child) => {
				child.setVisible(control.draw.xor);
			});
		}
		if (this.bools.intersects) {
			this.bools.intersects.toChildren().forEach((child) => {
				child.setVisible(control.draw.intersect);
			});
		}
	},
});

twaver.WallUI = function (network, element) {
	twaver.WallUI.superClass.constructor.call(this, network, element);
};

twaver.Util.ext(twaver.WallUI, twaver.vector.ShapeNodeUI, {
	paintBody: function (ctx) {
		let element = this._element;
		element.setControl(controlOptions);
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
		twaver.WallUI.super.drawVectorBody(ctx);
	},
});
