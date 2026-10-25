import * as me from '../../dist/melon-runtime.module.js'
import melon from '../../dist/melon-runtime.module.js'
import game from '../game.js'

// Put user code here //
import assetManager from "../script/assetManager.js";
 
assetManager();
//  End of user code  //

export default class LoadingGame extends me.Stage {

	/* Called by the state manager when reseting the object, this is typically where you will load a level, add renderables, etc.
	Read (https://melonjs.github.io/melonJS/classes/Stage.html#onResetEvent) for more details. */
	onResetEvent() {
        // Put user code here //
        me.game.pauseOnBlur = false;
        me.game.resumeOnFocus = true;
        //  End of user code  //
		me.level.load("LoadingGame");
		this.var = {};
        // Put user code here //
        this.var = {

            destroyed:
                false,

            fakeProgressRunning:
                false,

            fakeProgressRAF:
                null,

            transitionStarted:
                false
        };

        this.loadingText = me.game.world .getChildByName( "loadingText" )[0] || null;
        
        melon.camera.flash("#000000", 1000);
        
        if (
            game.var.loadingObj
        ) {
            game.var.loadingObj.value =
                0;
        }


        if (
            this.loadingText
        ) {

            this.loadingText.setText(
                "0%"
            );
        }

        /*
        * Kalau user balik ke tab,
        * pastikan game tidak tertinggal
        * dalam kondisi pause.
        */
        this._visibilityHandler =
            () => {

                if (
                    !document.hidden
                ) {

                    if (
                        me.game.isPaused()
                    ) {

                        me.game.resume();
                    }
                }
            };


        document.addEventListener(
            "visibilitychange",
            this._visibilityHandler
        );

        this.loadGameAssets();
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
        if (
            this.var
        ) {

            this.var.destroyed =
                true;


            this.stopFakeProgress();
        }


        if (
            this._visibilityHandler
        ) {

            document.removeEventListener(
                "visibilitychange",
                this._visibilityHandler
            );


            this._visibilityHandler =
                null;
        }


        melon.textures.unloadForLevel(
            "LoadingGame"
        );
        //  End of user code  //
		melon.textures.unloadForLevel("LoadingGame");
		super.onDestroyEvent();
	}

	// Your Blockly functions //

	// End of Blockly functions //
    // Put user code here //
    async loadGameAssets() {

        try {

            const MIN_LOADING_TIME =
                game.var.MIN_LOADING_TIME ??
                1800;


            const startTime =
                performance.now();


            const config =
                game.var.CONFIG;


            const boot =
                !game.var.loadingTarget;


            const target =
                boot

                    ? config.START_SCENE

                    : game.var.loadingTarget;


            const loadAssets =
                boot

                    ? (
                        config.ASSET_MODE ===
                        "PRELOAD_ALL"

                            ? config.PRELOAD_ASSETS

                            : game.util.sceneAssets(
                                target,
                                config.DEFAULT_LEVEL
                            )
                    )

                    : (
                        game.var.loadingAssets ||
                        []
                    );


            const unloadAssets =
                boot

                    ? []

                    : (
                        game.var.unloadAssets ||
                        []
                    );


            let realProgress = 0;


            /*
            * =========================
            * RESET
            * =========================
            */
            this.setProgress(
                0
            );


            /*
            * =========================
            * FAKE PROGRESS
            * =========================
            *
            * Hanya visual.
            *
            * TIDAK DI-AWAIT.
            */
            this.startFakeProgress(

                startTime,

                MIN_LOADING_TIME,

                () => realProgress
            );


            /*
            * =========================
            * UNLOAD
            * =========================
            */
            if (
                unloadAssets.length > 0
            ) {

                game.assets.unloadMany(
                    unloadAssets
                );
            }


            /*
            * =========================
            * LOAD
            * =========================
            */
            if (
                loadAssets.length > 0
            ) {

                await game.assets.loadMany(

                    loadAssets,

                    {

                        onProgress:
                            info => {

                                realProgress =
                                    info.progress ??
                                    0;
                            }
                    }
                );

            } else {

                realProgress = 1;
            }


            realProgress = 1;


            /*
            * Scene mungkin sudah diganti.
            */
            if (
                this.var.destroyed
            ) {

                return;
            }


            /*
            * =========================
            * MINIMUM LOADING TIME
            * =========================
            */
            const elapsed =
                performance.now() -
                startTime;


            const remaining =
                Math.max(
                    0,

                    MIN_LOADING_TIME -
                    elapsed
                );


            if (
                remaining > 0
            ) {

                await this.sleep(
                    remaining
                );
            }


            if (
                this.var.destroyed
            ) {

                return;
            }


            /*
            * =========================
            * STOP FAKE PROGRESS
            * =========================
            */
            this.stopFakeProgress();


            /*
            * Langsung 100%.
            *
            * Jangan menunggu RAF
            * dari 90 -> 100.
            */
            this.setProgress(
                1
            );


            /*
            * =========================
            * HOLD 100%
            * =========================
            */
            await this.sleep(
                150
            );


            if (
                this.var.destroyed
            ) {

                return;
            }


            /*
            * =========================
            * CLEAN REQUEST
            * =========================
            */
            game.var.loadingAssets =
                [];

            game.var.unloadAssets =
                [];

            game.var.loadingTarget =
                null;


            /*
            * =========================
            * TRANSITION
            * =========================
            */
            await this.finishLoading(
                target
            );


        } catch (error) {

            console.error(
                "Failed loading assets:",
                error
            );


            this.stopFakeProgress();


            if (
                this.loadingText
            ) {

                this.loadingText.setText(
                    "LOAD ERROR"
                );
            }
        }
    }

