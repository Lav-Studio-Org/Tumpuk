import * as me from '../../dist/melon-runtime.module.js'
import melon from '../../dist/melon-runtime.module.js'
import game from '../game.js'


// Put user code here //
 
//  End of user code  //

export default class dangerLine extends me.Renderable{
	constructor(x, y, settings = {}){
		settings.width = settings.width || 370;
		settings.height = settings.height || 4;
		settings.anchorPoint = {
			x: 0,
			y: 0.5
		};

        // Put user code here //
        
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

		this.var = {};
		this.color = "#ffffff"
		this.roundLevel = 10
		this.shapeType = "rect"

		this.posteffect = settings.posteffect ?? settings.postEffect ?? true;
        // Put user code here //
        this.color = "#ff4d4d";

        this.normalAlpha = 0;
        this.dangerAlpha = 0.85;

        this.pulseTime = 0;
        this.pulseSpeed = 0.008;

        this.alpha = 0;
        this.floating = false;
        this.alwaysUpdate = true;
        this.currentAlpha = 0;
        //  End of user code  //
	}

	/* triggered when a Renderable is added to the world.
	or when the scene containing it becomes active in game. */
	onActivateEvent() {
        // Put user code here //
        this.baseDangerY = this.pos.y;

        this.updateDangerPosition();
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
        this.updateDangerPosition();

        if (game.var.isDanger) {

            this.currentAlpha =
                Math.min(
                    1,
                    this.currentAlpha +
                    dt / 250
                );

            this.pulseTime += dt;

            const pulse =
                (
                    Math.sin(
                        this.pulseTime *
                        this.pulseSpeed
                    ) + 1
                ) / 2;

            this.alpha =
                this.currentAlpha *
                (0.5 + pulse * 0.4);

        } else {

            this.currentAlpha =
                Math.max(
                    0,
                    this.currentAlpha -
                    dt / 150
                );

            this.alpha =
                this.currentAlpha;
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
        if (!game.var.isDanger) {
            return;
        }

        renderer.setColor(this.color);

        const offsetX =
            (me.game.viewport.width - 540) / 2;

        renderer.fillRect(
            this.pos.x + offsetX,
            this.pos.y,
            this.width,
            this.height
        );
        return;








        
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

    // Put user code here //
    updateDangerPosition() {
        const designHeight = 960;

        const viewportHeight =
            me.game.viewport.height;
            
        game.var.dangerY =
            this.baseDangerY + ((viewportHeight - designHeight)/2);
        // game.var.dangerY = this.pos.y;
    }
    //  End of user code  //
};

// Put user code here //
 
//  End of user code  //
