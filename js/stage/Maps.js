import * as me from '../../dist/melon-runtime.module.js'
import melon from '../../dist/melon-runtime.module.js'
import game from '../game.js'

// Put user code here //
   
//  End of user code  //

export default class Maps extends me.Stage {

	/* Called by the state manager when reseting the object, this is typically where you will load a level, add renderables, etc.
	Read (https://melonjs.github.io/melonJS/classes/Stage.html#onResetEvent) for more details. */
	onResetEvent() {
        // Put user code here //
        game.var.coinValue = melon.storage.get("coinValue") ?? 0;
        //  End of user code  //
		me.level.load("Maps");
		this.var = {};
		// Your Blockly Start Here //
		melon.camera.flash("#000000", 1000);
	
		// End of Your Blockly //

        // Put user code here //
        /*
         * Offset drag.
         *
         * 0, 0 = posisi awal map.
         *
         * Posisi awal ini kita anggap sebagai:
         * - mentok kiri
         * - mentok atas
         *
         * Jadi offset hanya boleh <= 0.
         */
        this.mapOffsetX = 0;
        this.mapOffsetY = 0;


        this.dragging = false;

        this.dragStartX = 0;
        this.dragStartY = 0;

        this.dragStartOffsetX = 0;
        this.dragStartOffsetY = 0;


        /*
         * Ambil map utama dan semua sign.
         */
        this.mapFloat =
            me.game.world.getChildByName("mapFloat")[0];

        this.mapSigns =
            me.game.world.getChildByName("mapSign");


        /*
         * Simpan posisi asli.
         *
         * Jangan kita ubah baseX / baseY selama drag.
         *
         * Ini penting karena mapFloat floating
         * dan layout-nya sudah disesuaikan untuk
         * flex-height.
         */
        if (this.mapFloat) {

            this.mapFloat.baseX =
                this.mapFloat.pos.x;

            this.mapFloat.baseY =
                this.mapFloat.pos.y;
        }


        for (const sign of this.mapSigns) {

            sign.baseX =
                sign.pos.x;

            sign.baseY =
                sign.pos.y;
        }


        /*
         * =====================================================
         * UKURAN MAP
         * =====================================================
         *
         * Ini ukuran area map kamu.
         *
         * Kalau nanti ukuran map berubah,
         * cukup ubah dua angka ini.
         *
         * Karena map kamu punya scaling visual,
         * kalau angka ini ternyata masih ukuran
         * sebelum scale, tinggal kalikan scale.
         */
        this.mapWidth = 1059.566;
        this.mapHeight = 1882.672;

        // Event seluruh viewport.
        this._mapPointerDown =
            me.input.registerPointerEvent(
                "pointerdown",
                me.game.viewport,
                this.onMapPointerDown.bind(this)
            );

        this._mapPointerMove =
            me.input.registerPointerEvent(
                "pointermove",
                me.game.viewport,
                this.onMapPointerMove.bind(this)
            );

        this._mapPointerUp =
            me.input.registerPointerEvent(
                "pointerup",
                me.game.viewport,
                this.onMapPointerUp.bind(this)
            );

        this._mapPointerCancel =
            me.input.registerPointerEvent(
                "pointercancel",
                me.game.viewport,
                this.onMapPointerUp.bind(this)
            );
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
        me.input.releasePointerEvent(
            "pointerdown",
            me.game.viewport,
            this._mapPointerDown
        );

        me.input.releasePointerEvent(
            "pointermove",
            me.game.viewport,
            this._mapPointerMove
        );

        me.input.releasePointerEvent(
            "pointerup",
            me.game.viewport,
            this._mapPointerUp
        );

        me.input.releasePointerEvent(
            "pointercancel",
            me.game.viewport,
            this._mapPointerCancel
        );
        //  End of user code  //
		melon.textures.unloadForLevel("Maps");
		super.onDestroyEvent();
	}

	// Your Blockly functions //

