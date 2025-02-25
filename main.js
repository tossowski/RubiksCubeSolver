import * as THREE from 'three';
import {RubixCube, AXIS, DIRECTION, sides} from './rubix.js';
import { CubeAnimation, RotateCubeAnimation, RotateFaceAnimation } from './animation.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


// Useful Constants
CubeAnimation.animationSpeed = 0.1
let MIN_SPEED = 0.01;
let MAX_SPEED = 1;
let DEFAULT_CAMERA_DISTANCE = 5;
let DEFAULT_CAMERA_X = 2.5;
let renderqueue = [];
let CUBE_DIM = 3;
let animating = false;

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer({"antialiasing":true});
const controls = new OrbitControls( camera, renderer.domElement );
controls.minDistance = 3;
controls.maxDistance = 50;
controls.distance = DEFAULT_CAMERA_DISTANCE;


renderer.setSize( window.innerWidth, window.innerHeight );
scene.background = new THREE.Color( 0x808080 );
document.body.appendChild( renderer.domElement );

// Sphere Geometry 1
let sphereGeometry1 = new THREE.SphereGeometry(100, 30, 30);

// Sphere Material 1
let sphereMaterial1 = new THREE.MeshLambertMaterial({
	color: 0xffffff
});

// Sphere Mesh 1
let sphereMesh1 = new THREE.Mesh(sphereGeometry1, sphereMaterial1);
sphereMesh1.receiveShadow = true;
sphereMesh1.position.set(0, 0, 0);
scene.add(sphereMesh1);


// Pivot point
let pivotPoint = new THREE.Object3D();
sphereMesh1.add(pivotPoint);
pivotPoint.position.set(0,0,0);

let rcube = new RubixCube(CUBE_DIM);

const clearCube = function(size) {
	renderqueue = [];
	rcube.cubes.map(x => scene.remove(x));
	rcube = new RubixCube(size);
	const cubes = rcube.cubes;
	for (let i = 0; i < cubes.length; i++) {
		scene.attach(cubes[i]);
	}
}

const resetCamera = function() {
	controls.reset();
	controls.minDistance = 3;
	controls.maxDistance = 50;
	controls.distance = DEFAULT_CAMERA_DISTANCE;
	camera.position.z = DEFAULT_CAMERA_X;
	camera.position.x = DEFAULT_CAMERA_X;
	camera.position.y = DEFAULT_CAMERA_X;
	camera.lookAt(0,0,0);
}

clearCube(CUBE_DIM);
resetCamera();

const turn = function(axis, direction, num_turns, index, cube) {
	if (cube) {
        cube.rotate(axis, direction, num_turns, index);
	}
	return new RotateFaceAnimation(rcube, scene, camera, renderer, axis, direction, num_turns, index, pivotPoint)
}

const randomTurn = function(cube) {
	let index = Math.floor(Math.random() * CUBE_DIM);
	let direction = Math.floor(Math.random() * 2);
	if (direction == 0) {
		direction = -1;
	}
	let axis = Math.floor(Math.random() * 2);
	let num_turns =  Math.floor(Math.random() * 2) + 1;

	// axis=AXIS.DEPTH;
	// direction=DIRECTION.CLOCKWISE;
	// num_turns = 1;
	// index = 2;
	if (cube) {
        cube.rotate(axis, direction, num_turns, index);
	}
	
	return new RotateFaceAnimation(rcube, scene, camera, renderer, axis, direction, num_turns, index, pivotPoint)
	
};

const turnEntireCube = function (faceNum, cube) {
	let direction = (faceNum === 1 || faceNum === 2) ? DIRECTION.COUNTERCLOCKWISE : DIRECTION.CLOCKWISE;
	let axis = (faceNum === 2 || faceNum === 3) ? AXIS.VERTICAL : AXIS.HORIZONTAL;
	let num_turns = faceNum === 5 ? 2 : 1;
	if (cube) {
        cube.rotateEntireCube(axis, direction, num_turns);
	}
	return new RotateCubeAnimation(rcube, scene, camera, renderer, axis, direction, num_turns, pivotPoint)

}

