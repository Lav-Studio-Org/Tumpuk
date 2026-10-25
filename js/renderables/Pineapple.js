import * as me from '../../dist/melon-runtime.module.js'
import melon from '../../dist/melon-runtime.module.js'
import game from '../game.js'

import suikaObj from './suikaObj.js'


// Put user code here //
 
//  End of user code  //

export default class Pineapple extends suikaObj {
	constructor(x, y, settings = {}) {
		settings.texture = "Kebun";
		settings.image = game.textureMap.get(settings.texture);
		settings.imageLists = settings.imageLists || ["pineapple"];
		game.util.__populateAtlasIndices( settings.imageLists , settings);
		settings.animationMotions = settings.animationMotions || [
			{
				 animationName: "anim",
				 frames: [{ name: "pineapple", delay: 100 }],
			},
		];
		settings.animationDefault = settings.animationDefault || settings.animationMotions[0].animationName;
		settings.anchorPoint = { x: 0.5, y: 0.5 };
		settings.overrideAnchor = false;

        // Put user code here //
        settings.objLevel = 7;
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
		const ellipse_0 = me.pool.pull("me.Ellipse", 119.5 * sX + bodyShapeOriginX, 305 * sY + bodyShapeOriginY, 227 * sX, 246 * sY);
		const polygon_1 = me.pool.pull("me.Polygon", bodyShapeOriginX, bodyShapeOriginY, [me.pool.pull("me.Vector2d", 13 * sX, 147 * sY),me.pool.pull("me.Vector2d", 9 * sX, 89 * sY),me.pool.pull("me.Vector2d", 30 * sX, 41 * sY),me.pool.pull("me.Vector2d", 71 * sX, 14 * sY),me.pool.pull("me.Vector2d", 155 * sX, 5 * sY),me.pool.pull("me.Vector2d", 32 * sX, 189 * sY)]);
		const polygon_2 = me.pool.pull("me.Polygon", bodyShapeOriginX, bodyShapeOriginY, [me.pool.pull("me.Vector2d", 32 * sX, 190 * sY),me.pool.pull("me.Vector2d", 156 * sX, 5 * sY),me.pool.pull("me.Vector2d", 211 * sX, 33 * sY),me.pool.pull("me.Vector2d", 229 * sX, 80 * sY),me.pool.pull("me.Vector2d", 230 * sX, 138 * sY),me.pool.pull("me.Vector2d", 212 * sX, 183 * sY)]);
		this.bodyDef = {
			type: "dynamic",
			shapes: [],
			collisionType: me.collision.types.ENEMY_OBJECT | me.collision.types.ENEMY_OBJECT | me.collision.types.ENEMY_OBJECT,
			collisionMask: me.collision.types.ALL_OBJECT | me.collision.types.ALL_OBJECT | me.collision.types.ALL_OBJECT,
			gravityScale: 1,
			restitution: 0,
			frictionAir: { x: 0, y: 0 },
			maxVelocity: { x: 490, y: 490 },
			isSensor: false,
			fixedRotation: false
		};
		ellipse_0.collisionType = me.collision.types.ENEMY_OBJECT;
		ellipse_0.collisionMask = me.collision.types.ALL_OBJECT;
		ellipse_0.name = "ellipse";
		ellipse_0.debugColor = "red";
		ellipse_0.isTrigger = false;
		ellipse_0.isActive = true;
		this.bodyDef.shapes.push(ellipse_0);
		polygon_1.collisionType = me.collision.types.ENEMY_OBJECT;
		polygon_1.collisionMask = me.collision.types.ALL_OBJECT;
		polygon_1.name = "polygon";
		polygon_1.debugColor = "red";
		polygon_1.isTrigger = false;
		polygon_1.isActive = true;
		this.bodyDef.shapes.push(polygon_1);
		polygon_2.collisionType = me.collision.types.ENEMY_OBJECT;
		polygon_2.collisionMask = me.collision.types.ALL_OBJECT;
		polygon_2.name = "polygon";
		polygon_2.debugColor = "blue";
		polygon_2.isTrigger = false;
		polygon_2.isActive = true;
		this.bodyDef.shapes.push(polygon_2);
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