	// End of Blockly functions //
    // Put user code here //
    /*
     * =========================================================
     * POINTER DOWN
     * =========================================================
     */
    onMapPointerDown(e) {

        this.dragging = true;


        /*
         * Simpan posisi jari / mouse saat mulai drag.
         *
         * Gunakan gameScreenX/Y,
         * karena map kita floating / screen-space.
         */
        this.dragStartX =
            e.gameScreenX;

        this.dragStartY =
            e.gameScreenY;


        /*
         * Simpan offset map ketika drag dimulai.
         *
         * Penting supaya drag tetap smooth
         * setelah user lepas lalu drag lagi.
         */
        this.dragStartOffsetX =
            this.mapOffsetX;

        this.dragStartOffsetY =
            this.mapOffsetY;


        return true;
    }



    /*
     * =========================================================
     * POINTER MOVE
     * =========================================================
     */
    onMapPointerMove(e) {

        if (!this.dragging) {
            return true;
        }


        /*
         * Selisih gerakan pointer dari posisi awal drag.
         */
        const dx =
            e.gameScreenX -
            this.dragStartX;

        const dy =
            e.gameScreenY -
            this.dragStartY;


        /*
         * Offset baru.
         */
        let offsetX =
            this.dragStartOffsetX +
            dx;

        let offsetY =
            this.dragStartOffsetY +
            dy;


        /*
         * =====================================================
         * FLEX-HEIGHT
         * =====================================================
         *
         * Jangan hardcode ukuran layar ke 540x960.
         *
         * flex-height bisa membuat viewport width
         * berubah mengikuti aspect ratio device.
         */
        const screenWidth =
            me.game.viewport.width;

        const screenHeight =
            me.game.viewport.height;


        /*
         * =====================================================
         * OVERFLOW
         * =====================================================
         *
         * Contoh:
         *
         * mapWidth    = 1059
         * screenWidth = 600
         *
         * overflowX = 459
         *
         * Maka:
         *
         * offsetX = 0
         *     -> mentok kiri
         *
         * offsetX = -459
         *     -> mentok kanan
         *
         *
         * TIDAK dibagi 2,
         * karena posisi awal map sudah merupakan
         * ujung kiri / atas.
         */
        const overflowX =
            Math.max(
                0,
                this.mapWidth -
                screenWidth
            );


        const overflowY =
            Math.max(
                0,
                this.mapHeight -
                screenHeight
            );


        /*
         * =====================================================
         * CLAMP X
         * =====================================================
         *
         * Range:
         *
         * -overflowX <= offsetX <= 0
         *
         * Positif tidak diperbolehkan.
         *
         * Jadi kalau user drag ke kanan
         * saat map sudah di posisi awal:
         *
         * offsetX = +100
         *
         * langsung jadi:
         *
         * offsetX = 0
         */
        offsetX =
            Math.min(
                0,
                Math.max(
                    -overflowX,
                    offsetX
                )
            );


        /*
         * =====================================================
         * CLAMP Y
         * =====================================================
         *
         * Sama seperti X.
         *
         * 0 = mentok atas
         *
         * -overflowY = mentok bawah
         */
        offsetY =
            Math.min(
                0,
                Math.max(
                    -overflowY,
                    offsetY
                )
            );


        /*
         * Simpan offset final.
         */
        this.mapOffsetX =
            offsetX;

        this.mapOffsetY =
            offsetY;


        /*
         * Apply ke map dan sign.
         */
        this.applyMapOffset();


        return false;
    }



    /*
     * =========================================================
     * APPLY OFFSET
     * =========================================================
     */
    applyMapOffset() {

        /*
         * Map utama.
         *
         * baseX/baseY adalah posisi asli
         * hasil layout flex-height.
         *
         * Jadi kita tidak menghancurkan
         * posisi floating aslinya.
         */
        if (this.mapFloat) {

            this.mapFloat.pos.x =
                this.mapFloat.baseX +
                this.mapOffsetX;


            this.mapFloat.pos.y =
                this.mapFloat.baseY +
                this.mapOffsetY;
        }


        /*
         * Semua map sign harus bergerak
         * dengan offset yang sama persis.
         */
        for (const sign of this.mapSigns) {

            sign.pos.x =
                sign.baseX +
                this.mapOffsetX;


            sign.pos.y =
                sign.baseY +
                this.mapOffsetY;
        }
    }



    /*
     * =========================================================
     * POINTER UP / CANCEL
     * =========================================================
     */
    onMapPointerUp() {

        this.dragging = false;

        return true;
    }
    //  End of user code  //
};

// Put user code here //
 
//  End of user code  //
