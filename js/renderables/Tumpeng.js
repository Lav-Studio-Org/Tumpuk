import * as me from '../../dist/melon-runtime.module.js'
import melon from '../../dist/melon-runtime.module.js'
import game from '../game.js'

import suikaObj from './suikaObj.js'


// Put user code here //
 
//  End of user code  //

export default class Tumpeng extends suikaObj {
	constructor(x, y, settings = {}) {
		settings.texture = "Pasar";
		settings.image = game.textureMap.get(settings.texture);
		settings.imageLists = settings.imageLists || ["Tumpeng"];
		game.util.__populateAtlasIndices( settings.imageLists , settings);
		settings.animationMotions = settings.animationMotions || [
			{
				 animationName: "anim",
				 frames: [{ name: "Tumpeng", delay: 100 }],
			},
		];
		settings.animationDefault = settings.animationDefault || settings.animationMotions[0].animationName;
		settings.anchorPoint = { x: 0.5, y: 0.5 };
		settings.overrideAnchor = false;

        // Put user code here //
        settings.objLevel = 11;
        //  End of user code  //

		super(x, y, Object.assign(settings));
		delete settings.image;


		/* Extract inspector values */
		const inspectors = settings.inspectors || {};
		const alpha = inspectors.alpha ?? 1;
		const scale = inspectors.scale || { x: 1, y: 1 };
		const flip = inspectors.flip || { x: false, y: false };

		/* Handle configuration data for the object */
		this.alpha = alpha;
		this.floating = false;
		this.alwaysUpdate = false;
		this.updateWhenPaused = false;
		this.isPersistent = false;

		/* Apply scaling */
		this.scale(scale.x, scale.y);
		this._scaleX = scale.x;
		this._scaleY = scale.y;

		/* Apply flipping on X and/or Y axis */
		this.flipX(flip.x);
		this.flipY(flip.y);

		/* Register all defined animations from the object settings */
		for (let motion of settings.animationMotions) {
			this.addAnimation(motion.animationName, motion.frames);
		}

		/* Set the default animation to be played when the object is created */
		this.setCurrentAnimation(settings.animationDefault);

		/* Configure object body for collision behavior */
		this.isKinematic = false;


		/* Collision Shapes */
		const sX = inspectors.scale?.x ?? 1;
		const sY = inspectors.scale?.y ?? 1;
		const bodyShapeOriginX = Number.isFinite(this.width) ? this.width * this.anchorPoint.x * (1 - sX) : 0;
		const bodyShapeOriginY = Number.isFinite(this.height) ? this.height * this.anchorPoint.y * (1 - sY) : 0;
		const auto_polygon_1_0 = me.pool.pull("me.Polygon", bodyShapeOriginX, bodyShapeOriginY, [me.pool.pull("me.Vector2d", 153 * sX, 108 * sY),me.pool.pull("me.Vector2d", 268 * sX, 3 * sY),me.pool.pull("me.Vector2d", 353 * sX, 120 * sY)]);
		const auto_polygon_2_1 = me.pool.pull("me.Polygon", bodyShapeOriginX, bodyShapeOriginY, [me.pool.pull("me.Vector2d", 353 * sX, 120 * sY),me.pool.pull("me.Vector2d", 385 * sX, 92 * sY),me.pool.pull("me.Vector2d", 409 * sX, 137 * sY)]);
		const auto_polygon_3_2 = me.pool.pull("me.Polygon", bodyShapeOriginX, bodyShapeOriginY, [me.pool.pull("me.Vector2d", 153 * sX, 108 * sY),me.pool.pull("me.Vector2d", 353 * sX, 120 * sY),me.pool.pull("me.Vector2d", 409 * sX, 137 * sY),me.pool.pull("me.Vector2d", 465 * sX, 178 * sY),me.pool.pull("me.Vector2d", 535 * sX, 232 * sY),me.pool.pull("me.Vector2d", 527 * sX, 355 * sY),me.pool.pull("me.Vector2d", 445 * sX, 450 * sY),me.pool.pull("me.Vector2d", 317 * sX, 487 * sY)]);
		const auto_polygon_4_3 = me.pool.pull("me.Polygon", bodyShapeOriginX, bodyShapeOriginY, [me.pool.pull("me.Vector2d", 409 * sX, 137 * sY),me.pool.pull("me.Vector2d", 450 * sX, 110 * sY),me.pool.pull("me.Vector2d", 465 * sX, 178 * sY)]);
		const auto_polygon_5_4 = me.pool.pull("me.Polygon", bodyShapeOriginX, bodyShapeOriginY, [me.pool.pull("me.Vector2d", 465 * sX, 178 * sY),me.pool.pull("me.Vector2d", 497 * sX, 155 * sY),me.pool.pull("me.Vector2d", 535 * sX, 232 * sY)]);
		const auto_polygon_6_5 = me.pool.pull("me.Polygon", bodyShapeOriginX, bodyShapeOriginY, [me.pool.pull("me.Vector2d", 39 * sX, 407 * sY),me.pool.pull("me.Vector2d", 121 * sX, 167 * sY),me.pool.pull("me.Vector2d", 153 * sX, 108 * sY),me.pool.pull("me.Vector2d", 317 * sX, 487 * sY),me.pool.pull("me.Vector2d", 135 * sX, 467 * sY)]);
		const auto_polygon_7_6 = me.pool.pull("me.Polygon", bodyShapeOriginX, bodyShapeOriginY, [me.pool.pull("me.Vector2d", 8 * sX, 348 * sY),me.pool.pull("me.Vector2d", 16 * sX, 202 * sY),me.pool.pull("me.Vector2d", 50 * sX, 221 * sY),me.pool.pull("me.Vector2d", 39 * sX, 407 * sY)]);
		const auto_polygon_8_7 = me.pool.pull("me.Polygon", bodyShapeOriginX, bodyShapeOriginY, [me.pool.pull("me.Vector2d", 39 * sX, 407 * sY),me.pool.pull("me.Vector2d", 50 * sX, 221 * sY),me.pool.pull("me.Vector2d", 76 * sX, 141 * sY),me.pool.pull("me.Vector2d", 121 * sX, 167 * sY)]);
		this.bodyDef = {
			type: "dynamic",
			shapes: [],
			collisionType: me.collision.types.ENEMY_OBJECT | me.collision.types.ENEMY_OBJECT | me.collision.types.ENEMY_OBJECT | me.collision.types.ENEMY_OBJECT | me.collision.types.ENEMY_OBJECT | me.collision.types.ENEMY_OBJECT | me.collision.types.ENEMY_OBJECT | me.collision.types.ENEMY_OBJECT,
			collisionMask: me.collision.types.ALL_OBJECT | me.collision.types.ALL_OBJECT | me.collision.types.ALL_OBJECT | me.collision.types.ALL_OBJECT | me.collision.types.ALL_OBJECT | me.collision.types.ALL_OBJECT | me.collision.types.ALL_OBJECT | me.collision.types.ALL_OBJECT,
			gravityScale: 1,
			restitution: 0,
			frictionAir: { x: 0, y: 0 },
			maxVelocity: { x: 490, y: 490 },
			isSensor: false,
			fixedRotation: false
		};
		auto_polygon_1_0.collisionType = me.collision.types.ENEMY_OBJECT;
		auto_polygon_1_0.collisionMask = me.collision.types.ALL_OBJECT;
		auto_polygon_1_0.name = "auto_polygon_1";
		auto_polygon_1_0.debugColor = "red";
		auto_polygon_1_0.isTrigger = false;
		auto_polygon_1_0.isActive = true;
		this.bodyDef.shapes.push(auto_polygon_1_0);
		auto_polygon_2_1.collisionType = me.collision.types.ENEMY_OBJECT;
		auto_polygon_2_1.collisionMask = me.collision.types.ALL_OBJECT;
		auto_polygon_2_1.name = "auto_polygon_2";
		auto_polygon_2_1.debugColor = "red";
		auto_polygon_2_1.isTrigger = false;
		auto_polygon_2_1.isActive = true;
		this.bodyDef.shapes.push(auto_polygon_2_1);
		auto_polygon_3_2.collisionType = me.collision.types.ENEMY_OBJECT;
		auto_polygon_3_2.collisionMask = me.collision.types.ALL_OBJECT;
		auto_polygon_3_2.name = "auto_polygon_3";
		auto_polygon_3_2.debugColor = "red";
		auto_polygon_3_2.isTrigger = false;
		auto_polygon_3_2.isActive = true;
		this.bodyDef.shapes.push(auto_polygon_3_2);
		auto_polygon_4_3.collisionType = me.collision.types.ENEMY_OBJECT;
		auto_polygon_4_3.collisionMask = me.collision.types.ALL_OBJECT;
		auto_polygon_4_3.name = "auto_polygon_4";
		auto_polygon_4_3.debugColor = "red";
		auto_polygon_4_3.isTrigger = false;
		auto_polygon_4_3.isActive = true;
		this.bodyDef.shapes.push(auto_polygon_4_3);
		auto_polygon_5_4.collisionType = me.collision.types.ENEMY_OBJECT;
		auto_polygon_5_4.collisionMask = me.collision.types.ALL_OBJECT;
		auto_polygon_5_4.name = "auto_polygon_5";
		auto_polygon_5_4.debugColor = "red";
		auto_polygon_5_4.isTrigger = false;
		auto_polygon_5_4.isActive = true;
		this.bodyDef.shapes.push(auto_polygon_5_4);
		auto_polygon_6_5.collisionType = me.collision.types.ENEMY_OBJECT;
		auto_polygon_6_5.collisionMask = me.collision.types.ALL_OBJECT;
		auto_polygon_6_5.name = "auto_polygon_6";
		auto_polygon_6_5.debugColor = "red";
		auto_polygon_6_5.isTrigger = false;
		auto_polygon_6_5.isActive = true;
		this.bodyDef.shapes.push(auto_polygon_6_5);
		auto_polygon_7_6.collisionType = me.collision.types.ENEMY_OBJECT;
		auto_polygon_7_6.collisionMask = me.collision.types.ALL_OBJECT;
		auto_polygon_7_6.name = "auto_polygon_7";
		auto_polygon_7_6.debugColor = "red";
		auto_polygon_7_6.isTrigger = false;
		auto_polygon_7_6.isActive = true;
		this.bodyDef.shapes.push(auto_polygon_7_6);
		auto_polygon_8_7.collisionType = me.collision.types.ENEMY_OBJECT;
		auto_polygon_8_7.collisionMask = me.collision.types.ALL_OBJECT;
		auto_polygon_8_7.name = "auto_polygon_8";
		auto_polygon_8_7.debugColor = "blue";
		auto_polygon_8_7.isTrigger = false;
		auto_polygon_8_7.isActive = true;
		this.bodyDef.shapes.push(auto_polygon_8_7);
		melon.collision.prepareBody(this);
		this.var = this.var || {};
		this.posteffect = settings.posteffect ?? settings.postEffect ?? true;
        // Put user code here //
        
        //  End of user code  //
	}