const primeCube = function(cube) {
    let cornerCubie = cube.cubes[26];
	let cubieTopColor = cornerCubie.faceColors[sides.TOP];
	let cubieFrontColor = cornerCubie.faceColors[sides.FRONT];
	let cubieRightColor = cornerCubie.faceColors[sides.RIGHT];
	let moves = [];
	if (cubieTopColor !== rcube.cubes[16].faceColors[sides.TOP]) {
		if (rcube.cubes[4].faceColors[sides.LEFT] === cubieTopColor) {
			moves.push(turn(AXIS.DEPTH, DIRECTION.COUNTERCLOCKWISE, 1, 1, cube));
		} else if (rcube.cubes[14].faceColors[sides.FRONT] === cubieTopColor) {
			moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 1, cube));
		} else if (rcube.cubes[22].faceColors[sides.RIGHT] === cubieTopColor) {
			moves.push(turn(AXIS.DEPTH, DIRECTION.CLOCKWISE, 1, 1, cube));
		} else if (rcube.cubes[12].faceColors[sides.BACK] === cubieTopColor) {
			moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 1, cube));
		} else if (rcube.cubes[10].faceColors[sides.BOTTOM] === cubieTopColor) {
			moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 2, 1, cube));
		}
	}
	
	while(cube.cubes[14].faceColors[sides.FRONT] !== cubieFrontColor ||
		  cube.cubes[22].faceColors[sides.RIGHT] !== cubieRightColor) {
			moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 1, cube));
		  }

	return moves;
  }

const leftAlgo = function(cube) {
	let moves = [];
	moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 0, cube));
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 0, cube))
	moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 0, cube));
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 0, cube));
	moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 0, cube));
	moves.push(turn(AXIS.DEPTH, DIRECTION.CLOCKWISE, 1, 2, cube));
	moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 0, cube));
	moves.push(turn(AXIS.DEPTH, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));
	return moves;
}

const rightAlgo = function(cube) {
	let moves = [];
	moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 0, cube));
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));	
	moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 0, cube));
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 2, cube));
	moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 0, cube));
	moves.push(turn(AXIS.DEPTH, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));
	moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 0, cube));
	moves.push(turn(AXIS.DEPTH, DIRECTION.CLOCKWISE, 1, 2, cube));
	return moves;
}

const switch12 = function(cube) {
	let moves = [];
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 0, cube));	
	moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));	
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 0, cube));
	moves.push(turn(AXIS.DEPTH, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));
	moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 2, cube));	
	moves.push(turn(AXIS.DEPTH, DIRECTION.CLOCKWISE, 1, 2, cube));
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 0, cube));	
	moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 2, cube));	
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 0, cube));
	moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 2, 2, cube));	

	return moves;
}

const switch13 = function(cube) {
	let moves = [];
	moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 2, cube));	
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 0, cube));	
	moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));	
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 0, cube));
	moves.push(turn(AXIS.DEPTH, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));
	moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 2, cube));	
	moves.push(turn(AXIS.DEPTH, DIRECTION.CLOCKWISE, 1, 2, cube));
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 0, cube));	
	moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 2, cube));	
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 0, cube));
	moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 2, cube));	
	return moves;


}

const checkLastLayerEdges = function(cube) {
	let topColor = cube.cubes[16].faceColors[sides.TOP];
	let backColor = cube.cubes[12].faceColors[sides.BACK];
	let rightColor = cube.cubes[22].faceColors[sides.RIGHT];
	let leftColor = cube.cubes[4].faceColors[sides.LEFT];
	let frontColor = cube.cubes[14].faceColors[sides.FRONT];

	return ([topColor, frontColor].includes(cube.cubes[17].faceColors[sides.TOP]) && [topColor, frontColor].includes(cube.cubes[17].faceColors[sides.FRONT])) &&
		([topColor, rightColor].includes(cube.cubes[25].faceColors[sides.TOP]) && [topColor, rightColor].includes(cube.cubes[25].faceColors[sides.RIGHT])) &&
		([topColor, backColor].includes(cube.cubes[15].faceColors[sides.TOP]) && [topColor, backColor].includes(cube.cubes[15].faceColors[sides.BACK])) &&
		([topColor, leftColor].includes(cube.cubes[7].faceColors[sides.TOP]) && [topColor, leftColor].includes(cube.cubes[7].faceColors[sides.LEFT]))

}

