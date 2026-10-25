import * as me from '../../dist/melon-runtime.module.js'
import melon from '../../dist/melon-runtime.module.js'
import game from '../game.js'


// Put user code here //

//  End of user code  //

export default class comboParticle extends me.Text{
	constructor(x, y, settings = {}){
		settings.font = settings.font ?? "Arial";
		settings.size = settings.size ?? 24;
		settings.fillStyle = settings.fillStyle || "#ffffff";
		settings.strokeStyle = settings.strokeStyle || "#000000";
		settings.lineWidth = settings.lineWidth ?? 0;
		settings.textAlign = settings.textAlign || "left";
		settings.textBaseline = settings.textBaseline || "top";
		settings.lineHeight = settings.lineHeight ?? 1;
		settings.wordWrapWidth = settings.wordWrapWidth ?? -1;
		settings.text = settings.text ?? "Hello melonJS";
		settings.bold = settings.bold ?? false;
		settings.italic = settings.italic ?? false;
		settings.anchorPoint = settings.anchorPoint || {
			x: 0,
			y: 0
		};

        // Put user code here //
        const comboCount =
            Math.max(
                1,
                Number(settings.count) || 1
            );


        // =========================
        // WARNA BERDASARKAN COMBO
        // =========================

        let comboColor = "#FFFFFF";

        if (comboCount >= 20) {

            comboColor = "#FF7A9E";

        } else if (comboCount >= 10) {

            comboColor = "#FFB347";

        } else if (comboCount >= 5) {

            comboColor = "#FFE66D";
        }


        // =========================
        // UKURAN BERDASARKAN COMBO
        // =========================

        const comboSize =
            Math.min(
                52,
                30 +
                Math.floor(
                    comboCount * 0.75
                )
            );


        settings.font =
            "Super Bouncer";

        settings.size =
            comboSize;

        settings.fillStyle =
            comboColor;

        settings.strokeStyle =
            "#4A2515";

        settings.lineWidth =
            4;

        settings.textAlign =
            "center";

        settings.textBaseline =
            "middle";

        settings.bold =
            true;

        settings.text =
            `x${comboCount}`;

        settings.anchorPoint = {
            x: 0.5,
            y: 0.5
        };
        //  End of user code  //

		super(x, y, settings);


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

		this.posteffect = settings.posteffect ?? settings.postEffect ?? true;
        // Put user code here //
        this.var.count =
            Math.max(
                1,
                Number(settings.count) || 1
            );


        this.var.elapsed = 0;


        // Total umur particle
        this.var.lifetime =
            Number(settings.lifetime) ||
            850;


        // Jarak terbang ke atas
        this.var.floatDistance =
            Number(settings.floatDistance) ||
            72;


        // Posisi awal
        this.var.startX =
            this.pos.x;

        this.var.startY =
            this.pos.y;


        // Drift random kiri / kanan
        this.var.driftX =
            Number.isFinite(
                Number(settings.driftX)
            )
                ? Number(settings.driftX)
                : (
                    Math.random() *
                    36 -
                    18
                );


        // Sedikit rotation/wobble direction
        this.var.wobbleDirection =
            Math.random() < 0.5
                ? -1
                : 1;


        // Scale tracker
        this.var.visualScale = 1;


        // World object,
        // bukan HUD yang mengikuti camera.
        this.floating = false;


        // Mulai kecil
        this.setComboScale(
            0.55
        );


        // Mulai transparan
        this.setOpacity(
            0
        );
        //  End of user code  //
	}

	/* triggered when a Renderable is added to the world.
	or when the scene containing it becomes active in game. */
	onActivateEvent() {
        // Put user code here //
        this.var.elapsed = 0;
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
        this.var.elapsed +=
            dt;


        const lifetime =
            Math.max(
                1,
                this.var.lifetime
            );


        const t =
            Math.min(
                1,
                this.var.elapsed /
                lifetime
            );


        // =========================
        // FLOAT UP
        // =========================

        const moveEase =
            1 -
            Math.pow(
                1 - t,
                3
            );


        // Sedikit drift kiri / kanan
        this.pos.x =
            this.var.startX +
            this.var.driftX *
            moveEase;


        // Naik ke atas
        this.pos.y =
            this.var.startY -
            this.var.floatDistance *
            moveEase;


        // =========================
        // WOBBLE
        // =========================

        this.pos.x +=
            Math.sin(
                t *
                Math.PI *
                2
            ) *
            3 *
            (
                1 - t
            ) *
            this.var.wobbleDirection;


        // =========================
        // POP SCALE
        // =========================

        let visualScale = 1;


        /*
        * FASE 1
        *
        * 0.55 → 1.20
        */
        if (
            t < 0.16
        ) {

            const p =
                t /
                0.16;


            const eased =
                1 -
                Math.pow(
                    1 - p,
                    3
                );


            visualScale =
                0.55 +
                (
                    1.20 -
                    0.55
                ) *
                eased;


        /*
        * FASE 2
        *
        * 1.20 → 1.00
        */
        } else if (
            t < 0.30
        ) {

            const p =
                (
                    t -
                    0.16
                ) /
                (
                    0.30 -
                    0.16
                );


            const eased =
                1 -
                Math.pow(
                    1 - p,
                    3
                );


            visualScale =
                1.20 +
                (
                    1 -
                    1.20
                ) *
                eased;

        } else {

            /*
            * Setelah settle,
            * sedikit mengecil selama fade.
            */
            const settleProgress =
                (
                    t -
                    0.30
                ) /
                0.70;


            visualScale =
                1 -
                Math.max(
                    0,
                    settleProgress
                ) *
                0.06;
        }


        this.setComboScale(
            visualScale
        );


        // =========================
        // OPACITY
        // =========================

        let alpha = 1;


        /*
        * Fade-in cepat
        */
        if (
            t < 0.08
        ) {

            alpha =
                t /
                0.08;


        /*
        * Hold lalu fade-out
        */
        } else if (
            t > 0.55
        ) {

            const fadeProgress =
                (
                    t -
                    0.55
                ) /
                0.45;


            alpha =
                1 -
                fadeProgress *
                fadeProgress;
        }


        this.setOpacity(
            Math.max(
                0,
                Math.min(
                    1,
                    alpha
                )
            )
        );


        // =========================
        // DESTROY
        // =========================

        if (
            t >= 1
        ) {

            this.setOpacity(
                0
            );


            if (
                this.ancestor
            ) {

                melon.object.destroy(
                    this
                );
            }


            return false;
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
	}

    // Put user code here //
    setComboScale(value) {

        const previous =
            this.var.visualScale || 1;


        const ratio =
            value /
            previous;


        this.scale(
            ratio,
            ratio
        );


        this.var.visualScale =
            value;
    }
    //  End of user code  //
};

// Put user code here //

//  End of user code  //