    async finishLoading(target) {

        /*
        * Jangan sampai terpanggil dua kali.
        */
        if (
            this.var.transitionStarted ||
            this.var.destroyed
        ) {

            return;
        }


        this.var.transitionStarted =
            true;


        /*
        * Kalau tab sedang hidden,
        * jangan bergantung pada animasi fade.
        *
        * Asset sudah selesai:
        * langsung pindah scene.
        */
        if (
            document.hidden
        ) {

            melon.scene.goTo(
                target
            );

            return;
        }


        /*
        * Kalau tab aktif,
        * tetap pakai fade normal.
        */
        melon.camera.fade(
            "#000000",
            1000
        );


        await this.sleep(
            1000
        );


        if (
            this.var.destroyed
        ) {

            return;
        }


        melon.scene.goTo(
            target
        );
    }
    
    sleep(ms) {

        return new Promise(
            resolve => {

                setTimeout(
                    resolve,
                    ms
                );
            }
        );
    }

    setProgress(value) {

        const progress =
            Math.max(
                0,
                Math.min(
                    value,
                    1
                )
            );


        if (
            game.var.loadingObj
        ) {

            game.var.loadingObj.value =
                progress;
        }


        if (
            this.loadingText
        ) {

            this.loadingText.setText(
                Math.round(
                    progress * 100
                ) + "%"
            );
        }
    }

    startFakeProgress(
        startTime,
        minimumTime,
        getRealProgress
    ) {

        this.var.fakeProgressRunning =
            true;


        let fakeProgress = 0;


        const update =
            () => {

                if (
                    !this.var.fakeProgressRunning ||
                    this.var.destroyed
                ) {

                    return;
                }


                const elapsed =
                    performance.now() -
                    startTime;


                const timeRatio =
                    Math.min(
                        elapsed /
                        minimumTime,
                        1
                    );


                const eased =
                    1 -
                    Math.pow(
                        1 - timeRatio,
                        2
                    );


                const timeTarget =
                    eased * 0.9;


                const realTarget =
                    Math.min(
                        getRealProgress() *
                        0.9,
                        0.9
                    );


                const target =
                    Math.max(
                        timeTarget,

                        Math.min(
                            realTarget,
                            timeTarget + 0.05
                        )
                    );


                fakeProgress +=
                    (
                        target -
                        fakeProgress
                    ) *
                    0.15;


                fakeProgress =
                    Math.max(
                        0,

                        Math.min(
                            fakeProgress,
                            0.9
                        )
                    );


                this.setProgress(
                    fakeProgress
                );


                this.var.fakeProgressRAF =
                    requestAnimationFrame(
                        update
                    );
            };


        this.var.fakeProgressRAF =
            requestAnimationFrame(
                update
            );
    }

    stopFakeProgress() {

        this.var.fakeProgressRunning =
            false;


        if (
            this.var.fakeProgressRAF !==
            null
        ) {

            cancelAnimationFrame(
                this.var.fakeProgressRAF
            );


            this.var.fakeProgressRAF =
                null;
        }
    }
    //  End of user code  //
};

// Put user code here //
 
//  End of user code  //
