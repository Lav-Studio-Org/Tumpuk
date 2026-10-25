import * as me from '../../dist/melon-runtime.module.js'
import melon from '../../dist/melon-runtime.module.js'
import game from '../game.js'


// Put user code here //
import suikaObj from './suikaObj.js'
//  End of user code  //

export default class blower2 extends me.Renderable{
	constructor(x, y, settings = {}){
		settings.width = settings.width || 540;
		settings.height = settings.height || 960;
		settings.anchorPoint = {
			x: 0.5,
			y: 0.5
		};

        // Put user code here //
        if (settings.direction === "left" || settings.direction === "right") {
            settings.width = 100;
            settings.height = 500;
        } else {
            settings.width = 340;
            settings.height = 100;
        }
        //  End of user code  //

		super(x, y, settings.width, settings.height);


		/* Extract inspector values */
		const inspectors = settings.inspectors || {};
		const alpha = inspectors.alpha ?? 1;
		const scale = inspectors.scale || { x: 1, y: 1 };
		const flip = inspectors.flip || { x: false, y: false };
		const rotation = inspectors.rotate || 0;

		/* Handle configuration data for the object */
		this.alpha = alpha;
		this.floating = false;
		this.alwaysUpdate = false;
		this.updateWhenPaused = false;
		this.isPersistent = false;

		/* Apply rotation */
		this.rotate(rotation);
		this._rotation = rotation;

		/* Apply scaling */
		this.scale(scale.x, scale.y);
		this._scaleX = scale.x;
		this._scaleY = scale.y;

		/* Apply flipping on X and/or Y axis */
		this.flipX(flip.x);
		this.flipY(flip.y);
		this.anchorPoint.set(settings.anchorPoint.x, settings.anchorPoint.y);

		this._pointerDownHandler = me.input.registerPointerEvent("pointerdown", this, this.onClick.bind(this));

		this._pointerUpHandler = me.input.registerPointerEvent("pointerup", this, this.onRelease.bind(this));

		/* Configure object body for collision behavior */
		this.isKinematic = false;
		this.var = {};
		this.color = "#ffffff"
		this.roundLevel = 10
		this.shapeType = "empty"

		this.posteffect = settings.posteffect ?? settings.postEffect ?? true;
        // Put user code here //
        this._pointerLeaveHandler = me.input.registerPointerEvent(
            "pointerleave",
            this,
            this.onLeave.bind(this)
        );
        this.direction = settings.direction;
        this.isHolding = false;
        //  End of user code  //
	}

	/* triggered when a Renderable is added to the world.
	or when the scene containing it becomes active in game. */
	onActivateEvent() {
        // Put user code here //
        
        //  End of user code  //
	}

	/* triggered when a Renderable is removed from the world.
	or when the scene containing it is no longer active in game */
	onDeactivateEvent() {
		me.input.releasePointerEvent("pointerdown", this, this._pointerDownHandler);
		me.input.releasePointerEvent("pointerup", this, this._pointerUpHandler);
        // Put user code here //
        me.input.releasePointerEvent("pointerleave", this, this._pointerLeaveHandler);
        //  End of user code  //
	}

	/* The update function in MelonJS is called on every game frame to update an object's state.
	It is commonly used for handling movement, animations, physics, and game logic.
	Returning true from this function signals that the object needs to be re-rendered. */
	update (dt){
		var drawNextFrame = super.update(dt);
        // Put user code here //
        if (me.timer.getTime() >= game.var.blowerEndTime) {
            this.closeBlower();
            return false;
        }

        if (this.isHolding) {
            this.applyBlower(dt);
        }
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
		renderer.setColor(this.color);
		switch (this.shapeType) {
			case "rect":
				renderer.fillRect(this.pos.x, this.pos.y, this.width, this.height);
				break;

			case "roundrect":
				renderer.fillRoundRect(this.pos.x, this.pos.y, this.width, this.height, this.roundLevel);
				break;

			case "ellipse":
				let radius = Math.min(this.width, this.height) / 2;
				let centerX = this.pos.x + this.width / 2;
				let centerY = this.pos.y + this.height / 2;
				renderer.fillArc(centerX, centerY, radius, 0, Math.PI * 2, false);
				break;

			case "empty":
				break;

			default:
				console.warn(`Unknown shapeType: ${this.shapeType}`);
				renderer.fillRect(this.pos.x, this.pos.y, this.width, this.height);
				break;
		}
	}

	onClick(pointer) {
		if (this.ancestor && this.ancestor instanceof me.UIBaseElement && this.ancestor?.isEnable === false) return false;

        // Put user code here //
        this.isHolding = true;
        // let velocityX = 0;
        // let velocityY = 0;

        // switch (this.direction) {

        //     case "left":
        //         velocityX = 8;
        //         break;

        //     case "right":
        //         velocityX = -8;
        //         break;

        //     case "bottom":
        //         velocityY = -8;
        //         break;
        // }

        // this.blowObjects(velocityX, velocityY);
        // this.closeBlower();
        //  End of user code  //
		return false;
	}

	onRelease(pointer) {
		if (this.ancestor && this.ancestor instanceof me.UIBaseElement && this.ancestor?.isEnable === false) return false;

        // Put user code here //
        this.isHolding = false;
        //  End of user code  //
		return false;
	}

    // Put user code here //
    blowObjects(x, y) {

        const objects = me.game.world.getChildren();

        for (const object of objects) {

            if (!(object instanceof suikaObj)) {
                continue;
            }

            const velocity =
                object.body.getVelocity();

            object.body.setVelocity(
                velocity.x + x,
                velocity.y + y
            );
        }
    }

    closeBlower() {

        if (!game.var.skillActive) {
            return;
        }

        game.var.skillActive = null;

        const objects = [...me.game.world.getChildren()];

        for (const object of objects) {
            if (object instanceof blower) {
                me.game.world.removeChild(object);
            }
        }
    }

    applyBlower(dt) {

        let x = 0;
        let y = 0;

        // strength per detik
        const strength = 5;

        // supaya tidak tergantung FPS
        const force = strength * (dt / 1000);

        switch (this.direction) {
            case "left":
                x = force*2;
                break;

            case "right":
                x = -force*2;
                break;

            case "bottom":
                y = -force*5;
                break;
        }

        this.blowObjects(x, y);
    }

    onLeave(pointer) {
        // Pointer release logic (editable) //
        this.isHolding = false;
        // End of Pointer release logic //
		return false;
	}
    //  End of user code  //
};

// Put user code here //
 
//  End of user code  //
