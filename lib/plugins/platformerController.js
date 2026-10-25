import * as me from './../../dist/melonjs.module.js';
var DEFAULT_MOVE_FORCE = 2,
    DEFAULT_MOVE_FRICTION = 0.5,
    DEFAULT_JUMP_FORCE = 15;
var callbacks = {
    "move-right": [],
    "move-left": [],
    "move-down": [],
    "jump": [],
    "hit-by-enemy": []
};
export class platformerController extends me.plugin.BasePlugin {
    constructor(){
        super();
    }

    _getAdapter(obj) {
        const adapter = me.game?.world?.adapter;
        if (!adapter || adapter.physicLabel === "builtin") return null;
        return adapter.bodyMap?.has?.(obj) || obj.bodyDef ? adapter : null;
    }

    _isExternalPhysics(obj) {
        return !!this._getAdapter(obj);
    }

    _velocityScale(obj) {
        return this._getAdapter(obj)?.physicLabel === "planck" ? 60 : 1;
    }

    _controllerSpeed(obj, value) {
        return value * this._velocityScale(obj);
    }

    _getVelocity(obj) {
        if (obj.body?.getVelocity) return obj.body.getVelocity();
        return obj.body?.vel || { x: 0, y: 0 };
    }

    _setVelocity(obj, x, y) {
        if (obj.body?.setVelocity) {
            obj.body.setVelocity(x, y);
        } else if (obj.body?.vel) {
            obj.body.vel.x = x;
            obj.body.vel.y = y;
        }
    }

    _setHorizontalVelocity(obj, value) {
        const vel = this._getVelocity(obj);
        this._setVelocity(obj, this._controllerSpeed(obj, value), vel.y);
    }

    _setVerticalVelocity(obj, value) {
        const vel = this._getVelocity(obj);
        this._setVelocity(obj, vel.x, this._controllerSpeed(obj, value));
    }

    _setGravityScale(obj, gravity) {
        const adapter = this._getAdapter(obj);
        if (obj.body?.setGravityScale) obj.body.setGravityScale(gravity);
        else if (adapter?.setGravityScale) adapter.setGravityScale(obj, gravity);
        else if (obj.body) obj.body.gravityScale = gravity;
        if (obj.bodyDef) obj.bodyDef.gravityScale = gravity;
    }

    _configureAdapterBody(obj, moveForce, moveFriction, jumpForce, gravity) {
        const adapter = this._getAdapter(obj);
        const maxVelocity = {
            x: this._controllerSpeed(obj, moveForce),
            y: this._controllerSpeed(obj, jumpForce)
        };

        if (adapter?.bodyMap?.has?.(obj)) {
            adapter?.setMaxVelocity?.(obj, maxVelocity);
            adapter?.setFrictionAir?.(obj, { x: moveFriction, y: 0 });
        }
        this._setGravityScale(obj, gravity);

        if (obj.bodyDef) {
            obj.bodyDef.maxVelocity = maxVelocity;
            obj.bodyDef.frictionAir = { x: moveFriction, y: 0 };
            obj.bodyDef.gravityScale = gravity;
        }
    }

    _isGrounded(obj) {
        const adapter = this._getAdapter(obj);
        if (adapter?.isGrounded) return adapter.isGrounded(obj);
        if (obj.body?.isGrounded) return obj.body.isGrounded();
        return !obj.body?.falling && !obj.body?.jumping;
    }

    initObjectController(obj, moveForce, moveFriction, jumpForce, gravity = 1) {
        if(!obj.body && !obj.bodyDef) throw "Platformer Control : Given object doesn't have body";
        moveForce = moveForce || DEFAULT_MOVE_FORCE;
        moveFriction = moveFriction || DEFAULT_MOVE_FRICTION;
        jumpForce = jumpForce || DEFAULT_JUMP_FORCE;

        obj._platformerMoveForce = moveForce;
        obj._platformerJumpForce = jumpForce;

        if (this._isExternalPhysics(obj)) {
            this._configureAdapterBody(obj, moveForce, moveFriction, jumpForce, gravity);
            return;
        }

        obj.body?.setMaxVelocity(moveForce, jumpForce);
        obj.body?.setFriction(moveFriction, 0);
        if (obj.body) obj.body.gravityScale = gravity;
    }

    endObjectController(obj) {
        for(var key in callbacks){
            callbacks[key] = [];
        }
    }

