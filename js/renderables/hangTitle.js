import * as me from '../../dist/melon-runtime.module.js'
import melon from '../../dist/melon-runtime.module.js'
import game from '../game.js'


// Put user code here //

//  End of user code  //

export default class hangTitle extends me.UIBaseElement {
	constructor(x, y, settings = {}) {
		settings.width = settings.width || 387.486;
		settings.height = settings.height || 387.486;
		

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
		this.updateWhenPaused = false;
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
		const childerns = [{"type":"imagelayer","name":"hangTitle","image":"8a92bf50-a67a-11f1-a488-a51177990e19","imageName":"hangTitle","x":"194","y":"194","properties":[],"inspectors":{"alpha":1,"rotate":0,"scale":{"x":0.309,"y":0.309},"flip":{"x":false,"y":false},"z":null},"pivotX":0,"pivotY":0,"width":1254,"height":1254,"regX":0,"regY":0,"renderLayer":"world"},{"type":"text","name":"text","x":194,"y":299,"inspectors":{"alpha":1,"rotate":0,"scale":{"x":1,"y":1},"flip":{"x":false,"y":false},"z":0},"text":"TUMPUK!","size":59,"family":"Super Bouncer","color":"#ffffff","bold":false,"italic":false,"lineHeight":"59","textAlign":"center","textBaseline":"middle","wordWrapWidth":389,"boxWidth":389,"boxHeight":92,"renderLayer":"world"}];
		this._addEditorChild(childerns, me, game);

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
