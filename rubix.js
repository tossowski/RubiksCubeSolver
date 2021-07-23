//import * as THREE from './node_modules/three/build/three.module.js';

export const sides = {
	BACK: 5,
	FRONT: 4,
	LEFT: 1,
	RIGHT: 0,
  BOTTOM: 3,
  TOP: 2
}

export const AXIS = {
  DEPTH: 2,
  HORIZONTAL: 0,
  VERTICAL: 1
}

export const DIRECTION = {
  COUNTERCLOCKWISE: -1,
  CLOCKWISE: 1
}

export class RubixCube {
  constructor(dimension) {
    this.dim = dimension;
    this.cubes = [];
    this.init_cubes();
  }

  init_cubes() {
    const width = 2 / this.dim;
    const height = 2 / this.dim;
    const depth = 2 / this.dim;
    const spacing = 2 / this.dim;
    const loader = new THREE.TextureLoader();
    for (var i = 0; i < this.dim; i++) {
      for (var j = 0; j < this.dim; j++) {
        for (var k = 0; k < this.dim; k++) {
          var materials = [];
          let faceColors = [];
          for (let l = 0; l < 6; l++) {
            faceColors.push("black");
          }
          let material = new THREE.MeshBasicMaterial({color: 0x000000});
          for (let l = 0; l < 6; l++) {
            material = new THREE.MeshBasicMaterial({color: 0x000000});
            // Front
            if (k == this.dim - 1) {
                if (l == sides.FRONT) {
                  material = new THREE.MeshBasicMaterial({
                    map: loader.load('./images/textures/blue_square.png')});
                  faceColors[sides.FRONT] = "blue";
                } 
            }
            if (k == 0) { // Back
              if (l == sides.BACK) {
                material = new THREE.MeshBasicMaterial({
                    map: loader.load('./images/textures/green_square.png')});
                faceColors[sides.BACK] = "green";
              }
            }
            if (j == 0) {
              if (l == sides.BOTTOM) {
                material = new THREE.MeshBasicMaterial({
                  map: loader.load('./images/textures/yellow_square.png')});
                  faceColors[sides.BOTTOM] = "yellow";
              }
            } 
            if (j == this.dim - 1) {
              if (l == sides.TOP) {
                material = new THREE.MeshBasicMaterial({
                  map: loader.load('./images/textures/white_square.png')});
                faceColors[sides.TOP] = "white";
              }
            } 
            if (i == 0) {
              if (l == sides.LEFT) {
                material = new THREE.MeshBasicMaterial({
                  map: loader.load('./images/textures/red_square.png')});
                faceColors[sides.LEFT] = "red";
              }
            }
            if (i == this.dim - 1) {
              if (l == sides.RIGHT) {
                material = new THREE.MeshBasicMaterial({
                  map: loader.load('./images/textures/orange_square.png')});
                faceColors[sides.RIGHT] = "orange";
              }
            }
            
            materials.push(material);
          }
          const geometry = new THREE.BoxGeometry(width, height, depth);
          //const material = new THREE.MeshBasicMaterial( { color: 0x00ff00, vertexColors:THREE.FaceColors } );
          const cube = new THREE.Mesh(geometry, materials);
          cube.faceColors = faceColors;
          cube.position.x = -1 + i * spacing + width / 2;
          cube.position.y = -1 + j * spacing + height / 2;
          cube.position.z = -1 + k * spacing + depth / 2;
          this.cubes.push(cube);
         
        }
      }
    }
  }

  get_state() {
    let state = [];
    for (let i = 0; i < this.cubes.length; i++) {
      state.push(this.cubes[i].clone());
      let faceColors = [];
      for (let j = 0; j < this.cubes[i].faceColors.length; j++) {
        faceColors.push(this.cubes[i].faceColors[j]);
      }
      state[i].faceColors = faceColors;
    }
    return state;
  }

  set_state(state) { 
    this.cubes = state;
  }

  rotateEntireCube(axis, direction, num_turns) {
    for (let i = 0; i < this.dim; i++) {
      this.rotate(axis, direction, num_turns, i);
    }
  }

