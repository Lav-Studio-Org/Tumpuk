import * as me from '../../dist/melon-runtime.module.js'
import melon from '../../dist/melon-runtime.module.js'
import game from '../game.js'


// Put user code here //
 
//  End of user code  //

export default class exp extends me.Sprite {
	constructor(x, y, settings = {}) {
		settings.texture = "Level_Gameplay";
		settings.image = game.textureMap.get(settings.texture);
		settings.spriteAtlasFrames = settings.spriteAtlasFrames || [];
		settings.spriteSheetFrames = settings.spriteSheetFrames || [{"key":"Level_Gameplay__explosive__sheet_0","region":"explosive","texture":"Level_Gameplay","index":0,"x":0,"y":0,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_1","region":"explosive","texture":"Level_Gameplay","index":1,"x":100,"y":0,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_2","region":"explosive","texture":"Level_Gameplay","index":2,"x":200,"y":0,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_3","region":"explosive","texture":"Level_Gameplay","index":3,"x":300,"y":0,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_4","region":"explosive","texture":"Level_Gameplay","index":4,"x":400,"y":0,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_5","region":"explosive","texture":"Level_Gameplay","index":5,"x":500,"y":0,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_6","region":"explosive","texture":"Level_Gameplay","index":6,"x":600,"y":0,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_7","region":"explosive","texture":"Level_Gameplay","index":7,"x":700,"y":0,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_8","region":"explosive","texture":"Level_Gameplay","index":8,"x":800,"y":0,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_9","region":"explosive","texture":"Level_Gameplay","index":9,"x":900,"y":0,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_10","region":"explosive","texture":"Level_Gameplay","index":10,"x":0,"y":100,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_11","region":"explosive","texture":"Level_Gameplay","index":11,"x":100,"y":100,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_12","region":"explosive","texture":"Level_Gameplay","index":12,"x":200,"y":100,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_13","region":"explosive","texture":"Level_Gameplay","index":13,"x":300,"y":100,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_14","region":"explosive","texture":"Level_Gameplay","index":14,"x":400,"y":100,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_15","region":"explosive","texture":"Level_Gameplay","index":15,"x":500,"y":100,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_16","region":"explosive","texture":"Level_Gameplay","index":16,"x":600,"y":100,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_17","region":"explosive","texture":"Level_Gameplay","index":17,"x":700,"y":100,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_18","region":"explosive","texture":"Level_Gameplay","index":18,"x":800,"y":100,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_19","region":"explosive","texture":"Level_Gameplay","index":19,"x":900,"y":100,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_20","region":"explosive","texture":"Level_Gameplay","index":20,"x":0,"y":200,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_21","region":"explosive","texture":"Level_Gameplay","index":21,"x":100,"y":200,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_22","region":"explosive","texture":"Level_Gameplay","index":22,"x":200,"y":200,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_23","region":"explosive","texture":"Level_Gameplay","index":23,"x":300,"y":200,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_24","region":"explosive","texture":"Level_Gameplay","index":24,"x":400,"y":200,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_25","region":"explosive","texture":"Level_Gameplay","index":25,"x":500,"y":200,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_26","region":"explosive","texture":"Level_Gameplay","index":26,"x":600,"y":200,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_27","region":"explosive","texture":"Level_Gameplay","index":27,"x":700,"y":200,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_28","region":"explosive","texture":"Level_Gameplay","index":28,"x":800,"y":200,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_29","region":"explosive","texture":"Level_Gameplay","index":29,"x":900,"y":200,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_30","region":"explosive","texture":"Level_Gameplay","index":30,"x":0,"y":300,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_31","region":"explosive","texture":"Level_Gameplay","index":31,"x":100,"y":300,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_32","region":"explosive","texture":"Level_Gameplay","index":32,"x":200,"y":300,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_33","region":"explosive","texture":"Level_Gameplay","index":33,"x":300,"y":300,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_34","region":"explosive","texture":"Level_Gameplay","index":34,"x":400,"y":300,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_35","region":"explosive","texture":"Level_Gameplay","index":35,"x":500,"y":300,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_36","region":"explosive","texture":"Level_Gameplay","index":36,"x":600,"y":300,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_37","region":"explosive","texture":"Level_Gameplay","index":37,"x":700,"y":300,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_38","region":"explosive","texture":"Level_Gameplay","index":38,"x":800,"y":300,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_39","region":"explosive","texture":"Level_Gameplay","index":39,"x":900,"y":300,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_40","region":"explosive","texture":"Level_Gameplay","index":40,"x":0,"y":400,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_41","region":"explosive","texture":"Level_Gameplay","index":41,"x":100,"y":400,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_42","region":"explosive","texture":"Level_Gameplay","index":42,"x":200,"y":400,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_43","region":"explosive","texture":"Level_Gameplay","index":43,"x":300,"y":400,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_44","region":"explosive","texture":"Level_Gameplay","index":44,"x":400,"y":400,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_45","region":"explosive","texture":"Level_Gameplay","index":45,"x":500,"y":400,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_46","region":"explosive","texture":"Level_Gameplay","index":46,"x":600,"y":400,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_47","region":"explosive","texture":"Level_Gameplay","index":47,"x":700,"y":400,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_48","region":"explosive","texture":"Level_Gameplay","index":48,"x":800,"y":400,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_49","region":"explosive","texture":"Level_Gameplay","index":49,"x":900,"y":400,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_50","region":"explosive","texture":"Level_Gameplay","index":50,"x":0,"y":500,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_51","region":"explosive","texture":"Level_Gameplay","index":51,"x":100,"y":500,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_52","region":"explosive","texture":"Level_Gameplay","index":52,"x":200,"y":500,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_53","region":"explosive","texture":"Level_Gameplay","index":53,"x":300,"y":500,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_54","region":"explosive","texture":"Level_Gameplay","index":54,"x":400,"y":500,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_55","region":"explosive","texture":"Level_Gameplay","index":55,"x":500,"y":500,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_56","region":"explosive","texture":"Level_Gameplay","index":56,"x":600,"y":500,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_57","region":"explosive","texture":"Level_Gameplay","index":57,"x":700,"y":500,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_58","region":"explosive","texture":"Level_Gameplay","index":58,"x":800,"y":500,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_59","region":"explosive","texture":"Level_Gameplay","index":59,"x":900,"y":500,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_60","region":"explosive","texture":"Level_Gameplay","index":60,"x":0,"y":600,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_61","region":"explosive","texture":"Level_Gameplay","index":61,"x":100,"y":600,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_62","region":"explosive","texture":"Level_Gameplay","index":62,"x":200,"y":600,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_63","region":"explosive","texture":"Level_Gameplay","index":63,"x":300,"y":600,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_64","region":"explosive","texture":"Level_Gameplay","index":64,"x":400,"y":600,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_65","region":"explosive","texture":"Level_Gameplay","index":65,"x":500,"y":600,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_66","region":"explosive","texture":"Level_Gameplay","index":66,"x":600,"y":600,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_67","region":"explosive","texture":"Level_Gameplay","index":67,"x":700,"y":600,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_68","region":"explosive","texture":"Level_Gameplay","index":68,"x":800,"y":600,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_69","region":"explosive","texture":"Level_Gameplay","index":69,"x":900,"y":600,"width":100,"height":100},{"key":"Level_Gameplay__explosive__sheet_70","region":"explosive","texture":"Level_Gameplay","index":70,"x":0,"y":700,"width":100,"height":100}];
		settings.atlas = [];
		settings.atlasIndices = {};
		settings.framewidth = 0;
		settings.frameheight = 0;
		for (const frame of settings.spriteAtlasFrames) {
			const texture = game.textureMap.get(frame.texture);
			const region = texture?.getRegion(frame.name);
			if (!region) {
				throw new Error("Texture - region for " + frame.name + " not found in " + frame.texture);
			}
			const atlasRegion = Object.assign({}, region, { textureMapKey: frame.texture });
			settings.atlasIndices[frame.key] = settings.atlas.length;
			settings.atlas.push(atlasRegion);
			settings.framewidth = Math.max(region.width, settings.framewidth);
			settings.frameheight = Math.max(region.height, settings.frameheight);
		}
		for (const sheetFrame of settings.spriteSheetFrames) {
			const texture = game.textureMap.get(sheetFrame.texture);
			const sheetBaseRegion = texture?.getRegion(sheetFrame.region);
			if (!sheetBaseRegion) {
				throw new Error("Texture - region for " + sheetFrame.region + " not found in " + sheetFrame.texture);
			}
			if (sheetBaseRegion.angle) {
				throw new Error("Packed spritesheet region " + sheetFrame.region + " cannot be rotated");
			}
			const sheetTexture = texture.getTexture(sheetBaseRegion);
			const sheetTrim = sheetBaseRegion.trim || { x: 0, y: 0, w: sheetBaseRegion.width, h: sheetBaseRegion.height };
			const visibleLeft = Math.max(sheetFrame.x, sheetTrim.x);
			const visibleTop = Math.max(sheetFrame.y, sheetTrim.y);
			const visibleRight = Math.min(sheetFrame.x + sheetFrame.width, sheetTrim.x + sheetTrim.w);
			const visibleBottom = Math.min(sheetFrame.y + sheetFrame.height, sheetTrim.y + sheetTrim.h);
			const visibleWidth = Math.max(0, visibleRight - visibleLeft);
			const visibleHeight = Math.max(0, visibleBottom - visibleTop);
			const frameTrim = { x: visibleLeft - sheetFrame.x, y: visibleTop - sheetFrame.y, w: visibleWidth, h: visibleHeight };
			const atlasEntry = {};
			atlasEntry[sheetFrame.key] = Object.assign({}, sheetBaseRegion, {
				name: sheetFrame.key,
				offset: new me.Vector2d(sheetBaseRegion.offset.x + visibleLeft - sheetTrim.x, sheetBaseRegion.offset.y + visibleTop - sheetTrim.y),
				width: visibleWidth,
				height: visibleHeight,
				trimmed: visibleWidth !== sheetFrame.width || visibleHeight !== sheetFrame.height || frameTrim.x !== 0 || frameTrim.y !== 0,
				trim: frameTrim,
				sourceSize: { w: sheetFrame.width, h: sheetFrame.height },
				anchorPoint: undefined,
				angle: 0
			});
			texture.addUVs(atlasEntry, sheetFrame.key, sheetTexture.width, sheetTexture.height);
			settings.atlasIndices[sheetFrame.key] = settings.atlas.length;
			settings.atlas.push(Object.assign({}, atlasEntry[sheetFrame.key], { textureMapKey: sheetFrame.texture }));
			settings.framewidth = Math.max(sheetFrame.width, settings.framewidth);
			settings.frameheight = Math.max(sheetFrame.height, settings.frameheight);
		}
		settings.framewidth = settings.framewidth || 100;
		settings.frameheight = settings.frameheight || 100;
		settings.animationMotions = settings.animationMotions || [
			{
				 animationName: "exp",
				 frames: [{ name: "Level_Gameplay__explosive__sheet_0", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_1", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_2", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_3", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_4", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_5", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_6", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_7", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_8", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_9", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_10", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_11", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_12", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_13", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_14", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_15", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_16", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_17", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_18", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_19", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_20", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_21", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_22", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_23", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_24", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_25", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_26", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_27", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_28", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_29", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_30", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_31", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_32", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_33", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_34", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_35", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_36", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_37", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_38", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_39", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_40", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_41", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_42", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_43", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_44", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_45", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_46", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_47", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_48", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_49", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_50", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_51", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_52", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_53", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_54", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_55", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_56", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_57", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_58", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_59", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_60", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_61", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_62", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_63", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_64", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_65", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_66", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_67", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_68", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_69", delay: 10 }, { name: "Level_Gameplay__explosive__sheet_70", delay: 10 }],
			},
		];
		settings.animationDefault = settings.animationDefault || settings.animationMotions[0].animationName;
		settings.anchorPoint = { x: 0.5, y: 0.5 };
		settings.overrideAnchor = false;

        // Put user code here //
        
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

		this.var = {};

		this.posteffect = settings.posteffect ?? settings.postEffect ?? true;
        // Put user code here //
        this.setCurrentAnimation(settings.animationDefault, () => {
            me.game.world.removeChildNow(this);
        });
        this.tint = settings.tint;
        //  End of user code  //
	}

	/* triggered when a Renderable is added to the world.
	or when the scene containing it becomes active in game. */
	onActivateEvent() {
        // Put user code here //
        this.pos.z = 9999;
        //  End of user code  //
	}

	/* triggered when a Renderable is removed from the world.
	or when the scene containing it is no longer active in game */
	onDeactivateEvent() {
        // Put user code here //
        
        //  End of user code  //
	}

	/* The update function in MelonJS is called on every game frame to update an object's state.
	It is commonly used for handling movement, animations, physics, and game logic.
	Returning true from this function signals that the object needs to be re-rendered. */
	update (dt){
		var drawNextFrame = super.update(dt);
        // Put user code here //
        
        //  End of user code  //
		return true;
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

	__resolveRegionSource(region) {
		let activeRegion = region;
		if (region?.textureMapKey) {
			const source = game.textureMap.get(region.textureMapKey);
			if (source) {
				this.source = source;
				activeRegion = Object.assign({}, region);
				delete activeRegion.textureMapKey;
			}
		}
		return activeRegion;
	}

	_applyFrame(region) {
		const activeRegion = this.__resolveRegionSource(region);
		if (typeof super._applyFrame === "function") {
			return super._applyFrame(activeRegion);
		}
		return super.setRegion(activeRegion);
	}

	setRegion(region, regionNorm) {
		return super.setRegion(this.__resolveRegionSource(region), regionNorm);
	}

    // Put user code here //
    
    //  End of user code  //
};

// Put user code here //
 
//  End of user code  //