// Step 5 Algo
const lastCornerFixAlgo = function(cube) {
	let moves = [];
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 0, cube));	
	moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));	
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 0, cube));
	moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));	
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 0, cube));	
	moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 2, 2, cube));	
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 0, cube));
	moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 2, 2, cube));	

	return moves;
}

//Step 6 algo
const fixLastLayerEdgesAlgo = function(cube) {
	let moves = [];
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 1, cube));	
	moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));	
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 1, cube));
	moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 2, 2, cube));	
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 1, cube));	
	moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));	
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 1, cube));
	return moves;
}

const dedmoreH = function(cube) {
	let moves = [];
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));
	moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 1, cube));	
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 2, 2, cube));
	moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 2, 1, cube));	
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));
	moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 2, 2, cube));	
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 2, cube));
	moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 2, 1, cube));	
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 2, 2, cube));
	moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 1, cube));	
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 2, cube));
	moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 2, 2, cube));	
	return moves;
}

const dedmoreFish = function(cube) {
	let moves = [];
	moves.push(turn(AXIS.DEPTH, DIRECTION.CLOCKWISE, 1, 2, cube));
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 0, cube));	
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));
	moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 1, cube));	
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 2, 2, cube));
	moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 2, 1, cube));	
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));
	moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 2, 2, cube));	
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 2, cube));
	moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 2, 1, cube));	
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 2, 2, cube));
	moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 1, cube));	
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 2, cube));
	moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 2, 2, cube));	
	moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 0, cube));	
	moves.push(turn(AXIS.DEPTH, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));
	return moves;
}

const checkLastLayerCornersSolved = function(cube) {
	let topColor = cube.cubes[16].faceColors[sides.TOP];
	let leftColor = cube.cubes[4].faceColors[sides.LEFT];
	let backColor = cube.cubes[12].faceColors[sides.BACK];
	let rightColor = cube.cubes[22].faceColors[sides.RIGHT];
	let frontColor = cube.cubes[14].faceColors[sides.FRONT];

	return (cube.cubes[8].faceColors[sides.TOP] === topColor &&
		cube.cubes[8].faceColors[sides.LEFT] === leftColor &&
		cube.cubes[8].faceColors[sides.FRONT] === frontColor &&
		cube.cubes[26].faceColors[sides.TOP] === topColor &&
		cube.cubes[26].faceColors[sides.FRONT] === frontColor &&
		cube.cubes[26].faceColors[sides.RIGHT] === rightColor &&
		cube.cubes[24].faceColors[sides.TOP] === topColor &&
		cube.cubes[24].faceColors[sides.RIGHT] === rightColor &&
		cube.cubes[24].faceColors[sides.BACK] === backColor &&
		cube.cubes[6].faceColors[sides.TOP] === topColor &&
		cube.cubes[6].faceColors[sides.LEFT] === leftColor &&
		cube.cubes[6].faceColors[sides.BACK] === backColor)

}

const checkLastLayerConfig = function(cube) {

	let topColor = cube.cubes[16].faceColors[sides.TOP];


	if (cube.cubes[8].faceColors[sides.FRONT] === topColor &&
		cube.cubes[26].faceColors[sides.TOP] === topColor) {
			return 1;
	} else if ((cube.cubes[26].faceColors[sides.RIGHT] === topColor && 
		cube.cubes[24].faceColors[sides.RIGHT] === topColor))  {
			return 2;
	} else if ((cube.cubes[26].faceColors[sides.TOP] === topColor &&
		cube.cubes[24].faceColors[sides.RIGHT] === topColor)) {
			return 3;
	} else {
		return 0;
	}
}

const solveLastLayerCorners = function(cube) {
	let moves = [];
	let foundConfig = false;
	let configsUsed = [];

	while (!checkLastLayerCornersSolved(cube)) {
		foundConfig = false;
		while (!foundConfig) {
			for (let k = 0; k < 4; k++) {
				moves.push(turnEntireCube(3, cube));
				let config = checkLastLayerConfig(cube)
				if (config !== 0 && (configsUsed.length > 1 || !configsUsed.includes(config))) {
					foundConfig = true;
					if (!configsUsed.includes(config)) {
						configsUsed.push(config);
					}
					break;
				}
			}
			if (!foundConfig) {
				moves = moves.concat(lastCornerFixAlgo(cube));
			}
		}
		moves = moves.concat(lastCornerFixAlgo(cube));
	}
	
	return moves;
	
}