  swap(arr, idx1, idx2) {
    let tmp = arr[idx1];
    arr[idx1] = arr[idx2];
    arr[idx2] = tmp;
  }

  rotate(axis, direction, num_turns, index) {
    let face = this.get_face(axis, index);

    let inc = this.dim * this.dim;

    let face_to_rotate = [];
    while(face.length) face_to_rotate.push(face.splice(0,this.dim));

    for (let i = 0; i < num_turns; i++) {
      face_to_rotate = face_to_rotate[0].map((val, index) => face_to_rotate.map(row => row[index]).reverse());
      if (direction == DIRECTION.COUNTERCLOCKWISE) {
        face_to_rotate = face_to_rotate[0].map((val, index) => face_to_rotate.map(row => row[index]).reverse());
        
        face_to_rotate = face_to_rotate[0].map((val, index) => face_to_rotate.map(row => row[index]).reverse());
      }
    }

    for (let i = 0; i < this.dim; i++) {
      for (let j = 0; j < this.dim; j++) {
        if (axis == AXIS.HORIZONTAL) {
          this.cubes[inc * index + i * this.dim + j] = face_to_rotate[i][j];
        } else if (axis == AXIS.DEPTH) {
          this.cubes[j * inc + i * this.dim + index] = face_to_rotate[i][j];
        } else {
          this.cubes[j * inc + i + index * this.dim] = face_to_rotate[i][j];
        }
      }
    }

    face = this.get_face(axis, index);
    for (let i = 0; i < face.length; i++) {
      let arr = face[i].faceColors;
      for (let j = 0; j < num_turns; j++) {
        // handle material permutations
        if (axis == AXIS.VERTICAL) {
          if (direction == DIRECTION.COUNTERCLOCKWISE) {
            this.swap(arr, sides.FRONT, sides.RIGHT);
            this.swap(arr, sides.LEFT, sides.FRONT);
            this.swap(arr, sides.BACK, sides.LEFT);
          } else {
            this.swap(arr, sides.FRONT, sides.LEFT);
            this.swap(arr, sides.RIGHT, sides.FRONT);
            this.swap(arr, sides.BACK, sides.RIGHT);
          }
        } else if (axis == AXIS.HORIZONTAL) {
          if (direction == DIRECTION.COUNTERCLOCKWISE) {
            this.swap(arr, sides.BACK, sides.TOP);
            this.swap(arr, sides.BOTTOM, sides.BACK);
            this.swap(arr, sides.FRONT, sides.BOTTOM);
          } else {
            this.swap(arr, sides.FRONT, sides.TOP);
            this.swap(arr, sides.BOTTOM, sides.FRONT);
            this.swap(arr, sides.BACK, sides.BOTTOM);
          }
        } else {
          if (direction == DIRECTION.COUNTERCLOCKWISE) {
            this.swap(arr, sides.LEFT, sides.TOP);
            this.swap(arr, sides.BOTTOM, sides.LEFT);
            this.swap(arr, sides.RIGHT, sides.BOTTOM);
          } else {
            this.swap(arr, sides.RIGHT, sides.TOP);
            this.swap(arr, sides.BOTTOM, sides.RIGHT);
            this.swap(arr, sides.LEFT, sides.BOTTOM);
          }
        }
      }
    }
  }

  clone() {
    let cube = new RubixCube(3);
    cube.cubes = this.cubes;
    return cube;
  }

  get_face(axis, index) {
    let face = [];
    let inc = this.dim * this.dim;
    
    for (let i = 0; i < this.dim; i++) {
      for (let j = 0; j < this.dim; j++) {
        if (axis == AXIS.HORIZONTAL) {
          face.push(this.cubes[inc * index + i * this.dim + j]);
        } else if (axis == AXIS.DEPTH) {
          face.push(this.cubes[j * inc + i * this.dim + index])
        } else {
          face.push(this.cubes[j * inc + i + index * this.dim])
        }
      }
    }
    
    // let pivotPos = face[(Math.floor(face.length / 2))].position;
    return face;
  }

  

}
