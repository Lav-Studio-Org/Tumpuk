import * as me from '../../dist/melon-runtime.module.js'
import melon from '../../dist/melon-runtime.module.js'
import game from '../game.js'


// Put user code here //
import suikaObj from './suikaObj.js'
//  End of user code  //

export default class blower extends me.Sprite {
	constructor(x, y, settings = {}) {
		settings.texture = "Level_Gameplay";
		settings.image = game.textureMap.get(settings.texture);
		settings.imageLists = settings.imageLists || ["blower"];
		game.util.__populateAtlasIndices( settings.imageLists , settings);
		settings.animationMotions = settings.animationMotions || [
			{
				 animationName: "blower",
				 frames: [{ name: "blower", delay: 100 }],
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

		this._pointerDownHandler = me.input.registerPointerEvent("pointerdown", this, this.onClick.bind(this));

		this._pointerUpHandler = me.input.registerPointerEvent("pointerup", this, this.onRelease.bind(this));

		/* Configure object body for collision behavior */
		this.isKinematic = false;
		this.var = {};

		this.posteffect = settings.posteffect ?? settings.postEffect ?? true;
        // Put user code here //
        me.input.releasePointerEvent(
            "pointerup",
            this
        );


        // WAJIB untuk membuat viewport
        // mendapatkan pointerId setiap pointerdown.
        this._globalPointerDownHandler =
            () => true;


        this._globalPointerUpHandler =
            this.onRelease.bind(this);


        this._globalPointerCancelHandler =
            this.onRelease.bind(this);


        me.input.registerPointerEvent(
            "pointerdown",
            me.game.viewport,
            this._globalPointerDownHandler
        );


        me.input.registerPointerEvent(
            "pointerup",
            me.game.viewport,
            this._globalPointerUpHandler
        );


        me.input.registerPointerEvent(
            "pointercancel",
            me.game.viewport,
            this._globalPointerCancelHandler
        );

        this.direction = settings.direction;
        this.isHolding = false;

        if (this.direction === "bottom") {
            this.rotate(90 * Math.PI / 180);
        }

        const currentLevel =
            String(
                game.var.currentLevel ||
                "KEBUN"
            ).toUpperCase();

        const blowerTint =
            game.var.blowerTints?.[
                currentLevel
            ] || "#FFFFFF";

        this.tint.parseHex(
            blowerTint
        );
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
        me.input.releasePointerEvent(
            "pointerdown",
            me.game.viewport,
            this._globalPointerDownHandler
        );

        me.input.releasePointerEvent(
            "pointerup",
            me.game.viewport,
            this._globalPointerUpHandler
        );

        me.input.releasePointerEvent(
            "pointercancel",
            me.game.viewport,
            this._globalPointerCancelHandler
        );

        this.isHolding = false;

        this.stopBlowerSound();
        this.stopWindParticle();
        //  End of user code  //
	}

	/* The update function in MelonJS is called on every game frame to update an object's state.
	It is commonly used for handling movement, animations, physics, and game logic.
	Returning true from this function signals that the object needs to be re-rendered. */
	update (dt){
		var drawNextFrame = super.update(dt);
        // Put user code here //
        if (me.timer.getTime() >= game.var.blowerEndTime) {

            this.stopBlowerSound();
            this.stopWindParticle();
            this.closeBlower();

            return false;
        }

        if (game.var.isGameOver) {
            this.isHolding = false;
            this.stopBlowerSound();
            this.stopWindParticle();
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
	}

	onClick(pointer) {
		if (this.ancestor && this.ancestor instanceof me.UIBaseElement && this.ancestor?.isEnable === false) return false;

        // Put user code here //
        if (this.isHolding) {
            return false;
        }

        this.isHolding = true;

        this.startBlowerSound();
        this.startWindParticle();
        //  End of user code  //
		return false;
	}

	onRelease(pointer) {
		if (this.ancestor && this.ancestor instanceof me.UIBaseElement && this.ancestor?.isEnable === false) return false;

        // Put user code here //
        if (!this.isHolding) {
            return true;
        }

        this.isHolding = false;

        this.stopBlowerSound();
        this.stopWindParticle();

        return true;
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

        /*
        * update() dipanggil oleh ketiga blower.
        *
        * Jadi ketika waktunya habis,
        * ketiganya berpotensi memanggil
        * closeBlower() di frame yang sama.
        *
        * blowerClosing dipakai sebagai lock.
        */
        if (
            game.var.skillActive !== "blower" ||
            game.var.blowerClosing
        ) {
            return;
        }


        game.var.blowerClosing = true;


        /*
        * Ambil semua blower yang ada.
        */
        const blowers =
            [...me.game.world.getChildren()]
                .filter(
                    object =>
                        object instanceof blower
                );


        /*
        * Safety fallback.
        */
        if (blowers.length === 0) {

            this.finishBlowerSkill();

            return;
        }


        /*
        * Kita harus tahu kapan blower TERAKHIR
        * selesai tween.
        */
        let remaining =
            blowers.length;

        // Keep world-object exit positions in the fixed design coordinate system.
        const designWidth =
            game.application?.settings?.width ?? 540;
        const designHeight =
            game.application?.settings?.height ?? 960;


        for (const object of blowers) {

            // blower tidak boleh memberi force lagi
            object.isHolding = false;
            
            object.stopBlowerSound();
            object.stopWindParticle();

            /*
            * Default tetap posisi sekarang.
            */
            let targetX =
                object.pos.x;

            let targetY =
                object.pos.y;


            /*
            * Tentukan arah keluar sesuai
            * posisi blower.
            */
            switch (object.direction) {

                case "left":

                    targetX = -100;

                    break;


                case "right":

                    targetX =
                        designWidth +
                        100;

                    break;


                case "bottom":

                    targetY =
                        designHeight +
                        120;

                    break;
            }


            /*
            * Tween keluar.
            */
            new me.Tween(object.pos)
                .to(
                    {
                        x: targetX,
                        y: targetY
                    },
                    {
                        duration: 300,

                        easing:
                            me.Tween.Easing.Cubic.In,

                        autoStart: true
                    }
                )
                .onComplete(() => {

                    /*
                    * Setelah blower keluar layar,
                    * baru dihapus dari world.
                    */
                    if (object.ancestor) {

                        me.game.world.removeChild(
                            object
                        );
                    }


                    remaining--;


                    /*
                    * Blower terakhir selesai keluar.
                    */
                    if (remaining === 0) {

                        this.finishBlowerSkill();
                    }
                });
        }
    }

    finishBlowerSkill() {

        const evoBar =
            game.var.evolutionBarInstance;


        /*
        * Baru benar-benar bebaskan skillActive
        * setelah evo bar masuk kembali.
        */
        const finish = () => {

            game.var.skillActive = null;

            game.var.blowerClosing = false;
        };


        /*
        * Tween evo bar kembali masuk.
        */
        if (
            evoBar &&
            evoBar.showAfterBlower
        ) {

            evoBar.showAfterBlower(
                finish
            );

        } else {

            finish();
        }
    }

    applyBlower(dt) {

        let x = 0;
        let y = 0;

        // strength per detik
        const strength = 7.5;

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

    startBlowerSound() {

        const sound =
            game.var.blowerSound;

        if (!sound) {
            return;
        }


        /*
        * Kalau sound masih aktif / sedang fade out,
        * jangan spawn instance baru.
        */
        if (
            sound.playing &&
            sound.id !== null
        ) {

            sound.fadingOut = false;

            melon.audio.fade(
                "wind",
                0,
                1,
                sound.fadeDuration,
                sound.id
            );

            return;
        }


        /*
        * Mulai audio pada volume 0.
        * API play versi ini:
        *
        * play(name, loop, onend, volume)
        */
        sound.id =
            melon.audio.play(
                "wind",
                true,
                null,
                0
            );


        sound.playing = true;
        sound.fadingOut = false;


        /*
        * Fade 0 → 1
        */
        melon.audio.fade(
            "wind",
            0,
            1,
            sound.fadeDuration,
            sound.id
        );
    }

    stopBlowerSound() {

        const sound =
            game.var.blowerSound;

        if (
            !sound ||
            !sound.playing ||
            sound.id === null
        ) {
            return;
        }


        /*
        * Jangan trigger fade out berkali-kali
        * dari pointerleave / pointerup.
        */
        if (sound.fadingOut) {
            return;
        }


        sound.fadingOut = true;


        const id =
            sound.id;


        /*
        * Fade 1 → 0 selama 400 ms
        */
        melon.audio.fade(
            "wind",
            1,
            0,
            400,
            id
        );


        /*
        * Setelah fade selesai,
        * baru benar-benar stop.
        */
        melon.time.after(
            400,
            () => {

                /*
                * Pastikan masih instance yang sama.
                *
                * Bisa saja player menekan blower
                * lagi sebelum 400 ms selesai.
                */
                if (
                    sound.id !== id ||
                    !sound.fadingOut
                ) {
                    return;
                }


                melon.audio.stop(
                    "wind",
                    id
                );


                sound.id = null;
                sound.playing = false;
                sound.fadingOut = false;
            }
        );
    }

    getWindParticle() {

        const particles =
            game.var.blowerParticles;

        if (particles?.[this.direction]) {
            return particles[this.direction];
        }


        const particleName = {
            left: "suikaWhooshPushRight",
            right: "suikaWhooshPushLeft",
            bottom: "suikaWhooshPushUp"
        }[this.direction];


        if (!particleName) {
            return null;
        }


        return (
            me.game.world
                .getChildByName(particleName)[0] ||
            null
        );
    }


    startWindParticle() {

        const particle =
            this.getWindParticle();

        if (!particle) {
            return;
        }


        particle.play();
    }


    stopWindParticle() {

        const particle =
            this.getWindParticle();

        const system =
            particle?.runtime?.system;

        if (!system) return;


        // Stop spawn baru
        system.wantsEmission = false;


        // Percepat particle existing menuju fade-out
        const state = system.state;
        const current = state.current;

        const FADE_DURATION = 0.18;


        let slot = state.firstActiveSlot();

        while (slot !== -1) {

            const next =
                state.nextActiveSlot(slot);

            const lifetime =
                current.lifetime[slot];


            if (lifetime > 0) {

                current.age[slot] =
                    Math.max(
                        current.age[slot],
                        lifetime * 0.82
                    );

                current.lifetime[slot] =
                    current.age[slot] +
                    FADE_DURATION;
            }


            slot = next;
        }
    }
    //  End of user code  //
};

// Put user code here //
 
//  End of user code  //
