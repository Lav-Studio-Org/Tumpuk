import * as me from '../../dist/melonjs.module.js';

var DEFAULT_MAX_VELOCITY_X = 2,
    DEFAULT_MAX_VELOCITY_Y = 2,
    DEFAULT_MOVE_FRICTION = 1,
    callbacks = {
        "move-right": [],
        "move-left": [],
        "move-up": [],
        "move-down": [],
        "move-left-down": [],
        "move-right-down": [],
        "move-left-up": [],
        "move-right-up": [],
    };

export class topDownController extends me.plugin.BasePlugin {
    constructor() {
        super();
    }

    _getAdapter(obj) {
        const adapter = me.game?.world?.adapter;
        if (!adapter || adapter.physicLabel === "builtin") return null;
        return adapter.bodyMap?.has?.(obj) || obj.bodyDef ? adapter : null;
    }

    _velocityScale(obj) {
        return this._getAdapter(obj)?.physicLabel === "planck" ? 60 : 1;
    }

    _getVelocity(obj) {
        if (obj.body?.getVelocity) return obj.body.getVelocity();
        return obj.body?.vel || { x: 0, y: 0 };
    }

    endObjectController() {
        for(var key in callbacks){
            callbacks[key] = [];
        }
    }

    deleteControlKey() {
        me.input.unbindKey(this.leftKey);
        me.input.unbindKey(this.rightKey);
        me.input.unbindKey(this.upKey);
        me.input.unbindKey(this.downKey);
    }

    setControlKey(obj, moveXForce, moveYForce, friction, gravity = 0, leftKey, rightKey, upKey, downKey) {
        this.leftKey = leftKey;
        this.rightKey = rightKey;
        this.upKey = upKey;
        this.downKey = downKey;
        if (obj.body?.setMaxVelocity) {
            obj.body.setMaxVelocity(moveXForce || DEFAULT_MAX_VELOCITY_X, moveYForce || DEFAULT_MAX_VELOCITY_Y);
            obj.body.setFriction(friction || DEFAULT_MOVE_FRICTION, friction || DEFAULT_MOVE_FRICTION);        
            obj.body.gravityScale = gravity;
        } else {
            const scale = this._velocityScale(obj);
            this.speedX = (moveXForce || DEFAULT_MAX_VELOCITY_X) * scale;
            this.speedY = (moveYForce || DEFAULT_MAX_VELOCITY_Y) * scale;
            const adapter = this._getAdapter(obj);
            adapter?.setMaxVelocity?.(obj, { x: this.speedX, y: this.speedY });
            adapter?.setGravityScale?.(obj, gravity);
            adapter?.setFrictionAir?.(obj, { x: friction || DEFAULT_MOVE_FRICTION, y: friction || DEFAULT_MOVE_FRICTION });
            if (obj.bodyDef) {
                obj.bodyDef.maxVelocity = { x: this.speedX, y: this.speedY };
                obj.bodyDef.gravityScale = gravity;
                obj.bodyDef.frictionAir = { x: friction || DEFAULT_MOVE_FRICTION, y: friction || DEFAULT_MOVE_FRICTION };
            }
        }
        
        if(typeof leftKey === "number"){
            me.input.bindKey(leftKey, `td-left-${obj.name}`);
        }

        if(typeof rightKey === "number"){
            me.input.bindKey(rightKey, `td-right-${obj.name}`);
        }

        if(typeof upKey === "number"){
            me.input.bindKey(upKey, `td-up-${obj.name}`);
        }
        
        if(typeof downKey === "number"){
            me.input.bindKey(downKey, `td-down-${obj.name}`);
        }
    }

    moveLeft(obj) {
        if (this.speedX) obj.body.setVelocity(-this.speedX, this._getVelocity(obj).y);
        else obj.body.force.x = -obj.body.maxVel.x;
    }

    moveRight(obj) {
        if (this.speedX) obj.body.setVelocity(this.speedX, this._getVelocity(obj).y);
        else obj.body.force.x = obj.body.maxVel.x;
    }

    moveUp(obj) {
        if (this.speedY) obj.body.setVelocity(this._getVelocity(obj).x, -this.speedY);
        else obj.body.force.y = -obj.body.maxVel.y;
    }
    
    moveDown(obj) {
        if (this.speedY) obj.body.setVelocity(this._getVelocity(obj).x, this.speedY);
        else obj.body.force.y = obj.body.maxVel.y;
    }
    
    moveLeftUp(obj) {
        if (this.speedX || this.speedY) obj.body.setVelocity(-this.speedX, -this.speedY);
        else {
            obj.body.force.x = -obj.body.maxVel.x;
            obj.body.force.y = -obj.body.maxVel.y;
        }
    }

    moveRightUp(obj) {
        if (this.speedX || this.speedY) obj.body.setVelocity(this.speedX, -this.speedY);
        else {
            obj.body.force.x = obj.body.maxVel.x;
            obj.body.force.y = -obj.body.maxVel.y;
        }
    }

    moveLeftDown(obj) {
        if (this.speedX || this.speedY) obj.body.setVelocity(-this.speedX, this.speedY);
        else {
            obj.body.force.x = -obj.body.maxVel.x;
            obj.body.force.y = obj.body.maxVel.y;
        }
    }

    moveRightDown(obj) {
        if (this.speedX || this.speedY) obj.body.setVelocity(this.speedX, this.speedY);
        else {
            obj.body.force.x = obj.body.maxVel.x;
            obj.body.force.y = obj.body.maxVel.y;
        }
    }

    on(action, callback) {
        callbacks[action].push(callback);
    }

    _call(action) {
        callbacks[action].forEach( callback => callback() );
    }

    playerUpdate(obj) {        
        if(me.input.isKeyPressed(`td-right-${obj.name}`)){
            this.moveRight(obj);
            this._call("move-right");
        } else if(me.input.isKeyPressed(`td-left-${obj.name}`)){          
            this.moveLeft(obj);
            this._call("move-left");
        } else if(me.input.isKeyPressed(`td-up-${obj.name}`)){
            this.moveUp(obj);
            this._call("move-up");
        } else if(me.input.isKeyPressed(`td-down-${obj.name}`)){
            this.moveDown(obj);
            this._call("move-down");
        } 
        
        if(me.input.isKeyPressed(`td-left-${obj.name}`) && me.input.isKeyPressed(`td-up-${obj.name}`)){
            this.moveLeftUp(obj);
            this._call("move-left-up");
        } 
        
        if(me.input.isKeyPressed(`td-right-${obj.name}`) && me.input.isKeyPressed(`td-up-${obj.name}`)){
            this.moveRightUp(obj);
            this._call("move-right-up");
        } 
        
        if(me.input.isKeyPressed(`td-left-${obj.name}`) && me.input.isKeyPressed(`td-down-${obj.name}`)){
            this.moveLeftDown(obj);
            this._call("move-left-down");
        } 
        
        if(me.input.isKeyPressed(`td-right-${obj.name}`) && me.input.isKeyPressed(`td-down-${obj.name}`)){
            this.moveRightDown(obj);
            this._call("move-right-down");
        }
    }
};
