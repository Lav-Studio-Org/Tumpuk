import * as me from '../../dist/melon-runtime.module.js'
import melon from '../../dist/melon-runtime.module.js'
import game from '../game.js'


// Put user code here //
 
//  End of user code  //

export default class evolutionBar extends me.UIBaseElement {
	constructor(x, y, settings = {}) {
		settings.width = settings.width || 479;
		settings.height = settings.height || 65;
		

        // Put user code here //
        
        //  End of user code  //

		y += me.game.viewport.height*1;
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
		const childerns = [{"type":"imagelayer","name":"evoBar","image":"046ab200-9f74-11f1-8a49-e551180646a0","imageName":"evoBar","x":"239","y":"33","properties":[],"inspectors":{"alpha":1,"rotate":0,"scale":{"x":0.5,"y":0.5},"flip":{"x":false,"y":false},"z":null},"pivotX":0,"pivotY":0,"width":957,"height":130,"regX":0,"regY":0,"renderLayer":"world"}];
		this._addEditorChild(childerns, me, game);

        // Put user code here //
        this.startX = 51;
        this.stepX = 38;
        this.startY = 17;

        this.objectGap = 12;
        this.previewSize = 30;

        this.evolutionPreviews = [];
        // Store the home position in level-local design coordinates.
        this.homeX = x;
        this.homeY = y;

        // status apakah evo bar sedang disembunyikan oleh blower
        this.isBlowerHidden = false;

        // simpan instance supaya bisa diakses dari skill blower
        game.var.evolutionBarInstance = this;

        //  End of user code  //
	}

	/* triggered when a Renderable is added to the world.
	or when the scene containing it becomes active in game. */
	onActivateEvent() {
		super.onActivateEvent();
        // Put user code here //
        this.createEvolutionPreviews();

        // Refresh the home position after the object is attached to the level.
        this.homeX = this.pos.x;
        this.homeY = this.pos.y;

        game.var.evolutionBarInstance = this;
        //  End of user code  //
	}

	/* triggered when a Renderable is removed from the world.
	or when the scene containing it is no longer active in game */
	onDeactivateEvent() {
		super.onDeactivateEvent();
        // Put user code here //
        if (game.var.evolutionBarInstance === this) {
            game.var.evolutionBarInstance = null;
        }
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
    hideForBlower(onComplete) {

        // kalau sudah tersembunyi, langsung lanjut
        if (this.isBlowerHidden) {
            onComplete?.();
            return;
        }

        this.isBlowerHidden = true;

        // Preserve both axes so a resize cannot change the return target.
        this.homeX = this.homeX ?? this.pos.x;
        this.homeY = this.homeY ?? this.pos.y;

        // Move below the fixed design area, not the resized flex viewport.
        const designHeight =
            game.application?.settings?.height ?? 960;
        const outsideY =
            designHeight +
            this.height +
            200;

        new me.Tween(this.pos)
            .to(
                {
                    y: outsideY
                },
                {
                    duration: 300,
                    easing:
                        me.Tween.Easing.Cubic.In,
                    autoStart: true
                }
            )
            .onComplete(() => {

                // blower baru boleh muncul setelah
                // evo bar selesai keluar
                onComplete?.();
            });
    }


    showAfterBlower(onComplete) {

        const targetX =
            this.homeX;

        const targetY =
            this.homeY;

        new me.Tween(this.pos)
            .to(
                {
                    x: targetX,
                    y: targetY
                },
                {
                    duration: 350,
                    easing:
                        me.Tween.Easing.Cubic.Out,
                    autoStart: true
                }
            )
            .onComplete(() => {

                this.isBlowerHidden = false;

                onComplete?.();
            });
    }
    createEvolutionPreviews() {

        const level =
            game.var.currentLevel;


        const objects =
            game.var.suikaLevels?.[
                level
            ];


        if (
            !objects ||
            objects.length === 0
        ) {
            return;
        }


        const textureName =
            game.var.levelMap?.[
                level
            ];


        const texture =
            game.textureMap.get(
                textureName
            );


        if (!texture) {

            console.warn(
                "Evolution texture tidak ditemukan:",
                textureName
            );

            return;
        }


        const previewConfig =
            game.var.suikaEvolutionPreview?.[
                level
            ] || {};


        objects.forEach(
            (objectName, index) => {

                const imageName =
                    game.var
                        .suikaPreviewImages?.[
                            level
                        ]?.[
                            objectName
                        ];


                if (!imageName) {

                    console.warn(
                        "Evolution image tidak ditemukan:",
                        objectName
                    );

                    return;
                }


                const config =
                    previewConfig[
                        objectName
                    ] || {};


                const x =
                    this.startX +
                    index * this.stepX;

                const y =
                    this.startY +
                    this.previewSize / 2;


                const preview =
                    me.pool.pull(
                        "objectPreview", x, y,
                        {
                            image:
                                texture,
                            
                            texture: textureName,

                            imageLists: [
                                imageName
                            ],

                            objectName:
                                objectName,

                            evolutionPreview:
                                true,

                            maxWidth:
                                config.maxWidth ??
                                this.previewSize,

                            maxHeight:
                                config.maxHeight ??
                                this.previewSize,

                            scaleMultiplier:
                                config.scaleMultiplier ??
                                1,

                            z: 1
                        }
                    );


                if (!preview) {
                    return;
                }

                this.addChild(
                    preview
                );

                this.evolutionPreviews.push(
                    preview
                );

            }
        );

    }
    //  End of user code  //
};

// Put user code here //
 
//  End of user code  //
