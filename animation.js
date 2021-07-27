import {AXIS} from './rubix.js';

export class CubeAnimation {

    constructor(rcube, scene, camera, renderer) {
        this.cube = rcube;
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.id = null;
    }

    play() {
        
    }

    end() {
     
    }

    stop() {
        if (this.id) {
            cancelAnimationFrame(this.id);
        }
    }

    set_next_animation(anim) {
        this.next_anim = anim;
    }

    set_callback(callback) {
        this.callback = callback;
    }
    
}

export class RotationAnimation extends CubeAnimation {

    constructor(rcube, scene, camera, renderer, axis, direction, num_turns, index, pivotPoint) {
        
        super(rcube, scene, camera, renderer);
        if (this.constructor == RotationAnimation) {
            throw new Error("Abstract classes can't be instantiated.");
        }
        this.axis = axis;
        this.direction = direction;
        this.num_turns = num_turns;
        this.index = index;
        this.pivotPoint = pivotPoint;
        this.angle_counter = 0;
        this.target_amount = num_turns * Math.PI / 2;
        this.active = null;
    }

    rotate(axis, direction) {
        if (axis == AXIS.DEPTH) {
            this.pivotPoint.rotation.z += direction * CubeAnimation.animationSpeed;
        } else if (axis == AXIS.HORIZONTAL) {
            this.pivotPoint.rotation.x -= direction * CubeAnimation.animationSpeed;
        } else {
            this.pivotPoint.rotation.y -= direction * CubeAnimation.animationSpeed;
        }
    };


    
    play() {
        if (this.angle_counter >= this.target_amount) {
            this.end();
            if (this.next_anim) {
                this.next_anim.play();
            }  
            if (this.callback) {
                this.callback(this);
            }
            return;
        } else {
            this.angle_counter += CubeAnimation.animationSpeed;
        }
        this.rotate(this.axis, this.direction, CubeAnimation.animationSpeed);
        //this.pivotPoint.updateMatrixWorld();
        this.renderer.render( this.scene, this.camera );
        //console.log("playing");
        this.id = requestAnimationFrame( this.play.bind(this) );
    }
    
    end() {

        this.angle_counter = 0;
        let RIGHT_ANGLE = Math.PI / 2;
		this.pivotPoint.rotation.x = this.direction < 0 ? Math.floor(this.pivotPoint.rotation.x / RIGHT_ANGLE) * RIGHT_ANGLE : Math.ceil(this.pivotPoint.rotation.x / RIGHT_ANGLE) * RIGHT_ANGLE;
        this.pivotPoint.rotation.y = this.direction < 0 ? Math.floor(this.pivotPoint.rotation.y / RIGHT_ANGLE) * RIGHT_ANGLE : Math.ceil(this.pivotPoint.rotation.y / RIGHT_ANGLE) * RIGHT_ANGLE;
        this.pivotPoint.rotation.z = this.direction > 0 ? Math.floor(this.pivotPoint.rotation.z / RIGHT_ANGLE) * RIGHT_ANGLE : Math.ceil(this.pivotPoint.rotation.z / RIGHT_ANGLE) * RIGHT_ANGLE;
        
        // Parent to scene, so it is no longer attached to pivot point
        //this.pivotPoint.updateMatrixWorld();

        for (let i = 0; i < this.cube.cubes.length; i++) {
            this.scene.attach(this.cube.cubes[i]);
        }


        //this.pivotPoint.position.set(0,0,0);
		this.pivotPoint.rotation.set(0,0,0);
        
    }
    
}

export class RotateFaceAnimation extends RotationAnimation {

    constructor(rcube, scene, camera, renderer, axis, direction, num_turns, index, pivotPoint) {
        super(rcube, scene, camera, renderer, axis, direction, num_turns, index, pivotPoint);
    }

    play() {

        if (!this.active) {
            this.active = this.cube.get_face(this.axis, this.index);

            for (let i = 0; i < this.active.length; i++) {
                this.pivotPoint.attach(this.active[i]);
            }
        }
        
        super.play();
    }

    end() {
        super.end();
        this.cube.rotate(this.axis, this.direction, this.num_turns, this.index);
    }
}


export class RotateCubeAnimation extends RotationAnimation {

    constructor(rcube, scene, camera, renderer, axis, direction, num_turns, pivotPoint) {
        super(rcube, scene, camera, renderer, axis, direction, num_turns, 1, pivotPoint);
    }

    play() {

        if (!this.active) {
            this.active = this.cube.cubes;

            for (let i = 0; i < this.cube.cubes.length; i++) {
                this.pivotPoint.attach(this.cube.cubes[i]);
            }
        }
        
        super.play();
    }

    end() {
        super.end();
        this.cube.rotateEntireCube(this.axis, this.direction, this.num_turns);
    }
}