	/* triggered when a Renderable is added to the world.
	or when the scene containing it becomes active in game. */
	onActivateEvent() {
		super.onActivateEvent();
        // Put user code here //
        
        //  End of user code  //
	}

	/* triggered when a Renderable is removed from the world.
	or when the scene containing it is no longer active in game */
	onDeactivateEvent() {
		super.onDeactivateEvent();
        // Put user code here //
        
        //  End of user code  //
	}

	/* The update function in MelonJS is called on every game frame to update an object's state.
	It is commonly used for handling movement, animations, physics, and game logic.
	Returning true from this function signals that the object needs to be re-rendered. */
	update (dt){
		var drawNextFrame = super.update(dt);
		const bodyVelocity = this.body.getVelocity();
		drawNextFrame = drawNextFrame || bodyVelocity.x !== 0 || bodyVelocity.y !== 0;
        // Put user code here //
        
        //  End of user code  //
		return true;
	}

	onCollision(response, other, collisionInfo = response) {
		const parentIsSolid = super.onCollision(response, other, collisionInfo);
		var isSolid = true;
        // Put user code here //
        
        //  End of user code  //
		return parentIsSolid !== false && isSolid;
	}

	/* Draw this renderable (automatically called by melonJS). All draw operations for renderable are made 
	respectively to the position or transforms set or applied by the preDraw method. The main draw loop will first 
	call preDraw() to prepare the context for drawing the renderable, then draw() to draw the renderable, and 
	finally postDraw() to clear the context. If you override this method, be mindful about the drawing logic; for 
	example if you draw a shape from the draw method, you should make sure that your draw it at the 0, 0 
	coordinates. */
	draw(renderer, viewport) {
        // Put user code here //
        
        //  End of user code  //
		super.draw(renderer, viewport);
	}

	/* triggered when a collision between two objects begins. */
	onCollisionStart(response, other, collisionInfo = response) {
		super.onCollisionStart?.(response, other, collisionInfo);
        // Put user code here //
        
        //  End of user code  //
	}

	/* is triggered when a collision between two objects ends. */
	onCollisionEnd(response, other, collisionInfo = response) {
		super.onCollisionEnd?.(response, other, collisionInfo);
        // Put user code here //
        
        //  End of user code  //
	}

    // Put user code here //
    
    //  End of user code  //
};

// Put user code here //
 
//  End of user code  //
