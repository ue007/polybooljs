// let testwall = {
// 	known: {
// 		walls: [
// 			// 水平
// 			{
// 				coordinates: [
// 					[371, 12165],
// 					[18316, 12165],
// 				],
// 				width: 200,
// 				type: "normal",
// 				code: "Q0101",
// 			},
// 			// 垂直
// 			{
// 				coordinates: [
// 					[371, 12165],
// 					[18316, 12165],
// 				],
// 				width: 200,
// 				type: "normal",
// 				code: "Q0101",
// 			},
// 			// {
// 			// 	coordinates: [
// 			// 		[371, 24765],
// 			// 		[33266, 24765],
// 			// 	],
// 			// 	width: 200,
// 			// 	type: "normal",
// 			// 	code: "Q0101",
// 			// },
// 			// {
// 			// 	coordinates: [
// 			// 		[4629, 3430],
// 			// 		[4629, 32165],
// 			// 	],
// 			// 	width: 200,
// 			// 	type: "normal",
// 			// 	code: "Q0101",
// 			// },
// 			// {
// 			// 	coordinates: [
// 			// 		[6629, 3430],
// 			// 		[6629, 12165],
// 			// 	],
// 			// 	width: 200,
// 			// 	type: "normal",
// 			// 	code: "Q0101",
// 			// },
// 			// {
// 			// 	coordinates: [
// 			// 		[8629, 3430],
// 			// 		[8629, 12065],
// 			// 	],
// 			// 	width: 200,
// 			// 	type: "normal",
// 			// 	code: "Q0101",
// 			// },
// 			// {
// 			// 	coordinates: [
// 			// 		[10629, 3430],
// 			// 		[10629, 12265],
// 			// 	],
// 			// 	width: 200,
// 			// 	type: "normal",
// 			// 	code: "Q0101",
// 			// },
// 			// {
// 			// 	coordinates: [
// 			// 		[12629, 3430],
// 			// 		[12629, 12400],
// 			// 	],
// 			// 	width: 200,
// 			// 	type: "normal",
// 			// 	code: "Q0101",
// 			// },
// 			// {
// 			// 	coordinates: [
// 			// 		[18316, 3430],
// 			// 		[18316, 12165],
// 			// 	],
// 			// 	width: 300,
// 			// 	type: "normal",
// 			// 	code: "Q0101",
// 			// },
// 			// {
// 			// 	coordinates: [
// 			// 		[371, 3430],
// 			// 		[371, 12165],
// 			// 	],
// 			// 	width: 300,
// 			// 	type: "normal",
// 			// 	code: "Q0101",
// 			// },
// 			// {
// 			// 	coordinates: [
// 			// 		[18426, 12165],
// 			// 		[18426, 18165],
// 			// 	],
// 			// 	width: 300,
// 			// 	type: "normal",
// 			// 	code: "Q0101",
// 			// },
// 			// {
// 			// 	coordinates: [
// 			// 		[371, 12165],
// 			// 		[371, 18165],
// 			// 	],
// 			// 	width: 300,
// 			// 	type: "normal",
// 			// 	code: "Q0101",
// 			// },
// 			// {
// 			// 	coordinates: [
// 			// 		[0, 3315],
// 			// 		[20316, 3315],
// 			// 	],
// 			// 	width: 200,
// 			// 	type: "normal",
// 			// 	code: "Q0101",
// 			// },
// 			// {
// 			// 	coordinates: [
// 			// 		[0, 18266],
// 			// 		[33266, 18266],
// 			// 	],
// 			// 	width: 200,
// 			// 	type: "normal",
// 			// 	code: "Q0101",
// 			// },
// 			// {
// 			// 	coordinates: [
// 			// 		[0, 18266],
// 			// 		[0, 38266],
// 			// 	],
// 			// 	width: 400,
// 			// 	type: "normal",
// 			// 	code: "Q0101",
// 			// },
// 			// {
// 			// 	coordinates: [
// 			// 		[28426, 0],
// 			// 		[28426, 38266],
// 			// 	],
// 			// 	width: 400,
// 			// 	type: "normal",
// 			// 	code: "Q0101",
// 			// },

// 		],
// 	},
// };

// 水平 ok
let testwall = {
	known: {
		walls: [
			{
				coordinates: [
					[371, 12165],
					[18316, 12165],
				],
				width: 200,
				type: "normal",
				code: "Q0101",
			},
		],
	},
};

// 垂直 ok 
testwall = {
	known: {
		walls: [
			{
				coordinates: [
					[371, 12165],
					[371, 32165],
				],
				width: 200,
				type: "normal",
				code: "Q0101",
			},
		],
	},
};

// 矩形Room ok 
testwall = {
	known: {
		walls: [
			{
				coordinates: [
					[371, 12165],
					[18316, 12165],
				],
				width: 200,
				type: "normal",
				code: "Q0101",
			},
			{
				coordinates: [
					[371, 12165],
					[371, 32165],
				],
				width: 200,
				type: "normal",
				code: "Q0101",
			},
			{
				coordinates: [
					[18316, 12165],
					[18316, 32165],
				],
				width: 200,
				type: "normal",
				code: "Q0101",
			},
			{
				coordinates: [
					[371, 32165],
					[18316, 32165],
				],
				width: 200,
				type: "normal",
				code: "Q0101",
			},
		],
	},
};


// 
testwall = {
	known: {
		walls: [
			{
				coordinates: [
					[371, 12165],
					[18316, 12165],
				],
				width: 200,
				type: "normal",
				code: "Q0101",
			},
			{
				coordinates: [
					[371, 12165],
					[371, 32165],
				],
				width: 200,
				type: "normal",
				code: "Q0101",
			},
			{
				coordinates: [
					[18316, 12165],
					[18316, 32165],
				],
				width: 200,
				type: "normal",
				code: "Q0101",
			},
			{
				coordinates: [
					[371, 32165],
					[18316, 32165],
				],
				width: 200,
				type: "normal",
				code: "Q0101",
			},
			{
				coordinates: [
					[371, 22165],
					[18316, 22165],
				],
				width: 200,
				type: "normal",
				code: "Q0101",
			},
			{
				coordinates: [
					[2371, 12165],
					[2371, 22165],
				],
				width: 200,
				type: "normal",
				code: "Q0101",
			},
			{
				coordinates: [
					[4371, 11165],
					[4371, 24165],
				],
				width: 200,
				type: "normal",
				code: "Q0101",
			},
			{
				coordinates: [
					[6371, 16165],
					[6371, 24165],
				],
				width: 200,
				type: "normal",
				code: "Q0101",
			},
			{
				coordinates: [
					[8371, 16165],
					[8371, 34165],
				],
				width: 200,
				type: "normal",
				code: "Q0101",
			},
			{
				coordinates: [
					[10371, 11165],
					[10371, 34165],
				],
				width: 200,
				type: "normal",
				code: "Q0101",
			},
		],
	},
};
