import * as me from '../../dist/melon-runtime.module.js'
import melon from '../../dist/melon-runtime.module.js'
import game from '../game.js'


// Put user code here //

//  End of user code  //

export default class settingContainer extends me.UIBaseElement {
	constructor(x, y, settings = {}) {
		settings.width = settings.width || 540;
		settings.height = settings.height || 1200;
		

        // Put user code here //
        
        //  End of user code  //

		super(x, y, settings.width, settings.height);
		// Keep legacy object.x/object.y UI code mapped to renderable position on newer melonJS.
		Object.defineProperties(this, {
			x: { get: () => this.pos.x, set: (value) => { this.pos.x = value; }, configurable: true },
			y: { get: () => this.pos.y, set: (value) => { this.pos.y = value; }, configurable: true }
		});


		/* Extract inspector values */
		const inspectors = settings.inspectors || {};
		const alpha = inspectors.alpha ?? 1;
		const scale = inspectors.scale || { x: 1, y: 1 };
		const flip = inspectors.flip || { x: false, y: false };

		/* Handle configuration data for the object */
		this.alpha = alpha;
		this.floating = true;
		this.alwaysUpdate = false;
		this.updateWhenPaused = true;
		this.isPersistent = false;

		/* Apply scaling */
		this.scale(scale.x, scale.y);
		this._scaleX = scale.x;
		this._scaleY = scale.y;

		/* Apply flipping on X and/or Y axis */
		this.flipX(flip.x);
		this.flipY(flip.y);
		this.anchorPoint.set(0, 0);
		this.isHoldable = false;
		this.isDraggable = false;
		// isEnable controls whether the GUI object receives input events
		this.isEnable = true;

		this.var = {};

		this.posteffect = settings.posteffect ?? settings.postEffect ?? true;
		/* built in function for adding container childs */
		const childerns = [{"type":"objectgroup","name":"hangBlack","objectName":"hangBlack","x":270,"y":600,"renderLayer":"world","properties":[],"inspectors":{"alpha":0.4,"rotate":0,"scale":{"x":5.583,"y":17.892},"flip":{"x":false,"y":false},"z":0},"modification":{}},{"type":"imagelayer","name":"result","image":"d9e79503-a6aa-11f1-a488-a51177990e19","imageName":"settingsBG","x":"270","y":"600","properties":[],"inspectors":{"alpha":1,"rotate":0,"scale":{"x":0.905,"y":0.905},"flip":{"x":false,"y":false},"z":null},"pivotX":0,"pivotY":0,"width":561,"height":663,"regX":0,"regY":0,"renderLayer":"world"},{"type":"objectgroup","name":"sfxSlider","objectName":"sfxSlider","x":170,"y":696,"renderLayer":"world","properties":[],"inspectors":{"alpha":1,"rotate":0,"scale":{"x":1,"y":1},"flip":{"x":false,"y":false},"z":0},"modification":{}},{"type":"text","name":"text","x":270,"y":675,"inspectors":{"alpha":1,"rotate":0,"scale":{"x":1,"y":1},"flip":{"x":false,"y":false},"z":0},"text":"SFX","size":32,"family":"Super Bouncer","color":"#000000","bold":false,"italic":false,"lineHeight":"32","textAlign":"center","textBaseline":"middle","wordWrapWidth":129,"boxWidth":129,"boxHeight":32,"renderLayer":"world"},{"type":"text","name":"text","x":270,"y":540,"inspectors":{"alpha":1,"rotate":0,"scale":{"x":1,"y":1},"flip":{"x":false,"y":false},"z":0},"text":"MUSIC","size":32,"family":"Super Bouncer","color":"#000000","bold":false,"italic":false,"lineHeight":"32","textAlign":"center","textBaseline":"middle","wordWrapWidth":129,"boxWidth":129,"boxHeight":32,"renderLayer":"world"},{"type":"text","name":"text","x":271,"y":373,"inspectors":{"alpha":1,"rotate":0,"scale":{"x":1,"y":1},"flip":{"x":false,"y":false},"z":0},"text":"Settings","size":32,"family":"Super Bouncer","color":"#ffffff","bold":false,"italic":true,"lineHeight":"32","textAlign":"center","textBaseline":"middle","wordWrapWidth":129,"boxWidth":129,"boxHeight":32,"renderLayer":"world"},{"type":"objectgroup","name":"musicSlider","objectName":"musicSlider","x":170,"y":561,"renderLayer":"world","properties":[],"inspectors":{"alpha":1,"rotate":0,"scale":{"x":1,"y":1},"flip":{"x":false,"y":false},"z":0},"modification":{}},{"type":"objectgroup","name":"closeSettings","objectName":"closeSettings","x":434,"y":409,"renderLayer":"world","properties":[],"inspectors":{"alpha":0.44,"rotate":0,"scale":{"x":1,"y":1},"flip":{"x":false,"y":false},"z":0},"modification":{}}];
		this._addEditorChild(childerns, me, game);

        // Put user code here //
        this.enablePausedUI(this);
        this.floating = false;
        // this.anchorPoint.set(0.5,0.5);
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
    enablePausedUI(object) {
        object.updateWhenPaused = true;
        object.inViewport = true;
        object.getChildren?.().forEach(child => this.enablePausedUI(child));
    }
    //  End of user code  //
};

// Put user code here //
 
//  End of user code  //