const arrangeLastLayerCorners = function(cube) {
	let moves = [];
	moves.push(turnEntireCube(5, cube));

	let potentialCubes = [26, 24, 8, 6];
	let nextCorner = 0;

	for (let k = 0; k < 4; k++) {
		moves.push(turnEntireCube(3, cube));
		let cubes = cube.cubes;
		let frontColor = cubes[14].faceColors[sides.FRONT];
		let leftColor = cubes[4].faceColors[sides.LEFT];
		let topColor = cubes[16].faceColors[sides.TOP];
		for (let i = 0; i < potentialCubes.length; i++) {
			if (cubes[potentialCubes[i]].faceColors.includes(frontColor) &&
				cubes[potentialCubes[i]].faceColors.includes(leftColor) &&
				cubes[potentialCubes[i]].faceColors.includes(topColor)) {
					nextCorner = potentialCubes[i];
					break;
			}
		}

		if (nextCorner === 6) {
			moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));	
			moves = moves.concat(switch12(cube));
			moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 2, cube));	
		} else if (nextCorner === 26) {
			moves = moves.concat(switch12(cube));
		} else if (nextCorner === 24) {
			moves = moves.concat(switch13(cube));
			moves = moves.concat(switch12(cube));
		}

	}
	
	return moves;
	

}

const solveSecondLayer = function(cube) {
	let moves = [];
	let potentialCubes = [11, 19, 9, 1, 5, 23, 21, 3];
	let desired = [11, 19, 9, 1];

	for (let k = 0; k < 4; k++) {
		moves.push(turnEntireCube(3, cube));
		let cubes = cube.cubes;
		let frontColor = cubes[14].faceColors[sides.FRONT];
		let leftColor = cubes[4].faceColors[sides.LEFT];
		let nextEdge = 26;

		for (let i = 0; i < potentialCubes.length; i++) {
			if (cubes[potentialCubes[i]].faceColors.includes(frontColor) &&
				cubes[potentialCubes[i]].faceColors.includes(leftColor)) {
					nextEdge = potentialCubes[i];
			}
		}

		while (!desired.includes(nextEdge)) {
			cubes = cube.cubes;
			if (nextEdge === 5) {
				if (cubes[5].faceColors[sides.FRONT] === leftColor) {
					moves = moves.concat(leftAlgo(cube));
					moves = moves.concat(leftAlgo(cube));
				} else {
					break;
				}
			} else if (nextEdge === 23) {
				moves = moves.concat(rightAlgo(cube));
			} else if (nextEdge === 21) {
				moves.push(turnEntireCube(3, cube));
				moves = moves.concat(rightAlgo(cube));
				moves.push(turnEntireCube(2, cube));
			} else if (nextEdge === 3) {
				moves.push(turnEntireCube(2, cube));
				moves = moves.concat(leftAlgo(cube));
				moves.push(turnEntireCube(3, cube));
			}

			for (let i = 0; i < potentialCubes.length; i++) {
				if (cubes[potentialCubes[i]].faceColors.includes(frontColor) &&
					cubes[potentialCubes[i]].faceColors.includes(leftColor)) {
						nextEdge = potentialCubes[i];
						break;
				}
			}
		}
		
		if (nextEdge === 19) {
			moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 0, cube));
		} else if (nextEdge === 9) {
			moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 2, 0, cube));
		} else if (nextEdge === 1) {
			moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 0, cube));
		} else if (nextEdge === 5) {
			continue;
		}

		if (cubes[11].faceColors[sides.FRONT] !== cubes[14].faceColors[sides.FRONT]) {
			moves.push(turnEntireCube(2, cube));
			moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 0, cube));
			moves = moves.concat(rightAlgo(cube));
			// Right
			moves.push(turnEntireCube(3, cube));
		} else {
			// Left
			moves = moves.concat(leftAlgo(cube));
		}
		
		



	}

	return moves;

}

