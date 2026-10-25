import * as me from '../../dist/melon-runtime.module.js'
import melon from '../../dist/melon-runtime.module.js'
import game from '../game.js'


// Put user code here //
 
//  End of user code  //

export default class gameContainerFront extends me.Sprite {
	constructor(x, y, settings = {}) {
		settings.texture = "Level_Gameplay";
		settings.image = game.textureMap.get(settings.texture);
		settings.imageLists = settings.imageLists || ["suikaContainerFront"];
		game.util.__populateAtlasIndices( settings.imageLists , settings);
		settings.animationMotions = settings.animationMotions || [
			{
				 animationName: "a",
				 frames: [{ name: "suikaContainerFront", delay: 100 }],
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
		this.shaderUniforms = [
			{ name: "uScreenTexture", type: "sampler2D", value: "ScreenTexture2D", objectName: "gameContainerFront" },
			{ name: "uResolution", type: "vec2", value: () => [540,960] },
			{ name: "uBodyAlpha", type: "float", value: () => [-100] },
			{ name: "uRimAlpha", type: "float", value: () => [0] },
			{ name: "uBackgroundMix", type: "float", value: () => [10] },
			{ name: "uRefraction", type: "float", value: () => [0.01] },
			{ name: "uBlurAmount", type: "float", value: () => [1000] },
		];
		const shader = game.ShaderManager?.getProgram("containerShader") || me.loader.getShader("containerShader");
		if (shader) {
			if (game.ShaderManager) game.ShaderManager.attachShader("containerShader");
			if (this.addPostEffect) this.addPostEffect(shader);
			else this.shader = shader;
		}

        // Put user code here //
        this.shader = null;
        this.postEffect = false;
        //  End of user code  //
	}

	/* triggered when a Renderable is added to the world.
	or when the scene containing it becomes active in game. */
	onActivateEvent() {
        // Put user code here //
        this.pos.z = 500;
        //  End of user code  //
	}

	/* triggered when a Renderable is removed from the world.
	or when the scene containing it is no longer active in game */
	onDeactivateEvent() {
        // Put user code here //
        if (Array.isArray(this.postEffects)) {
			this.postEffects.length = 0;
		}
        //  End of user code  //
	}

	onDestroyEvent() {
		if (Array.isArray(this.postEffects)) {
			this.postEffects.length = 0;
		}
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
		const shader = this.shader;
		const usePostEffect = shader && this.posteffect !== false && shader.enabled !== false;

		if (usePostEffect) {
			if (renderer.shaderLanguage !== "wgsl") renderer.setBatcher("quad", shader._shader || shader);

			const shaderUniforms = shader.uniforms || shader._shader?.uniforms || {};
			const shaderTime = me.timer.getTime() / 1000;
			if (typeof shader.setTime === "function") shader.setTime(shaderTime);
			else if (typeof shaderUniforms.uTime !== "undefined") shader.setUniform("uTime", shaderTime);
			if (shader.wgslRealization?.hasUniform("TIME") || typeof shaderUniforms.TIME !== "undefined") shader.setUniform("TIME", shaderTime);
			if (shader.wgslRealization?.hasUniform("ME_offset") || typeof shaderUniforms.ME_offset !== "undefined") shader.setUniform("ME_offset", [this.current.offset.x, this.current.offset.y]);
			if (shader.wgslRealization?.hasUniform("ME_size_obj") || typeof shaderUniforms.ME_size_obj !== "undefined") shader.setUniform("ME_size_obj", [Math.max(Math.abs(this.current.width), 1), Math.max(Math.abs(this.current.height), 1)]);
			if (shader.wgslRealization?.hasUniform("ME_size_img") || typeof shaderUniforms.ME_size_img !== "undefined") shader.setUniform("ME_size_img", [Math.max(this.image.width, 1), Math.max(this.image.height, 1)]);
			if (shader.wgslRealization?.hasUniform("ME_size_screen") || typeof shaderUniforms.ME_size_screen !== "undefined") shader.setUniform("ME_size_screen", [me.game.viewport.width, me.game.viewport.height]);
			if (shader.wgslRealization?.hasUniform("ME_scale_screen") || typeof shaderUniforms.ME_scale_screen !== "undefined") shader.setUniform("ME_scale_screen", [this.scaleX, this.scaleY]);
			if (shader.wgslRealization?.hasUniform("ME_pos_obj") || typeof shaderUniforms.ME_pos_obj !== "undefined") shader.setUniform("ME_pos_obj", [this.pos.x, this.pos.y]);
			if (shader.wgslRealization?.hasUniform("ME_pos_world") || typeof shaderUniforms.ME_pos_world !== "undefined") shader.setUniform("ME_pos_world", [me.game.viewport.x, me.game.viewport.y]);
			if (shader.wgslRealization?.hasUniform("ME_size_world") || typeof shaderUniforms.ME_size_world !== "undefined") shader.setUniform("ME_size_world", [me.game.viewport.width, me.game.viewport.height]);

			shader.setTexture("uScreenTexture", renderer.toFrameTexture(), "no-repeat");
			if (shader.wgslRealization?.hasUniform("uResolution") || typeof shaderUniforms.uResolution !== "undefined") shader.setUniform("uResolution", [540,960]);
			if (shader.wgslRealization?.hasUniform("uBodyAlpha") || typeof shaderUniforms.uBodyAlpha !== "undefined") shader.setUniform("uBodyAlpha", [-100]);
			if (shader.wgslRealization?.hasUniform("uRimAlpha") || typeof shaderUniforms.uRimAlpha !== "undefined") shader.setUniform("uRimAlpha", [0]);
			if (shader.wgslRealization?.hasUniform("uBackgroundMix") || typeof shaderUniforms.uBackgroundMix !== "undefined") shader.setUniform("uBackgroundMix", [10]);
			if (shader.wgslRealization?.hasUniform("uRefraction") || typeof shaderUniforms.uRefraction !== "undefined") shader.setUniform("uRefraction", [0.01]);
			if (shader.wgslRealization?.hasUniform("uBlurAmount") || typeof shaderUniforms.uBlurAmount !== "undefined") shader.setUniform("uBlurAmount", [1000]);

			if (renderer.shaderLanguage !== "wgsl" && typeof shader._prepareTextures === "function") shader._prepareTextures(renderer.currentBatcher);
		}
        // Put user code here //
 
        //  End of user code  //
		super.draw(renderer, viewport);
	}

    // Put user code here //
    
    //  End of user code  //
};

// Put user code here //
 
//  End of user code  //
