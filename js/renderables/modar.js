import * as me from '../../dist/melon-runtime.module.js'
import melon from '../../dist/melon-runtime.module.js'
import game from '../game.js'


// Put user code here //

//  End of user code  //

export default class modar extends me.Sprite {
	constructor(x, y, settings = {}) {
		settings.videoName = settings.videoName || "modar";
		const videoSource = settings.image || me.loader.getVideo(settings.videoName);
		if (!videoSource) throw new Error("Video Sprite 'modar' requires a valid video asset");
		const playOnStart = settings.videoPlayOnStart ?? true;
		videoSource.autoplay = playOnStart;
		videoSource.loop = settings.videoLoop ?? false;
		videoSource.muted = settings.videoMuted ?? false;
		videoSource.volume = Math.max(0, Math.min(1, settings.videoVolume ?? 1));
		videoSource.playbackRate = Math.max(0.25, settings.videoPlaybackRate ?? 1);
		settings.image = videoSource;
		settings.anchorPoint = { x: 0.5, y: 0.5 };
		settings.overrideAnchor = true;

        // Put user code here //
        
        //  End of user code  //

		super(x, y, Object.assign(settings));
		this.videoName = settings.videoName;
		this.playOnStart = playOnStart;
		this.videoStopOnDeactivate = settings.videoStopOnDeactivate ?? true;
		if (!this.playOnStart) this.pause();


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

		this.var = {};

		this.posteffect = settings.posteffect ?? settings.postEffect ?? true;
        // Put user code here //
        
        //  End of user code  //
	}

	onActivateEvent() {
		if (this.playOnStart) this.play();
        // Put user code here //
        
        //  End of user code  //
	}

	onDeactivateEvent() {
		if (this.videoStopOnDeactivate) this.stop();
		else this.pause();
        // Put user code here //
        
        //  End of user code  //
	}

	onended() {
		if (!this.image.loop) this.stop();
        // Put user code here //
        melon.camera.fade("#000000", 1000);
        melon.time.after(1000, () => {
            const currentWorld =
                game.var.levelMap[game.var.currentLevel];
            game.var.loadingTarget = "Maps";
            game.var.loadingAssets = [
                "image"
            ];
            game.var.unloadAssets = [
                "Level Gameplay",
                currentWorld
            ];
            melon.scene.goTo("LoadingGame");
        });
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

    // Put user code here //
    
    //  End of user code  //
};

// Put user code here //

//  End of user code  //
