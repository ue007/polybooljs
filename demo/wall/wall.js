twaver.Wall = function (id, wall) {
	this._scaleX = 0.05;
	this._scaleY = 0.05;
	this._isbool = false;
	this.neighbor = null;
	this.neighbors = new Map();
	this.bools = {};
	this.boolMap = new Map();
	this.shapes = {
		d2: {
			shape1: null,
		},
		d3: {
			top: null,
			side: null,
		},
	};
	this.preprocessingNodes = {};

	twaver.Wall.superClass.constructor.call(this, id);

	// debug container
	// let group = (this.group = new twaver.Group("Group " + id));
	// group.s({
	// 	"group.shape": "roundrect",
	// 	"group.shape.roundrect.radius": 0,
	// 	"group.fill": false,
	// 	"group.deep": 10,
	// 	"group.fill.color": "rgba(100,0,0,0.1)",
	// 	"group.outline.width": 1,
	// 	"group.outline.color": "#6F6F6F",
	// });
	// this.group.setLayerId(0);
	// this.group.setExpanded(true);
	// this.group.addChild(this);
	this.setLayerId(0);
	this.wall = wall;
	this.originData = {
		p1: wall.coordinates[0],
		p2: wall.coordinates[1],
		width: wall.width,
		obb: [],
	};
	this._obb();
	let points = new twaver.List();
	this._obbpoints.forEach((data) => {
		points.add({
			x: data.x,
			y: data.y,
		});
		this.originData.obb.push({
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

	updatePolyData() {
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
		console.log("wall" + this._id + "预处理成功！");
	},
	/**
	 * 预处理数据
	 * 1. 直角断点相交
	 * @param {*} intersection
	 */
	preprocessing(intersection) {
		let neighbor = this.neighbor;
		let obbpoints = this._obbpoints;
		let obbpoints2 = neighbor._obbpoints;
		// this.originData.obb.forEach((o) => {
		// 	obbpoints.push({ x: o.x, y: o.y });
		// });
		// neighbor.originData.obb.forEach((o) => {
		// 	obbpoints2.push({ x: o.x, y: o.y });
		// });

		this.preprocessingNodes["crossIntersection"] = null;
		neighbor.preprocessingNodes["crossIntersection"] =  null;

		let unionpoints = new twaver.List();
		unionpoints.addAll(obbpoints);
		unionpoints.addAll(obbpoints2);
		let bounds1 = _twaver.math.getLineRect(obbpoints);
		let bounds2 = _twaver.math.getLineRect(obbpoints2);
		let unionBounds = _twaver.math.getLineRect(unionpoints);
		let intersectionPoints = intersection.points;
		let center1 = this.getCenterLocation(),
			center2 = this.neighbor.getCenterLocation();
		let vector1 = new THREE.Vector2(
			this.originData.p1[0] - this.originData.p2[0],
			this.originData.p1[1] - this.originData.p2[1]
		);
		let vector2 = new THREE.Vector2(
			neighbor.originData.p1[0] - neighbor.originData.p2[0],
			neighbor.originData.p1[1] - neighbor.originData.p2[1]
		);
		if (this.neighbors.get(this._id + "-" + neighbor._id)) return;

		if (
			intersectionPoints.length === 2 &&
			vector1.dot(vector2) === 0 &&
			vector1.y === 0
		) {
			let isInners = new Map();
			let polygon = this._points;
			intersectionPoints.forEach((p, index) => {
				let isInner = _twaver.math.isPointInPolygon(polygon, {
					x: center1.x > center2.x ? parseInt(p.x) : p.x,
					y: center2.y > center1.y ? parseInt(p.y) : p.y,
				});
				isInners.set(index, isInner ? 1 : -1);
			});

			if (isInners.get(0) * isInners.get(1) > 0) {
				if (isInners.get(0) < 0) {
					intersection.status2 = "十字外接相交";
				} else {
					intersection.status2 = "十字内部相交";
					if (center2.y < center1.y) {
						intersection.status2 = "十字内部相交->上方";
					} else {
						intersection.status2 = "十字内部相交->下方";
					}
				}
			} else if (isInners.get(0) * isInners.get(1) < 0) {
				intersection.status2 = "十字端点相交";
				if (center1.x < center2.x && center2.y < center1.y) {
					intersection.status2 = "十字端点相交->右侧->上方";
				} else if (center1.x < center2.x && center2.y > center1.y) {
					intersection.status2 = "十字端点相交->右侧->下方";
				} else if (center1.x > center2.x && center2.y < center1.y) {
					intersection.status2 = "十字端点相交->左侧->上方";
				} else if (center1.x > center2.x && center2.y > center1.y) {
					intersection.status2 = "十字端点相交->左侧->下方";
				}
			}

			if (intersection.status2 === "十字端点相交->右侧->上方") {
				obbpoints.forEach((p) => {
					if (p.x > center1.x) {
						p.x = unionBounds.x + unionBounds.width;
					}
				});
				// 右侧上方
				obbpoints2.forEach((p) => {
					if (p.y > center2.y) {
						p.y =
							unionBounds.y + unionBounds.height - bounds1.height;
					}
				});
			} else if (intersection.status2 === "十字端点相交->右侧->下方") {
				obbpoints.forEach((p) => {
					if (p.x > center1.x) {
						p.x = unionBounds.x + unionBounds.width;
					}
				});
				// 右侧下方
				obbpoints2.forEach((p) => {
					if (p.y < center2.y) {
						p.y = unionBounds.y + bounds1.height;
					}
				});
			} else if (intersection.status2 === "十字端点相交->左侧->上方") {
				// 需要考虑精度问题
				obbpoints.forEach((p) => {
					if (p.x < center1.x) {
						p.x = unionBounds.x;
					}
				});
				// 右侧上方
				obbpoints2.forEach((p) => {
					if (p.y > center2.y) {
						p.y =
							unionBounds.y + unionBounds.height - bounds1.height;
					}
				});
			} else if (intersection.status2 === "十字端点相交->左侧->下方") {
				// 需要考虑精度问题
				obbpoints.forEach((p) => {
					if (p.x < center1.x) {
						p.x = unionBounds.x;
					}
				});
				// 右侧下方
				obbpoints2.forEach((p) => {
					if (p.y < center2.y) {
						p.y = unionBounds.y + bounds1.height;
					}
				});
			} else if (intersection.status2 === "十字内部相交->左侧") {
			} else if (intersection.status2 === "十字内部相交->上方") {
				obbpoints2.forEach((p) => {
					if (p.y > center2.y) {
						p.y = bounds1.y;
					}
				});
			} else if (intersection.status2 === "十字内部相交->下方") {
				obbpoints2.forEach((p) => {
					if (p.y < center2.y) {
						p.y = bounds1.y;
					}
				});
			}

			/** debug for this wall */
			if (!this.preprocessingNodes["crossIntersection"]) {
				let crossIntersection = (this.preprocessingNodes[
					"crossIntersection"
				] = new twaver.ShapeNode());
				crossIntersection.setName(this._id + ":preprocessing");
				let list = new twaver.List();
				list.addAll(obbpoints);
				crossIntersection.setPoints(list);
				crossIntersection.s("vector.fill.color", "rgba(255,153,0,0.1)");
				crossIntersection.s("vector.outline.width", 1);
				crossIntersection.s(
					"vector.outline.color",
					"rgba(255,153,0,1.0)"
				);
				crossIntersection.s("label.position", "top");
				crossIntersection.s("shapenode.closed", true);
				crossIntersection.s("body.type", "default");
				crossIntersection.setVisible(false);
				crossIntersection.setLayerId(2);
				box.add(crossIntersection);
			} else {
				let points =
					this.preprocessingNodes["crossIntersection"].getPoints();
				let poly1 = {
					regions: [],
					inverted: false,
					id: this._id,
				};
				let regions = [];
				points.forEach((obb) => {
					regions.push([obb.x, obb.y]);
				});
				poly1.regions.push(regions);

				let poly2 = {
					regions: [],
					inverted: false,
					id: this._id,
				};
				let regions2 = [];
				obbpoints.forEach((obb) => {
					regions2.push([obb.x, obb.y]);
				});
				poly2.regions.push(regions2);

				let result = PolyBool.union(poly1, poly2);
				let ppp = new twaver.List();
				result.regions[0].forEach((r) => {
					ppp.add({ x: r[0], y: r[1] });
				});
				this.preprocessingNodes["crossIntersection"].setPoints(ppp);
			}

			// update this.obbpoints
			this._obbpoints =
				this.preprocessingNodes["crossIntersection"].getPoints();
			this.updatePolyData();

			/** debug for neighbor wall */
			if (!neighbor.preprocessingNodes["crossIntersection"]) {
				neighbor.preprocessingNodes["crossIntersection"] =
					new twaver.ShapeNode();
				neighbor.preprocessingNodes["crossIntersection"].setName(
					this._id + ":preprocessing"
				);
				let list = new twaver.List();
				list.addAll(obbpoints2);
				neighbor.preprocessingNodes["crossIntersection"].setPoints(
					list
				);
				neighbor.preprocessingNodes["crossIntersection"].s(
					"vector.fill.color",
					"rgba(102, 204,153 ,0.1)"
				);
				neighbor.preprocessingNodes["crossIntersection"].s(
					"vector.outline.width",
					1
				);
				neighbor.preprocessingNodes["crossIntersection"].s(
					"vector.outline.color",
					"rgba(102, 204,153 ,1.0)"
				);
				neighbor.preprocessingNodes["crossIntersection"].s(
					"label.position",
					"top"
				);
				neighbor.preprocessingNodes["crossIntersection"].s(
					"shapenode.closed",
					true
				);
				neighbor.preprocessingNodes["crossIntersection"].s(
					"body.type",
					"default"
				);
				neighbor.preprocessingNodes["crossIntersection"].setVisible(
					false
				);
				neighbor.preprocessingNodes["crossIntersection"].setLayerId(2);
				box.add(neighbor.preprocessingNodes["crossIntersection"]);
			} else {
				let points =
					neighbor.preprocessingNodes[
						"crossIntersection"
					].getPoints();
				let poly1 = {
					regions: [],
					inverted: false,
					id: neighbor._id,
				};
				let regions = [];
				points.forEach((obb) => {
					regions.push([obb.x, obb.y]);
				});
				poly1.regions.push(regions);

				let poly2 = {
					regions: [],
					inverted: false,
					id: neighbor._id,
				};
				let regions2 = [];
				obbpoints.forEach((obb) => {
					regions2.push([obb.x, obb.y]);
				});
				poly2.regions.push(regions2);

				let result = PolyBool.union(poly1, poly2);
				let ppp = new twaver.List();
				result.regions[0].forEach((r) => {
					ppp.add({ x: r[0], y: r[1] });
				});
				neighbor.preprocessingNodes["crossIntersection"].setPoints(ppp);
			}
			// update neighbor wall
			neighbor._obbpoints =
				neighbor.preprocessingNodes["crossIntersection"].getPoints();
			neighbor.updatePolyData();
		} else if (
			intersectionPoints.length === 2 &&
			vector1.dot(vector2) === 0 &&
			vector1.x === 0
		) {
			let isInners = new Map();
			let polygon = this._points;
			intersectionPoints.forEach((p, index) => {
				let isInner = _twaver.math.isPointInPolygon(polygon, {
					x: center1.x > center2.x ? parseInt(p.x) : p.x,
					y: center2.y > center1.y ? parseInt(p.y) : p.y,
				});
				isInners.set(index, isInner ? 1 : -1);
			});

			if (isInners.get(0) * isInners.get(1) > 0) {
				if (isInners.get(0) < 0) {
					intersection.status2 = "十字外接相交";
				} else {
					intersection.status2 = "十字内部相交";
					if (center2.y < center1.y) {
						intersection.status2 = "十字内部相交->上方";
					} else {
						intersection.status2 = "十字内部相交->下方";
					}
				}
			} else if (isInners.get(0) * isInners.get(1) < 0) {
				intersection.status2 = "十字端点相交";
				if (center1.x < center2.x && center2.y < center1.y) {
					intersection.status2 = "十字端点相交->右侧->上方";
				} else if (center1.x < center2.x && center2.y > center1.y) {
					intersection.status2 = "十字端点相交->右侧->下方";
				} else if (center1.x > center2.x && center2.y < center1.y) {
					intersection.status2 = "十字端点相交->左侧->上方";
				} else if (center1.x > center2.x && center2.y > center1.y) {
					intersection.status2 = "十字端点相交->左侧->下方";
				}
			}

			if (intersection.status2 === "十字端点相交->右侧->上方") {
				obbpoints.forEach((p) => {
					if (p.y < center1.y) {
						p.y = bounds2.y + bounds2.height;
					}
				});
				obbpoints2.forEach((p) => {
					if (p.x > center2.x) {
						p.x = unionBounds.x;
					}
				});
			} else if (intersection.status2 === "十字端点相交->右侧->下方") {
				obbpoints.forEach((p) => {
					if (p.y > center1.y) {
						p.y = bounds2.y;
					}
				});
				// 右侧下方
				obbpoints2.forEach((p) => {
					if (p.x < center2.x) {
						p.x = unionBounds.x;
					}
				});
			} else if (intersection.status2 === "十字端点相交->左侧->上方") {
				// 需要考虑精度问题
				obbpoints.forEach((p) => {
					if (p.x < center1.x) {
						p.x = unionBounds.x;
					}
				});
				// 右侧上方
				obbpoints2.forEach((p) => {
					if (p.y > center2.y) {
						p.y =
							unionBounds.y + unionBounds.height - bounds1.height;
					}
				});
			} else if (intersection.status2 === "十字端点相交->左侧->下方") {
				// 需要考虑精度问题
				obbpoints.forEach((p) => {
					if (p.y > center1.y) {
						p.y = bounds2.y;
					}
				});
				// 左侧下方
				obbpoints2.forEach((p) => {
					if (p.x > center2.x) {
						p.x = unionBounds.x + unionBounds.width;
					}
				});
			} else if (intersection.status2 === "十字内部相交->左侧") {
			} else if (intersection.status2 === "十字内部相交->上方") {
				obbpoints2.forEach((p) => {
					if (p.y > center2.y) {
						p.y = bounds1.y;
					}
				});
			} else if (intersection.status2 === "十字内部相交->下方") {
				obbpoints2.forEach((p) => {
					if (p.y < center2.y) {
						p.y = bounds1.y;
					}
				});
			}

			/** debug for this wall */
			if (!this.preprocessingNodes["crossIntersection"]) {
				let crossIntersection = (this.preprocessingNodes[
					"crossIntersection"
				] = new twaver.ShapeNode());
				crossIntersection.setName(this._id + ":preprocessing");
				let list = new twaver.List();
				list.addAll(obbpoints);
				crossIntersection.setPoints(list);
				crossIntersection.s("vector.fill.color", "rgba(255,153,0,0.1)");
				crossIntersection.s("vector.outline.width", 1);
				crossIntersection.s(
					"vector.outline.color",
					"rgba(255,153,0,1.0)"
				);
				crossIntersection.s("label.position", "top");
				crossIntersection.s("shapenode.closed", true);
				crossIntersection.s("body.type", "default");
				crossIntersection.setVisible(false);
				crossIntersection.setLayerId(2);
				box.add(crossIntersection);
			} else {
				let points =
					this.preprocessingNodes["crossIntersection"].getPoints();
				let poly1 = {
					regions: [],
					inverted: false,
					id: this._id,
				};
				let regions = [];
				points.forEach((obb) => {
					regions.push([obb.x, obb.y]);
				});
				poly1.regions.push(regions);

				let poly2 = {
					regions: [],
					inverted: false,
					id: this._id,
				};
				let regions2 = [];
				obbpoints.forEach((obb) => {
					regions2.push([obb.x, obb.y]);
				});
				poly2.regions.push(regions2);

				let result = PolyBool.union(poly1, poly2);
				let ppp = new twaver.List();
				result.regions[0] &&
					result.regions[0].forEach((r) => {
						ppp.add({ x: r[0], y: r[1] });
					});
				this.preprocessingNodes["crossIntersection"].setPoints(ppp);
			}

			// update this.obbpoints
			this._obbpoints =
				this.preprocessingNodes["crossIntersection"].getPoints();
			this.updatePolyData();

			/** debug for neighbor wall */
			if (!neighbor.preprocessingNodes["crossIntersection"]) {
				neighbor.preprocessingNodes["crossIntersection"] =
					new twaver.ShapeNode();
				neighbor.preprocessingNodes["crossIntersection"].setName(
					this._id + ":preprocessing"
				);
				let list = new twaver.List();
				list.addAll(obbpoints2);
				neighbor.preprocessingNodes["crossIntersection"].setPoints(
					list
				);
				neighbor.preprocessingNodes["crossIntersection"].s(
					"vector.fill.color",
					"rgba(102, 204,153 ,0.1)"
				);
				neighbor.preprocessingNodes["crossIntersection"].s(
					"vector.outline.width",
					1
				);
				neighbor.preprocessingNodes["crossIntersection"].s(
					"vector.outline.color",
					"rgba(102, 204,153 ,1.0)"
				);
				neighbor.preprocessingNodes["crossIntersection"].s(
					"label.position",
					"top"
				);
				neighbor.preprocessingNodes["crossIntersection"].s(
					"shapenode.closed",
					true
				);
				neighbor.preprocessingNodes["crossIntersection"].s(
					"body.type",
					"default"
				);
				neighbor.preprocessingNodes["crossIntersection"].setVisible(
					false
				);
				neighbor.preprocessingNodes["crossIntersection"].setLayerId(2);
				box.add(neighbor.preprocessingNodes["crossIntersection"]);
			} else {
				let points =
					neighbor.preprocessingNodes[
						"crossIntersection"
					].getPoints();
				let poly1 = {
					regions: [],
					inverted: false,
					id: neighbor._id,
				};
				let regions = [];
				points.forEach((obb) => {
					regions.push([obb.x, obb.y]);
				});
				poly1.regions.push(regions);

				let poly2 = {
					regions: [],
					inverted: false,
					id: neighbor._id,
				};
				let regions2 = [];
				obbpoints.forEach((obb) => {
					regions2.push([obb.x, obb.y]);
				});
				poly2.regions.push(regions2);

				let result = PolyBool.union(poly1, poly2);
				let ppp = new twaver.List();
				result.regions[0].forEach((r) => {
					ppp.add({ x: r[0], y: r[1] });
				});
				neighbor.preprocessingNodes["crossIntersection"].setPoints(ppp);
			}
			// update neighbor wall
			neighbor._obbpoints =
				neighbor.preprocessingNodes["crossIntersection"].getPoints();
			neighbor.updatePolyData();
		} else if (intersectionPoints.length === 4) {
			intersection.status2 = "十字交叉相交";
			if (!this.preprocessingNodes["crossIntersection"]) {
				this.preprocessingNodes["crossIntersection"] =
					new twaver.ShapeNode();
				this.preprocessingNodes["crossIntersection"].setName(
					this._id + ":preprocessing"
				);
				let list = new twaver.List();
				list.addAll(obbpoints);
				this.preprocessingNodes["crossIntersection"].setPoints(list);
				this.preprocessingNodes["crossIntersection"].s(
					"vector.fill.color",
					"rgba(255,153,0,0.1)"
				);
				this.preprocessingNodes["crossIntersection"].s(
					"vector.outline.width",
					1
				);
				this.preprocessingNodes["crossIntersection"].s(
					"vector.outline.color",
					"rgba(255,153,0,1.0)"
				);
				this.preprocessingNodes["crossIntersection"].s(
					"label.position",
					"top"
				);
				this.preprocessingNodes["crossIntersection"].s(
					"shapenode.closed",
					true
				);
				this.preprocessingNodes["crossIntersection"].s(
					"body.type",
					"default"
				);
				this.preprocessingNodes["crossIntersection"].setVisible(false);
				this.preprocessingNodes["crossIntersection"].setLayerId(2);
				box.add(this.preprocessingNodes["crossIntersection"]);
			}
			this._obbpoints =
				this.preprocessingNodes["crossIntersection"].getPoints();
			this.updatePolyData();

			if (!neighbor.preprocessingNodes["crossIntersection"]) {
				neighbor.preprocessingNodes["crossIntersection"] =
					new twaver.ShapeNode();
				neighbor.preprocessingNodes["crossIntersection"].setName(
					this._id + ":preprocessing"
				);
				let list = new twaver.List();
				list.addAll(obbpoints2);
				neighbor.preprocessingNodes["crossIntersection"].setPoints(
					list
				);
				neighbor.preprocessingNodes["crossIntersection"].s(
					"vector.fill.color",
					"rgba(102, 204,153 ,0.1)"
				);
				neighbor.preprocessingNodes["crossIntersection"].s(
					"vector.outline.width",
					1
				);
				neighbor.preprocessingNodes["crossIntersection"].s(
					"vector.outline.color",
					"rgba(102, 204,153 ,1.0)"
				);
				neighbor.preprocessingNodes["crossIntersection"].s(
					"label.position",
					"top"
				);
				neighbor.preprocessingNodes["crossIntersection"].s(
					"shapenode.closed",
					true
				);
				neighbor.preprocessingNodes["crossIntersection"].s(
					"body.type",
					"default"
				);
				neighbor.preprocessingNodes["crossIntersection"].setVisible(
					false
				);
				neighbor.preprocessingNodes["crossIntersection"].setLayerId(2);
				box.add(neighbor.preprocessingNodes["crossIntersection"]);
			}
			neighbor._obbpoints =
				neighbor.preprocessingNodes["crossIntersection"].getPoints();
			neighbor.updatePolyData();
		}
	},
	// 后处理
	postprocessing(wall) {},

	/**
	 * 相交判断
	 * @param {}} wall
	 * @returns
	 */
	intersection(neighbor) {
		this.neighbor = neighbor;
		let obb1 = this.originData.obb;
		let obb2 = neighbor.originData.obb;
		let intersection = $Intersection.intersectPolygonPolygon(obb1, obb2);

		if (intersection.status === "Intersection") {
			this.preprocessing(intersection);
			this.addNeighbor(neighbor);
			neighbor.addNeighbor(this);
		}
		return intersection;
	},

	/**
	 *
	 */
	addNeighbor(neighbor) {
		this.neighbors.set(this._id + "-" + neighbor._id, neighbor);
	},

	getNeighbors() {
		console.log(this.neighbors);
		return this.neighbors;
	},
	isBooled(neighbor) {
		return !!this.neighbors.get(this._id + "-" + neighbor._id);
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
		let poly = { regions: [], inverted: false };
		if (walls.length === 0) walls = this.getNeighbors();
		if (walls.length !== 0) {
			walls.forEach((wall) => {
				poly.regions.push(wall.regions);
			});
			if (poly.regions.length === 0) return;
			this.booldatas.intersect = PolyBool.intersect(this.poly, poly);
			this.booldatas.union = PolyBool.union(this.poly, poly);
			this.booldatas.difference = PolyBool.difference(this.poly, poly);
			this.booldatas.differenceRev = PolyBool.differenceRev(
				this.poly,
				poly
			);
			this.booldatas.xor = PolyBool.xor(this.poly, poly);
		}
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
	generate2DShape() {
		this.shapes.d2.shape1 = new twaver.Dummy();
		let difference =
			this.booldatas.difference && this.booldatas.difference.regions;

		if (difference) {
			difference.forEach((un, index) => {
				let child = new twaver.ShapeNode();
				child.setName(this._id + "-" + index + "difference");
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
				this.shapes.d2.shape1.addChild(child);
				this.group && this.group.addChild(this.shapes.d2.shape1);
			});
		} else {
			// 使用预处理之后的顶点数据
			let child = new twaver.ShapeNode();
			child.setName(this._id + ":d2-shape1");
			let points = new twaver.List();
			points.addAll(this._obbpoints);
			child.setPoints(points);
			child.s("vector.fill.color", "rgba(152,0,102,0.1)");
			child.s("vector.outline.width", 1);
			child.s("vector.outline.color", "rgba(152,0,102,1.0)");
			child.s("label.position", "center");
			child.s("shapenode.closed", true);
			child.s("body.type", "default");
			box.add(child);
			child.setLayerId(1);
			this.shapes.d2.shape1.addChild(child);
			this.group && this.group.addChild(this.shapes.d2.shape1);
		}
		this.shapes.d2.shape1.toChildren().forEach((child) => {
			child.setVisible(false);
		});

		// shape1
		/* this.shapes.d2.shape1 = new twaver.Dummy();
		let difference =
			this.booldatas.difference && this.booldatas.difference.regions;
		if (difference) {
			difference.forEach((un, index) => {
				let child = new twaver.ShapeNode();
				child.setName(this._id + "-" + index + ":d2-shape1");
				let points = new twaver.List();
				un.forEach((u) => {
					points.add({
						x: u[0],
						y: u[1],
					});
				});
				if (points.size() > 4) {
					// points = this.postprocessing2d(points);
				}
				child.setPoints(points);
				child.s("vector.fill.color", "rgba(152,0,102,0.1)");
				child.s("vector.outline.width", 1);
				child.s("vector.outline.color", "rgba(152,0,102,1.0)");
				child.s("label.position", "center");
				child.s("shapenode.closed", true);
				child.s("body.type", "default");
				box.add(child);
				child.setLayerId(1);
				this.shapes.d2.shape1.addChild(child);
				this.group && this.group.addChild(this.shapes.d2.shape1);
			});
		} else {
			let child = new twaver.ShapeNode();
			child.setName(this._id + ":d2-shape1");
			let points = this._points;
			child.setPoints(points);
			child.s("vector.fill.color", "rgba(152,0,102,0.1)");
			child.s("vector.outline.width", 1);
			child.s("vector.outline.color", "rgba(152,0,102,1.0)");
			child.s("label.position", "center");
			child.s("shapenode.closed", true);
			child.s("body.type", "default");
			box.add(child);
			child.setLayerId(1);
			this.shapes.d2.shape1.addChild(child);
			this.group && this.group.addChild(this.shapes.d2.shape1);
		}

		this.shapes.d2.shape1.toChildren().forEach((child) => {
			child.setVisible(false);
		}); */
	},

	/**
	 * 2D图纸数据的后期处理, 需要持续优化
	 * @param {*} points
	 */
	postprocessing2d(points) {
		let pp = new twaver.List();
		let ppp = new twaver.List();
		let pppp = new twaver.List();
		let size = points.size();
		points.toArray().forEach((point, index) => {
			pp.add({
				x: point.x,
				y: point.y,
				index: index,
			});
		});
		pp.sort((a, b) => {
			return a.x - b.x;
		});
		pp.toArray().forEach((p, index) => {
			if (
				index === 0 ||
				index === 1 ||
				index === size - 1 ||
				index === size - 2
			) {
				ppp.set(p.index, points.get(p.index));
			}
		});
		ppp.toArray().forEach((p) => {
			pppp.add(p);
		});

		console.log("sort:", points, pp, pppp);
		return pppp;
	},

	/**
	 * 导出2D的墙体信息
	 */
	to2DJson() {},
	/**
	 * union 数据
	 */
	generate3DShape() {
		// side
		this.shapes.d3.top = new twaver.Dummy();
		let union = this.booldatas.union && this.booldatas.union.regions;
		if (union) {
			union.forEach((un, index) => {
				let child = new twaver.Top();
				child.setName(this._id + "-" + index + ":d3-top");
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
				child.setLayerId(1);
				this.shapes.d3.top.addChild(child);
				this.group && this.group.addChild(this.shapes.d3.top);
			});
		} else {
			let child = new twaver.Top();
			child.setName(this._id + ":d3-top");
			let points = this._points;
			child.setPoints(points);
			child.s("vector.fill.color", "rgba(0,255,255,0.1)");
			child.s("vector.outline.width", 1);
			child.s("vector.outline.color", "rgba(0,255,255,1.0)");
			child.s("label.position", "center");
			child.s("shapenode.closed", true);
			child.s("body.type", "default");
			box.add(child);
			child.setLayerId(1);
			this.shapes.d3.top.addChild(child);
			this.group && this.group.addChild(this.shapes.d3.top);
		}

		this.shapes.d3.top.toChildren().forEach((child) => {
			child.setVisible(false);
		});

		// side
		this.shapes.d3.side = new twaver.Dummy();
		let difference =
			this.booldatas.difference && this.booldatas.difference.regions;
		if (difference) {
			difference.forEach((un, index) => {
				let child = new twaver.ShapeNode();
				child.setName(this._id + "-" + index + ":d3-side");
				let points = new twaver.List();
				un.forEach((u) => {
					points.add({
						x: u[0],
						y: u[1],
					});
				});
				child.setPoints(points);
				child.s("vector.fill.color", "rgba(255,102,102,0.1)");
				child.s("vector.outline.width", 1);
				child.s("vector.outline.color", "rgba(255,102,102,1.0)");
				child.s("label.position", "center");
				child.s("shapenode.closed", true);
				child.s("body.type", "default");
				box.add(child);
				child.setLayerId(1);
				this.shapes.d3.side.addChild(child);
				this.group && this.group.addChild(this.shapes.d3.side);
			});
		} else {
			let child = new twaver.ShapeNode();
			child.setName(this._id + ":d3-side");
			let points = this._points;
			child.setPoints(points);
			child.s("vector.fill.color", "rgba(255,102,102,0.1)");
			child.s("vector.outline.width", 1);
			child.s("vector.outline.color", "rgba(255,102,102,1.0)");
			child.s("label.position", "center");
			child.s("shapenode.closed", true);
			child.s("body.type", "default");
			box.add(child);
			child.setLayerId(1);
			this.shapes.d3.side.addChild(child);
			this.group && this.group.addChild(this.shapes.d3.side);
		}

		this.shapes.d3.side.toChildren().forEach((child) => {
			child.setVisible(false);
		});
	},

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
		let neighbors = this.getNeighbors();
		intersect.forEach((un) => {
			let child = new twaver.ShapeNode();
			if (this.neighbor) {
				child.setName(this._id + "-" + this.neighbor._id + "intersect");
			} else {
				child.setName(
					this._id + "-" + neighbors.length + +"多个邻居intersect"
				);
			}

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
		difference.forEach((un, index) => {
			let child = new twaver.ShapeNode();
			child.setName(this._id + "-" + index + "difference");
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
		if (this.shapes.d2.shape1) {
			this.shapes.d2.shape1.toChildren().forEach((child) => {
				child.setVisible(control.shapes["d2-shape1"]);
			});
		}
		if (this.shapes.d3.top) {
			this.shapes.d3.top.toChildren().forEach((child) => {
				child.setVisible(control.shapes["d3-top"]);
			});
		}
		if (this.shapes.d3.side) {
			this.shapes.d3.side.toChildren().forEach((child) => {
				child.setVisible(control.shapes["d3-side"]);
			});
		}
		if (this.preprocessingNodes["crossEndPoint"]) {
			this.preprocessingNodes["crossEndPoint"].setVisible(
				control.preprocessing.visible
			);
		}
		if (this.preprocessingNodes["crossIntersection"]) {
			this.preprocessingNodes["crossIntersection"].setVisible(
				control.preprocessing.visible
			);
		}
	},
});

twaver.WallUI = function (network, element) {
	twaver.WallUI.superClass.constructor.call(this, network, element);
};

twaver.Util.ext(twaver.WallUI, twaver.vector.ShapeNodeUI, {
	paintBody: function (ctx) {
		// let element = this._element;
		// element.setControl(controlOptions);
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