    setControlKey(leftKey, rightKey, jumpKey, downKey) {
        if(typeof leftKey === "number"){
            me.input.bindKey(leftKey,  "left");
        }
        if(typeof rightKey === "number"){
            me.input.bindKey(rightKey, "right");
        }
        if(typeof jumpKey === "number"){
            me.input.bindKey(jumpKey,    "jump", true);
        }
        if(typeof downKey === "number"){
            me.input.bindKey(downKey,  "down");
        }
    }

    setDoubleJump(obj, dblJmp) {
        if(dblJmp) obj._multipleJump = 1;
        else obj._multipleJump = null;
    }

    moveLeft(obj) {
        if (this._isExternalPhysics(obj)) {
            this._setHorizontalVelocity(obj, -(obj._platformerMoveForce || DEFAULT_MOVE_FORCE));
            return;
        }
        obj.body.force.x = -obj.body.maxVel.x;
    }

    moveRight(obj) {
        if (this._isExternalPhysics(obj)) {
            this._setHorizontalVelocity(obj, obj._platformerMoveForce || DEFAULT_MOVE_FORCE);
            return;
        }
        obj.body.force.x = obj.body.maxVel.x;
    }

    idleMove(obj) {
        if (this._isExternalPhysics(obj)) {
            this._setHorizontalVelocity(obj, 0);
            return;
        }
        obj.body.force.x = 0;
    }

    jump(obj) {
        const jumpForce = obj._platformerJumpForce || DEFAULT_JUMP_FORCE;
        if (this._isExternalPhysics(obj)) {
            if (!obj._multipleJump) {
                if (this._isGrounded(obj)) {
                    this._call("jump");
                    this._setVerticalVelocity(obj, -jumpForce);
                }
            }
            else if (obj._multipleJump <= 2) {
                this._call("jump");
                this._setVerticalVelocity(obj, -jumpForce * obj._multipleJump++);
            }
            obj.body.jumping = true;
            return;
        }

        if(!obj._multipleJump){    
            if(!obj.body.jumping && !obj.body.falling){
                this._call("jump");
                obj.body.vel.y = -obj.body.maxVel.y;
            }
        }
        else if(obj._multipleJump <= 2) {
            this._call("jump");
            obj.body.vel.y = -obj.body.maxVel.y * obj._multipleJump++;
        }
        obj.body.jumping = true
    }

    idleJump(obj) {
        if (this._isExternalPhysics(obj)) {
            if(!obj._multipleJump) return;
            if(this._isGrounded(obj)){
                obj._multipleJump = 1;
                obj.body.jumping = false;
                obj.body.falling = false;
            }
            else if(obj._multipleJump < 2){
                obj._multipleJump = 2;
            }
            return;
        }

        obj.body.force.y = 0;
        if(!obj._multipleJump) return;
        if(!obj.body.falling && !obj.body.jumping){
            obj._multipleJump = 1;
        }
        else if(obj.body.falling && obj._multipleJump < 2){
            obj._multipleJump = 2;
        }
    }

    on(action, callback) {
        callbacks[action].push(callback);
    }

    _call(action) {
        callbacks[action].forEach( callback => callback() );
    }

    playerUpdate(obj) {
        this.timeSingleJump -= 1
        if(me.input.isKeyPressed("right")){
            this.moveRight(obj);
            this._call("move-right");
        }
        else if(me.input.isKeyPressed("left")){
            this.moveLeft(obj);
            this._call("move-left");
        }
        else this.idleMove(obj);
        if(me.input.isKeyPressed("jump")){
            this.jump(obj);
        }
        else this.idleJump(obj);
    }

    playerCollision(obj, response, other) {
        if (this._isExternalPhysics(obj)) {
            const collisionType = other.body?.collisionType;
            if (collisionType === me.collision.types.ENEMY_OBJECT) {
                this._call("hit-by-enemy");
            }
            return true;
        }

        switch(other.body.collisionType){
            case me.collision.types.WORLD_SHAPE:
                if (other.type === "polyline") {
                    if (obj.body.falling && !me.input.isKeyPressed("down") &&
                        (response.overlapV.y > 0) && (~~obj.body.vel.y >= ~~response.overlapV.y)
                    ) {
                        response.overlapV.x = 0;
                        return true;
                    }
                    return false;
                }
                else if (other.type === "polygon") {
                    response.overlapV.y = Math.abs(response.overlap);
                    response.overlapV.x = 0;
                    return true;
                }
                break;
            case me.collision.types.ENEMY_OBJECT:
                this._call("hit-by-enemy");
                break;
        }
        return true;
    }
};