const solveFirstLayerEdges = function(cube) {
	let moves = [];
	let potentialCubes = [23, 21, 5, 3, 11, 19, 1, 9, 17, 7, 25, 15];
	for (let k = 0; k < 4; k++) {
		moves = moves.concat([turnEntireCube(3, cube)]);
		let nextEdge = 17;
		let topColor = cube.cubes[16].faceColors[sides.TOP];
		let sideColor = cube.cubes[14].faceColors[sides.FRONT];
		let cubes = cube.cubes;
		for (let i = 0; i < potentialCubes.length; i++) {
			if (cubes[potentialCubes[i]].faceColors.includes(topColor) &&
				cubes[potentialCubes[i]].faceColors.includes(sideColor)) { 	
					nextEdge = potentialCubes[i];
					break;
				}
		}

		let row = 0;

		if (nextEdge === 17) {
			row = 2;
		} else if (nextEdge === 23) {
			row = 1;
		} else if (nextEdge === 21) {
			moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 1, cube));
			row = 1;
		} else if (nextEdge === 3) {
			moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 2, 1, cube));
			row = 1;
		} else if (nextEdge === 5) {
			moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 1, cube));
			row = 1;
		} else if (nextEdge === 19) {
			moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 0, cube));
			row = 0;
		} else if (nextEdge === 1) {
			moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 0, cube));
			row = 0;
		} else if (nextEdge === 9) {
			moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 2, 0, cube));
			row = 0;
		} else if (nextEdge == 7) {
			moves.push(turn(AXIS.DEPTH, DIRECTION.CLOCKWISE, 1, 1, cube));
			moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 0, cube));
			moves.push(turn(AXIS.DEPTH, DIRECTION.COUNTERCLOCKWISE, 1, 1, cube));	
			row = 0;
		} else if (nextEdge == 25) {
			moves.push(turn(AXIS.DEPTH, DIRECTION.COUNTERCLOCKWISE, 1, 1, cube));
			moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 0, cube));
			moves.push(turn(AXIS.DEPTH, DIRECTION.CLOCKWISE, 1, 1, cube));	
			row = 0;
		} else if (nextEdge == 15) {
			moves.push(turn(AXIS.DEPTH, DIRECTION.COUNTERCLOCKWISE, 1, 0, cube));
			moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 1, cube));
			moves.push(turn(AXIS.DEPTH, DIRECTION.CLOCKWISE, 1, 0, cube));
			row = 1;
		}

		if (row === 2) {
			if (cube.cubes[17].faceColors[sides.FRONT] === topColor) {
				moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 1, cube));
				moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 2, 0, cube));
				moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 1, cube));
				moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 0, cube));
				moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 1, cube));
				moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 0, cube));
				moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 1, cube));
			}
		} else if (row === 1) {
			if (cube.cubes[23].faceColors[sides.RIGHT] === topColor) {
				moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 1, cube));
				moves.push(turn(AXIS.DEPTH, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));
				moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 1, cube));
				moves.push(turn(AXIS.DEPTH, DIRECTION.CLOCKWISE, 1, 2, cube));	
			} else {

				moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 1, cube));
				moves.push(turn(AXIS.DEPTH, DIRECTION.CLOCKWISE, 1, 2, cube));
				moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 2, 1, cube));
				moves.push(turn(AXIS.DEPTH, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));
				moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 1, cube));

			}
		} else {
			if (cube.cubes[11].faceColors[sides.BOTTOM] === topColor) {
				moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 1, cube));
				moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 2, 0, cube));
				moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 1, cube));
			} else {
				moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 0, cube));
				moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 1, cube));
				moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 0, cube));
				moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 1, cube));
			}
		}

		if (nextEdge === 5) {
			moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 1, cube));
		} else if (nextEdge === 21) {
			moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 1, cube));
		} else if (nextEdge === 3) {
			moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 2, 1, cube));
		} else if (nextEdge === 15) {
			moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 1, cube));
		} 

	}
	return moves;
}

