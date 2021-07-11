
/**
 * 2D向量对象  二维对象向量对象
 * @class mono.Vec2
 * @constructor
 * @param {Number} x x坐标值
 * @param {Number} y y坐标值
 * @example
 *    var v = new mono.Vec2(x,y);
 */
var $Vec2 = function(x, y) {
	this.x = x || 0;
	this.y = y || 0;
};
$Vec2.prototype = {
	constructor : $Vec2,
	/**
	 * 设置mono.Vec2对象的坐标
	 * @method set
	 * @param {Number} x x坐标值
	 * @param {Number} y y坐标值
	 * @return {mono.Vec2} 返回设置了坐标的向量
	 */
	set : function(x, y) {
		this.x = x;
		this.y = y;
		return this;
	},
	/**
	 * 设置mono.Vec2对象的X坐标
	 * @method setX
	 * @param {Number} x x坐标值
	 * @return {mono.Vec2} 返回设置了X坐标的向量
	 */
	setX : function(x) {
		this.x = x;
		return this;
	},
	/**
	 * 设置mono.Vec2对象的y坐标
	 * @method setY
	 * @param {Number} y y坐标值
	 * @return {mono.Vec2} 返回设置了y坐标的向量
	 */
	setY : function(y) {
		this.y = y;
		return this;
	},
	/**
	 * 设置mono.Vec2对象的任意一个坐标
	 * @method setComponent
	 * @param {number} index 需要设置的坐标轴;index = 0，设置X轴坐标；index = 1，设置y轴坐标；
	 * @param {number} value 坐标值
	 */
	setComponent : function(index, value) {
		switch ( index ) {
			case 0:
				this.x = value;
				break;
			case 1:
				this.y = value;
				break;
			default:
				throw new Error("index is out of range: " + index);
		}
	},
	/**
	 * 获取向量的任意一个坐标
	 * @method getComponent
	 * @param {number} index 需要获取的坐标轴，index = 0，返回X轴坐标；index = 1，返回y轴坐标；
	 */
	getComponent : function(index) {
		switch ( index ) {
			case 0:
				return this.x;
			case 1:
				return this.y;
			default:
				throw new Error("index is out of range: " + index);
		}
	},
	/**
	 * 复制mono.Vec2对象
	 * @method copy
	 * @param {mono.Vec2} v 被复制的对象
	 * @return {mono.Vec2} 返回结果向量
	 */
	copy : function(v) {
		this.x = v.x;
		this.y = v.y;
		return this;
	},
	/**
	 * 与其他向量的加法
	 * @method add
	 * @param {mono.Vec2} v 等待被加的对象
	 * @return {mono.Vec2} 返回结果向量
	 */
	add : function(v) {
		this.x += v.x;
		this.y += v.y;
		return this;
	},
	/**
	 * 两个向量相加
	 * @method addVectors
	 * @param {mono.Vec2} a 被加的向量a
	 * @param {mono.Vec2} b 被加的向量b
	 * @return {mono.Vec2} 返回结果向量
	 */
	addVectors : function(a, b) {
		this.x = a.x + b.x;
		this.y = a.y + b.y;
		return this;
	},
	/**
	 * 向量每个坐标上的长度与常量s相加
	 * @method addScalar
	 * @param {number} s 被加的常量
	 * @return {mono.Vec2} 返回结果向量
	 */
	addScalar : function(s) {
		this.x += s;
		this.y += s;
		return this;
	},
	/**
	 * 与其他向量的减法
	 * @method sub
	 * @param {mono.Vec2} v 作为减数的向量
	 * @return {mono.Vec2} 返回结果向量
	 */
	sub : function(v) {
		this.x -= v.x;
		this.y -= v.y;
		return this;
	},
	/**
	 * 返回两个向量相减结果
	 * @method subVectors
	 * @param {mono.Vec2} a 被减数向量a
	 * @param {mono.Vec2} b 减数向量b
	 * @return {mono.Vec2} 返回结果向量
	 */
	subVectors : function(a, b) {
		this.x = a.x - b.x;
		this.y = a.y - b.y;
		return this;
	},
	/**
	 * 向量每个坐标上的长度与常量相乘
	 * @method multiplyScalar
	 * @param {mono.Vec2} s 被乘的常量
	 * @return {mono.Vec2} 返回结果向量
	 */
	multiplyScalar : function(s) {
		this.x *= s;
		this.y *= s;
		return this;
	},
	/**
	 * 与向量相乘
	 * @method multiply
	 * @param {mono.Vec2} v 等待被乘的向量
	 * @return {mono.Vec2} 返回结果向量
	 */
	multiply: function(v){
	    this.x *= v.x;
	    this.y *= v.y;
	    return this;
	},
	/**
	 * 向量每个坐标上的长度与常量相除
	 * @method divideScalar
	 * @param {number} s 被除的常量 s不能为 0
	 * @return {mono.Vec2} 返回结果向量
	 */
	divideScalar : function(s) {
		if (s !== 0) {
			this.x /= s;
			this.y /= s;
		} else {
			this.set(0, 0);
		}
		return this;
	},
	/**
	 * 向量每个坐标与v的每个坐标比较大小
	 * @method min
	 * @param {mono.Vec2} v 被比较的向量
	 * @return {mono.Vec2} 返回 较小的x,y组成的向量
	 */
	min : function(v) {
		if (this.x > v.x) {
			this.x = v.x;
		}
		if (this.y > v.y) {
			this.y = v.y;
		}
		return this;
	},
	/**
	 * 向量每个坐标与v的每个坐标比较大小
	 * @method max
	 * @param {mono.Vec2} v 被比较的向量
	 * @return {mono.Vec2} 返回 较大的x,y组成的向量
	 */
	max : function(v) {
		if (this.x < v.x) {
			this.x = v.x;
		}
		if (this.y < v.y) {
			this.y = v.y;
		}
		return this;
	},
	/**
	 * 向量向max和min向量靠近
	 * @method clamp
	 * @param {mono.Vec2} min min向量
	 * @param {mono.Vec2} max max向量
	 * @return {mono.Vec2} 如果该向量x或y的值大于最大向量的x或y值，由相应的值替换；
	 *如果该向量x或y值小于最小向量的x或y值，由相应的值替换。返回替换后的向量
	 */
	clamp : function(min, max) {
		// This function assumes min < max, if this assumption isn't true it will not operate correctly
		if (this.x < min.x) {
			this.x = min.x;
		} else if (this.x > max.x) {
			this.x = max.x;
		}
		if (this.y < min.y) {
			this.y = min.y;
		} else if (this.y > max.y) {
			this.y = max.y;
		}
		return this;
	},
	/**
	 * 向量反向
	 * @method negate
	 * @return {mono.Vec2} 返回每个坐标乘以 -1 后反向的向量
	 */
	negate : function() {
		return this.multiplyScalar(-1);
	},
	/**
	 * 向量与向量v的数量积
	 * @method dot
	 * @return {number} 数量积
	 */
	dot : function(v) {
		return this.x * v.x + this.y * v.y;
	},
	/**
	 * 计算向量的长度的平方
	 * @method lengthSq
	 * @return {number} 向量长度的平方
	 */
	lengthSq : function() {
		return this.x * this.x + this.y * this.y;
	},
	/**
	 * 计算向量的长度
	 * @method length
	 * @return {number} 向量长度
	 */
	length : function() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	},
	/**
	 * 获取单位向量，向量/向量长度
	 * @method normalize
	 * @return {mono.Vec2} 返回向量的单位向量
	 */
	normalize : function() {
		return this.divideScalar(this.length());
	},
	/**
	 * 计算向量与向量v距离
	 * @method distanceTo
	 * @param {mono.Vec2} v  v向量
	 * @return {number} 返回向量与向量v距离
	 */
	distanceTo : function(v) {
		return Math.sqrt(this.distanceToSquared(v));
	},
	/**
	 * 计算向量与向量v距离的平方
	 * @method distanceToSquared
	 * @param {mono.Vec2} v  v向量
	 * @return {number} 返回向量与向量v距离的平方
	 */
	distanceToSquared : function(v) {
		var dx = this.x - v.x, dy = this.y - v.y;
		return dx * dx + dy * dy;
	},
	/**
	 * 截取 l/向量长度 的向量，向量长度不能为 0 或 l
	 * @method setLength
	 * @param {number} l 长度
	 * @return {mono.Vec2} 返回各个坐标都乘以 l/向量长度 的向量
	 */
	setLength : function(l) {
		var oldLength = this.length();
		if (oldLength !== 0 && l !== oldLength) {
			this.multiplyScalar(l / oldLength);
		}
		return this;
	},
	/**
	 * 计算向量与V向量时间的线性插值
	 * @method lerp
	 * @param {mono.Vec2} v 向量
	 * @param {Float} alpha 取值 0 ~ 1
	 * @return {mono.Vec2} 向量与V向量时间的线性插值
	 */
	lerp : function(v, alpha) {
		this.x += (v.x - this.x ) * alpha;
		this.y += (v.y - this.y ) * alpha;
		return this;
	},
	/**
	 * 判断向量与V向量是否相等
	 * @method equals
	 * @param {mono.Vec2} v 被比较的向量
	 * @return {Boolean} 向量与V向量相等返回true，否则返回false
	 */
	equals : function(v) {
		if(v == null){
			return false;
		}
		return ((v.x === this.x ) && (v.y === this.y ) );
	},
	/**
	 * 复制向量
	 * @method clone
	 * @return {mono.Vec2} 返回复制的向量
	 */
	clone : function() {
		return new $Vec2(this.x, this.y);
	}
};
