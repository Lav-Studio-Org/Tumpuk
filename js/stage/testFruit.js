import * as me from '../../dist/melon-runtime.module.js'
import melon from '../../dist/melon-runtime.module.js'
import game from '../game.js'

// Put user code here //
 
//  End of user code  //

export default class testFruit extends me.Stage {

	/* Called by the state manager when reseting the object, this is typically where you will load a level, add renderables, etc.
	Read (https://melonjs.github.io/melonJS/classes/Stage.html#onResetEvent) for more details. */
	onResetEvent() {
        // Put user code here //
        
        //  End of user code  //
		me.level.load("testFruit");
		this.var = {};
        // Put user code here //
 
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
        
        //  End of user code  //
		melon.textures.unloadForLevel("testFruit");
		super.onDestroyEvent();
	}

	// Your Blockly functions //

	// End of Blockly functions //
    // Put user code here //
    
    //  End of user code  //
};

// Put user code here //
 
//  End of user code  //