const solveCorners = function(cube) {
	let moves = [];
	for (let k = 0; k < 3; k++) {
		moves = moves.concat([turnEntireCube(3, cube)]);
		let potentialCubes = [20, 18, 2, 0, 6, 24, 26];
		let nextCorner = 26;
		let topColor = cube.cubes[16].faceColors[sides.TOP];
		let sideColor = cube.cubes[14].faceColors[sides.FRONT];
		let rightColor = cube.cubes[14].faceColors[sides.RIGHT];
		let cubes = cube.cubes;
		for (let i = 0; i < potentialCubes.length; i++) {
			if (cubes[potentialCubes[i]].faceColors.includes(topColor) &&
				cubes[potentialCubes[i]].faceColors.includes(sideColor) &&
				cubes[potentialCubes[i]].faceColors.includes(rightColor)) { 	
					nextCorner = potentialCubes[i];
					break;
				}
		}

		if (nextCorner == 18) {
			moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 0, cube));
		} else if (nextCorner == 2) {
			moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 0, cube));
		} else if (nextCorner == 0) {
			moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 2, 0, cube));
		} else if (nextCorner == 6) {
			moves.push(turn(AXIS.DEPTH, DIRECTION.CLOCKWISE, 1, 0, cube));
			moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 2, 0, cube));
			moves.push(turn(AXIS.DEPTH, DIRECTION.COUNTERCLOCKWISE, 1, 0, cube));
		} else if (nextCorner == 24) {
			moves.push(turn(AXIS.DEPTH, DIRECTION.COUNTERCLOCKWISE, 1, 0, cube));
			moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 0, cube));
			moves.push(turn(AXIS.DEPTH, DIRECTION.CLOCKWISE, 1, 0, cube));			
		}

		if (nextCorner === 26) {
			if (cube.cubes[26].faceColors[sides.FRONT] === topColor) {
				moves.push(turn(AXIS.DEPTH, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));
				moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 0, cube));
				moves.push(turn(AXIS.DEPTH, DIRECTION.CLOCKWISE, 1, 2, cube));
				moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 2, 0, cube));
				moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));
				moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 0, cube));
				moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 2, cube));
			} else if (cube.cubes[26].faceColors[sides.RIGHT] === topColor) {
				moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));
				moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 0, cube));
				moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 2, cube));
				moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 0, cube));

				moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));
				moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 0, cube));
				moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 2, cube));
			}
			continue;
		}

		if (cube.cubes[20].faceColors[sides.FRONT] === topColor) {
			moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 0, cube));
			moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));
			moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 0, cube));
			moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 2, cube));
		} else if (cube.cubes[20].faceColors[sides.RIGHT] === topColor) {
			moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));
			moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 0, cube));
			moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 2, cube));
		} else if (cube.cubes[20].faceColors[sides.BOTTOM] === topColor) {
			moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));
			moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 1, 0, cube));
			moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 2, cube));
			moves.push(turn(AXIS.VERTICAL, DIRECTION.COUNTERCLOCKWISE, 2, 0, cube));
			moves.push(turn(AXIS.HORIZONTAL, DIRECTION.COUNTERCLOCKWISE, 1, 2, cube));
			moves.push(turn(AXIS.VERTICAL, DIRECTION.CLOCKWISE, 1, 0, cube));
			moves.push(turn(AXIS.HORIZONTAL, DIRECTION.CLOCKWISE, 1, 2, cube));
		}
	}

	return moves;
}

const finish2EdgesLastLayer = function(cube) {
	let moves = [];
	let topColor = cube.cubes[16].faceColors[sides.TOP];
	let foundEdge = false;

	while(!foundEdge) {
		
		for (let k = 0; k < 4; k++) {
			moves.push(turnEntireCube(3, cube));
			let frontColor = cube.cubes[14].faceColors[sides.FRONT];
			if ([topColor, frontColor].includes(cube.cubes[17].faceColors[sides.TOP]) && [topColor, frontColor].includes(cube.cubes[17].faceColors[sides.FRONT])) {
				foundEdge = true;
				break;
			}
		}

		if (!foundEdge) {
			moves = moves.concat(fixLastLayerEdgesAlgo(cube));
		}
	}

	while (!checkLastLayerEdges(cube)) {		
		moves = moves.concat(fixLastLayerEdgesAlgo(cube));
	}
		

	return moves;
}

