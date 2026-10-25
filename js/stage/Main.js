import * as me from '../../dist/melon-runtime.module.js'
import melon from '../../dist/melon-runtime.module.js'
import game from '../game.js'

// Put user code here //
 
//  End of user code  //

export default class Main extends me.Stage {

	/* Called by the state manager when reseting the object, this is typically where you will load a level, add renderables, etc.
	Read (https://melonjs.github.io/melonJS/classes/Stage.html#onResetEvent) for more details. */
	onResetEvent() {
        // Put user code here //
 
        //  End of user code  //
		me.level.load("Main");
		this.var = {};
        // Put user code here //
        melon.camera.flash("#000000", 2500);
        this.menuAnimation();
        game.var.homeExit = (callback) => {
            this.homeExitAnimation(callback);
        };
        game.var.homeEntrance = () => {
            this.homeEntranceAnimation();
        };
        // me.game.world.getChildByName("tumpuk")[0].blendMode = "exclusion";
        //  End of user code  //
	}

	update(dt) {
        // Put user code here //
        
        //  End of user code  //
		super.update(dt);
        // Put user code here //
        
        //  End of user code  //
	}
	/* Called by the state manager before switching to another state.
	Read (https://melonjs.github.io/melonJS/classes/Stage.html#onDestroyEvent) for more details. */
	onDestroyEvent() {
        // Put user code here //
        game.var.homeTitleTween?.stop();
        game.var.homeUITween?.stop();

        game.var.homeTitleTween = null;
        game.var.homeUITween = null;

        game.var.homeAnimation = null;
        game.var.homeEntrance = null;
        game.var.homeExit = null;
        //  End of user code  //
		melon.textures.unloadForLevel("Main");
		super.onDestroyEvent();
	}

	// Your Blockly functions //

	// End of Blockly functions //
    // Put user code here //
    menuAnimation() {
        const menuBG =
            me.game.world.getChildByName("menuBG")[0];

        const hangTitle =
            me.game.world.getChildByName("hangTitle")[0];

        const homeUI =
            me.game.world.getChildByName("homeUI")[0];

        if (!menuBG || !hangTitle || !homeUI) {
            return;
        }


        // =====================================================
        // SIMPAN POSISI FINAL RUNTIME
        // =====================================================
        //
        // homeUI.pos.y sudah hasil dari:
        //
        // y += me.game.viewport.height
        //
        // Jadi ini tetap support flex height.
        //

        const hangTarget = {
            x: hangTitle.pos.x,
            y: hangTitle.pos.y
        };

        const homeTarget = {
            x: homeUI.pos.x,
            y: homeUI.pos.y
        };


        game.var.homeAnimation = {
            hangTarget,
            homeTarget
        };


        // =====================================================
        // PINDAHKAN HOME KE POSISI HIDDEN
        // =====================================================

        hangTitle.pos.x = hangTarget.x;
        hangTitle.pos.y = hangTarget.y - 300;


        homeUI.pos.x = homeTarget.x;
        homeUI.pos.y =
            homeTarget.y +
            me.game.viewport.height;


        // =====================================================
        // MENU BG TWEEN
        // =====================================================

        const targetScale = 0.743;

        const startScale =
            1 / targetScale;


        const scaleTween = {
            value: startScale
        };


        let previousScale =
            startScale;


        // Start zoomed.
        menuBG.scale(
            startScale,
            startScale
        );


        game.var.menuBGTween?.stop();


        game.var.menuBGTween =
            new me.Tween(scaleTween)
                .to(
                    {
                        value: 1
                    },
                    {
                        duration: 1400,
                        easing: me.Tween.Easing.Quadratic.Out
                    }
                )
                .onUpdate(() => {

                    // menuBG.scale() bersifat relative.
                    const ratio =
                        scaleTween.value /
                        previousScale;


                    menuBG.scale(
                        ratio,
                        ratio
                    );


                    previousScale =
                        scaleTween.value;
                })
                .onComplete(() => {

                    game.var.menuBGTween = null;

                    // =================================================
                    // MENU BG SUDAH SELESAI.
                    // BARU HANG TITLE + HOME UI MASUK.
                    // =================================================

                    this.homeEntranceAnimation();

                })
                .start();
    }


    homeEntranceAnimation() {
        const hangTitle =
            me.game.world.getChildByName("hangTitle")[0];

        const homeUI =
            me.game.world.getChildByName("homeUI")[0];

        const anim =
            game.var.homeAnimation;


        if (!hangTitle || !homeUI || !anim) {
            return;
        }


        // Kalau sedang exit, stop dulu.
        game.var.homeTitleTween?.stop();
        game.var.homeUITween?.stop();


        // =====================================================
        // HANG TITLE ENTRANCE
        // =====================================================

        game.var.homeTitleTween =
            new me.Tween(hangTitle.pos)
                .to(
                    {
                        x: anim.hangTarget.x,
                        y: anim.hangTarget.y
                    },
                    {
                        duration: 1000,
                        easing: me.Tween.Easing.Back.Out
                    }
                )
                .onComplete(() => {
                    game.var.homeTitleTween = null;
                })
                .start();


        // =====================================================
        // HOME UI ENTRANCE
        // =====================================================

        game.var.homeUITween =
            new me.Tween(homeUI.pos)
                .to(
                    {
                        x: anim.homeTarget.x,
                        y: anim.homeTarget.y
                    },
                    {
                        duration: 900,
                        easing: me.Tween.Easing.Cubic.Out
                    }
                )
                .onComplete(() => {
                    game.var.homeUITween = null;
                })
                .start();
    }


    homeExitAnimation(callback) {
        const hangTitle =
            me.game.world.getChildByName("hangTitle")[0];

        const homeUI =
            me.game.world.getChildByName("homeUI")[0];

        const anim =
            game.var.homeAnimation;


        if (!hangTitle || !homeUI || !anim) {
            callback?.();
            return;
        }


        // Kalau sedang entrance, stop dulu.
        game.var.homeTitleTween?.stop();
        game.var.homeUITween?.stop();


        let completed = 0;


        const done = () => {
            completed++;


            if (completed < 2) {
                return;
            }


            game.var.homeTitleTween = null;
            game.var.homeUITween = null;


            callback?.();
        };


        // =====================================================
        // HANG TITLE EXIT
        // =====================================================

        game.var.homeTitleTween =
            new me.Tween(hangTitle.pos)
                .to(
                    {
                        x: anim.hangTarget.x,
                        y: anim.hangTarget.y - 300
                    },
                    {
                        duration: 700,
                        easing: me.Tween.Easing.Cubic.In
                    }
                )
                .onComplete(done)
                .start();


        // =====================================================
        // HOME UI EXIT
        // =====================================================
        //
        // Tidak pakai hardcode 960.
        // Tetap berdasarkan viewport height.
        //

        game.var.homeUITween =
            new me.Tween(homeUI.pos)
                .to(
                    {
                        x: anim.homeTarget.x,
                        y:
                            anim.homeTarget.y +
                            me.game.viewport.height
                    },
                    {
                        duration: 700,
                        easing: me.Tween.Easing.Cubic.In
                    }
                )
                .onComplete(done)
                .start();
    }
    //  End of user code  //
};

// Put user code here //
 
//  End of user code  //
