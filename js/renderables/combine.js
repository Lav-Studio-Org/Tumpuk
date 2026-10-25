import * as me from '../../dist/melon-runtime.module.js'
import melon from '../../dist/melon-runtime.module.js'
import game from '../game.js'


// Put user code here //

//  End of user code  //

export default class combine extends me.ParticleEmitter {
	constructor(x, y, settings = {}) {

        // Put user code here //
        
        //  End of user code  //
		settings.image = settings.image || me.loader.getImage('image');
		super(x, y, Object.assign({}, me.ParticleEmitterSettings, settings));
		var image = this.settings.image || me.loader.getImage('image');

		this.width = 32;
		this.height = 32;

		this.settings.width = 32;
		this.settings.height = 32;
		this.settings.image = this.settings.image || image;
		this.settings.totalParticles = 50;
		this.settings.angle = 0;
		this.settings.angleVariation = 0.5235987755982988;
		this.settings.minLife = 1000;
		this.settings.maxLife = 1000;
		this.settings.lifeTime = 1000;
		this.settings.speed = 2;
		this.settings.speedVariation = 1;
		this.settings.minRotation = 0;
		this.settings.maxRotation = 0;
		this.settings.minStartScale = 1;
		this.settings.maxStartScale = 1;
		this.settings.startScale = 1;
		this.settings.endScale = 0;
		this.settings.minEndScale = 0;
		this.settings.maxEndScale = 0;
		this.settings.gravity = 0.1;
		this.settings.wind = 0;
		this.settings.maxParticles = 100;
		this.settings.frequency = 10;
		this.settings.duration = 5000;
		this.settings.framesToSkip = 0;
		this.settings.z = 0;
		this.settings.followTrajectory = false;
		this.settings.onlyInViewport = false;
		this.settings.floating = false;
		this.settings.textureAdditive = false;
        // Put user code here //
        
        //  End of user code  //
	};

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
        // Put user code here //
        
        //  End of user code  //
		return drawNextFrame;
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