const finishLastLayer = function(cube) {
	let moves = [];
	let topColor = cube.cubes[16].faceColors[sides.TOP];
	let topEdgeCubes = [7, 15, 25, 17];
	let allFourMisaligned = true;
	for (let i = 0; i < topEdgeCubes.length; i++) {
		if (cube.cubes[topEdgeCubes[i]].faceColors[sides.TOP] === topColor) {
			allFourMisaligned = false;
			break;
		}
	}

	if (allFourMisaligned) {
		moves = moves.concat(dedmoreH(cube));
	}

	for (let k = 0; k < 4; k++) {
		moves.push(turnEntireCube(3, cube));
		if (topColor !== cube.cubes[25].faceColors[sides.TOP]) {
			if (topColor !== cube.cubes[17].faceColors[sides.TOP]) {
				moves = moves.concat(dedmoreFish(cube));
			} else if (topColor !== cube.cubes[7].faceColors[sides.TOP]) {
				moves = moves.concat(dedmoreH(cube));
			} else if (topColor !== cube.cubes[15].faceColors[sides.TOP]) {
				moves.push(turnEntireCube(3, cube));
				moves = moves.concat(dedmoreFish(cube));
			}
			break;
		}
	}

	return moves;
}

const solveCube = function(cube) {
	let moves = [];
	moves = moves.concat(primeCube(cube));
 	moves = moves.concat(solveCorners(cube));
	moves = moves.concat(solveFirstLayerEdges(cube));
	moves = moves.concat(solveSecondLayer(cube));
	moves = moves.concat(arrangeLastLayerCorners(cube));
	moves = moves.concat(solveLastLayerCorners(cube));
	moves = moves.concat(finish2EdgesLastLayer(cube));
	moves = moves.concat(finishLastLayer(cube));
	//moves.push(randomTurn());
	return moves;
}

// document.body.onkeyup = function(e){
//     if(e.keyCode == 84){ // t keycode
// 		renderqueue = renderqueue.concat(randomTurn());
//     } else if (e.keyCode == 82) {// r keycode 
// 		clearCube(3);
// 	} else if (e.keyCode == 76) {
// 		let rnum = Math.floor(Math.random() * 5);
// 		renderqueue = renderqueue.concat(turnEntireCube(rnum));
// 	} else if (e.keyCode == 83) {
// 		let cube = new RubixCube(3);
// 		cube.set_state(rcube.get_state());
// 		let solution = solveCube(cube);
// 		renderqueue = renderqueue.concat(solution);
// 	} else if (e.keyCode == 80) {
// 		for (let i = 0; i < 10; i++) {
// 			renderqueue = renderqueue.concat(randomTurn());
// 		}
// 	} else if (e.keyCode == 81) {
// 		stop_animation();
// 	}
// }

function stop_animation() {
	animating = false;
}


function process_queue() {
	let idx = 0;
	if (renderqueue.length > 0) {
		for (let i = 1; i < renderqueue.length; i++) {
			renderqueue[idx].set_next_animation(renderqueue[i]);
			idx++;
		}
		renderqueue[renderqueue.length - 1].set_callback(stop_animation);
		renderqueue[0].play();
		renderqueue = [];
	}
}


function animate() {

	requestAnimationFrame( animate );

	// required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();

	process_queue();

	renderer.render( scene, camera );

}

animate();


function scramble() {
	if (animating) return;
	for (let i = 0; i < 20; i++) {
		renderqueue = renderqueue.concat(randomTurn());
	}
	animating = true;
}

function solve() {
	if (animating) return;
	let cube = new RubixCube(3);
	cube.set_state(rcube.get_state());
	let solution = solveCube(cube);
	renderqueue = renderqueue.concat(solution);
	animating = true;

}

function reset() {
	if (animating) return;
	clearCube(CUBE_DIM);
}


// Bind EventListeners
let buttonToHandler = {"scramble": scramble, "solve": solve, "reset": reset, "resetCamera": resetCamera};
var buttons = document.getElementsByTagName("button");
for (let i = 0; i < buttons.length; i++) {
	buttons[i].addEventListener("click", buttonToHandler[buttons[i].id], false);
};

const updateSlider = function(slider) {
	let percentage =  (slider.value - 1) / (99) * 100
    slider.style = 'background: linear-gradient(to right, #50299c, #7a00ff ' + percentage + '%, #d3edff ' + percentage + '%, #dee1e2 100%)'
  }


var slider = document.getElementById("speed");
updateSlider(slider);


// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  	CubeAnimation.animationSpeed = (slider.value - 1) / (99) * (MAX_SPEED - MIN_SPEED) + MIN_SPEED;
	updateSlider(slider);
}


function onResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.render(scene, camera);
}
  
window.addEventListener('resize', onResize);