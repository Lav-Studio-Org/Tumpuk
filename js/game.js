/**
 * Holds all game-specific global data and utilities
 */
var game = {

	/**
	 * Object to store variables accessible globally throughout the game
	 */
	var: {},

	/**
	 * Object to store audio mixer settings or references
	 */
	audioMixer: {},

	/**
	 * Object to group audio into categories (e.g., music, SFX, voice)
	 */
	audioGroup: {},

	/**
	 * Object to define and store collision types
	 */
	collisionTypes: {},

	/**
	 * A reference to the texture atlas (sprite sheet or tileset)
	 */
	texture: null,

	/**
	 * Utility functions shared across the game
	 */
	util: {},

	/**
	 * Handlers for custom runtime scripts
	 */
	scriptHandlers: {},

	/**
	 * Object to store GLSL shader code for rendering effects
	 */
	shader: [],

	/**
	 * Array of z-anchors for managing render order or depth layers
	 */
	zAnchors: [],

	/**
	 * Melon Runtime instance (configured during application startup)
	 */
	melon: null
};

export default game;
