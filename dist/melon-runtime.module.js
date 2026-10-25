/* Melon Runtime 0.4.0 | adapter: melonjs 20.0.0 */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// public/meloneditor/src/helper/tile-collision.js
var require_tile_collision = __commonJS({
  "public/meloneditor/src/helper/tile-collision.js"(exports, module) {
    (function(root, factory) {
      const api = factory();
      if (typeof module === "object" && module.exports) module.exports = api;
      else root.TileCollision = api;
    })(typeof globalThis !== "undefined" ? globalThis : exports, function() {
      const cross2 = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
      const area = (p) => p.reduce((sum, a, i) => {
        const b = p[(i + 1) % p.length];
        return sum + a[0] * b[1] - b[0] * a[1];
      }, 0) / 2;
      const box = () => [[0, 0], [1, 0], [1, 1], [0, 1]];
      function validate(points) {
        if (!Array.isArray(points) || points.length < 3 || points.length > 64)
          return "Use 3 to 64 vertices.";
        if (points.some((p) => !Array.isArray(p) || p.length !== 2 || p.some((v) => !Number.isFinite(v) || v < 0 || v > 1)))
          return "Keep all vertices inside the tile.";
        const onSegment = (a, b, p) => Math.abs(cross2(a, b, p)) < 1e-10 && p[0] >= Math.min(a[0], b[0]) && p[0] <= Math.max(a[0], b[0]) && p[1] >= Math.min(a[1], b[1]) && p[1] <= Math.max(a[1], b[1]);
        for (let i = 0; i < points.length; i++) {
          const a = points[i], b = points[(i + 1) % points.length];
          if (points.some((p, j) => j !== i && Math.hypot(p[0] - a[0], p[1] - a[1]) < 1e-8))
            return "Vertices must not overlap.";
          for (let j = i + 2; j < points.length; j++) {
            if (i === 0 && j === points.length - 1) continue;
            const c = points[j], d = points[(j + 1) % points.length];
            if (cross2(a, b, c) * cross2(a, b, d) < 0 && cross2(c, d, a) * cross2(c, d, b) < 0 || onSegment(a, b, c) || onSegment(a, b, d) || onSegment(c, d, a) || onSegment(c, d, b))
              return "Edges must not cross or touch.";
          }
        }
        if (Math.abs(area(points)) < 1e-8) return "The shape needs a non-zero area.";
        return "";
      }
      function decompose(points) {
        const error = validate(points);
        if (error) throw new Error(error);
        let p = points.map((v) => v.slice());
        if (area(p) < 0) p.reverse();
        let changed = true;
        while (changed && p.length > 3) {
          changed = false;
          for (let i = 0; i < p.length; i++) {
            if (Math.abs(cross2(p[(i + p.length - 1) % p.length], p[i], p[(i + 1) % p.length])) < 1e-10) {
              p.splice(i, 1);
              changed = true;
              break;
            }
          }
        }
        if (p.every((b, i) => cross2(p[(i + p.length - 1) % p.length], b, p[(i + 1) % p.length]) > 0)) return [p];
        const result = [];
        while (p.length > 3) {
          let found = false;
          for (let i = 0; i < p.length; i++) {
            const a = p[(i + p.length - 1) % p.length], b = p[i], c = p[(i + 1) % p.length];
            if (cross2(a, b, c) <= 0) continue;
            if (p.some((v) => v !== a && v !== b && v !== c && cross2(a, b, v) >= -1e-10 && cross2(b, c, v) >= -1e-10 && cross2(c, a, v) >= -1e-10)) continue;
            result.push([a, b, c]);
            p.splice(i, 1);
            found = true;
            break;
          }
          if (!found) throw new Error("Unable to split collision polygon. Adjust its vertices.");
        }
        result.push(p);
        return result;
      }
      function shapes(properties, points, width, height, x = 0, y = 0) {
        const value = (name) => properties?.find((p) => p.name === name)?.value;
        if (value("collision") !== true && value("collision") !== "true") return [];
        const collisionType = value("collisionType") || "WORLD_SHAPE";
        if (!points) return [{ type: "tileset-mask", collisionType, points: [[x, y], [x + width, y + height]] }];
        return decompose(points).map((polygon) => ({
          type: "polygon",
          collisionType,
          points: polygon.map((p) => [x + p[0] * width, y + p[1] * height])
        }));
      }
      function appendLevel(data, tiles, tileset) {
        for (let row = 0; row < data.rows; row++) for (let col = 0; col < data.cols; col++) {
          const id = tiles[row]?.[col];
          if (!id) continue;
          const iso = data.orientation === "isometric";
          const x = iso ? data.rows * data.tileWidth / 2 + (col - row) * data.tileWidth / 2 - data.tileWidth / 2 : col * data.tileWidth;
          const y = (iso ? (col + row) * data.tileHeight / 2 : row * data.tileHeight) + data.tileHeight - tileset.tileHeight;
          try {
            data.collision.push(...shapes(tileset.tileProperties?.[id - 1], tileset.tileCollisionShapes?.[id - 1], tileset.tileWidth, tileset.tileHeight, x, y));
          } catch (error) {
            throw new Error(`Tile ${id} collision: ${error.message}`);
          }
        }
      }
      return { box, validate, decompose, shapes, appendLevel };
    });
  }
});

// public/meloneditor/src/helper/tilemap-scene.js
var require_tilemap_scene = __commonJS({
  "public/meloneditor/src/helper/tilemap-scene.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) module.exports = factory(require_tile_collision());
      else root.TilemapSceneData = factory(root.TileCollision);
    })(typeof globalThis !== "undefined" ? globalThis : exports, function(collision) {
      "use strict";
      const clone2 = (value) => JSON.parse(JSON.stringify(value));
      function positive(value, fallback, name, roundUp = false) {
        const raw = Number(value ?? fallback);
        const number = roundUp && raw > 0 ? Math.ceil(raw) : raw;
        if (!Number.isInteger(number) || number < 1 || number > 4096) throw new Error(`Tilemap Scene: invalid ${name}.`);
        return number;
      }
      function normalize2(data = {}) {
        const cols = positive(data.cols, 20, "columns", true), rows = positive(data.rows, 15, "rows", true);
        const tileWidth = positive(data.tileWidth, 32, "tile width"), tileHeight = positive(data.tileHeight, 32, "tile height");
        if (cols * rows > 1048576) throw new Error("Tilemap Scene exceeds one million cells per layer.");
        const orientation = data.orientation || "orthogonal";
        if (!["orthogonal", "isometric"].includes(orientation)) throw new Error("Unsupported Tilemap Scene orientation.");
        const layers = (data.layers || []).map((layer, index) => {
          if (layer.type !== "tilelayer" || !layer.tileset) throw new Error(`Tilemap Scene layer ${index + 1} requires a project tileset.`);
          return {
            type: "tilelayer",
            name: layer.name || `Layer ${index + 1}`,
            tileset: layer.tileset,
            tilesetName: layer.tilesetName || "",
            visible: layer.visible !== false,
            opacity: Math.max(0, Math.min(1, Number(layer.opacity ?? 1))),
            tiles: Array.from({ length: rows }, (_, y) => Array.from({ length: cols }, (_2, x) => {
              const tile = layer.tiles?.[y]?.[x] ?? 0;
              if (!Number.isInteger(tile) || tile < 0) throw new Error(`Invalid tile at layer ${index + 1}, column ${x}, row ${y}.`);
              return tile;
            }))
          };
        });
        return { cols, rows, tileWidth, tileHeight, orientation, layers };
      }
      function size(data) {
        return data.orientation === "isometric" ? { width: (data.cols + data.rows) * data.tileWidth / 2, height: (data.cols + data.rows) * data.tileHeight / 2 } : { width: data.cols * data.tileWidth, height: data.rows * data.tileHeight };
      }
      function collisionObject(shape, id) {
        const x = shape.points[0][0], y = shape.points[0][1];
        const object = {
          id,
          name: shape.collisionType === "NO_SLOPE" ? "noSlopeCollisionTP" : "collisionTP",
          x,
          y,
          rotation: 0,
          visible: true,
          properties: [{ name: "collisionType", type: "string", value: shape.collisionType }]
        };
        if (shape.type === "tileset-mask") {
          object.width = shape.points[1][0] - x;
          object.height = shape.points[1][1] - y;
        } else object.polygon = shape.points.map((point2) => ({ x: point2[0] - x, y: point2[1] - y }));
        return object;
      }
      function buildMap(source, resolveTileset) {
        const scene = normalize2(source), byId = /* @__PURE__ */ new Map(), tilesets = [], shapes = [];
        let firstgid = 1;
        const layers = scene.layers.map((layer, index) => {
          let entry = byId.get(layer.tileset);
          if (!entry) {
            const asset2 = resolveTileset(layer.tileset, layer.tilesetName);
            if (!asset2) throw new Error(`Tilemap Scene: missing tileset ${layer.tilesetName || layer.tileset}.`);
            const tilecount = Number(asset2.tilecount);
            if (!Number.isInteger(tilecount) || tilecount < 1) throw new Error("Tilemap Scene tileset has no tiles.");
            entry = { ...clone2(asset2), firstgid };
            firstgid += tilecount;
            byId.set(layer.tileset, entry);
            tilesets.push(entry);
          }
          const values = layer.tiles.flat().map((tile) => {
            if (tile > entry.tilecount) throw new Error(`Tile ${tile} is outside tileset ${layer.tilesetName}.`);
            return tile === 0 ? 0 : tile + entry.firstgid - 1;
          });
          const tileProperties = [];
          Object.entries(entry.tileproperties || {}).forEach(([id, properties]) => {
            tileProperties[id] = Object.entries(properties).map(([name, value]) => ({ name, value }));
          });
          collision.appendLevel({ ...scene, collision: shapes }, layer.tiles, {
            tileWidth: entry.tilewidth,
            tileHeight: entry.tileheight,
            tileProperties,
            tileCollisionShapes: entry.tileCollisionShapes
          });
          return {
            id: index + 1,
            name: layer.name,
            type: "tilelayer",
            x: 0,
            y: 0,
            width: scene.cols,
            height: scene.rows,
            opacity: layer.opacity,
            visible: layer.visible,
            data: values
          };
        });
        if (shapes.length) layers.push({
          name: "collision",
          type: "objectgroup",
          x: 0,
          y: 0,
          opacity: 1,
          visible: true,
          objects: shapes.map((shape, index) => collisionObject(shape, index + 1))
        });
        return {
          type: "map",
          version: "1.10",
          orientation: scene.orientation,
          renderorder: "right-down",
          width: scene.cols,
          height: scene.rows,
          tilewidth: scene.tileWidth,
          tileheight: scene.tileHeight,
          infinite: false,
          nextobjectid: shapes.length + 1,
          tilesets,
          layers
        };
      }
      return { normalize: normalize2, size, buildMap };
    });
  }
});

// packages/melon-runtime/src/entries/melonjs-20.0.0.js
import * as engine from "./melonjs.module.js";

// packages/melon-runtime/src/adapters/tilemap-scene.js
var import_tilemap_scene = __toESM(require_tilemap_scene(), 1);
function localTilemapRect(scene, rect) {
  if (!rect?.pos) return rect;
  const absolute = typeof scene.getAbsolutePosition === "function" ? scene.getAbsolutePosition() : scene.pos;
  const originX = Number(absolute?.x) || 0;
  const originY = Number(absolute?.y) || 0;
  const viewX = scene.floating === true ? 0 : Number(rect.pos.x) || 0;
  const viewY = scene.floating === true ? 0 : Number(rect.pos.y) || 0;
  const x = viewX - originX;
  const y = viewY - originY;
  const width = Number(rect.width) || 0;
  const height = Number(rect.height) || 0;
  return {
    pos: {
      x,
      y
    },
    width,
    height,
    left: x,
    top: y,
    right: x + width,
    bottom: y + height
  };
}
function createTilemapSceneClass(engine2) {
  return class TilemapScene extends engine2.Container {
    constructor(x, y, source, settings = {}) {
      const data = import_tilemap_scene.default.normalize(source);
      const bounds = import_tilemap_scene.default.size(data);
      super(x, y, bounds.width, bounds.height);
      this.anchorPoint.set(0, 0);
      this.name = settings.name || "tilemapScene";
      this.tilemapData = data;
      this.autoSort = false;
      this.autoDepth = false;
      this.alwaysUpdate = settings.alwaysUpdate ?? true;
      this.floating = settings.floating ?? false;
      this._tilesetAssets = /* @__PURE__ */ new Map();
      const mapData = import_tilemap_scene.default.buildMap(data, (id, name) => {
        const asset2 = settings.resolveTileset ? settings.resolveTileset(id, name) : engine2.loader.getTMX(name);
        this._tilesetAssets.set(id, asset2);
        return asset2;
      });
      this.tilemap = new engine2.TMXTileMap(this.name, mapData);
      try {
        this.tilemap.getLayers().forEach((layer, index) => {
          layer.renderMode = settings.tileRenderMode ?? "perTile";
          const originalDraw = layer.draw;
          layer.draw = (renderer, rect) => {
            const localRect = localTilemapRect(this, rect);
            return originalDraw.call(layer, renderer, localRect);
          };
          this.addChild(layer, index);
        });
        this.tilemap.getObjects(true).forEach((object) => {
          this.addChild(object);
        });
      } catch (error) {
        this.destroy();
        throw error;
      }
    }
    getTile(layerIndex, column, row) {
      if (![layerIndex, column, row].every(Number.isInteger)) {
        return 0;
      }
      return this.tilemapData.layers[layerIndex]?.tiles[row]?.[column] ?? 0;
    }
    getTileProperties(layerIndex, column, row) {
      const layer = this.tilemapData.layers[layerIndex];
      const tile = this.getTile(layerIndex, column, row);
      if (!tile) {
        return {};
      }
      return {
        ...this._tilesetAssets.get(layer.tileset)?.tileproperties?.[tile - 1] || {}
      };
    }
    getTileLayer(layerIndex) {
      return this.tilemap?.getLayers()[layerIndex] ?? null;
    }
    destroy() {
      super.destroy();
      this.tilemap?.destroy();
      this.tilemap = null;
      this._tilesetAssets?.clear();
    }
  };
}

// packages/melon-runtime/src/internal/guards.js
function requireObject(value, label = "object") {
  if (!value || typeof value !== "object") {
    throw new TypeError(`Melon Runtime: ${label} tidak valid.`);
  }
  return value;
}
function requireFunction(value, label = "callback") {
  if (typeof value !== "function") {
    throw new TypeError(`Melon Runtime: ${label} harus berupa fungsi.`);
  }
  return value;
}
function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// packages/melon-runtime/src/modules/animation.js
function createAnimationModule({ adapter }) {
  return {
    play(object, name, options = {}) {
      return adapter.playAnimation(requireObject(object), String(name), options);
    },
    pause(object) {
      return adapter.pauseAnimation(requireObject(object));
    },
    resume(object) {
      return adapter.resumeAnimation(requireObject(object));
    },
    stop(object) {
      return adapter.stopAnimation(requireObject(object));
    },
    isPlaying(object, name) {
      return adapter.isAnimationPlaying(requireObject(object), String(name));
    },
    setFrame(object, frame) {
      return adapter.setAnimationFrame(requireObject(object), Math.max(0, Math.floor(finiteNumber(frame))));
    },
    onComplete(object, callback) {
      return adapter.onAnimationComplete(requireObject(object), requireFunction(callback));
    }
  };
}

// packages/melon-runtime/src/modules/audio.js
function audioGroupName(value, label = "audio group") {
  const name = String(value ?? "").trim();
  if (!name) {
    throw new TypeError(`Melon Runtime: nama ${label} tidak boleh kosong.`);
  }
  return name;
}
function createFallbackAudioMixer(adapter) {
  function createGroup2(name, parent = null) {
    const group = {
      name,
      parent,
      children: [],
      volume: 1,
      actualVolume: parent?.actualVolume ?? 1,
      audioClips: [],
      addChild(child) {
        if (!this.children.includes(child)) this.children.push(child);
        child.parent = this;
        child.updateEffectiveVolume();
        return child;
      },
      addAudioClip(clipName) {
        if (!this.audioClips.includes(clipName)) this.audioClips.push(clipName);
        return this;
      },
      setVolume(volume) {
        this.volume = clamp(finiteNumber(volume, 1), 0, 1);
        this.updateEffectiveVolume();
        return this;
      },
      updateEffectiveVolume() {
        this.actualVolume = this.volume * (this.parent?.actualVolume ?? 1);
        for (const clipName of this.audioClips) {
          adapter.setSoundVolume?.(clipName, this.actualVolume);
        }
        for (const child of this.children) child.updateEffectiveVolume();
      },
      play(clipName, loop = false, volumeScale = 1) {
        if (!this.audioClips.includes(clipName)) return null;
        return adapter.playSound(clipName, {
          loop,
          volume: this.actualVolume * clamp(finiteNumber(volumeScale, 1), 0, 1)
        });
      },
      stop(clipName, id) {
        return adapter.stopSound(clipName, id);
      }
    };
    if (parent) parent.addChild(group);
    return group;
  }
  const masterGroup = createGroup2("Master");
  const mixer = { masterGroup };
  mixer.findGroup = function findGroup(name, group = masterGroup) {
    if (group.name === name) return group;
    for (const child of group.children) {
      const result = mixer.findGroup(name, child);
      if (result) return result;
    }
    return null;
  };
  mixer.createGroup = function createMixerGroup(name, parentName = "Master") {
    const parent = mixer.findGroup(parentName);
    return parent ? createGroup2(name, parent) : null;
  };
  return mixer;
}
function createAudioModule({ adapter }) {
  let fallbackMixer;
  const groupStates = /* @__PURE__ */ new WeakMap();
  function mixer() {
    return adapter.getAudioMixer?.() ?? (fallbackMixer ?? (fallbackMixer = createFallbackAudioMixer(adapter)));
  }
  function findGroup(name, required = true) {
    const groupName = audioGroupName(name);
    const group = mixer().findGroup?.(groupName) ?? null;
    if (!group && required) {
      throw new Error(
        `Melon Runtime: audio group "${groupName}" tidak ditemukan. Buat group melalui panel Audio Mixer atau block create audio group.`
      );
    }
    return group;
  }
  function groupState(group) {
    let runtimeState = groupStates.get(group);
    if (!runtimeState) {
      runtimeState = {
        muted: false,
        volume: clamp(finiteNumber(group.volume, 1), 0, 1)
      };
      groupStates.set(group, runtimeState);
    }
    return runtimeState;
  }
  function applyGroupVolume(group, volume) {
    if (typeof group.setVolume === "function") {
      group.setVolume(volume);
    } else {
      group.volume = volume;
      group.actualVolume = volume * (group.parent?.actualVolume ?? 1);
      group.updateEffectiveVolume?.();
    }
    return volume;
  }
  function requireClip(group, clipName) {
    const name = String(clipName);
    if (!Array.isArray(group.audioClips) || !group.audioClips.includes(name)) {
      throw new Error(
        `Melon Runtime: sound "${name}" belum ditambahkan ke audio group "${group.name}".`
      );
    }
    return name;
  }
  function forEachGroupClip(group, callback) {
    let count = 0;
    for (const clipName of group.audioClips || []) {
      callback(group, clipName);
      count++;
    }
    for (const child of group.children || []) {
      count += forEachGroupClip(child, callback);
    }
    return count;
  }
  function controlGroupSound(action, groupName, clipName, instanceId) {
    const group = findGroup(groupName);
    const name = requireClip(group, clipName);
    const method = {
      stop: "stopSound",
      pause: "pauseSound",
      resume: "resumeSound"
    }[action];
    if (!method) throw new RangeError(`Melon Runtime: aksi audio group "${action}" tidak dikenal.`);
    return adapter[method](name, instanceId);
  }
  function controlWholeGroup(action, groupName) {
    const group = findGroup(groupName);
    const method = {
      stop: "stopSound",
      pause: "pauseSound",
      resume: "resumeSound"
    }[action];
    if (action === "play") {
      return forEachGroupClip(group, (owner, clipName) => owner.play(clipName));
    }
    if (!method) throw new RangeError(`Melon Runtime: aksi audio group "${action}" tidak dikenal.`);
    return forEachGroupClip(group, (_owner, clipName) => adapter[method](clipName));
  }
  return {
    play(name, options = {}) {
      return adapter.playSound(String(name), {
        loop: options.loop === true,
        volume: clamp(finiteNumber(options.volume, 1), 0, 1),
        onEnd: typeof options.onEnd === "function" ? options.onEnd : void 0
      });
    },
    stop(name, instanceId) {
      return adapter.stopSound(
        typeof name === "undefined" ? void 0 : String(name),
        instanceId
      );
    },
    stopAll() {
      return adapter.stopAllSounds();
    },
    pause(name, instanceId) {
      return adapter.pauseSound(String(name), instanceId);
    },
    resume(name, instanceId) {
      return adapter.resumeSound(String(name), instanceId);
    },
    playMusic(name, options = {}) {
      return adapter.playMusic(String(name), clamp(finiteNumber(options.volume, 1), 0, 1));
    },
    stopMusic() {
      return adapter.stopMusic();
    },
    pauseMusic() {
      return adapter.pauseMusic();
    },
    resumeMusic() {
      return adapter.resumeMusic();
    },
    setVolume(value) {
      return adapter.setVolume(clamp(finiteNumber(value, 1), 0, 1));
    },
    getVolume() {
      return adapter.getVolume();
    },
    setAudioVolume(name, value, instanceId) {
      return adapter.setSoundVolume(
        String(name),
        clamp(finiteNumber(value, 1), 0, 1),
        instanceId
      );
    },
    getAudioVolume(name, instanceId) {
      return adapter.getSoundVolume(String(name), instanceId);
    },
    getTrack() {
      return adapter.getAudioTracks();
    },
    mute(value = true) {
      return adapter.setMuted(value === true);
    },
    fade(name, from, to, duration, instanceId) {
      return adapter.fadeSound(
        String(name),
        clamp(finiteNumber(from), 0, 1),
        clamp(finiteNumber(to), 0, 1),
        Math.max(0, finiteNumber(duration)),
        instanceId
      );
    },
    createGroup(name, parentName = "Master", volume = 1) {
      const groupName = audioGroupName(name);
      const parent = findGroup(parentName);
      let group = findGroup(groupName, false);
      if (!group) group = mixer().createGroup?.(groupName, parent.name);
      if (!group) {
        throw new Error(
          `Melon Runtime: audio group "${groupName}" gagal dibuat di dalam "${parent.name}".`
        );
      }
      const nextVolume = clamp(finiteNumber(volume, 1), 0, 1);
      const runtimeState = groupState(group);
      runtimeState.volume = nextVolume;
      if (!runtimeState.muted) applyGroupVolume(group, nextVolume);
      return groupName;
    },
    hasGroup(name) {
      return Boolean(findGroup(name, false));
    },
    addToGroup(groupName, clipName) {
      const group = findGroup(groupName);
      const name = String(clipName);
      if (typeof group.addAudioClip === "function") group.addAudioClip(name);
      else {
        group.audioClips ?? (group.audioClips = []);
        if (!group.audioClips.includes(name)) group.audioClips.push(name);
      }
      return true;
    },
    removeFromGroup(groupName, clipName) {
      const group = findGroup(groupName);
      const index = group.audioClips?.indexOf(String(clipName)) ?? -1;
      if (index === -1) return false;
      group.audioClips.splice(index, 1);
      return true;
    },
    playInGroup(groupName, clipName, options = {}) {
      const group = findGroup(groupName);
      const name = requireClip(group, clipName);
      return group.play(name, options.loop === true, clamp(finiteNumber(options.volume, 1), 0, 1));
    },
    stopInGroup(groupName, clipName, instanceId) {
      return controlGroupSound("stop", groupName, clipName, instanceId);
    },
    pauseInGroup(groupName, clipName, instanceId) {
      return controlGroupSound("pause", groupName, clipName, instanceId);
    },
    resumeInGroup(groupName, clipName, instanceId) {
      return controlGroupSound("resume", groupName, clipName, instanceId);
    },
    setGroupVolume(name, volume) {
      const group = findGroup(name);
      const nextVolume = clamp(finiteNumber(volume, 1), 0, 1);
      const runtimeState = groupState(group);
      runtimeState.volume = nextVolume;
      if (!runtimeState.muted) applyGroupVolume(group, nextVolume);
      return nextVolume;
    },
    getGroupVolume(name) {
      return groupState(findGroup(name)).volume;
    },
    muteGroup(name, muted = true) {
      const group = findGroup(name);
      const runtimeState = groupState(group);
      runtimeState.muted = muted === true;
      applyGroupVolume(group, runtimeState.muted ? 0 : runtimeState.volume);
      return runtimeState.muted;
    },
    isGroupMuted(name) {
      return groupState(findGroup(name)).muted;
    },
    playGroup(name) {
      return controlWholeGroup("play", name);
    },
    stopGroup(name) {
      return controlWholeGroup("stop", name);
    },
    pauseGroup(name) {
      return controlWholeGroup("pause", name);
    },
    resumeGroup(name) {
      return controlWholeGroup("resume", name);
    }
  };
}

// packages/melon-runtime/src/modules/behavior.js
function createBehaviorModule({ adapter, state }) {
  function dataFor(object) {
    let data = state.behavior.get(object);
    if (!data) {
      data = {};
      state.behavior.set(object, data);
    }
    return data;
  }
  function moveToward(object, targetPosition, speed = 2) {
    requireObject(object);
    const from = adapter.getPosition(object);
    const dx = finiteNumber(targetPosition?.x) - from.x;
    const dy = finiteNumber(targetPosition?.y) - from.y;
    const distance = Math.hypot(dx, dy);
    if (distance === 0) return adapter.stopMovement(object, "both");
    const velocity = Math.abs(finiteNumber(speed, 2));
    return adapter.setVelocity(object, dx / distance * velocity, dy / distance * velocity);
  }
  return {
    follow(object, target, options = {}) {
      requireObject(object);
      requireObject(target, "target");
      const from = adapter.getPosition(object);
      const to = adapter.getPosition(target);
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const distance = Math.hypot(dx, dy);
      const stopDistance = Math.max(0, finiteNumber(options.stopDistance, 0));
      if (distance <= stopDistance || distance === 0) {
        return adapter.stopMovement(object, "both");
      }
      const speed = Math.abs(finiteNumber(options.speed, 2));
      return adapter.setVelocity(object, dx / distance * speed, dy / distance * speed);
    },
    moveToward,
    patrol(object, points, options = {}) {
      requireObject(object);
      if (!Array.isArray(points) || points.length === 0) return object;
      const data = dataFor(object);
      data.patrolIndex ?? (data.patrolIndex = 0);
      const target = points[data.patrolIndex % points.length];
      const position = adapter.getPosition(object);
      const distance = Math.hypot(
        finiteNumber(target?.x) - position.x,
        finiteNumber(target?.y) - position.y
      );
      if (distance <= Math.max(1, finiteNumber(options.tolerance, 4))) {
        data.patrolIndex = (data.patrolIndex + 1) % points.length;
      }
      return moveToward(object, points[data.patrolIndex], options.speed ?? 2);
    },
    keepInside(object, bounds) {
      requireObject(object);
      const position = adapter.getPosition(object);
      return adapter.setPosition(
        object,
        Math.min(Math.max(position.x, finiteNumber(bounds?.x)), finiteNumber(bounds?.x) + finiteNumber(bounds?.width)),
        Math.min(Math.max(position.y, finiteNumber(bounds?.y)), finiteNumber(bounds?.y) + finiteNumber(bounds?.height))
      );
    },
    faceTarget(object, target) {
      const from = adapter.getPosition(requireObject(object));
      const to = adapter.getPosition(requireObject(target, "target"));
      return adapter.flip(object, to.x < from.x, false);
    }
  };
}

// packages/melon-runtime/src/modules/camera.js
function createCameraModule({ adapter }) {
  return {
    follow(object, options = {}) {
      return adapter.followCamera(requireObject(object), {
        axis: options.axis ?? "both",
        smoothing: finiteNumber(options.smoothing, 1)
      });
    },
    stopFollowing() {
      return adapter.unfollowCamera();
    },
    moveBy(x, y) {
      return adapter.moveCamera(finiteNumber(x), finiteNumber(y));
    },
    moveTo(x, y) {
      return adapter.moveCameraTo(finiteNumber(x), finiteNumber(y));
    },
    position(axis = "x") {
      const key = String(axis).toLowerCase();
      if (!["x", "y"].includes(key)) {
        throw new RangeError(
          'Melon Runtime: camera axis harus "x" atau "y".'
        );
      }
      return finiteNumber(adapter.getCameraPosition()[key]);
    },
    shake(options = {}) {
      return adapter.shakeCamera({
        intensity: Math.max(0, finiteNumber(options.intensity, 8)),
        duration: Math.max(0, finiteNumber(options.duration, 300)),
        axis: options.axis ?? "both",
        onComplete: options.onComplete,
        force: options.force === true
      });
    },
    flash(color = "#ffffff", duration = 300, onComplete) {
      return adapter.flashCamera(String(color), Math.max(0, finiteNumber(duration)), onComplete);
    },
    fade(color = "#000000", duration = 300, onComplete) {
      return adapter.fadeCamera(String(color), Math.max(0, finiteNumber(duration)), onComplete);
    }
  };
}

// packages/melon-runtime/src/internal/particle-capabilities.js
var PARTICLE_CAPABILITY_STATUS = Object.freeze({
  NATIVE: "native",
  SHARED_CPU: "shared-cpu",
  GPU_ONLY: "gpu-only",
  FALLBACK: "fallback",
  UNSUPPORTED: "unsupported"
});
function rendererName(renderer) {
  const value = String(renderer ?? "unknown").toLowerCase();
  if (value === "canvas" || value === "canvas2d") return "canvas";
  if (value === "webgl" || value === "webgl1" || value === "webgl2") return "webgl";
  if (value === "webgpu") return "webgpu";
  return "unknown";
}
function majorVersion(version) {
  const major = Number.parseInt(String(version).split(".")[0], 10);
  return Number.isFinite(major) ? major : 0;
}
function createParticle2DCapabilities({
  engineVersion = "unknown",
  renderer = "unknown",
  webglVersion = 0
} = {}) {
  const status = PARTICLE_CAPABILITY_STATUS;
  const activeRenderer2 = rendererName(renderer);
  const isWebGL = activeRenderer2 === "webgl";
  const isCanvas = activeRenderer2 === "canvas";
  const engineMajor = majorVersion(engineVersion);
  const knownEngine = engineVersion === "17.4.0" || engineMajor === 20;
  const isWebGPU = activeRenderer2 === "webgpu" && engineMajor === 20;
  const available = knownEngine && (isCanvas || isWebGL || isWebGPU);
  return Object.freeze({
    engineVersion: String(engineVersion),
    renderer: activeRenderer2,
    webglVersion: isWebGL ? Math.max(1, Number(webglVersion) || 1) : 0,
    simulation: available ? status.SHARED_CPU : status.UNSUPPORTED,
    deterministicRandom: available ? status.SHARED_CPU : status.UNSUPPORTED,
    emission: available ? status.SHARED_CPU : status.UNSUPPORTED,
    curvesAndGradients: available ? status.SHARED_CPU : status.UNSUPPORTED,
    shapesAndForces: available ? status.SHARED_CPU : status.UNSUPPORTED,
    collisionQueries: available ? status.SHARED_CPU : status.UNSUPPORTED,
    tilemapCollision: available ? status.SHARED_CPU : status.UNSUPPORTED,
    atlasUv: available ? status.NATIVE : status.UNSUPPORTED,
    flipbook: available ? status.SHARED_CPU : status.UNSUPPORTED,
    quadBatching: (isWebGL || isWebGPU) && knownEngine ? status.NATIVE : isCanvas && knownEngine ? status.FALLBACK : status.UNSUPPORTED,
    blendModes: available ? status.NATIVE : status.UNSUPPORTED,
    masks: available ? status.NATIVE : status.UNSUPPORTED,
    sorting: available ? status.SHARED_CPU : status.UNSUPPORTED,
    trails: (isWebGL || isWebGPU) && knownEngine ? status.SHARED_CPU : isCanvas && knownEngine ? status.FALLBACK : status.UNSUPPORTED,
    lights: isWebGL && knownEngine ? status.NATIVE : isCanvas && knownEngine ? status.FALLBACK : status.UNSUPPORTED,
    customMaterials: isWebGL && knownEngine ? status.GPU_ONLY : status.UNSUPPORTED,
    distortion: isWebGL && knownEngine ? status.GPU_ONLY : status.UNSUPPORTED,
    perParticleShaderAttributes: status.UNSUPPORTED,
    gpuSimulation: status.UNSUPPORTED
  });
}
function detectParticle2DTarget(engineVersion, application, engine2) {
  const renderer = application?.renderer ?? engine2?.game?.renderer ?? engine2?.video?.renderer;
  const isWebGL = Boolean(renderer?.gl);
  let webglVersion = 0;
  if (isWebGL) {
    webglVersion = 1;
    const WebGL2 = globalThis.WebGL2RenderingContext;
    if (typeof WebGL2 === "function" && renderer.gl instanceof WebGL2) {
      webglVersion = 2;
    } else if (Number(renderer.webglVersion) === 2 || Number(renderer.version) === 2) {
      webglVersion = 2;
    }
  }
  return createParticle2DCapabilities({
    engineVersion,
    renderer: renderer?.type === "WebGPU" ? "webgpu" : isWebGL ? "webgl" : renderer ? "canvas" : "unknown",
    webglVersion
  });
}

// packages/melon-runtime/src/modules/capabilities.js
function resolvePath(value, path) {
  if (!path) return value;
  return String(path).split(".").reduce(
    (current, key) => current?.[key],
    value
  );
}
function snapshot(adapter) {
  if (typeof adapter.getCapabilities === "function") {
    return adapter.getCapabilities();
  }
  return Object.freeze({ adapter: adapter.capabilities ?? Object.freeze({}) });
}
function createCapabilitiesModule({ adapter }) {
  return Object.freeze({
    get(path) {
      return resolvePath(snapshot(adapter), path);
    },
    supports(path) {
      const value = resolvePath(snapshot(adapter), path);
      if (typeof value === "boolean") return value;
      return value !== void 0 && value !== PARTICLE_CAPABILITY_STATUS.UNSUPPORTED;
    },
    warnings(features = []) {
      const current = snapshot(adapter);
      return features.flatMap((feature) => {
        const path = String(feature).includes(".") ? String(feature) : `particle2D.${feature}`;
        const value = resolvePath(current, path);
        if (value === PARTICLE_CAPABILITY_STATUS.FALLBACK) {
          return [{
            code: "APS_CAP_FALLBACK",
            severity: "warning",
            feature: path,
            status: value,
            message: `${path} memakai fallback pada target aktif.`
          }];
        }
        if (value === void 0 || value === PARTICLE_CAPABILITY_STATUS.UNSUPPORTED) {
          return [{
            code: "APS_CAP_UNSUPPORTED",
            severity: "error",
            feature: path,
            status: PARTICLE_CAPABILITY_STATUS.UNSUPPORTED,
            message: `${path} tidak didukung pada target aktif.`
          }];
        }
        return [];
      });
    },
    forTarget(engineVersion, renderer, webglVersion = 0) {
      return createParticle2DCapabilities({ engineVersion, renderer, webglVersion });
    }
  });
}

// packages/melon-runtime/src/modules/collision.js
function createCollisionModule({ adapter }) {
  return {
    prepareBody(object) {
      return adapter.prepareCollisionBody(requireObject(object));
    },
    snapshot(response, object) {
      return adapter.snapshotCollisionResponse(response, requireObject(object));
    },
    setType(object, type) {
      return adapter.setCollisionType(requireObject(object), type);
    },
    collidesWith(object, ...types) {
      return adapter.setCollisionMask(requireObject(object), types);
    },
    isType(object, type) {
      return adapter.isCollisionType(requireObject(object), type);
    },
    addShape(target, shape, options = {}) {
      return adapter.addCollisionShape(
        requireObject(target, "collision body"),
        requireObject(shape, "collision shape"),
        requireObject(options, "collision shape options")
      );
    },
    setShapeFilter(target, shape, filter = {}) {
      return adapter.setCollisionShapeFilter(
        requireObject(target, "collision body"),
        shape,
        requireObject(filter, "collision shape filter")
      );
    },
    syncShapeFilters(target) {
      return adapter.syncCollisionShapeFilters(requireObject(target, "collision body"));
    },
    overlap(response) {
      return finiteNumber(adapter.getCollisionOverlap(
        requireObject(response, "collision response")
      ));
    },
    overlapVector(response, object, axis = "x") {
      return finiteNumber(adapter.getCollisionVector(
        requireObject(response, "collision response"),
        requireObject(object),
        "overlap",
        axis
      ));
    },
    normal(response, object, axis = "x") {
      return finiteNumber(adapter.getCollisionVector(
        requireObject(response, "collision response"),
        requireObject(object),
        "normal",
        axis
      ));
    },
    isInside(response, object, side = "self") {
      return adapter.isCollisionInside(
        requireObject(response, "collision response"),
        requireObject(object),
        side
      );
    },
    shapeIndex(response, collisionInfo, object, side = "self") {
      return adapter.getCollisionShapeIndex(
        requireObject(response, "collision response"),
        requireObject(collisionInfo, "collision info"),
        requireObject(object),
        side
      );
    },
    setShapeActive(object, target, enabled = true) {
      return adapter.setShapeActive(requireObject(object), target, enabled === true);
    },
    toggleShape(object, target) {
      return adapter.toggleShape(requireObject(object), target);
    },
    containsPoint(object, x, y) {
      return adapter.bodyContainsPoint(
        requireObject(object),
        finiteNumber(x),
        finiteNumber(y)
      );
    },
    shapeCount(object) {
      return adapter.getShapeCount(requireObject(object));
    },
    rotateBody(object, degrees2) {
      return adapter.rotateBody(requireObject(object), finiteNumber(degrees2));
    },
    bodyBounds(object, property = "width") {
      const bounds = adapter.getBodyBounds(requireObject(object));
      const key = String(property).toLowerCase();
      if (!["x", "y", "width", "height"].includes(key)) {
        throw new Error(`Melon Runtime: properti body bounds "${property}" tidak dikenal.`);
      }
      return finiteNumber(bounds?.[key]);
    },
    onEnter(object, callback) {
      return adapter.onCollision(requireObject(object), "enter", requireFunction(callback));
    },
    onStay(object, callback) {
      return adapter.onCollision(requireObject(object), "stay", requireFunction(callback));
    },
    onExit(object, callback) {
      return adapter.onCollision(requireObject(object), "exit", requireFunction(callback));
    }
  };
}

// packages/melon-runtime/src/modules/events.js
function createEventsModule() {
  const listeners = /* @__PURE__ */ new Map();
  function on(name, callback) {
    requireFunction(callback);
    const eventName = String(name);
    const callbacks = listeners.get(eventName) ?? /* @__PURE__ */ new Set();
    callbacks.add(callback);
    listeners.set(eventName, callbacks);
    return () => off(eventName, callback);
  }
  function once(name, callback) {
    requireFunction(callback);
    const unsubscribe = on(name, (...args) => {
      unsubscribe();
      callback(...args);
    });
    return unsubscribe;
  }
  function off(name, callback) {
    const callbacks = listeners.get(String(name));
    if (!callbacks) return false;
    const removed = callbacks.delete(callback);
    if (callbacks.size === 0) listeners.delete(String(name));
    return removed;
  }
  return {
    on,
    once,
    off,
    emit(name, ...args) {
      const callbacks = listeners.get(String(name));
      if (!callbacks) return 0;
      [...callbacks].forEach((callback) => callback(...args));
      return callbacks.size;
    },
    clear(name) {
      if (typeof name === "undefined") listeners.clear();
      else listeners.delete(String(name));
    }
  };
}

// packages/melon-runtime/src/modules/game.js
function createGameModule({ adapter }) {
  return {
    pause(options = {}) {
      return adapter.pauseGame(options.pauseMusic === true);
    },
    resume(options = {}) {
      return adapter.resumeGame(options.resumeMusic === true);
    },
    isPaused() {
      return adapter.isGamePaused();
    },
    width() {
      return adapter.gameSize().width;
    },
    height() {
      return adapter.gameSize().height;
    }
  };
}

// packages/melon-runtime/src/modules/group.js
function createGroupModule({ adapter, state }) {
  const groups = state.groups;
  function groupFor(name, create = false) {
    const groupName = String(name);
    if (!groups.has(groupName) && create) groups.set(groupName, /* @__PURE__ */ new Set());
    return groups.get(groupName);
  }
  function activeMembers(name) {
    const members = groupFor(name);
    if (!members) return [];
    for (const object of members) {
      if (adapter.hasObject?.(object) === false) members.delete(object);
    }
    return [...members];
  }
  function pointOf(target) {
    requireObject(target, "target");
    if (Number.isFinite(Number(target.x)) && Number.isFinite(Number(target.y)) && !target.pos) {
      return {
        x: finiteNumber(target.x),
        y: finiteNumber(target.y)
      };
    }
    return adapter.getPosition(target);
  }
  function add(name, object) {
    const member = requireObject(object);
    groupFor(name, true).add(member);
    return member;
  }
  return {
    add,
    remove(name, object) {
      return groupFor(name)?.delete(requireObject(object)) ?? false;
    },
    has(name, object) {
      return groupFor(name)?.has(requireObject(object)) ?? false;
    },
    all(name) {
      return activeMembers(name);
    },
    count(name) {
      return activeMembers(name).length;
    },
    random(name) {
      const members = activeMembers(name);
      if (members.length === 0) return null;
      return members[Math.floor(Math.random() * members.length)];
    },
    nearest(name, target, maximumDistance = Infinity) {
      const targetPosition = pointOf(target);
      const limit = Math.max(0, finiteNumber(maximumDistance, Infinity));
      let nearestObject = null;
      let nearestDistance = limit;
      for (const object of activeMembers(name)) {
        const position = adapter.getPosition(object);
        const distance = Math.hypot(
          position.x - targetPosition.x,
          position.y - targetPosition.y
        );
        if (distance <= nearestDistance) {
          nearestObject = object;
          nearestDistance = distance;
        }
      }
      return nearestObject;
    },
    forEach(name, callback) {
      const handler = requireFunction(callback);
      const members = activeMembers(name);
      members.forEach((object, index) => handler(object, index, members));
      return members.length;
    },
    spawn(name, prefabName, count = 1, options = {}) {
      const total = Math.min(1e4, Math.max(0, Math.floor(finiteNumber(count))));
      const objects = [];
      const baseX = finiteNumber(options.x);
      const baseY = finiteNumber(options.y);
      const stepX = finiteNumber(options.stepX);
      const stepY = finiteNumber(options.stepY);
      for (let index = 0; index < total; index += 1) {
        const settings = typeof options.settings === "function" ? options.settings(index) : options.settings;
        const object = adapter.spawn(String(prefabName), {
          x: baseX + stepX * index,
          y: baseY + stepY * index,
          z: options.z,
          settings: settings ?? {}
        });
        add(name, object);
        objects.push(object);
      }
      return objects;
    },
    destroyAll(name) {
      const members = activeMembers(name);
      let destroyed = 0;
      for (const object of members) {
        if (adapter.removeObject(object) !== false) destroyed += 1;
      }
      groups.delete(String(name));
      return destroyed;
    },
    clear(name) {
      if (typeof name === "undefined") {
        const count = groups.size;
        groups.clear();
        return count;
      }
      return groups.delete(String(name));
    }
  };
}

// packages/melon-runtime/src/modules/input.js
function createInputModule({ adapter, state }) {
  function defineAction(name, keys, options = {}) {
    const actionName = String(name);
    const keyNames = Array.isArray(keys) ? keys : [keys];
    if (state.actions.has(actionName)) {
      adapter.unbindAction(state.actions.get(actionName));
    }
    const binding = adapter.bindAction(actionName, keyNames, {
      once: options.once === true,
      preventDefault: options.preventDefault !== false
    });
    state.actions.set(actionName, binding);
    return actionName;
  }
  return {
    defineAction,
    pressed(name) {
      return adapter.isActionPressed(String(name));
    },
    down(name) {
      return adapter.isActionDown(String(name));
    },
    removeAction(name) {
      const actionName = String(name);
      const binding = state.actions.get(actionName);
      if (!binding) return false;
      adapter.unbindAction(binding);
      state.actions.delete(actionName);
      return true;
    },
    clear() {
      for (const binding of state.actions.values()) {
        adapter.unbindAction(binding);
      }
      state.actions.clear();
    }
  };
}

// packages/melon-runtime/src/modules/math.js
function createMathModule() {
  return {
    clamp,
    lerp(from, to, amount) {
      return from + (to - from) * clamp(finiteNumber(amount), 0, 1);
    },
    random(min = 0, max = 1) {
      const low = finiteNumber(min);
      const high = finiteNumber(max, 1);
      return low + Math.random() * (high - low);
    },
    randomInt(min, max) {
      const low = Math.ceil(Math.min(finiteNumber(min), finiteNumber(max)));
      const high = Math.floor(Math.max(finiteNumber(min), finiteNumber(max)));
      return Math.floor(Math.random() * (high - low + 1)) + low;
    },
    distance(a, b) {
      return Math.hypot(
        finiteNumber(b?.x) - finiteNumber(a?.x),
        finiteNumber(b?.y) - finiteNumber(a?.y)
      );
    },
    angle(a, b) {
      return Math.atan2(
        finiteNumber(b?.y) - finiteNumber(a?.y),
        finiteNumber(b?.x) - finiteNumber(a?.x)
      );
    },
    moveTowards(current, target, maximumChange) {
      const difference = finiteNumber(target) - finiteNumber(current);
      const change = Math.min(Math.abs(difference), Math.abs(finiteNumber(maximumChange)));
      return finiteNumber(current) + Math.sign(difference) * change;
    }
  };
}

// packages/melon-runtime/src/modules/movement.js
var DIRECTION = {
  left: [-1, 0],
  right: [1, 0],
  up: [0, -1],
  down: [0, 1]
};
function createMovementModule({ adapter }) {
  function velocityOf(object) {
    const velocity = adapter.getVelocity(requireObject(object));
    return {
      x: finiteNumber(velocity?.x),
      y: finiteNumber(velocity?.y)
    };
  }
  return {
    move(object, direction, speed = 4) {
      const vector = typeof direction === "string" ? DIRECTION[direction.toLowerCase()] : [finiteNumber(direction?.x), finiteNumber(direction?.y)];
      if (!vector) {
        throw new Error(`Melon Runtime: arah "${direction}" tidak dikenal.`);
      }
      return adapter.setVelocity(
        requireObject(object),
        vector[0] * Math.abs(finiteNumber(speed)),
        vector[1] * Math.abs(finiteNumber(speed))
      );
    },
    setVelocity(object, x, y) {
      return adapter.setVelocity(
        requireObject(object),
        finiteNumber(x),
        finiteNumber(y)
      );
    },
    velocity(object, axis = "x") {
      const velocity = velocityOf(object);
      const key = String(axis).toLowerCase();
      if (key !== "x" && key !== "y") {
        throw new Error(`Melon Runtime: velocity axis "${axis}" tidak dikenal.`);
      }
      return velocity[key];
    },
    speed(object) {
      const velocity = velocityOf(object);
      return Math.hypot(velocity.x, velocity.y);
    },
    stop(object, axis = "both") {
      return adapter.stopMovement(requireObject(object), String(axis).toLowerCase());
    },
    jump(object, power = 12) {
      return adapter.jump(requireObject(object), Math.abs(finiteNumber(power, 12)));
    },
    isFalling(object) {
      return adapter.isFalling(requireObject(object));
    },
    isJumping(object) {
      return adapter.isJumping(requireObject(object));
    },
    isGrounded(object) {
      return adapter.isGrounded(requireObject(object));
    },
    applyForce(object, x, y) {
      return adapter.applyForce(
        requireObject(object),
        finiteNumber(x),
        finiteNumber(y)
      );
    },
    setMaxVelocity(object, x, y) {
      return adapter.setMaxVelocity(
        requireObject(object),
        Math.abs(finiteNumber(x)),
        Math.abs(finiteNumber(y))
      );
    },
    setFriction(object, x, y) {
      return adapter.setFriction(
        requireObject(object),
        Math.max(0, finiteNumber(x)),
        Math.max(0, finiteNumber(y))
      );
    },
    setBounce(object, amount) {
      return adapter.setBounce(
        requireObject(object),
        Math.min(1, Math.max(0, finiteNumber(amount)))
      );
    },
    setMass(object, mass = 1) {
      return adapter.setMass(
        requireObject(object),
        Math.max(Number.EPSILON, finiteNumber(mass, 1))
      );
    },
    setStatic(object, enabled = true) {
      return adapter.setStatic(requireObject(object), enabled === true);
    },
    setGravity(object, strength = 1) {
      return adapter.setGravity(requireObject(object), finiteNumber(strength, 1));
    },
    setGravityEnabled(object, enabled = true) {
      return adapter.setGravityEnabled(requireObject(object), enabled === true);
    }
  };
}

// packages/melon-runtime/src/modules/object.js
function createObjectModule({ adapter, state }) {
  function dataFor(object, create = false) {
    const target = requireObject(object);
    if (!state.objectData.has(target) && create) {
      state.objectData.set(target, /* @__PURE__ */ new Map());
    }
    return state.objectData.get(target);
  }
  function setData(object, key, value) {
    dataFor(object, true).set(String(key), value);
    return value;
  }
  function getData(object, key, defaultValue = null) {
    const data = dataFor(object);
    const dataKey = String(key);
    return data?.has(dataKey) ? data.get(dataKey) : defaultValue;
  }
  return {
    find(name) {
      return adapter.findObjects(String(name))[0] ?? null;
    },
    findAll(name) {
      return adapter.findObjects(name instanceof RegExp ? name : String(name));
    },
    count(name) {
      return adapter.findObjects(name instanceof RegExp ? name : String(name)).length;
    },
    exists(object) {
      return adapter.hasObject(requireObject(object));
    },
    spawn(prefabName, options = {}) {
      return adapter.spawn(String(prefabName), options);
    },
    add(object, z) {
      return adapter.addObject(requireObject(object), z);
    },
    destroy(object) {
      return adapter.removeObject(requireObject(object));
    },
    show(object) {
      return adapter.setOpacity(requireObject(object), 1);
    },
    hide(object) {
      return adapter.setOpacity(requireObject(object), 0);
    },
    setPosition(object, x, y, z) {
      return adapter.setPosition(
        requireObject(object),
        finiteNumber(x),
        finiteNumber(y),
        typeof z === "undefined" ? void 0 : finiteNumber(z)
      );
    },
    moveBy(object, x, y) {
      const position = adapter.getPosition(requireObject(object));
      return adapter.setPosition(
        object,
        position.x + finiteNumber(x),
        position.y + finiteNumber(y)
      );
    },
    position(object) {
      const position = adapter.getPosition(requireObject(object));
      return {
        x: finiteNumber(position.x),
        y: finiteNumber(position.y),
        z: finiteNumber(position.z)
      };
    },
    x(object) {
      return finiteNumber(adapter.getPosition(requireObject(object)).x);
    },
    y(object) {
      return finiteNumber(adapter.getPosition(requireObject(object)).y);
    },
    setOpacity(object, opacity) {
      return adapter.setOpacity(requireObject(object), opacity);
    },
    rotate(object, degrees2) {
      return adapter.rotate(requireObject(object), finiteNumber(degrees2));
    },
    scale(object, x, y = x, options = {}) {
      const settings = options && typeof options === "object" ? options : {};
      return adapter.scale(
        requireObject(object),
        finiteNumber(x, 1),
        finiteNumber(y, 1),
        {
          z: finiteNumber(settings.z, 1),
          withCollision: settings.withCollision === true
        }
      );
    },
    flip(object, horizontal, vertical, withCollision = false) {
      return adapter.flip(
        requireObject(object),
        horizontal,
        vertical,
        withCollision === true
      );
    },
    setData,
    getData,
    hasData(object, key) {
      return dataFor(object)?.has(String(key)) ?? false;
    },
    incrementData(object, key, amount = 1, initialValue = 0) {
      const current = getData(object, key, finiteNumber(initialValue));
      return setData(
        object,
        key,
        finiteNumber(current) + finiteNumber(amount, 1)
      );
    },
    removeData(object, key) {
      return dataFor(object)?.delete(String(key)) ?? false;
    }
  };
}

// packages/melon-runtime/src/modules/particles.js
function createParticlesModule(context) {
  const bridge = () => {
    const value = context.adapter.particle2D;
    if (!value || typeof value.create !== "function") throw Object.assign(new Error("Advanced ParticleSystem2D adapter is unavailable."), { code: "APS_CAP_UNSUPPORTED" });
    return value;
  };
  return Object.freeze({
    create(compiledEffect, systemId, emitterId, options) {
      return bridge().create(compiledEffect, systemId, emitterId, options);
    },
    mount(renderable, z) {
      return bridge().mount(renderable, z);
    },
    unmount(renderable) {
      return bridge().unmount(renderable);
    },
    capabilities() {
      return bridge().capabilities();
    },
    get RenderableClass() {
      return bridge().RenderableClass;
    }
  });
}

// packages/melon-runtime/src/modules/scene.js
function createSceneModule({ adapter }) {
  return {
    goTo(name, options = {}) {
      return adapter.loadScene(String(name), options);
    },
    restart(options = {}) {
      return adapter.reloadScene(options);
    },
    current() {
      return adapter.currentScene();
    }
  };
}

// packages/melon-runtime/src/modules/sprite.js
function createSpriteModule({ adapter }) {
  return {
    flicker(object, duration = 1e3, onComplete) {
      return adapter.flickerSprite(
        requireObject(object),
        Math.max(0, finiteNumber(duration, 1e3)),
        typeof onComplete === "function" ? () => onComplete(object) : void 0
      );
    },
    stopFlicker(object) {
      return adapter.flickerSprite(requireObject(object), 0);
    },
    isFlickering(object) {
      return adapter.isSpriteFlickering(requireObject(object));
    },
    setTint(object, color) {
      return adapter.setSpriteTint(requireObject(object), String(color));
    },
    clearTint(object) {
      return adapter.setSpriteTint(requireObject(object), "#ffffff");
    },
    setBlendMode(object, mode = "normal") {
      return adapter.setSpriteBlendMode(
        requireObject(object),
        String(mode || "normal")
      );
    },
    setAnchor(object, x, y) {
      return adapter.setSpriteAnchor(
        requireObject(object),
        finiteNumber(x, 0.5),
        finiteNumber(y, 0.5)
      );
    },
    setOffset(object, x, y) {
      return adapter.setSpriteOffset(
        requireObject(object),
        finiteNumber(x),
        finiteNumber(y)
      );
    },
    setAnimationSpeed(object, milliseconds = 100) {
      return adapter.setSpriteAnimationSpeed(
        requireObject(object),
        Math.max(0, finiteNumber(milliseconds, 100))
      );
    },
    setFrame(object, frame = 0) {
      return adapter.setSpriteFrame(
        requireObject(object),
        Math.max(0, Math.trunc(finiteNumber(frame)))
      );
    },
    currentFrame(object) {
      return adapter.getSpriteFrame(requireObject(object));
    },
    reverseAnimation(object, name) {
      return adapter.reverseSpriteAnimation(
        requireObject(object),
        typeof name === "undefined" || name === null || name === "" ? void 0 : String(name)
      );
    },
    setRegion(object, regionName) {
      return adapter.setSpriteRegion(
        requireObject(object),
        String(regionName)
      );
    }
  };
}

// packages/melon-runtime/src/modules/storage.js
function createStorageModule({ adapter }) {
  return {
    set(key, value) {
      return adapter.saveValue(String(key), value);
    },
    get(key, defaultValue = null) {
      return adapter.loadValue(String(key), defaultValue);
    },
    has(key) {
      return adapter.hasValue(String(key));
    },
    remove(key) {
      return adapter.removeValue(String(key));
    }
  };
}

// packages/melon-runtime/src/modules/state.js
function createStateModule({ state }) {
  const values = state.values;
  const watchers = state.valueWatchers;
  function notify(key, value, previousValue) {
    if (Object.is(value, previousValue)) return 0;
    const callbacks = watchers.get(key);
    if (!callbacks) return 0;
    [...callbacks].forEach((callback) => callback(value, previousValue, key));
    return callbacks.size;
  }
  function set(key, value) {
    const stateKey = String(key);
    const previousValue = values.get(stateKey);
    values.set(stateKey, value);
    notify(stateKey, value, previousValue);
    return value;
  }
  function get(key, defaultValue = null) {
    const stateKey = String(key);
    return values.has(stateKey) ? values.get(stateKey) : defaultValue;
  }
  function remove(key) {
    const stateKey = String(key);
    if (!values.has(stateKey)) return false;
    const previousValue = values.get(stateKey);
    values.delete(stateKey);
    notify(stateKey, void 0, previousValue);
    return true;
  }
  return {
    set,
    get,
    has(key) {
      return values.has(String(key));
    },
    remove,
    increment(key, amount = 1, initialValue = 0) {
      const current = get(key, finiteNumber(initialValue));
      return set(key, finiteNumber(current) + finiteNumber(amount, 1));
    },
    toggle(key, initialValue = false) {
      return set(key, !Boolean(get(key, initialValue)));
    },
    update(key, updater, defaultValue = null) {
      return set(
        key,
        requireFunction(updater, "state updater")(get(key, defaultValue))
      );
    },
    onChange(key, callback, options = {}) {
      const stateKey = String(key);
      const handler = requireFunction(callback);
      const callbacks = watchers.get(stateKey) ?? /* @__PURE__ */ new Set();
      callbacks.add(handler);
      watchers.set(stateKey, callbacks);
      if (options.immediate === true) {
        handler(get(stateKey, options.defaultValue), void 0, stateKey);
      }
      return () => {
        const currentCallbacks = watchers.get(stateKey);
        if (!currentCallbacks) return false;
        const removed = currentCallbacks.delete(handler);
        if (currentCallbacks.size === 0) watchers.delete(stateKey);
        return removed;
      };
    },
    clear() {
      const keys = [...values.keys()];
      keys.forEach(remove);
      return keys.length;
    }
  };
}

// packages/melon-runtime/src/modules/time.js
function createTimeModule({ adapter }) {
  return {
    after(duration, callback, options = {}) {
      return adapter.setTimeout(
        requireFunction(callback),
        Math.max(0, finiteNumber(duration)),
        options
      );
    },
    every(duration, callback, options = {}) {
      return adapter.setInterval(
        requireFunction(callback),
        Math.max(1, finiteNumber(duration, 1)),
        options
      );
    },
    cancel(timerId) {
      return adapter.clearTimer(timerId);
    },
    deltaSeconds(deltaMilliseconds) {
      return Math.max(0, finiteNumber(deltaMilliseconds)) / 1e3;
    }
  };
}

// packages/melon-runtime/src/modules/textures.js
function createTexturesModule() {
  let options = null;
  let originalChange = null;
  let pendingGroups = /* @__PURE__ */ new Set();
  let transitionId = 0;
  const loadedGroups = /* @__PURE__ */ new Set();
  function levelConfig(level) {
    return options?.levels?.[String(level)] || { load: [], unload: [] };
  }
  async function loadGroups(groups) {
    const missing = [...new Set(groups || [])].filter((group) => !loadedGroups.has(group) && options.resources[group]);
    for (const group of missing) {
      await options.preload(options.resources[group]);
      options.onLoaded?.(group);
      loadedGroups.add(group);
    }
  }
  async function unloadGroups(groups) {
    for (const group of new Set(groups || [])) {
      if (!loadedGroups.has(group) || pendingGroups.has(group)) continue;
      options.onBeforeUnload?.(group);
      for (const resource of options.resources[group] || []) options.unload(resource);
      loadedGroups.delete(group);
    }
  }
  return {
    configure(configuration) {
      options = configuration;
      loadedGroups.clear();
      (configuration.initiallyLoaded || []).forEach((group) => loadedGroups.add(group));
      if (!originalChange) {
        originalChange = configuration.state.change.bind(configuration.state);
        configuration.state.change = function textureStreamingStateChange(level, ...args) {
          const currentTransition = ++transitionId;
          const config = levelConfig(level);
          const groups = config.load || [];
          pendingGroups = new Set(groups);
          return loadGroups(groups).then(() => {
            if (currentTransition !== transitionId) return false;
            return originalChange(level, ...args);
          });
        };
      }
      return this;
    },
    loadForLevel(level) {
      const config = levelConfig(level);
      return loadGroups(config.load || []);
    },
    unloadForLevel(level) {
      return unloadGroups(levelConfig(level).unload);
    },
    isLoaded(group) {
      return loadedGroups.has(group);
    }
  };
}

// packages/melon-runtime/src/modules/renderables.js
function targetOf(object) {
  return object.renderable ?? object;
}
function invoke(object, names, ...args) {
  for (const name of names) {
    if (typeof object?.[name] === "function") return object[name](...args);
  }
  return void 0;
}
function setVector(vector, x, y) {
  if (typeof vector?.set === "function") vector.set(x, y);
  else if (vector) Object.assign(vector, { x, y });
}
function createRenderableModule({ adapter }) {
  return {
    setOpacity(object, value) {
      return adapter.setOpacity(requireObject(object), clamp(finiteNumber(value, 1), 0, 1));
    },
    opacity(object) {
      const target = targetOf(requireObject(object));
      return finiteNumber(target.getOpacity?.() ?? target.opacity ?? target._opacity, 1);
    },
    setTint(object, color) {
      return adapter.setSpriteTint(requireObject(object), String(color));
    },
    clearTint(object) {
      return adapter.setSpriteTint(requireObject(object), "#ffffff");
    },
    setBlendMode(object, mode = "normal") {
      return adapter.setSpriteBlendMode(requireObject(object), String(mode || "normal"));
    },
    setAnchor(object, x = 0.5, y = 0.5) {
      return adapter.setSpriteAnchor(requireObject(object), finiteNumber(x, 0.5), finiteNumber(y, 0.5));
    },
    setSize(object, width, height) {
      const target = targetOf(requireObject(object));
      const nextWidth = Math.max(0, finiteNumber(width));
      const nextHeight = Math.max(0, finiteNumber(height));
      if (typeof target.resize === "function") target.resize(nextWidth, nextHeight);
      else {
        target.width = nextWidth;
        target.height = nextHeight;
        if ("_width" in target) target._width = nextWidth;
        if ("_height" in target) target._height = nextHeight;
      }
      return object;
    },
    size(object, axis = "width") {
      const target = targetOf(requireObject(object));
      return finiteNumber(axis === "height" ? target.height ?? target._height : target.width ?? target._width);
    },
    setVisible(object, visible = true) {
      const target = targetOf(requireObject(object));
      target.visible = visible === true;
      return object;
    },
    isVisible(object) {
      return targetOf(requireObject(object)).visible !== false;
    },
    setFloating(object, floating = true) {
      targetOf(requireObject(object)).floating = floating === true;
      return object;
    },
    setPrimitive(object, property, value) {
      const target = targetOf(requireObject(object));
      const key = property === "roundness" ? "roundLevel" : property;
      target[key] = key === "roundLevel" ? Math.max(0, finiteNumber(value)) : value;
      target.isDirty = true;
      return object;
    }
  };
}
function createVideoModule() {
  const videoTarget = (object) => {
    const target = requireObject(object);
    return target.video ?? target.image ?? targetOf(target);
  };
  return {
    control(object, action) {
      const target = videoTarget(object);
      if (action === "reset") {
        target.currentTime = 0;
        return object;
      }
      if (action === "stop") {
        invoke(target, ["stop", "pause"]);
        if ("currentTime" in target) target.currentTime = 0;
        return object;
      }
      invoke(target, action === "play" || action === "resume" ? ["play", "resume"] : ["pause"]);
      return object;
    },
    seek(object, seconds) {
      videoTarget(object).currentTime = Math.max(0, finiteNumber(seconds));
      return object;
    },
    time(object, kind = "currentTime") {
      return finiteNumber(videoTarget(object)[kind]);
    },
    setOption(object, option, value) {
      const target = videoTarget(object);
      target[option] = option === "volume" ? clamp(finiteNumber(value, 1), 0, 1) : option === "playbackRate" ? Math.max(0.01, finiteNumber(value, 1)) : value === true;
      return object;
    },
    status(object, kind = "playing") {
      const target = videoTarget(object);
      if (kind === "ended") return target.ended === true;
      if (kind === "muted") return target.muted === true;
      return target.paused !== true && target.ended !== true;
    }
  };
}
function writeText(object, value, append) {
  const target = targetOf(requireObject(object));
  const next = append ? String(target.text ?? "") + String(value) : String(value);
  if (typeof target.setText === "function") target.setText(next);
  else target.text = next;
  return object;
}
function createTextLikeModule(bitmap = false) {
  return {
    set(object, value) {
      return writeText(object, value, false);
    },
    append(object, value) {
      return writeText(object, value, true);
    },
    get(object) {
      return String(targetOf(requireObject(object)).text ?? "");
    },
    setStyle(object, property, value) {
      const target = targetOf(requireObject(object));
      const numeric = /* @__PURE__ */ new Set(["fontSize", "size", "lineWidth", "lineHeight", "wordWrapWidth"]);
      const next = numeric.has(property) ? finiteNumber(value) : value;
      if (bitmap && property === "size" && typeof target.resize === "function") {
        target.resize(Math.max(0, next));
      } else if (!bitmap && property === "font" && typeof target.setFont === "function") {
        target.setFont(String(next), target.fontSize);
      } else if (!bitmap && property === "fontSize" && typeof target.setFont === "function") {
        target.setFont(String(target.font || "Arial").replace(/^(?:(?:bold|italic)\s+)+/, ""), Math.max(0, next));
      } else if (!bitmap && (property === "fillStyle" || property === "strokeStyle") && typeof target[property]?.parseCSS === "function") {
        target[property].parseCSS(String(next));
      } else if (!bitmap && (property === "bold" || property === "italic")) {
        const enabled = next === true || next === "true" || next === "TRUE" || next === 1;
        if (enabled) target[property]?.();
        else {
          const token = new RegExp(`(^|\\s)${property}(?=\\s|$)`, "g");
          target.font = String(target.font || "").replace(token, " ").replace(/\s+/g, " ").trim();
        }
      } else {
        target[property] = next;
      }
      target.isDirty = true;
      if (typeof target.setText === "function" && !["font", "fontSize", "size"].includes(property)) {
        target.setText(target.text ?? "");
      }
      return object;
    },
    measure(object, axis = "width") {
      const target = targetOf(requireObject(object));
      return finiteNumber(target.measureText?.()?.[axis] ?? target.getBounds?.()?.[axis] ?? target[axis]);
    }
  };
}
function createTextModule() {
  return createTextLikeModule(false);
}
function createBitmapTextModule() {
  return createTextLikeModule(true);
}
function createTriggerModule({ adapter }) {
  return {
    setEnabled(object, enabled = true) {
      const target = requireObject(object);
      target.triggerEnabled = enabled === true;
      const shapes = target.body?.shapes ?? [];
      for (let index = 0; index < shapes.length; index++) {
        if (typeof adapter.setShapeActive === "function") adapter.setShapeActive(target, index, enabled === true);
        else shapes[index].isActive = enabled === true;
      }
      return object;
    },
    isEnabled(object) {
      return requireObject(object).triggerEnabled !== false;
    },
    reset(object) {
      requireObject(object).onceOnly = false;
      return object;
    },
    fire(object, activator = null) {
      const target = requireObject(object);
      if (target.triggerEnabled === false) return false;
      if (typeof target.onCollisionStart === "function") return target.onCollisionStart({}, activator);
      if (typeof target.onCollision === "function") return target.onCollision({}, activator);
      return invoke(target, ["activate", "trigger"], activator) ?? false;
    }
  };
}
function createDraggableModule() {
  return {
    setEnabled(object, enabled = true) {
      requireObject(object).dragEnabled = enabled === true;
      return object;
    },
    isDragging(object) {
      return requireObject(object).dragging === true;
    },
    cancel(object) {
      const target = requireObject(object);
      invoke(target, ["dragEnd"]);
      target.dragging = false;
      return object;
    },
    setAxis(object, axis = "both") {
      requireObject(object).dragAxis = axis;
      return object;
    },
    setBounds(object, x, y, width, height) {
      requireObject(object).dragBounds = { x: finiteNumber(x), y: finiteNumber(y), width: Math.max(0, finiteNumber(width)), height: Math.max(0, finiteNumber(height)) };
      return object;
    },
    setSnap(object, x, y = x) {
      requireObject(object).dragSnap = { x: Math.max(0, finiteNumber(x)), y: Math.max(0, finiteNumber(y)) };
      return object;
    }
  };
}
function createUiModule() {
  return {
    setEnabled(object, enabled = true) {
      const target = requireObject(object);
      target.isEnable = enabled === true;
      target.enabled = enabled === true;
      return object;
    },
    isEnabled(object) {
      const target = requireObject(object);
      return target.isEnable !== false && target.enabled !== false;
    },
    add(object, child, z) {
      requireObject(object).addChild?.(requireObject(child, "child"), z);
      return child;
    },
    remove(object, child) {
      return requireObject(object).removeChild?.(requireObject(child, "child")) ?? false;
    },
    find(object, name) {
      const target = requireObject(object);
      return target.getChildByName?.(String(name)) ?? (target.children ?? []).find((child) => child?.name === String(name)) ?? null;
    },
    count(object) {
      return requireObject(object).children?.length ?? 0;
    },
    clear(object) {
      const target = requireObject(object);
      for (const child of [...target.children ?? []]) {
        if (typeof target.removeChildNow === "function") target.removeChildNow(child);
        else target.removeChild?.(child);
      }
      return object;
    }
  };
}
function createSliderModule() {
  const watchers = /* @__PURE__ */ new WeakMap();
  const bridgedButtons = /* @__PURE__ */ new WeakSet();
  const ensureEnabledBridge = (target) => {
    const button = target.sliderButton;
    if (!button || bridgedButtons.has(button)) return;
    bridgedButtons.add(button);
    for (const method of ["dragStart", "dragMove"]) {
      const original = button[method];
      if (typeof original !== "function") continue;
      button[method] = function(...args) {
        if (target.sliderEnabled === false) return false;
        return original.apply(this, args);
      };
    }
  };
  const ensureWatcherBridge = (target) => {
    if (watchers.has(target)) return watchers.get(target);
    const callbacks = /* @__PURE__ */ new Set();
    watchers.set(target, callbacks);
    const setter = target.setValueInternal;
    if (typeof setter === "function") {
      target.setValueInternal = function(...args) {
        const previous = this.value ?? this._value;
        const result = setter.apply(this, args);
        const next = this.value ?? this._value;
        if (next !== previous) callbacks.forEach((callback) => callback(next, previous));
        return result;
      };
    }
    return callbacks;
  };
  return {
    setValue(object, value) {
      const target = requireObject(object);
      if (typeof target.setValueInternal === "function") target.setValueInternal(finiteNumber(value));
      else target.value = finiteNumber(value);
      return object;
    },
    value(object) {
      return finiteNumber(requireObject(object).value ?? object._value);
    },
    setRange(object, min, max) {
      const target = requireObject(object);
      target._minValue = finiteNumber(min);
      target._maxValue = Math.max(target._minValue, finiteNumber(max));
      this.setValue(target, target._value);
      return object;
    },
    percent(object) {
      const target = requireObject(object);
      const range = finiteNumber(target._maxValue) - finiteNumber(target._minValue);
      return range === 0 ? 0 : clamp((finiteNumber(target.value ?? target._value) - finiteNumber(target._minValue)) / range, 0, 1);
    },
    setEnabled(object, enabled = true) {
      const target = requireObject(object);
      ensureEnabledBridge(target);
      target.sliderEnabled = enabled === true;
      if (target.sliderButton) {
        target.sliderButton.isEnable = enabled === true;
        if (!enabled) {
          target.sliderButton.dragging = false;
        }
      }
      return object;
    },
    onChange(object, callback) {
      const target = requireObject(object);
      requireFunction(callback);
      ensureWatcherBridge(target).add(callback);
      return callback;
    }
  };
}
function createTrailModule() {
  return {
    setTarget(object, target) {
      requireObject(object).target = requireObject(target, "target");
      return object;
    },
    addPoint(object, x, y) {
      const target = requireObject(object);
      target.addPoint?.(finiteNumber(x), finiteNumber(y));
      return object;
    },
    clear(object) {
      requireObject(object).clear?.();
      return object;
    },
    configure(object, property, value) {
      const target = requireObject(object);
      target[property] = Math.max(0, finiteNumber(value));
      return object;
    },
    pointCount(object) {
      return requireObject(object)._points?.length ?? object.points?.length ?? 0;
    }
  };
}
function createLightModule() {
  return {
    setColor(object, color) {
      const target = requireObject(object);
      if (typeof target.color?.parseCSS === "function") target.color.parseCSS(String(color));
      else target.color = String(color);
      return this.refresh(target);
    },
    setRadius(object, x, y = x) {
      const target = requireObject(object);
      target.radiusX = Math.max(0, finiteNumber(x));
      target.radiusY = Math.max(0, finiteNumber(y));
      return this.refresh(target);
    },
    setProperty(object, property, value) {
      const target = requireObject(object);
      const destination = property in (target.gradientSettings ?? {}) ? target.gradientSettings : target;
      destination[property] = typeof value === "number" ? finiteNumber(value) : value;
      return this.refresh(target);
    },
    refresh(object) {
      const target = requireObject(object);
      invoke(target, ["refreshLightGradient", "refreshGradient", "createGradient"]);
      target.isDirty = true;
      return object;
    }
  };
}
function createParticleEmitterModule() {
  return {
    burst(object, total) {
      requireObject(object).burstParticles?.(Math.max(0, Math.trunc(finiteNumber(total))));
      return object;
    },
    stream(object, duration) {
      requireObject(object).streamParticles?.(Math.max(0, finiteNumber(duration)));
      return object;
    },
    stop(object) {
      requireObject(object).stopStream?.();
      return object;
    },
    add(object, count) {
      requireObject(object).addParticles?.(Math.max(0, Math.trunc(finiteNumber(count))));
      return object;
    },
    reset(object) {
      requireObject(object).reset?.();
      return object;
    },
    isRunning(object) {
      const target = requireObject(object);
      return target.isRunning?.() === true || target._stream === true;
    }
  };
}
function createAudioSourceModule() {
  return {
    control(object, action) {
      const target = requireObject(object);
      const methods = { play: ["playAudio", "play"], stop: ["stopAudio", "stop"], pause: ["pauseAudio", "pause"], resume: ["resumeAudio", "resume"], mute: ["muteAudio", "mute"], unmute: ["unmuteAudio", "unmute"] };
      invoke(target, methods[action] ?? []);
      return object;
    },
    setProperty(object, property, value) {
      const target = requireObject(object);
      target[property] = property === "audioVolume" ? clamp(finiteNumber(value, 1), 0, 1) : finiteNumber(value);
      target.applyAudioSettings?.();
      return object;
    },
    status(object, kind = "playing") {
      const target = requireObject(object);
      return kind === "muted" ? target.isAudioMuted === true : kind === "paused" ? target.isAudioPaused === true : target.isAudioPlaying === true;
    },
    setPosition(object, x, y, z = 0) {
      const target = requireObject(object);
      if (typeof target.setSoundPosition === "function") target.setSoundPosition(finiteNumber(x), finiteNumber(y), finiteNumber(z));
      else setVector(target.soundPosition ?? target.pos, finiteNumber(x), finiteNumber(y));
      return object;
    },
    setSpatial(object, property, value) {
      requireObject(object)[property] = finiteNumber(value);
      return object;
    }
  };
}
function createSprite25Module() {
  return {
    setLightingEnabled(object, enabled = true) {
      const target = targetOf(requireObject(object));
      target.lightingEnabled = enabled === true;
      if (target.lightShader) target.lightShader.enabled = enabled === true;
      return object;
    },
    setLightHeight(object, height) {
      const target = targetOf(requireObject(object));
      target.lightHeight = finiteNumber(height);
      target.lightShader?.setUniform?.("uHeight", target.lightHeight);
      return object;
    }
  };
}

// packages/melon-runtime/src/particle/particle-values.js
var PARTICLE_VALUE_MODES = Object.freeze([
  "constant",
  "randomBetweenConstants",
  "curve",
  "randomBetweenCurves"
]);
var PARTICLE_VALUE_TYPES = Object.freeze([
  "scalar",
  "vector2",
  "angle",
  "color",
  "boolean",
  "probability"
]);
var CURVE_INTERPOLATIONS = Object.freeze(["constant", "linear", "cubic"]);
var CURVE_TIME_POLICIES = Object.freeze(["clamp", "loop", "ping-pong"]);
var GRADIENT_COLOR_SPACE = "linear-rgb";
var INTERPOLATION_CODES = Object.freeze({ constant: 0, linear: 1, cubic: 2 });
var hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}
function cloneJson(value) {
  if (Array.isArray(value)) return value.map(cloneJson);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, cloneJson(child)]));
  }
  return value;
}
function diagnostic(code, path, message, details = {}) {
  return { code, path, message, severity: "error", details };
}
function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}
function clamp2(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}
function clamp01(value) {
  return clamp2(value, 0, 1);
}
function positiveInteger(value, fallback) {
  return Number.isInteger(value) && value >= 2 ? value : fallback;
}
function throwDiagnostics(errors, message) {
  if (errors.length > 0) throw new ParticleValueError(message, errors);
}
var ParticleValueError = class extends Error {
  constructor(message, diagnostics) {
    super(message);
    this.name = "ParticleValueError";
    this.code = diagnostics?.[0]?.code ?? "APS_VALUE_ERROR";
    this.diagnostics = diagnostics ?? [];
  }
};
function validateCurveDefinition(curve2, path = "$.curve") {
  const errors = [];
  if (!curve2 || typeof curve2 !== "object" || Array.isArray(curve2)) {
    errors.push(diagnostic("APS_CURVE_INVALID_TYPE", path, "Curve must be an object."));
    return { valid: false, errors };
  }
  if (typeof curve2.id !== "string" || !curve2.id) {
    errors.push(diagnostic("APS_CURVE_ID_REQUIRED", `${path}.id`, "Curve requires a stable ID."));
  }
  if (hasOwn(curve2, "multiplier") && !isFiniteNumber(curve2.multiplier)) {
    errors.push(diagnostic("APS_CURVE_NON_FINITE", `${path}.multiplier`, "Curve multiplier must be finite."));
  }
  if (hasOwn(curve2, "timePolicy") && !CURVE_TIME_POLICIES.includes(curve2.timePolicy)) {
    errors.push(diagnostic(
      "APS_CURVE_INVALID_POLICY",
      `${path}.timePolicy`,
      `Curve timePolicy must be one of ${CURVE_TIME_POLICIES.join(", ")}.`
    ));
  }
  if (hasOwn(curve2, "interpolation") && !CURVE_INTERPOLATIONS.includes(curve2.interpolation)) {
    errors.push(diagnostic(
      "APS_CURVE_INVALID_INTERPOLATION",
      `${path}.interpolation`,
      `Curve interpolation must be one of ${CURVE_INTERPOLATIONS.join(", ")}.`
    ));
  }
  if (hasOwn(curve2, "valueClamp")) {
    const valueClamp = curve2.valueClamp;
    if (!valueClamp || typeof valueClamp !== "object" || Array.isArray(valueClamp)) {
      errors.push(diagnostic("APS_CURVE_INVALID_CLAMP", `${path}.valueClamp`, "valueClamp must be an object."));
    } else {
      if (hasOwn(valueClamp, "enabled") && typeof valueClamp.enabled !== "boolean") {
        errors.push(diagnostic("APS_CURVE_INVALID_CLAMP", `${path}.valueClamp.enabled`, "valueClamp.enabled must be boolean."));
      }
      for (const key of ["min", "max"]) {
        if (hasOwn(valueClamp, key) && !isFiniteNumber(valueClamp[key])) {
          errors.push(diagnostic("APS_CURVE_NON_FINITE", `${path}.valueClamp.${key}`, `valueClamp.${key} must be finite.`));
        }
      }
      if (isFiniteNumber(valueClamp.min) && isFiniteNumber(valueClamp.max) && valueClamp.min > valueClamp.max) {
        errors.push(diagnostic("APS_CURVE_INVALID_CLAMP", `${path}.valueClamp`, "valueClamp.min cannot exceed valueClamp.max."));
      }
    }
  }
  if (!hasOwn(curve2, "keys")) return { valid: errors.length === 0, errors };
  if (!Array.isArray(curve2.keys)) {
    errors.push(diagnostic("APS_CURVE_INVALID_KEYS", `${path}.keys`, "Curve keys must be an array."));
    return { valid: false, errors };
  }
  curve2.keys.forEach((key, index) => {
    const keyPath = `${path}.keys[${index}]`;
    if (!key || typeof key !== "object" || Array.isArray(key)) {
      errors.push(diagnostic("APS_CURVE_INVALID_KEY", keyPath, "Curve key must be an object."));
      return;
    }
    for (const field of ["time", "value"]) {
      if (!isFiniteNumber(key[field])) {
        errors.push(diagnostic("APS_CURVE_NON_FINITE", `${keyPath}.${field}`, `Curve key ${field} must be finite.`));
      }
    }
    if (isFiniteNumber(key.time) && (key.time < 0 || key.time > 1)) {
      errors.push(diagnostic("APS_CURVE_INVALID_TIME", `${keyPath}.time`, "Curve key time must be in normalized range 0..1."));
    }
    for (const field of ["inTangent", "outTangent"]) {
      if (hasOwn(key, field) && !isFiniteNumber(key[field])) {
        errors.push(diagnostic("APS_CURVE_NON_FINITE", `${keyPath}.${field}`, `Curve key ${field} must be finite.`));
      }
    }
    if (hasOwn(key, "interpolation") && !CURVE_INTERPOLATIONS.includes(key.interpolation)) {
      errors.push(diagnostic(
        "APS_CURVE_INVALID_INTERPOLATION",
        `${keyPath}.interpolation`,
        `Curve key interpolation must be one of ${CURVE_INTERPOLATIONS.join(", ")}.`
      ));
    }
  });
  return { valid: errors.length === 0, errors };
}
function stableUniqueKeys(keys) {
  const sorted = keys.map((key, index) => ({ ...key, sourceIndex: index })).sort((left, right) => left.time - right.time || left.sourceIndex - right.sourceIndex);
  const unique = [];
  for (const key of sorted) {
    const previous = unique[unique.length - 1];
    if (previous && previous.time === key.time) unique[unique.length - 1] = key;
    else unique.push(key);
  }
  return unique;
}
function normalizeTime(time, start, end, policy) {
  if (start === end) return start;
  if (policy === "clamp") return clamp2(time, start, end);
  const length = end - start;
  const offset = ((time - start) % length + length) % length;
  if (policy === "loop") return start + offset;
  const doubled = length * 2;
  const pingOffset = ((time - start) % doubled + doubled) % doubled;
  return pingOffset <= length ? start + pingOffset : end - (pingOffset - length);
}
function findSegment(times, time) {
  let low = 0;
  let high = times.length - 1;
  while (low + 1 < high) {
    const middle = low + high >>> 1;
    if (times[middle] <= time) low = middle;
    else high = middle;
  }
  return low;
}
function applyValueClamp(value, compiled) {
  if (!compiled.valueClampEnabled) return value;
  return clamp2(value, compiled.valueClampMin, compiled.valueClampMax);
}
function evaluateCurveExact(compiled, rawTime) {
  const count = compiled.times.length;
  if (count === 0) return applyValueClamp(0, compiled);
  if (count === 1) return applyValueClamp(compiled.values[0] * compiled.multiplier, compiled);
  const time = normalizeTime(rawTime, compiled.times[0], compiled.times[count - 1], compiled.timePolicy);
  if (time <= compiled.times[0]) return applyValueClamp(compiled.values[0] * compiled.multiplier, compiled);
  if (time >= compiled.times[count - 1]) return applyValueClamp(compiled.values[count - 1] * compiled.multiplier, compiled);
  const index = findSegment(compiled.times, time);
  const startTime = compiled.times[index];
  const endTime = compiled.times[index + 1];
  const duration = endTime - startTime;
  const amount = duration === 0 ? 1 : (time - startTime) / duration;
  const startValue = compiled.values[index];
  const endValue = compiled.values[index + 1];
  let value;
  if (compiled.interpolations[index] === INTERPOLATION_CODES.constant) {
    value = startValue;
  } else if (compiled.interpolations[index] === INTERPOLATION_CODES.cubic) {
    const amount2 = amount * amount;
    const amount3 = amount2 * amount;
    const h00 = 2 * amount3 - 3 * amount2 + 1;
    const h10 = amount3 - 2 * amount2 + amount;
    const h01 = -2 * amount3 + 3 * amount2;
    const h11 = amount3 - amount2;
    value = h00 * startValue + h10 * duration * compiled.outTangents[index] + h01 * endValue + h11 * duration * compiled.inTangents[index + 1];
  } else {
    value = startValue + (endValue - startValue) * amount;
  }
  return applyValueClamp(value * compiled.multiplier, compiled);
}
function buildCurveLut(compiled, size) {
  const count = compiled.times.length;
  if (count === 0) return { start: 0, end: 1, values: new Float64Array(size) };
  const start = compiled.times[0];
  const end = compiled.times[count - 1];
  const values = new Float64Array(size);
  for (let index = 0; index < size; index += 1) {
    const amount = size === 1 ? 0 : index / (size - 1);
    values[index] = evaluateCurveExact(compiled, start + (end - start) * amount);
  }
  return { start, end, values };
}
function compileCurve(curve2, options = {}) {
  const validation = validateCurveDefinition(curve2);
  throwDiagnostics(validation.errors, "Curve validation failed.");
  const keys = stableUniqueKeys(curve2.keys ?? []);
  const count = keys.length;
  const times = new Float64Array(count);
  const values = new Float64Array(count);
  const inTangents = new Float64Array(count);
  const outTangents = new Float64Array(count);
  const interpolations = new Uint8Array(count);
  const defaultInterpolation = curve2.interpolation ?? "linear";
  for (let index = 0; index < count; index += 1) {
    const key = keys[index];
    times[index] = key.time;
    values[index] = key.value;
    const previous = keys[Math.max(0, index - 1)];
    const next = keys[Math.min(count - 1, index + 1)];
    const tangentDuration = next.time - previous.time;
    const automaticTangent = tangentDuration === 0 ? 0 : (next.value - previous.value) / tangentDuration;
    inTangents[index] = key.inTangent ?? automaticTangent;
    outTangents[index] = key.outTangent ?? automaticTangent;
    interpolations[index] = INTERPOLATION_CODES[key.interpolation ?? defaultInterpolation];
  }
  const valueClamp = curve2.valueClamp ?? {};
  const compiled = {
    kind: "particle-curve-compiled",
    id: curve2.id,
    times,
    values,
    inTangents,
    outTangents,
    interpolations,
    multiplier: curve2.multiplier ?? 1,
    timePolicy: curve2.timePolicy ?? "clamp",
    valueClampEnabled: valueClamp.enabled === true,
    valueClampMin: valueClamp.min ?? Number.NEGATIVE_INFINITY,
    valueClampMax: valueClamp.max ?? Number.POSITIVE_INFINITY,
    lut: null
  };
  const lutSize = options.lutSize === 0 ? 0 : positiveInteger(options.lutSize, 0);
  if (lutSize >= 2) compiled.lut = buildCurveLut(compiled, lutSize);
  return compiled;
}
function evaluateCompiledCurve(compiled, rawTime) {
  if (!compiled?.lut || compiled.lut.values.length < 2 || compiled.lut.start === compiled.lut.end) {
    return evaluateCurveExact(compiled, rawTime);
  }
  const time = normalizeTime(rawTime, compiled.lut.start, compiled.lut.end, compiled.timePolicy);
  const position = (time - compiled.lut.start) / (compiled.lut.end - compiled.lut.start) * (compiled.lut.values.length - 1);
  const left = clamp2(Math.floor(position), 0, compiled.lut.values.length - 1);
  const right = Math.min(left + 1, compiled.lut.values.length - 1);
  const amount = position - left;
  return compiled.lut.values[left] + (compiled.lut.values[right] - compiled.lut.values[left]) * amount;
}
function validateColor(color, path, errors) {
  if (!Array.isArray(color) || color.length !== 3 && color.length !== 4) {
    errors.push(diagnostic("APS_GRADIENT_INVALID_COLOR", path, "Color must be [r,g,b] or [r,g,b,a]."));
    return;
  }
  color.forEach((channel, index) => {
    if (!isFiniteNumber(channel) || channel < 0 || channel > 1) {
      errors.push(diagnostic(
        "APS_GRADIENT_INVALID_COLOR",
        `${path}[${index}]`,
        "Color channels must be finite values in range 0..1."
      ));
    }
  });
}
function validateGradientDefinition(gradient2, path = "$.gradient") {
  const errors = [];
  if (!gradient2 || typeof gradient2 !== "object" || Array.isArray(gradient2)) {
    errors.push(diagnostic("APS_GRADIENT_INVALID_TYPE", path, "Gradient must be an object."));
    return { valid: false, errors };
  }
  if (typeof gradient2.id !== "string" || !gradient2.id) {
    errors.push(diagnostic("APS_GRADIENT_ID_REQUIRED", `${path}.id`, "Gradient requires a stable ID."));
  }
  if (hasOwn(gradient2, "colorSpace") && !["srgb", "linear"].includes(gradient2.colorSpace)) {
    errors.push(diagnostic("APS_GRADIENT_INVALID_COLOR_SPACE", `${path}.colorSpace`, "colorSpace must be srgb or linear."));
  }
  for (const [key, valueName] of [["colorKeys", "color"], ["alphaKeys", "alpha"]]) {
    const keys = gradient2[key] ?? [];
    if (!Array.isArray(keys)) {
      errors.push(diagnostic("APS_GRADIENT_INVALID_KEYS", `${path}.${key}`, `${key} must be an array.`));
      continue;
    }
    keys.forEach((entry, index) => {
      const keyPath = `${path}.${key}[${index}]`;
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        errors.push(diagnostic("APS_GRADIENT_INVALID_KEY", keyPath, "Gradient key must be an object."));
        return;
      }
      if (!isFiniteNumber(entry.time)) {
        errors.push(diagnostic("APS_GRADIENT_NON_FINITE", `${keyPath}.time`, "Gradient key time must be finite."));
      } else if (entry.time < 0 || entry.time > 1) {
        errors.push(diagnostic("APS_GRADIENT_INVALID_TIME", `${keyPath}.time`, "Gradient key time must be in normalized range 0..1."));
      }
      if (valueName === "color") validateColor(entry.color, `${keyPath}.color`, errors);
      else if (!isFiniteNumber(entry.alpha) || entry.alpha < 0 || entry.alpha > 1) {
        errors.push(diagnostic("APS_GRADIENT_INVALID_ALPHA", `${keyPath}.alpha`, "Alpha must be finite and in range 0..1."));
      }
    });
  }
  return { valid: errors.length === 0, errors };
}
function srgbChannelToLinear(channel) {
  const value = clamp01(channel);
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}
function compileColorKeys(keys, colorSpace) {
  const unique = stableUniqueKeys(keys ?? []);
  const times = new Float64Array(unique.length);
  const colors = new Float64Array(unique.length * 3);
  unique.forEach((key, index) => {
    times[index] = key.time;
    for (let channel = 0; channel < 3; channel += 1) {
      const value = key.color[channel];
      colors[index * 3 + channel] = colorSpace === "linear" ? value : srgbChannelToLinear(value);
    }
  });
  return { times, colors };
}
function compileAlphaKeys(keys) {
  const unique = stableUniqueKeys(keys ?? []);
  const times = new Float64Array(unique.length);
  const values = new Float64Array(unique.length);
  unique.forEach((key, index) => {
    times[index] = key.time;
    values[index] = key.alpha;
  });
  return { times, values };
}
function evaluateScalarKeys(times, values, time, fallback) {
  const count = times.length;
  if (count === 0) return fallback;
  if (count === 1 || time <= times[0]) return values[0];
  if (time >= times[count - 1]) return values[count - 1];
  const index = findSegment(times, time);
  const amount = (time - times[index]) / (times[index + 1] - times[index]);
  return values[index] + (values[index + 1] - values[index]) * amount;
}
function evaluateGradientExact(compiled, rawTime, out) {
  const time = clamp01(rawTime);
  const colorCount = compiled.colorTimes.length;
  if (colorCount === 0) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  } else if (colorCount === 1 || time <= compiled.colorTimes[0]) {
    out[0] = compiled.colors[0];
    out[1] = compiled.colors[1];
    out[2] = compiled.colors[2];
  } else if (time >= compiled.colorTimes[colorCount - 1]) {
    const offset = (colorCount - 1) * 3;
    out[0] = compiled.colors[offset];
    out[1] = compiled.colors[offset + 1];
    out[2] = compiled.colors[offset + 2];
  } else {
    const index = findSegment(compiled.colorTimes, time);
    const amount = (time - compiled.colorTimes[index]) / (compiled.colorTimes[index + 1] - compiled.colorTimes[index]);
    const left = index * 3;
    const right = left + 3;
    out[0] = compiled.colors[left] + (compiled.colors[right] - compiled.colors[left]) * amount;
    out[1] = compiled.colors[left + 1] + (compiled.colors[right + 1] - compiled.colors[left + 1]) * amount;
    out[2] = compiled.colors[left + 2] + (compiled.colors[right + 2] - compiled.colors[left + 2]) * amount;
  }
  out[3] = evaluateScalarKeys(compiled.alphaTimes, compiled.alphas, time, colorCount === 0 ? 0 : 1);
  return out;
}
function buildGradientLut(compiled, size) {
  const values = new Float64Array(size * 4);
  const scratch = new Float64Array(4);
  for (let index = 0; index < size; index += 1) {
    evaluateGradientExact(compiled, index / (size - 1), scratch);
    values.set(scratch, index * 4);
  }
  return values;
}
function compileGradient(gradient2, options = {}) {
  const validation = validateGradientDefinition(gradient2);
  throwDiagnostics(validation.errors, "Gradient validation failed.");
  const colorSpace = gradient2.colorSpace ?? "srgb";
  const colors = compileColorKeys(gradient2.colorKeys ?? [], colorSpace);
  const alphas = compileAlphaKeys(gradient2.alphaKeys ?? []);
  const compiled = {
    kind: "particle-gradient-compiled",
    id: gradient2.id,
    colorSpace: GRADIENT_COLOR_SPACE,
    colorTimes: colors.times,
    colors: colors.colors,
    alphaTimes: alphas.times,
    alphas: alphas.values,
    lut: null
  };
  const lutSize = options.lutSize === 0 ? 0 : positiveInteger(options.lutSize, 0);
  if (lutSize >= 2) compiled.lut = buildGradientLut(compiled, lutSize);
  return compiled;
}
function evaluateCompiledGradient(compiled, rawTime, output = new Float64Array(4)) {
  if (!compiled.lut || compiled.lut.length < 8) return evaluateGradientExact(compiled, rawTime, output);
  const position = clamp01(rawTime) * (compiled.lut.length / 4 - 1);
  const left = Math.floor(position);
  const right = Math.min(left + 1, compiled.lut.length / 4 - 1);
  const amount = position - left;
  for (let channel = 0; channel < 4; channel += 1) {
    const leftValue = compiled.lut[left * 4 + channel];
    output[channel] = leftValue + (compiled.lut[right * 4 + channel] - leftValue) * amount;
  }
  return output;
}
function resolveRandom(random2) {
  let value;
  if (typeof random2 === "number") value = random2;
  else if (typeof random2 === "function") value = random2();
  else if (typeof random2?.nextFloat === "function") value = random2.nextFloat();
  else value = 0;
  return clamp2(value, 0, 1 - Number.EPSILON);
}
function resolveCurve(curves, id, path) {
  const curve2 = curves?.get?.(id) ?? curves?.[id];
  if (!curve2) {
    throw new ParticleValueError(`Unknown curve '${id}'.`, [
      diagnostic("APS_VALUE_REFERENCE_MISSING", path, `Unknown curve '${id}'.`, { id, kind: "curve" })
    ]);
  }
  return curve2.kind === "particle-curve-compiled" ? curve2 : compileCurve(curve2);
}
function resolveGradient(gradients, id, path) {
  const gradient2 = gradients?.get?.(id) ?? gradients?.[id];
  if (!gradient2) {
    throw new ParticleValueError(`Unknown gradient '${id}'.`, [
      diagnostic("APS_VALUE_REFERENCE_MISSING", path, `Unknown gradient '${id}'.`, { id, kind: "gradient" })
    ]);
  }
  return gradient2.kind === "particle-gradient-compiled" ? gradient2 : compileGradient(gradient2);
}
function numericValue(value, path) {
  if (!isFiniteNumber(value)) {
    throw new ParticleValueError(`Expected finite number at ${path}.`, [
      diagnostic("APS_VALUE_NON_FINITE", path, `Expected finite number at ${path}.`)
    ]);
  }
  return value;
}
function compileNumericValue(value, context, path) {
  const mode = value.mode ?? "constant";
  if (!PARTICLE_VALUE_MODES.includes(mode)) {
    throw new ParticleValueError(`Unknown value mode '${mode}'.`, [
      diagnostic("APS_VALUE_INVALID_MODE", `${path}.mode`, `Unknown value mode '${mode}'.`)
    ]);
  }
  const compiled = { type: value.type ?? "scalar", mode };
  if (mode === "constant") compiled.value = numericValue(value.value, `${path}.value`);
  if (mode === "randomBetweenConstants") {
    compiled.min = numericValue(value.min, `${path}.min`);
    compiled.max = numericValue(value.max, `${path}.max`);
  }
  if (mode === "curve") compiled.curve = resolveCurve(context.curves, value.curveId, `${path}.curveId`);
  if (mode === "randomBetweenCurves") {
    compiled.minCurve = resolveCurve(context.curves, value.minCurveId, `${path}.minCurveId`);
    compiled.maxCurve = resolveCurve(context.curves, value.maxCurveId, `${path}.maxCurveId`);
  }
  return compiled;
}
function vectorFrom(value, path) {
  const x = Array.isArray(value) ? value[0] : value?.x;
  const y = Array.isArray(value) ? value[1] : value?.y;
  return [numericValue(x, `${path}.x`), numericValue(y, `${path}.y`)];
}
function compileVectorValue(value, context, path) {
  if (value.separateAxes === true) {
    return {
      type: "vector2",
      mode: "separateAxes",
      x: compileNumericValue(value.x, context, `${path}.x`),
      y: compileNumericValue(value.y, context, `${path}.y`)
    };
  }
  const mode = value.mode ?? "constant";
  if (!(/* @__PURE__ */ new Set(["constant", "randomBetweenConstants"])).has(mode)) {
    throw new ParticleValueError("Vector curve modes require separateAxes.", [
      diagnostic("APS_VALUE_VECTOR_AXES_REQUIRED", path, "Vector curve modes require separateAxes: true.")
    ]);
  }
  const compiled = { type: "vector2", mode };
  if (mode === "constant") compiled.value = vectorFrom(value.value, `${path}.value`);
  else {
    compiled.min = vectorFrom(value.min, `${path}.min`);
    compiled.max = vectorFrom(value.max, `${path}.max`);
  }
  return compiled;
}
function compileColorValue(value, context, path) {
  const mode = value.mode ?? "constant";
  if (hasOwn(value, "colorSpace") && !["srgb", "linear"].includes(value.colorSpace)) {
    throw new ParticleValueError(`Unsupported color space '${value.colorSpace}'.`, [
      diagnostic("APS_GRADIENT_INVALID_COLOR_SPACE", `${path}.colorSpace`, "colorSpace must be srgb or linear.")
    ]);
  }
  const compiled = { type: "color", mode };
  const compileColor2 = (color, colorPath) => {
    const errors = [];
    validateColor(color, colorPath, errors);
    throwDiagnostics(errors, "Color value validation failed.");
    const output = color.length === 4 ? [...color] : [...color, 1];
    if ((value.colorSpace ?? "srgb") === "srgb") {
      output[0] = srgbChannelToLinear(output[0]);
      output[1] = srgbChannelToLinear(output[1]);
      output[2] = srgbChannelToLinear(output[2]);
    }
    return output;
  };
  if (mode === "constant") {
    compiled.value = compileColor2(value.value, `${path}.value`);
  } else if (mode === "randomBetweenConstants") {
    compiled.min = compileColor2(value.min, `${path}.min`);
    compiled.max = compileColor2(value.max, `${path}.max`);
  } else if (mode === "gradient") {
    compiled.gradient = resolveGradient(context.gradients, value.gradientId, `${path}.gradientId`);
  } else if (mode === "randomBetweenGradients") {
    compiled.minGradient = resolveGradient(context.gradients, value.minGradientId, `${path}.minGradientId`);
    compiled.maxGradient = resolveGradient(context.gradients, value.maxGradientId, `${path}.maxGradientId`);
    compiled.scratch = new Float64Array(4);
  } else {
    throw new ParticleValueError(`Unsupported color mode '${mode}'.`, [
      diagnostic("APS_VALUE_INVALID_MODE", `${path}.mode`, `Unsupported color mode '${mode}'.`)
    ]);
  }
  return compiled;
}
function compileParticleValue(value, context = {}, path = "$.value") {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ParticleValueError("Particle value must be an object.", [
      diagnostic("APS_VALUE_INVALID_TYPE", path, "Particle value must be an object.")
    ]);
  }
  const type = value.type ?? "scalar";
  if (!PARTICLE_VALUE_TYPES.includes(type)) {
    throw new ParticleValueError(`Unknown particle value type '${type}'.`, [
      diagnostic("APS_VALUE_INVALID_TYPE", `${path}.type`, `Unknown particle value type '${type}'.`)
    ]);
  }
  if (type === "vector2") return compileVectorValue(value, context, path);
  if (type === "color") return compileColorValue(value, context, path);
  if (type === "boolean") {
    if ((value.mode ?? "constant") !== "constant" || typeof value.value !== "boolean") {
      throw new ParticleValueError("Boolean value requires constant boolean mode.", [
        diagnostic("APS_VALUE_INVALID_BOOLEAN", path, "Boolean value requires constant boolean mode.")
      ]);
    }
    return { type, mode: "constant", value: value.value };
  }
  const compiled = compileNumericValue({ ...value, type }, context, path);
  if (type === "probability") compiled.clampProbability = true;
  return compiled;
}
function evaluateNumericValue(compiled, time, random2) {
  let value;
  if (compiled.mode === "constant") value = compiled.value;
  else if (compiled.mode === "randomBetweenConstants") {
    const amount = resolveRandom(random2);
    value = compiled.min + (compiled.max - compiled.min) * amount;
  } else if (compiled.mode === "curve") value = evaluateCompiledCurve(compiled.curve, time);
  else {
    const amount = resolveRandom(random2);
    const minimum = evaluateCompiledCurve(compiled.minCurve, time);
    value = minimum + (evaluateCompiledCurve(compiled.maxCurve, time) - minimum) * amount;
  }
  return compiled.clampProbability ? clamp01(value) : value;
}
function evaluateParticleValue(compiled, time, random2 = 0, output) {
  if (compiled.type === "boolean") return compiled.value;
  if (compiled.type !== "vector2" && compiled.type !== "color") {
    return evaluateNumericValue(compiled, time, random2);
  }
  if (compiled.type === "vector2") {
    const out2 = output ?? new Float64Array(2);
    if (compiled.mode === "separateAxes") {
      out2[0] = evaluateNumericValue(compiled.x, time, random2);
      out2[1] = evaluateNumericValue(compiled.y, time, random2);
    } else if (compiled.mode === "constant") {
      out2[0] = compiled.value[0];
      out2[1] = compiled.value[1];
    } else {
      const amount = resolveRandom(random2);
      out2[0] = compiled.min[0] + (compiled.max[0] - compiled.min[0]) * amount;
      out2[1] = compiled.min[1] + (compiled.max[1] - compiled.min[1]) * amount;
    }
    return out2;
  }
  const out = output ?? new Float64Array(4);
  if (compiled.mode === "constant") {
    for (let channel = 0; channel < 4; channel += 1) out[channel] = compiled.value[channel];
  } else if (compiled.mode === "randomBetweenConstants") {
    const amount = resolveRandom(random2);
    for (let channel = 0; channel < 4; channel += 1) {
      out[channel] = compiled.min[channel] + (compiled.max[channel] - compiled.min[channel]) * amount;
    }
  } else if (compiled.mode === "gradient") {
    evaluateCompiledGradient(compiled.gradient, time, out);
  } else {
    const minimum = compiled.scratch;
    evaluateCompiledGradient(compiled.minGradient, time, minimum);
    evaluateCompiledGradient(compiled.maxGradient, time, out);
    const amount = resolveRandom(random2);
    for (let channel = 0; channel < 4; channel += 1) {
      out[channel] = minimum[channel] + (out[channel] - minimum[channel]) * amount;
    }
  }
  return out;
}
var CURVE_PRESET_DATA = deepFreeze({
  linear: {
    interpolation: "linear",
    keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }]
  },
  easeIn: {
    interpolation: "cubic",
    keys: [
      { time: 0, value: 0, outTangent: 0 },
      { time: 1, value: 1, inTangent: 2 }
    ]
  },
  easeOut: {
    interpolation: "cubic",
    keys: [
      { time: 0, value: 0, outTangent: 2 },
      { time: 1, value: 1, inTangent: 0 }
    ]
  },
  bell: {
    interpolation: "linear",
    keys: [{ time: 0, value: 0 }, { time: 0.5, value: 1 }, { time: 1, value: 0 }]
  }
});
var GRADIENT_PRESET_DATA = deepFreeze({
  whiteFade: {
    colorSpace: "srgb",
    colorKeys: [{ time: 0, color: [1, 1, 1] }, { time: 1, color: [1, 1, 1] }],
    alphaKeys: [{ time: 0, alpha: 1 }, { time: 1, alpha: 0 }]
  },
  fire: {
    colorSpace: "srgb",
    colorKeys: [
      { time: 0, color: [1, 1, 0.8] },
      { time: 0.5, color: [1, 0.2, 0.02] },
      { time: 1, color: [0.1, 0, 0] }
    ],
    alphaKeys: [{ time: 0, alpha: 1 }, { time: 1, alpha: 0 }]
  }
});
var PARTICLE_CURVE_PRESETS = CURVE_PRESET_DATA;
var PARTICLE_GRADIENT_PRESETS = GRADIENT_PRESET_DATA;
function createParticleCurvePreset(name, id = `curve.preset.${name}`) {
  if (!CURVE_PRESET_DATA[name]) throw new RangeError(`Unknown particle curve preset '${name}'.`);
  return { id, multiplier: 1, timePolicy: "clamp", ...cloneJson(CURVE_PRESET_DATA[name]) };
}
function createParticleGradientPreset(name, id = `gradient.preset.${name}`) {
  if (!GRADIENT_PRESET_DATA[name]) throw new RangeError(`Unknown particle gradient preset '${name}'.`);
  return { id, ...cloneJson(GRADIENT_PRESET_DATA[name]) };
}

// packages/melon-runtime/src/particle/deterministic-random.js
var PARTICLE_RANDOM_ALGORITHM = "xoshiro128ss-v1";
var PARTICLE_RANDOM_SAMPLING = Object.freeze({
  SPAWN: "spawn",
  EVALUATION: "evaluation"
});
var UINT32_RANGE = 4294967296;
function rotateLeft(value, shift) {
  return (value << shift | value >>> 32 - shift) >>> 0;
}
function mix32(value) {
  let mixed = value >>> 0;
  mixed = Math.imul(mixed ^ mixed >>> 16, 569420461);
  mixed = Math.imul(mixed ^ mixed >>> 15, 1935289751);
  return (mixed ^ mixed >>> 15) >>> 0;
}
function hashParticleSeedComponent(value) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("Particle seed component must be finite.");
    return mix32(value >>> 0);
  }
  if (typeof value === "bigint") return mix32(Number(value & 0xFFFFFFFFn));
  if (typeof value === "boolean") return value ? 2654435769 : 2246822507;
  if (value === null || typeof value === "undefined") return 3266489909;
  const text = String(value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    hash = Math.imul(hash ^ code & 255, 16777619);
    hash = Math.imul(hash ^ code >>> 8, 16777619);
  }
  return mix32(hash);
}
function normalizeParticleSeed(seed) {
  if (typeof seed === "number") {
    if (!Number.isFinite(seed)) throw new TypeError("Particle seed must be finite.");
    return seed >>> 0;
  }
  if (typeof seed === "bigint") return Number(seed & 0xFFFFFFFFn) >>> 0;
  return hashParticleSeedComponent(seed);
}
function deriveParticleSeed(parentSeed, ...components) {
  let seed = mix32(normalizeParticleSeed(parentSeed) ^ 2769414579);
  for (let index = 0; index < components.length; index += 1) {
    const componentHash = hashParticleSeedComponent(components[index]);
    seed = mix32(seed ^ componentHash ^ Math.imul(index + 1, 2654435769));
  }
  return seed >>> 0;
}
function createInitialState(seed) {
  let cursor = seed >>> 0;
  const state = new Uint32Array(4);
  for (let index = 0; index < state.length; index += 1) {
    cursor = cursor + 2654435769 >>> 0;
    state[index] = mix32(cursor);
  }
  if ((state[0] | state[1] | state[2] | state[3]) === 0) state[0] = 1;
  return state;
}
function firstFloatForSeed(seed) {
  const stateWordOne = mix32(normalizeParticleSeed(seed) + Math.imul(2, 2654435769) >>> 0);
  const result = Math.imul(rotateLeft(Math.imul(stateWordOne, 5) >>> 0, 7), 9) >>> 0;
  return result / UINT32_RANGE;
}
var ParticleRandom = class _ParticleRandom {
  constructor(seed = 1) {
    this.seed = normalizeParticleSeed(seed);
    this.state = createInitialState(this.seed);
  }
  nextUint32() {
    const state = this.state;
    const result = Math.imul(rotateLeft(Math.imul(state[1], 5) >>> 0, 7), 9) >>> 0;
    const temporary = state[1] << 9 >>> 0;
    state[2] ^= state[0];
    state[3] ^= state[1];
    state[1] ^= state[2];
    state[0] ^= state[3];
    state[2] ^= temporary;
    state[3] = rotateLeft(state[3], 11);
    return result;
  }
  nextFloat() {
    return this.nextUint32() / UINT32_RANGE;
  }
  range(minimum = 0, maximum = 1) {
    if (!Number.isFinite(minimum) || !Number.isFinite(maximum)) {
      throw new TypeError("Particle random range bounds must be finite.");
    }
    return minimum + (maximum - minimum) * this.nextFloat();
  }
  int(minimum, maximum) {
    if (!Number.isInteger(minimum) || !Number.isInteger(maximum) || maximum < minimum) {
      throw new RangeError("Particle random int bounds must be ordered integers.");
    }
    const span = maximum - minimum + 1;
    if (span <= 0 || span > UINT32_RANGE) throw new RangeError("Particle random int range is too large.");
    const limit = UINT32_RANGE - UINT32_RANGE % span;
    let value;
    do
      value = this.nextUint32();
    while (value >= limit);
    return minimum + value % span;
  }
  chance(probability) {
    if (!Number.isFinite(probability)) throw new TypeError("Particle probability must be finite.");
    if (probability <= 0) return false;
    if (probability >= 1) return true;
    return this.nextFloat() < probability;
  }
  fork(...path) {
    return new _ParticleRandom(deriveParticleSeed(this.seed, ...path));
  }
  clone() {
    const clone2 = new _ParticleRandom(this.seed);
    clone2.state.set(this.state);
    return clone2;
  }
  saveState() {
    return {
      algorithm: PARTICLE_RANDOM_ALGORITHM,
      seed: this.seed,
      state: Array.from(this.state)
    };
  }
  restoreState(snapshot2) {
    if (snapshot2?.algorithm !== PARTICLE_RANDOM_ALGORITHM || !Array.isArray(snapshot2.state) || snapshot2.state.length !== 4 || snapshot2.state.some((value) => !Number.isInteger(value) || value < 0 || value > 4294967295)) {
      throw new TypeError("Invalid ParticleRandom state snapshot.");
    }
    this.seed = normalizeParticleSeed(snapshot2.seed);
    this.state.set(snapshot2.state);
    if ((this.state[0] | this.state[1] | this.state[2] | this.state[3]) === 0) {
      throw new TypeError("ParticleRandom state cannot contain four zero words.");
    }
    return this;
  }
};
function createParticleRandom(seed = 1) {
  return new ParticleRandom(seed);
}
var ParticleSeedHierarchy = class _ParticleSeedHierarchy {
  constructor(effectSeed, path = []) {
    this.effectSeed = normalizeParticleSeed(effectSeed);
    this.path = Object.freeze([...path]);
    this.seed = deriveParticleSeed(this.effectSeed, ...this.path);
  }
  system(systemId) {
    return new _ParticleSeedHierarchy(this.effectSeed, [...this.path, "system", systemId]);
  }
  emitter(emitterId) {
    return new _ParticleSeedHierarchy(this.effectSeed, [...this.path, "emitter", emitterId]);
  }
  particle(particleId) {
    return new _ParticleSeedHierarchy(this.effectSeed, [...this.path, "particle", particleId]);
  }
  channel(moduleId, channelId, sampling = PARTICLE_RANDOM_SAMPLING.SPAWN) {
    if (!Object.values(PARTICLE_RANDOM_SAMPLING).includes(sampling)) {
      throw new RangeError(`Unknown particle random sampling mode '${sampling}'.`);
    }
    return new ParticleRandomSampler(
      deriveParticleSeed(this.seed, "module", moduleId, "channel", channelId, sampling),
      sampling
    );
  }
  stream(...path) {
    return new ParticleRandom(deriveParticleSeed(this.seed, ...path));
  }
};
var ParticleRandomSampler = class {
  constructor(seed, sampling = PARTICLE_RANDOM_SAMPLING.SPAWN) {
    this.seed = normalizeParticleSeed(seed);
    this.sampling = sampling;
    this.spawnValue = void 0;
  }
  sample(evaluationIndex = 0) {
    if (this.sampling === PARTICLE_RANDOM_SAMPLING.SPAWN) {
      if (typeof this.spawnValue === "undefined") {
        this.spawnValue = firstFloatForSeed(this.seed);
      }
      return this.spawnValue;
    }
    if (!Number.isInteger(evaluationIndex) || evaluationIndex < 0) {
      throw new RangeError("Particle evaluation sample index must be a non-negative integer.");
    }
    return firstFloatForSeed(deriveParticleSeed(this.seed, "evaluation", evaluationIndex));
  }
  nextFloat(evaluationIndex = 0) {
    return this.sample(evaluationIndex);
  }
  saveState() {
    return {
      algorithm: PARTICLE_RANDOM_ALGORITHM,
      seed: this.seed,
      sampling: this.sampling,
      spawnValue: this.spawnValue
    };
  }
  restoreState(snapshot2) {
    if (snapshot2?.algorithm !== PARTICLE_RANDOM_ALGORITHM || !Object.values(PARTICLE_RANDOM_SAMPLING).includes(snapshot2.sampling) || typeof snapshot2.spawnValue !== "undefined" && (!Number.isFinite(snapshot2.spawnValue) || snapshot2.spawnValue < 0 || snapshot2.spawnValue >= 1)) {
      throw new TypeError("Invalid ParticleRandomSampler state snapshot.");
    }
    this.seed = normalizeParticleSeed(snapshot2.seed);
    this.sampling = snapshot2.sampling;
    this.spawnValue = snapshot2.spawnValue;
    return this;
  }
};
function createParticleSeedHierarchy(effectOrSeed, options = {}) {
  const effect = effectOrSeed && typeof effectOrSeed === "object" ? effectOrSeed : null;
  const seed = effect ? resolveParticleEffectSeed(effect, options) : effectOrSeed;
  return new ParticleSeedHierarchy(seed ?? 1);
}
function resolveParticleEffectSeed(effect, options = {}) {
  if (!effect || typeof effect !== "object") throw new TypeError("Particle effect seed settings are required.");
  if (effect.autoRandomSeed === true) {
    if (options.previewSeedController) return options.previewSeedController.seedForPreview();
    if (typeof options.autoSeed !== "undefined") return normalizeParticleSeed(options.autoSeed);
    throw new Error("autoRandomSeed requires an explicit autoSeed or previewSeedController at the runtime boundary.");
  }
  return normalizeParticleSeed(effect.randomSeed ?? 1);
}
var ParticlePreviewSeedController = class {
  constructor(options = {}) {
    this.seed = normalizeParticleSeed(options.seed ?? 1);
    this.locked = options.locked !== false;
    this.revision = Number.isInteger(options.revision) && options.revision >= 0 ? options.revision : 0;
  }
  lock(seed = this.seed) {
    this.seed = normalizeParticleSeed(seed);
    this.locked = true;
    return this.seed;
  }
  unlock() {
    this.locked = false;
    return this.seed;
  }
  setSeed(seed) {
    this.seed = normalizeParticleSeed(seed);
    return this.seed;
  }
  randomize(entropy = this.seed) {
    this.revision += 1;
    this.seed = deriveParticleSeed(entropy, "preview-randomize", this.revision);
    return this.seed;
  }
  seedForPreview() {
    return this.locked ? this.seed : this.randomize();
  }
  saveState() {
    return { seed: this.seed, locked: this.locked, revision: this.revision };
  }
  restoreState(snapshot2) {
    if (!snapshot2 || typeof snapshot2.locked !== "boolean" || !Number.isInteger(snapshot2.revision) || snapshot2.revision < 0) {
      throw new TypeError("Invalid ParticlePreviewSeedController state snapshot.");
    }
    this.seed = normalizeParticleSeed(snapshot2.seed);
    this.locked = snapshot2.locked;
    this.revision = snapshot2.revision;
    return this;
  }
};
function createParticlePreviewSeedController(options) {
  return new ParticlePreviewSeedController(options);
}

// packages/melon-runtime/src/particle/particle-effect-2d.js
var hasOwn2 = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
var PARTICLE_EFFECT_2D_ASSET_TYPE = "particle-effect-2d";
var PARTICLE_EFFECT_2D_SCHEMA_VERSION = 1;
var PARTICLE_EFFECT_2D_COMPILED_VERSION = 1;
var PARTICLE_EFFECT_2D_LIMITS = Object.freeze({
  maxSourceBytes: 1024 * 1024,
  maxCanonicalBytes: 1024 * 1024,
  maxDepth: 32,
  maxSystems: 64,
  maxEmittersPerSystem: 32,
  maxCurves: 512,
  maxGradients: 512,
  maxDependenciesPerKind: 2048,
  maxSubEmitterLinksPerEmitter: 128
});
var ID_PATTERN = /^[A-Za-z][A-Za-z0-9._:-]{0,127}$/;
var PARTICLE_SHAPE_TYPE_VALUES = /* @__PURE__ */ new Set(["point", "line", "rect", "rectangle", "circle", "ring", "arc", "ellipse", "polygon", "polyline", "path", "capsule", "custom-points", "alpha-mask", "sprite-silhouette", "object-shape", "socket"]);
var MODULE_DEFAULTS = deepFreeze2({
  main: {
    enabled: true,
    maxParticles: 1e3,
    duration: 5,
    looping: true,
    startDelay: 0,
    startLifetime: 1,
    startSpeed: 0,
    startSize: 1,
    startSizeX: 1,
    startSizeY: 1,
    startRotation: 0,
    startColor: [1, 1, 1, 1],
    gravityModifier: 0,
    simulationSpace: "local",
    simulationSpeed: 1,
    scalingMode: "hierarchy",
    playOnAwake: false,
    stopAction: "none",
    overflowPolicy: "reject",
    qualityAmountRatio: 1,
    cullingMode: "simulate"
  },
  emission: {
    enabled: true,
    rateOverTime: 10,
    rateOverDistance: 0,
    rateOverSpeed: 0,
    bursts: [],
    maxSpawnPerFrame: 1024,
    catchUpPolicy: "carry",
    teleportThreshold: 128,
    qualityAmountRatio: 1
  },
  shape: {
    enabled: true,
    type: "point",
    angle: 25,
    radius: 1,
    dimensions: { x: 1, y: 1 },
    length: 1,
    innerRadius: 0,
    arcStart: 0,
    arcRange: 360,
    thickness: 0,
    position: { x: 0, y: 0 },
    rotation: 0,
    scale: { x: 1, y: 1 },
    emitFrom: "area",
    direction: "shape-normal",
    distribution: "random",
    points: [],
    positionJitter: 0,
    directionBlend: 0,
    randomizeDirection: 0
  },
  velocityOverLifetime: {
    enabled: false,
    x: 0,
    y: 0,
    orbital: 0,
    radial: 0,
    tangential: 0,
    speedModifier: 1,
    space: "local",
    composition: "add",
    initialVelocity: { enabled: true, x: 0, y: 0, space: "local", composition: "add" },
    inheritVelocity: { translational: 0, angular: 0 },
    lifetimeByEmitterSpeed: { enabled: false, multiplier: 1, referenceSpeed: 100 },
    limitVelocity: { enabled: false, magnitude: 1e6, x: 1e6, y: 1e6, dampening: 1 },
    alignToVelocity: { enabled: false, trajectoryOffset: 0 }
  },
  forceOverLifetime: {
    enabled: false,
    x: 0,
    y: 0,
    gravity: { x: 0, y: 0 },
    gravityModifier: 1,
    mass: 1,
    linearDrag: 0,
    quadraticDrag: 0,
    linearAcceleration: 0,
    radialAcceleration: 0,
    tangentialAcceleration: 0,
    damping: 0,
    attractorInteraction: 1,
    space: "world",
    composition: "add"
  },
  colorOverLifetime: { enabled: false, gradientId: null, color: [1, 1, 1, 1], speedRange: { min: 0, max: 1 } },
  colorBySpeed: { enabled: false, gradientId: null, color: [1, 1, 1, 1], speedRange: { min: 0, max: 1 } },
  sizeOverLifetime: { enabled: false, curveId: null, value: 1, separateAxes: false, aspectRatio: null, negativeSize: "flip", pivot: { x: 0.5, y: 0.5 } },
  sizeBySpeed: { enabled: false, curveId: null, value: 1, separateAxes: false, speedRange: { min: 0, max: 1 } },
  rotationOverLifetime: { enabled: false, curveId: null, angularVelocity: 0, value: 0, space: "local", orientation: "free", trajectoryOffset: 0 },
  rotationBySpeed: { enabled: false, curveId: null, value: 0, speedRange: { min: 0, max: 1 } },
  noise: {
    enabled: false,
    mode: "curl",
    strength: 0,
    strengthX: 0,
    strengthY: 0,
    frequency: 0.5,
    scrollSpeed: 0,
    octaves: 1,
    scale: 1,
    multiplier: 1,
    damping: 0,
    space: "world",
    perParticlePhase: true,
    influence: { position: 0, velocity: 1, rotation: 0, size: 0 }
  },
  forceFields: { enabled: false, layerMask: 4294967295, maxFieldsPerStep: 64, evaluationInterval: 1, maxSpeed: 1e6 },
  textureSheetAnimation: {
    enabled: false,
    mode: "lifetime",
    textureId: null,
    atlasRegionId: null,
    columns: 1,
    rows: 1,
    frameCount: 1,
    frameRate: 0,
    startFrame: 0,
    cycles: 1,
    loop: true,
    pingPong: false,
    randomStart: false,
    randomRow: false,
    uvPadding: 0,
    frames: [],
    variants: []
  },
  collision: {
    enabled: false,
    mode: "world-bounds",
    collisionLayerIds: [],
    authority: "visual",
    simulation: "swept",
    layerMask: 4294967295,
    particleLayer: 1,
    radiusMultiplier: 0.5,
    bounce: 0,
    friction: 0,
    dampen: 0,
    lifetimeLoss: 0,
    speedLoss: 0,
    killOnContact: false,
    maxCollisions: 1,
    minimumSpeed: 0,
    frameBudget: 4096,
    triggerActions: {}
  },
  subEmitters: { enabled: false, links: [], maximumDepth: 4, eventBudget: 1024, spawnBudget: 256 },
  trails: {
    enabled: false,
    lifetime: 0.5,
    minimumVertexDistance: 1,
    maxPoints: 32,
    smoothing: 0,
    width: 1,
    color: [1, 1, 1, 1],
    appearanceMode: "particle",
    textureMode: "stretch",
    textureTileLength: 64,
    cap: "butt",
    space: "world",
    dieWithParticle: true,
    ribbonGroup: "default"
  },
  lights: {
    enabled: false,
    lightReference: null,
    ratio: 1,
    maxLights: 32,
    inheritColor: true,
    color: [1, 1, 1, 1],
    intensity: 1,
    range: 32,
    renderMask: 4294967295
  },
  customData: { enabled: false, channels: [], flags: {} }
});
var PARTICLE_EFFECT_2D_MODULE_DEFAULTS = MODULE_DEFAULTS;
var DEPENDENCY_KINDS = deepFreeze2({
  textures: "texture",
  atlasRegions: "atlas-region",
  objects: "object",
  shaders: "shader",
  collisionLayers: "collision-layer",
  subEffects: "sub-effect"
});
var TOP_LEVEL_DEFAULTS = deepFreeze2({
  assetType: PARTICLE_EFFECT_2D_ASSET_TYPE,
  schemaVersion: PARTICLE_EFFECT_2D_SCHEMA_VERSION,
  units: { time: "seconds", angle: "degrees", distance: "pixels-or-units" },
  effect: {
    name: "Particle Effect 2D",
    enabled: true,
    duration: 5,
    looping: true,
    autoRandomSeed: false,
    randomSeed: 1,
    simulationSpace: "local"
  },
  systems: [],
  libraries: { curves: [], gradients: [] },
  dependencies: {
    textures: [],
    atlasRegions: [],
    objects: [],
    shaders: [],
    collisionLayers: [],
    subEffects: []
  },
  overrides: { platforms: [], qualities: [] },
  metadata: { tags: [], author: "", description: "" }
});
var SYSTEM_DEFAULTS = deepFreeze2({
  enabled: true,
  emitters: [],
  renderer: {
    enabled: true,
    type: "sprite",
    sortMode: "none",
    blendMode: "normal",
    textureId: null,
    atlasRegionId: null,
    anchor: { x: 0.5, y: 0.5 },
    textureMode: "image",
    gradientTexture: { gradientId: null, mode: "linear", angle: 0 },
    flipX: false,
    flipY: false,
    stretchLength: 1,
    speedScale: 0,
    renderLayer: "default",
    z: 0,
    mask: null,
    clip: null,
    filtering: "linear",
    pixelSnap: false,
    bounds: { mode: "auto", padding: 0 }
  }
});
var MATERIAL_DEFAULTS = deepFreeze2({
  enabled: false,
  shaderId: null,
  required: false,
  uniforms: {}
});
var EMITTER_DEFAULTS = deepFreeze2({
  enabled: true,
  modules: MODULE_DEFAULTS
});
function deepFreeze2(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze2(child);
  return value;
}
function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
function cloneJsonValue(value, seen = /* @__PURE__ */ new Map()) {
  if (!value || typeof value !== "object") return value;
  if (seen.has(value)) return seen.get(value);
  const copy = Array.isArray(value) ? [] : {};
  seen.set(value, copy);
  if (Array.isArray(value)) {
    for (const item of value) copy.push(cloneJsonValue(item, seen));
  } else {
    for (const [key, child] of Object.entries(value)) {
      copy[key] = cloneJsonValue(child, seen);
    }
  }
  return copy;
}
function applyDefaults(input, defaults) {
  const output = isPlainObject(input) ? cloneJsonValue(input) : {};
  for (const [key, defaultValue] of Object.entries(defaults)) {
    if (!hasOwn2(output, key) || typeof output[key] === "undefined") {
      output[key] = cloneJsonValue(defaultValue);
    } else if (isPlainObject(output[key]) && isPlainObject(defaultValue)) {
      output[key] = applyDefaults(output[key], defaultValue);
    }
  }
  return output;
}
function utf8ByteLength(value) {
  return new TextEncoder().encode(value).byteLength;
}
function makeDiagnostic(code, path, message, details = {}) {
  return { code, path, message, severity: "error", details };
}
function typeName(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}
function addTypeError(errors, path, expected, actual) {
  errors.push(makeDiagnostic(
    "APS_SCHEMA_INVALID_TYPE",
    path,
    `Expected ${expected} at ${path}, received ${typeName(actual)}.`,
    { expected, actual: typeName(actual) }
  ));
}
function validateJsonValue(value, path, depth, state) {
  if (depth > state.limits.maxDepth) {
    state.errors.push(makeDiagnostic(
      "APS_SCHEMA_LIMIT_DEPTH",
      path,
      `ParticleEffect2D exceeds maximum nesting depth ${state.limits.maxDepth}.`,
      { limit: state.limits.maxDepth, actual: depth }
    ));
    return;
  }
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      state.errors.push(makeDiagnostic(
        "APS_SCHEMA_NON_JSON_VALUE",
        path,
        `Non-finite number at ${path} is not valid JSON data.`
      ));
    }
    return;
  }
  if (typeof value !== "object") {
    state.errors.push(makeDiagnostic(
      "APS_SCHEMA_NON_JSON_VALUE",
      path,
      `Value at ${path} is not JSON-compatible.`,
      { actual: typeName(value) }
    ));
    return;
  }
  if (state.seen.has(value)) {
    state.errors.push(makeDiagnostic(
      "APS_SCHEMA_NON_JSON_VALUE",
      path,
      `Circular reference at ${path} is not valid JSON data.`
    ));
    return;
  }
  if (!Array.isArray(value) && !isPlainObject(value)) {
    state.errors.push(makeDiagnostic(
      "APS_SCHEMA_NON_JSON_VALUE",
      path,
      `Object at ${path} must be a plain JSON object.`,
      { actual: value.constructor?.name ?? "object" }
    ));
    return;
  }
  state.seen.add(value);
  if (Array.isArray(value)) {
    value.forEach((child, index) => validateJsonValue(child, `${path}[${index}]`, depth + 1, state));
  } else {
    Object.entries(value).forEach(([key, child]) => validateJsonValue(child, `${path}.${key}`, depth + 1, state));
  }
  state.seen.delete(value);
}
function validateId(value, path, errors, registry) {
  if (typeof value !== "string" || !ID_PATTERN.test(value)) {
    errors.push(makeDiagnostic(
      "APS_SCHEMA_INVALID_ID",
      path,
      `Stable ID at ${path} must match ${ID_PATTERN}.`,
      { pattern: ID_PATTERN.source }
    ));
    return false;
  }
  if (registry.has(value)) {
    errors.push(makeDiagnostic(
      "APS_SCHEMA_DUPLICATE_ID",
      path,
      `Stable ID '${value}' is duplicated.`,
      { id: value, firstPath: registry.get(value) }
    ));
    return false;
  }
  registry.set(value, path);
  return true;
}
function validateBoolean(object, key, path, errors) {
  if (hasOwn2(object, key) && typeof object[key] !== "boolean") {
    addTypeError(errors, `${path}.${key}`, "boolean", object[key]);
  }
}
function validateDefaultTypes(object, defaults, path, errors) {
  for (const [key, defaultValue] of Object.entries(defaults)) {
    if (!hasOwn2(object, key) || defaultValue === null) continue;
    const value = object[key];
    const childPath = `${path}.${key}`;
    if (typeof defaultValue === "number") {
      const genericValue = isPlainObject(value) && (hasOwn2(value, "mode") || hasOwn2(value, "type") || value.separateAxes === true);
      if (!genericValue && (typeof value !== "number" || !Number.isFinite(value))) {
        addTypeError(errors, childPath, "finite number", value);
      }
    } else if (typeof defaultValue === "string" || typeof defaultValue === "boolean") {
      if (typeof value !== typeof defaultValue) {
        addTypeError(errors, childPath, typeof defaultValue, value);
      }
    } else if (Array.isArray(defaultValue)) {
      const genericValue = isPlainObject(value) && (hasOwn2(value, "mode") || hasOwn2(value, "type"));
      if (!Array.isArray(value) && !genericValue) addTypeError(errors, childPath, "array", value);
    } else if (isPlainObject(defaultValue)) {
      if (!isPlainObject(value)) {
        addTypeError(errors, childPath, "object", value);
      } else {
        validateDefaultTypes(value, defaultValue, childPath, errors);
      }
    }
  }
}
function validateAdvancedModuleRanges(modules, path, errors) {
  const main = modules.main;
  if (isPlainObject(main)) {
    validateNumber(main, "maxParticles", `${path}.main`, errors, { integer: true, min: 1 });
    for (const key of ["duration", "startDelay", "startLifetime"]) if (typeof main[key] === "number") validateNumber(main, key, `${path}.main`, errors, { min: 0 });
    validateNumber(main, "simulationSpeed", `${path}.main`, errors, { min: 0 });
    validateNumber(main, "qualityAmountRatio", `${path}.main`, errors, { min: 0, max: 1 });
  }
  const emission = modules.emission;
  if (isPlainObject(emission)) {
    for (const key of ["rateOverTime", "rateOverDistance", "rateOverSpeed"]) {
      if (typeof emission[key] === "number") validateNumber(emission, key, `${path}.emission`, errors, { min: 0 });
    }
    validateNumber(emission, "maxSpawnPerFrame", `${path}.emission`, errors, { integer: true, min: 1 });
    validateNumber(emission, "qualityAmountRatio", `${path}.emission`, errors, { min: 0, max: 1 });
    validateNumber(emission, "teleportThreshold", `${path}.emission`, errors, { min: 0 });
    if (Array.isArray(emission.bursts)) {
      emission.bursts.forEach((burst, index) => {
        if (!isPlainObject(burst)) return;
        const burstPath = `${path}.emission.bursts[${index}]`;
        validateNumber(burst, "time", burstPath, errors, { min: 0 });
        validateNumber(burst, "cycles", burstPath, errors, { integer: true, min: 1 });
        validateNumber(burst, "interval", burstPath, errors, { min: 0 });
        validateNumber(burst, "probability", burstPath, errors, { min: 0, max: 1 });
        if (typeof burst.count === "number") validateNumber(burst, "count", burstPath, errors, { min: 0 });
      });
    }
  }
  const force = modules.forceOverLifetime;
  if (isPlainObject(force) && typeof force.mass === "number") validateNumber(force, "mass", `${path}.forceOverLifetime`, errors, { min: Number.EPSILON });
  for (const name of ["colorOverLifetime", "colorBySpeed", "sizeBySpeed", "rotationBySpeed"]) {
    const range = modules[name]?.speedRange;
    if (isPlainObject(range) && Number.isFinite(range.min) && Number.isFinite(range.max) && range.min > range.max) {
      errors.push(makeDiagnostic("APS_SCHEMA_INVALID_VALUE", `${path}.${name}.speedRange`, "speedRange.min cannot exceed speedRange.max."));
    }
  }
  const size = modules.sizeOverLifetime;
  if (isPlainObject(size) && size.aspectRatio !== null && typeof size.aspectRatio !== "undefined") validateNumber(size, "aspectRatio", `${path}.sizeOverLifetime`, errors, { min: Number.EPSILON });
  const shape = modules.shape;
  if (isPlainObject(shape) && typeof shape.type === "string" && !PARTICLE_SHAPE_TYPE_VALUES.has(shape.type)) errors.push(makeDiagnostic("APS_SCHEMA_INVALID_ENUM", `${path}.shape.type`, `Unknown particle shape type '${shape.type}'.`));
  const noise = modules.noise;
  if (isPlainObject(noise)) {
    validateNumber(noise, "frequency", `${path}.noise`, errors, { min: 0 });
    validateNumber(noise, "octaves", `${path}.noise`, errors, { integer: true, min: 1, max: 8 });
    validateNumber(noise, "scale", `${path}.noise`, errors, { min: Number.EPSILON });
    validateNumber(noise, "damping", `${path}.noise`, errors, { min: 0, max: 1 });
  }
  const texture = modules.textureSheetAnimation;
  if (isPlainObject(texture)) {
    for (const key of ["columns", "rows", "frameCount"]) validateNumber(texture, key, `${path}.textureSheetAnimation`, errors, { integer: true, min: 1 });
    validateNumber(texture, "frameRate", `${path}.textureSheetAnimation`, errors, { min: 0 });
    validateNumber(texture, "cycles", `${path}.textureSheetAnimation`, errors, { min: 0 });
  }
  const collision = modules.collision;
  if (isPlainObject(collision)) {
    for (const key of ["bounce", "friction", "dampen", "speedLoss"]) validateNumber(collision, key, `${path}.collision`, errors, { min: 0, max: 1 });
    validateNumber(collision, "radiusMultiplier", `${path}.collision`, errors, { min: 0 });
    validateNumber(collision, "maxCollisions", `${path}.collision`, errors, { integer: true, min: 1 });
    validateNumber(collision, "frameBudget", `${path}.collision`, errors, { integer: true, min: 0 });
  }
  const subEmitters = modules.subEmitters;
  if (isPlainObject(subEmitters)) {
    validateNumber(subEmitters, "maximumDepth", `${path}.subEmitters`, errors, { integer: true, min: 1, max: 16 });
    validateNumber(subEmitters, "eventBudget", `${path}.subEmitters`, errors, { integer: true, min: 1 });
    validateNumber(subEmitters, "spawnBudget", `${path}.subEmitters`, errors, { integer: true, min: 0 });
  }
  const trails = modules.trails;
  if (isPlainObject(trails)) {
    validateNumber(trails, "lifetime", `${path}.trails`, errors, { min: 0 });
    validateNumber(trails, "minimumVertexDistance", `${path}.trails`, errors, { min: 0 });
    validateNumber(trails, "maxPoints", `${path}.trails`, errors, { integer: true, min: 2, max: 1024 });
    validateNumber(trails, "smoothing", `${path}.trails`, errors, { min: 0, max: 1 });
    validateNumber(trails, "textureTileLength", `${path}.trails`, errors, { min: 1 });
    if (trails.appearanceMode !== void 0 && !["particle", "particleImage", "color"].includes(trails.appearanceMode)) {
      errors.push(makeDiagnostic("APS_SCHEMA_INVALID_ENUM", `${path}.trails.appearanceMode`, "Unknown trail appearance mode."));
    }
  }
  const lights = modules.lights;
  if (isPlainObject(lights)) {
    validateNumber(lights, "ratio", `${path}.lights`, errors, { min: 0, max: 1 });
    validateNumber(lights, "maxLights", `${path}.lights`, errors, { integer: true, min: 0 });
  }
  const customData = modules.customData;
  if (isPlainObject(customData) && Array.isArray(customData.channels) && customData.channels.length > 2) {
    errors.push(makeDiagnostic("APS_SCHEMA_LIMIT_COUNT", `${path}.customData.channels`, "Custom data supports at most two Vector4 channels.", { limit: 2, actual: customData.channels.length }));
  }
}
function validateNumber(object, key, path, errors, options = {}) {
  if (!hasOwn2(object, key)) return;
  const value = object[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    addTypeError(errors, `${path}.${key}`, "finite number", value);
    return;
  }
  if (options.integer && !Number.isInteger(value)) {
    errors.push(makeDiagnostic("APS_SCHEMA_INVALID_VALUE", `${path}.${key}`, `${path}.${key} must be an integer.`));
  }
  if (typeof options.min === "number" && value < options.min) {
    errors.push(makeDiagnostic(
      "APS_SCHEMA_INVALID_VALUE",
      `${path}.${key}`,
      `${path}.${key} must be at least ${options.min}.`,
      { minimum: options.min, actual: value }
    ));
  }
  if (typeof options.max === "number" && value > options.max) {
    errors.push(makeDiagnostic(
      "APS_SCHEMA_INVALID_VALUE",
      `${path}.${key}`,
      `${path}.${key} must be at most ${options.max}.`,
      { maximum: options.max, actual: value }
    ));
  }
}
function validateModuleCollection(modules, path, errors, registries, dependencyIds, limits) {
  if (!isPlainObject(modules)) {
    addTypeError(errors, path, "object", modules);
    return;
  }
  for (const moduleName of Object.keys(MODULE_DEFAULTS)) {
    if (!hasOwn2(modules, moduleName)) continue;
    const module = modules[moduleName];
    if (!isPlainObject(module)) {
      addTypeError(errors, `${path}.${moduleName}`, "object", module);
      continue;
    }
    validateBoolean(module, "enabled", `${path}.${moduleName}`, errors);
    if (moduleName === "customData") {
      const { channels: _channels, ...customDefaults } = MODULE_DEFAULTS.customData;
      validateDefaultTypes(module, customDefaults, `${path}.${moduleName}`, errors);
      if (typeof module.channels !== "undefined" && !Array.isArray(module.channels) && !isPlainObject(module.channels)) {
        addTypeError(errors, `${path}.customData.channels`, "array or object", module.channels);
      }
    } else validateDefaultTypes(module, MODULE_DEFAULTS[moduleName], `${path}.${moduleName}`, errors);
    validateValueReferences(module, `${path}.${moduleName}`, errors, registries);
  }
  validateAdvancedModuleRanges(modules, path, errors);
  const links = modules.subEmitters?.links;
  if (typeof links !== "undefined") {
    if (!Array.isArray(links)) {
      addTypeError(errors, `${path}.subEmitters.links`, "array", links);
    } else {
      if (links.length > limits.maxSubEmitterLinksPerEmitter) {
        errors.push(makeDiagnostic(
          "APS_SCHEMA_LIMIT_COUNT",
          `${path}.subEmitters.links`,
          `Sub-emitter links exceed limit ${limits.maxSubEmitterLinksPerEmitter}.`,
          { limit: limits.maxSubEmitterLinksPerEmitter, actual: links.length }
        ));
      }
      links.forEach((link, index) => {
        const linkPath = `${path}.subEmitters.links[${index}]`;
        if (!isPlainObject(link)) {
          addTypeError(errors, linkPath, "object", link);
          return;
        }
        validateId(link.id, `${linkPath}.id`, errors, registries.subEmitterLinks);
        if (typeof link.probability === "number") validateNumber(link, "probability", linkPath, errors, { min: 0, max: 1 });
        if (typeof link.count === "number") validateNumber(link, "count", linkPath, errors, { min: 0 });
        validateNumber(link, "delay", linkPath, errors, { min: 0 });
        validateNumber(link, "maximumSpawn", linkPath, errors, { integer: true, min: 0 });
        validateNumber(link, "interval", linkPath, errors, { min: Number.EPSILON });
        if (link.enabled !== false && !link.subEffectId && !link.systemId && !link.emitterId) {
          errors.push(makeDiagnostic(
            "APS_SCHEMA_REQUIRED",
            linkPath,
            "Sub-emitter link requires subEffectId, systemId, or emitterId."
          ));
        }
        if (typeof link.subEffectId === "string" && !dependencyIds.subEffects.has(link.subEffectId)) {
          errors.push(makeDiagnostic(
            "APS_SCHEMA_REFERENCE_MISSING",
            `${linkPath}.subEffectId`,
            `Unknown sub-effect dependency '${link.subEffectId}'.`,
            { id: link.subEffectId, dependencyKind: "sub-effect" }
          ));
        }
      });
    }
  }
  const collisionLayerIds = modules.collision?.collisionLayerIds;
  if (typeof collisionLayerIds !== "undefined") {
    if (!Array.isArray(collisionLayerIds)) {
      addTypeError(errors, `${path}.collision.collisionLayerIds`, "array", collisionLayerIds);
    } else {
      collisionLayerIds.forEach((id, index) => {
        if (typeof id !== "string" || !dependencyIds.collisionLayers.has(id)) {
          errors.push(makeDiagnostic(
            "APS_SCHEMA_REFERENCE_MISSING",
            `${path}.collision.collisionLayerIds[${index}]`,
            `Unknown collision-layer dependency '${id}'.`,
            { id, dependencyKind: "collision-layer" }
          ));
        }
      });
    }
  }
  const textureAnimation = modules.textureSheetAnimation;
  for (const [key, bucket] of [["textureId", "textures"], ["atlasRegionId", "atlasRegions"]]) {
    const id = textureAnimation?.[key];
    if (id !== null && typeof id !== "undefined" && !dependencyIds[bucket].has(id)) {
      errors.push(makeDiagnostic(
        "APS_SCHEMA_REFERENCE_MISSING",
        `${path}.textureSheetAnimation.${key}`,
        `Unknown ${DEPENDENCY_KINDS[bucket]} dependency '${id}'.`,
        { id, dependencyKind: DEPENDENCY_KINDS[bucket] }
      ));
    }
  }
  const objectId = modules.shape?.objectId;
  if (objectId !== null && typeof objectId !== "undefined" && !dependencyIds.objects.has(objectId)) {
    errors.push(makeDiagnostic(
      "APS_SCHEMA_REFERENCE_MISSING",
      `${path}.shape.objectId`,
      `Unknown object dependency '${objectId}'.`,
      { id: objectId, dependencyKind: "object" }
    ));
  }
  const lightReference = modules.lights?.lightReference;
  if (lightReference !== null && typeof lightReference !== "undefined" && !dependencyIds.objects.has(lightReference)) {
    errors.push(makeDiagnostic(
      "APS_SCHEMA_REFERENCE_MISSING",
      `${path}.lights.lightReference`,
      `Unknown object dependency '${lightReference}'.`,
      { id: lightReference, dependencyKind: "object" }
    ));
  }
}
function validateValueReferences(value, path, errors, registries) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((child, index) => validateValueReferences(child, `${path}[${index}]`, errors, registries));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`;
    const referenceKind = /^(?:curveId|minCurveId|maxCurveId)$/.test(key) ? "curve" : /^(?:gradientId|minGradientId|maxGradientId)$/.test(key) ? "gradient" : null;
    if (referenceKind && child !== null && typeof child !== "undefined") {
      const registry = referenceKind === "curve" ? registries.curves : registries.gradients;
      if (typeof child !== "string" || !registry.has(child)) {
        errors.push(makeDiagnostic(
          "APS_SCHEMA_REFERENCE_MISSING",
          childPath,
          `Unknown ${referenceKind} '${child}'.`,
          { id: child, referenceKind }
        ));
      }
    }
    validateValueReferences(child, childPath, errors, registries);
  }
}
function validateDependencies(dependencies, path, errors, registries, limits) {
  const ids = Object.fromEntries(Object.keys(DEPENDENCY_KINDS).map((key) => [key, /* @__PURE__ */ new Set()]));
  if (typeof dependencies === "undefined") return ids;
  if (!isPlainObject(dependencies)) {
    addTypeError(errors, path, "object", dependencies);
    return ids;
  }
  for (const [bucket, kind] of Object.entries(DEPENDENCY_KINDS)) {
    const references = dependencies[bucket];
    if (typeof references === "undefined") continue;
    const bucketPath = `${path}.${bucket}`;
    if (!Array.isArray(references)) {
      addTypeError(errors, bucketPath, "array", references);
      continue;
    }
    if (references.length > limits.maxDependenciesPerKind) {
      errors.push(makeDiagnostic(
        "APS_SCHEMA_LIMIT_COUNT",
        bucketPath,
        `${bucket} dependencies exceed limit ${limits.maxDependenciesPerKind}.`,
        { limit: limits.maxDependenciesPerKind, actual: references.length }
      ));
    }
    references.forEach((reference, index) => {
      const referencePath = `${bucketPath}[${index}]`;
      if (!isPlainObject(reference)) {
        addTypeError(errors, referencePath, "object", reference);
        return;
      }
      if (validateId(reference.id, `${referencePath}.id`, errors, registries.dependencies)) {
        ids[bucket].add(reference.id);
      }
      if (hasOwn2(reference, "kind") && reference.kind !== kind) {
        errors.push(makeDiagnostic(
          "APS_SCHEMA_INVALID_VALUE",
          `${referencePath}.kind`,
          `Dependency in ${bucket} must use kind '${kind}'.`,
          { expected: kind, actual: reference.kind }
        ));
      }
      if (typeof reference.assetId !== "string" || reference.assetId.length === 0) {
        addTypeError(errors, `${referencePath}.assetId`, "non-empty string", reference.assetId);
      }
      validateBoolean(reference, "required", referencePath, errors);
      if (bucket === "atlasRegions" && (typeof reference.region !== "string" || !reference.region)) {
        addTypeError(errors, `${referencePath}.region`, "non-empty string", reference.region);
      }
      if (bucket === "collisionLayers" && (typeof reference.layer !== "string" || !reference.layer)) {
        addTypeError(errors, `${referencePath}.layer`, "non-empty string", reference.layer);
      }
    });
  }
  return ids;
}
function validateRenderer(renderer, path, errors, registries, dependencyIds) {
  if (typeof renderer === "undefined") return;
  if (!isPlainObject(renderer)) {
    addTypeError(errors, path, "object", renderer);
    return;
  }
  validateDefaultTypes(renderer, SYSTEM_DEFAULTS.renderer, path, errors);
  validateBoolean(renderer, "enabled", path, errors);
  for (const [key, value, allowed] of [
    ["textureMode", renderer.textureMode, ["image", "color", "gradient"]],
    ["gradientTexture.mode", renderer.gradientTexture?.mode, ["linear", "radial"]]
  ]) {
    if (value !== void 0 && !allowed.includes(value)) errors.push(makeDiagnostic("APS_SCHEMA_INVALID_ENUM", `${path}.${key}`, `Unknown ${key} '${value}'.`));
  }
  validateValueReferences(renderer.gradientTexture, `${path}.gradientTexture`, errors, registries);
  for (const [key, bucket] of [["textureId", "textures"], ["atlasRegionId", "atlasRegions"]]) {
    const id = renderer[key];
    if (id !== null && typeof id !== "undefined" && !dependencyIds[bucket].has(id)) {
      errors.push(makeDiagnostic(
        "APS_SCHEMA_REFERENCE_MISSING",
        `${path}.${key}`,
        `Unknown ${DEPENDENCY_KINDS[bucket]} dependency '${id}'.`,
        { id, dependencyKind: DEPENDENCY_KINDS[bucket] }
      ));
    }
  }
  if (typeof renderer.material !== "undefined") {
    const material = renderer.material;
    if (!isPlainObject(material)) {
      addTypeError(errors, `${path}.material`, "object", material);
    } else {
      validateDefaultTypes(material, MATERIAL_DEFAULTS, `${path}.material`, errors);
      validateId(material.id, `${path}.material.id`, errors, registries.materials);
      validateBoolean(material, "enabled", `${path}.material`, errors);
      validateBoolean(material, "required", `${path}.material`, errors);
      if (material.shaderId !== null && typeof material.shaderId !== "undefined" && !dependencyIds.shaders.has(material.shaderId)) {
        errors.push(makeDiagnostic(
          "APS_SCHEMA_REFERENCE_MISSING",
          `${path}.material.shaderId`,
          `Unknown shader dependency '${material.shaderId}'.`,
          { id: material.shaderId, dependencyKind: "shader" }
        ));
      }
    }
  }
}
function validateLibrary(libraries, errors, registries, limits) {
  if (typeof libraries === "undefined") return;
  if (!isPlainObject(libraries)) {
    addTypeError(errors, "$.libraries", "object", libraries);
    return;
  }
  for (const [key, limit, registry] of [
    ["curves", limits.maxCurves, registries.curves],
    ["gradients", limits.maxGradients, registries.gradients]
  ]) {
    if (typeof libraries[key] === "undefined") continue;
    if (!Array.isArray(libraries[key])) {
      addTypeError(errors, `$.libraries.${key}`, "array", libraries[key]);
      continue;
    }
    if (libraries[key].length > limit) {
      errors.push(makeDiagnostic(
        "APS_SCHEMA_LIMIT_COUNT",
        `$.libraries.${key}`,
        `${key} exceed limit ${limit}.`,
        { limit, actual: libraries[key].length }
      ));
    }
    libraries[key].forEach((entry, index) => {
      const path = `$.libraries.${key}[${index}]`;
      if (!isPlainObject(entry)) {
        addTypeError(errors, path, "object", entry);
        return;
      }
      validateId(entry.id, `${path}.id`, errors, registry);
      const arrayFields = key === "curves" ? ["keys"] : ["colorKeys", "alphaKeys"];
      for (const field of arrayFields) {
        if (hasOwn2(entry, field) && !Array.isArray(entry[field])) {
          addTypeError(errors, `${path}.${field}`, "array", entry[field]);
        }
      }
      const valueValidation = key === "curves" ? validateCurveDefinition(entry, path) : validateGradientDefinition(entry, path);
      errors.push(...valueValidation.errors);
    });
  }
}
function validateOverrides(overrides, errors) {
  if (typeof overrides === "undefined") return;
  if (!isPlainObject(overrides)) {
    addTypeError(errors, "$.overrides", "object", overrides);
    return;
  }
  for (const key of ["platforms", "qualities"]) {
    if (typeof overrides[key] === "undefined") continue;
    if (!Array.isArray(overrides[key])) {
      addTypeError(errors, `$.overrides.${key}`, "array", overrides[key]);
      continue;
    }
    overrides[key].forEach((entry, index) => {
      const path = `$.overrides.${key}[${index}]`;
      if (!isPlainObject(entry)) {
        addTypeError(errors, path, "object", entry);
        return;
      }
      const selector = key === "platforms" ? "platform" : "quality";
      if (typeof entry[selector] !== "string" || !entry[selector]) {
        addTypeError(errors, `${path}.${selector}`, "non-empty string", entry[selector]);
      }
      if (!isPlainObject(entry.patch)) {
        addTypeError(errors, `${path}.patch`, "object", entry.patch);
      }
    });
  }
}
function mergeLimits(options) {
  return { ...PARTICLE_EFFECT_2D_LIMITS, ...options.limits ?? {} };
}
function validateSubEmitterGraph(asset2, errors) {
  if (!Array.isArray(asset2.systems)) return;
  const graph = /* @__PURE__ */ new Map();
  const pathById = /* @__PURE__ */ new Map();
  const emittersBySystem = /* @__PURE__ */ new Map();
  asset2.systems.forEach((system, systemIndex) => {
    const ids = [];
    (system.emitters ?? []).forEach((emitter, emitterIndex) => {
      if (!emitter?.id) return;
      ids.push(emitter.id);
      graph.set(emitter.id, []);
      pathById.set(emitter.id, `$.systems[${systemIndex}].emitters[${emitterIndex}].modules.subEmitters.links`);
    });
    if (system?.id) emittersBySystem.set(system.id, ids);
  });
  for (const system of asset2.systems) for (const emitter of system.emitters ?? []) {
    const edges = graph.get(emitter?.id);
    if (!edges) continue;
    for (const link of emitter.modules?.subEmitters?.links ?? []) {
      if (link.enabled === false) continue;
      if (link.emitterId && graph.has(link.emitterId)) edges.push(link.emitterId);
      else if (link.systemId && emittersBySystem.has(link.systemId)) edges.push(...emittersBySystem.get(link.systemId));
      if (link.subEffectId && asset2.effect?.id && link.subEffectId === asset2.effect.id) edges.push(emitter.id);
    }
  }
  const visiting = /* @__PURE__ */ new Set();
  const visited = /* @__PURE__ */ new Set();
  const visit = (id, stack) => {
    if (visiting.has(id)) {
      const start = stack.indexOf(id);
      const cycle = [...stack.slice(start), id];
      errors.push(makeDiagnostic("APS_SUBEMITTER_CYCLE", pathById.get(id) ?? "$.systems", `Sub-emitter cycle detected: ${cycle.join(" -> ")}.`, { cycle }));
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    stack.push(id);
    for (const next of graph.get(id) ?? []) visit(next, stack);
    stack.pop();
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of graph.keys()) visit(id, []);
}
var ParticleEffect2DError = class extends Error {
  constructor(message, diagnostics, code = diagnostics?.[0]?.code ?? "APS_SCHEMA_ERROR") {
    super(message);
    this.name = "ParticleEffect2DError";
    this.code = code;
    this.diagnostics = diagnostics ?? [];
  }
};
function validateParticleEffect2D(asset2, options = {}) {
  const errors = [];
  const warnings = [];
  const limits = mergeLimits(options);
  const state = { errors, limits, seen: /* @__PURE__ */ new Set() };
  validateJsonValue(asset2, "$", 0, state);
  if (!isPlainObject(asset2)) {
    if (!errors.some((error) => error.path === "$")) addTypeError(errors, "$", "object", asset2);
    return { valid: false, errors, warnings };
  }
  if (asset2.assetType !== PARTICLE_EFFECT_2D_ASSET_TYPE) {
    errors.push(makeDiagnostic(
      "APS_SCHEMA_ASSET_TYPE",
      "$.assetType",
      `assetType must be '${PARTICLE_EFFECT_2D_ASSET_TYPE}'.`,
      { expected: PARTICLE_EFFECT_2D_ASSET_TYPE, actual: asset2.assetType }
    ));
  }
  if (!Number.isInteger(asset2.schemaVersion)) {
    errors.push(makeDiagnostic(
      "APS_SCHEMA_VERSION_REQUIRED",
      "$.schemaVersion",
      "schemaVersion must be an explicit integer."
    ));
  } else if (asset2.schemaVersion > PARTICLE_EFFECT_2D_SCHEMA_VERSION && !options.allowFutureVersion) {
    errors.push(makeDiagnostic(
      "APS_SCHEMA_FUTURE_VERSION",
      "$.schemaVersion",
      `Schema version ${asset2.schemaVersion} is newer than supported version ${PARTICLE_EFFECT_2D_SCHEMA_VERSION}.`,
      { supported: PARTICLE_EFFECT_2D_SCHEMA_VERSION, actual: asset2.schemaVersion }
    ));
  } else if (asset2.schemaVersion < 1) {
    errors.push(makeDiagnostic(
      "APS_SCHEMA_UNSUPPORTED_VERSION",
      "$.schemaVersion",
      `Schema version ${asset2.schemaVersion} is not supported.`,
      { supported: [PARTICLE_EFFECT_2D_SCHEMA_VERSION], actual: asset2.schemaVersion }
    ));
  }
  if (asset2.schemaVersion > PARTICLE_EFFECT_2D_SCHEMA_VERSION && options.allowFutureVersion) {
    return { valid: errors.length === 0, errors, warnings };
  }
  if (typeof asset2.effect !== "undefined") {
    if (!isPlainObject(asset2.effect)) {
      addTypeError(errors, "$.effect", "object", asset2.effect);
    } else {
      validateDefaultTypes(asset2.effect, TOP_LEVEL_DEFAULTS.effect, "$.effect", errors);
      validateBoolean(asset2.effect, "enabled", "$.effect", errors);
      validateBoolean(asset2.effect, "looping", "$.effect", errors);
      validateBoolean(asset2.effect, "autoRandomSeed", "$.effect", errors);
      validateNumber(asset2.effect, "duration", "$.effect", errors, { min: 0 });
      validateNumber(asset2.effect, "randomSeed", "$.effect", errors, {
        integer: true,
        min: 0,
        max: 4294967295
      });
    }
  }
  if (typeof asset2.units !== "undefined") {
    if (!isPlainObject(asset2.units)) {
      addTypeError(errors, "$.units", "object", asset2.units);
    } else {
      validateDefaultTypes(asset2.units, TOP_LEVEL_DEFAULTS.units, "$.units", errors);
      for (const [key, expected] of Object.entries(TOP_LEVEL_DEFAULTS.units)) {
        if (hasOwn2(asset2.units, key) && asset2.units[key] !== expected) {
          errors.push(makeDiagnostic(
            "APS_SCHEMA_INVALID_VALUE",
            `$.units.${key}`,
            `Public unit '${key}' must be '${expected}'.`,
            { expected, actual: asset2.units[key] }
          ));
        }
      }
    }
  }
  const registries = {
    systems: /* @__PURE__ */ new Map(),
    emitters: /* @__PURE__ */ new Map(),
    curves: /* @__PURE__ */ new Map(),
    gradients: /* @__PURE__ */ new Map(),
    materials: /* @__PURE__ */ new Map(),
    subEmitterLinks: /* @__PURE__ */ new Map(),
    dependencies: /* @__PURE__ */ new Map()
  };
  validateLibrary(asset2.libraries, errors, registries, limits);
  const dependencyIds = validateDependencies(asset2.dependencies, "$.dependencies", errors, registries, limits);
  if (typeof asset2.systems !== "undefined") {
    if (!Array.isArray(asset2.systems)) {
      addTypeError(errors, "$.systems", "array", asset2.systems);
    } else {
      if (asset2.systems.length > limits.maxSystems) {
        errors.push(makeDiagnostic(
          "APS_SCHEMA_LIMIT_COUNT",
          "$.systems",
          `Systems exceed limit ${limits.maxSystems}.`,
          { limit: limits.maxSystems, actual: asset2.systems.length }
        ));
      }
      asset2.systems.forEach((system, systemIndex) => {
        const systemPath = `$.systems[${systemIndex}]`;
        if (!isPlainObject(system)) {
          addTypeError(errors, systemPath, "object", system);
          return;
        }
        validateId(system.id, `${systemPath}.id`, errors, registries.systems);
        validateDefaultTypes(system, { enabled: true }, systemPath, errors);
        validateBoolean(system, "enabled", systemPath, errors);
        validateRenderer(system.renderer, `${systemPath}.renderer`, errors, registries, dependencyIds);
        if (typeof system.emitters === "undefined") return;
        if (!Array.isArray(system.emitters)) {
          addTypeError(errors, `${systemPath}.emitters`, "array", system.emitters);
          return;
        }
        if (system.emitters.length > limits.maxEmittersPerSystem) {
          errors.push(makeDiagnostic(
            "APS_SCHEMA_LIMIT_COUNT",
            `${systemPath}.emitters`,
            `Emitters exceed per-system limit ${limits.maxEmittersPerSystem}.`,
            { limit: limits.maxEmittersPerSystem, actual: system.emitters.length }
          ));
        }
        system.emitters.forEach((emitter, emitterIndex) => {
          const emitterPath = `${systemPath}.emitters[${emitterIndex}]`;
          if (!isPlainObject(emitter)) {
            addTypeError(errors, emitterPath, "object", emitter);
            return;
          }
          validateId(emitter.id, `${emitterPath}.id`, errors, registries.emitters);
          validateDefaultTypes(emitter, { enabled: true }, emitterPath, errors);
          validateBoolean(emitter, "enabled", emitterPath, errors);
          if (typeof emitter.modules !== "undefined") {
            validateModuleCollection(
              emitter.modules,
              `${emitterPath}.modules`,
              errors,
              registries,
              dependencyIds,
              limits
            );
          }
        });
      });
    }
  }
  validateSubEmitterGraph(asset2, errors);
  validateOverrides(asset2.overrides, errors);
  if (typeof asset2.metadata !== "undefined") {
    if (!isPlainObject(asset2.metadata)) {
      addTypeError(errors, "$.metadata", "object", asset2.metadata);
    } else {
      validateDefaultTypes(asset2.metadata, TOP_LEVEL_DEFAULTS.metadata, "$.metadata", errors);
    }
  }
  return { valid: errors.length === 0, errors, warnings };
}
function normalizeDependency(reference, kind) {
  return applyDefaults(reference, { kind, required: true });
}
var NULLABLE_REFERENCE_KEYS = /* @__PURE__ */ new Set([
  "textureId",
  "atlasRegionId",
  "shaderId",
  "objectId",
  "socketId",
  "subEffectId",
  "systemId",
  "emitterId",
  "lightReference",
  "curveId",
  "minCurveId",
  "maxCurveId",
  "gradientId",
  "minGradientId",
  "maxGradientId"
]);
function normalizeEmptyReferences(value) {
  if (Array.isArray(value)) {
    for (const child of value) normalizeEmptyReferences(child);
    return value;
  }
  if (!isPlainObject(value)) return value;
  for (const [key, child] of Object.entries(value)) {
    if (NULLABLE_REFERENCE_KEYS.has(key) && child === "") value[key] = null;
    else normalizeEmptyReferences(child);
  }
  return value;
}
function normalizeEmitter(emitter) {
  const normalized = applyDefaults(emitter, EMITTER_DEFAULTS);
  normalized.modules = isPlainObject(emitter?.modules) ? cloneJsonValue(emitter.modules) : {};
  for (const [name, defaults] of Object.entries(MODULE_DEFAULTS)) {
    normalized.modules[name] = applyDefaults(normalized.modules[name], defaults);
  }
  const sourceMain = isPlainObject(emitter?.modules?.main) ? emitter.modules.main : {};
  for (const axis of ["startSizeX", "startSizeY"]) {
    if (!hasOwn2(sourceMain, axis) || sourceMain[axis] === null) {
      normalized.modules.main[axis] = cloneJsonValue(normalized.modules.main.startSize);
    }
  }
  if (normalized.modules.shape.type === "rect") normalized.modules.shape.type = "rectangle";
  const links = normalized.modules.subEmitters.links;
  normalized.modules.subEmitters.links = Array.isArray(links) ? links.map((link) => applyDefaults(link, {
    enabled: true,
    event: "birth",
    subEffectId: null,
    systemId: null,
    emitterId: null,
    probability: 1,
    count: 1,
    delay: 0,
    maximumSpawn: 256,
    interval: 0.1,
    followParent: false,
    inherit: { position: true, color: false, size: false, velocity: false, rotation: false, lifetimeRatio: false, seed: true, customData: false }
  })) : links;
  return normalized;
}
function normalizeSystem(system) {
  const normalized = applyDefaults(system, SYSTEM_DEFAULTS);
  normalized.emitters = Array.isArray(system?.emitters) ? system.emitters.map(normalizeEmitter) : normalized.emitters;
  normalized.renderer = applyDefaults(system?.renderer, SYSTEM_DEFAULTS.renderer);
  if (isPlainObject(system?.renderer?.material)) {
    normalized.renderer.material = applyDefaults(system.renderer.material, MATERIAL_DEFAULTS);
  }
  return normalized;
}
function normalizeParticleEffect2D(asset2, options = {}) {
  if (!isPlainObject(asset2)) {
    const diagnostic2 = makeDiagnostic("APS_SCHEMA_INVALID_TYPE", "$", "ParticleEffect2D source must be an object.");
    throw new ParticleEffect2DError(diagnostic2.message, [diagnostic2]);
  }
  if (Number.isInteger(asset2.schemaVersion) && asset2.schemaVersion > PARTICLE_EFFECT_2D_SCHEMA_VERSION) {
    if (options.allowFutureVersion) return cloneJsonValue(asset2);
    const diagnostic2 = makeDiagnostic(
      "APS_SCHEMA_FUTURE_VERSION",
      "$.schemaVersion",
      `Schema version ${asset2.schemaVersion} is newer than supported version ${PARTICLE_EFFECT_2D_SCHEMA_VERSION}.`,
      { supported: PARTICLE_EFFECT_2D_SCHEMA_VERSION, actual: asset2.schemaVersion }
    );
    throw new ParticleEffect2DError(diagnostic2.message, [diagnostic2]);
  }
  const normalized = applyDefaults(asset2, TOP_LEVEL_DEFAULTS);
  normalized.systems = Array.isArray(asset2.systems) ? asset2.systems.map(normalizeSystem) : normalized.systems;
  normalizeEmptyReferences(normalized.systems);
  normalized.libraries = applyDefaults(asset2.libraries, TOP_LEVEL_DEFAULTS.libraries);
  if (Array.isArray(normalized.libraries.curves)) {
    normalized.libraries.curves = normalized.libraries.curves.map((curve2) => applyDefaults(curve2, {
      keys: [],
      interpolation: "linear",
      multiplier: 1,
      timePolicy: "clamp",
      valueClamp: { enabled: false, min: 0, max: 1 }
    }));
  }
  if (Array.isArray(normalized.libraries.gradients)) {
    normalized.libraries.gradients = normalized.libraries.gradients.map((gradient2) => applyDefaults(gradient2, {
      colorSpace: "srgb",
      colorKeys: [],
      alphaKeys: []
    }));
  }
  normalized.dependencies = applyDefaults(asset2.dependencies, TOP_LEVEL_DEFAULTS.dependencies);
  for (const [bucket, kind] of Object.entries(DEPENDENCY_KINDS)) {
    if (Array.isArray(normalized.dependencies[bucket])) {
      normalized.dependencies[bucket] = normalized.dependencies[bucket].map((reference) => normalizeDependency(reference, kind));
    }
  }
  normalized.overrides = applyDefaults(asset2.overrides, TOP_LEVEL_DEFAULTS.overrides);
  normalized.metadata = applyDefaults(asset2.metadata, TOP_LEVEL_DEFAULTS.metadata);
  return normalized;
}
function throwForDiagnostics(result, message = "ParticleEffect2D validation failed.") {
  if (!result.valid) throw new ParticleEffect2DError(message, result.errors);
}
function parseParticleEffect2D(source, options = {}) {
  if (typeof source !== "string") {
    const diagnostic2 = makeDiagnostic("APS_SCHEMA_INVALID_TYPE", "$", "ParticleEffect2D JSON source must be a string.");
    throw new ParticleEffect2DError(diagnostic2.message, [diagnostic2]);
  }
  const limits = mergeLimits(options);
  const sourceBytes = utf8ByteLength(source);
  if (sourceBytes > limits.maxSourceBytes) {
    const diagnostic2 = makeDiagnostic(
      "APS_SCHEMA_LIMIT_SIZE",
      "$",
      `ParticleEffect2D source exceeds ${limits.maxSourceBytes} bytes.`,
      { limit: limits.maxSourceBytes, actual: sourceBytes }
    );
    throw new ParticleEffect2DError(diagnostic2.message, [diagnostic2]);
  }
  let asset2;
  try {
    asset2 = JSON.parse(source);
  } catch (error) {
    const diagnostic2 = makeDiagnostic(
      "APS_SCHEMA_INVALID_JSON",
      "$",
      "ParticleEffect2D source is not valid JSON.",
      { cause: error.message }
    );
    throw new ParticleEffect2DError(diagnostic2.message, [diagnostic2]);
  }
  const validation = validateParticleEffect2D(asset2, options);
  throwForDiagnostics(validation);
  if (options.normalize === false) return asset2;
  const normalized = normalizeParticleEffect2D(asset2, options);
  throwForDiagnostics(validateParticleEffect2D(normalized, options));
  return normalized;
}
function sortObjectKeys(value) {
  if (Array.isArray(value)) return value.map(sortObjectKeys);
  if (!isPlainObject(value)) return value;
  const output = {};
  for (const key of Object.keys(value).sort()) output[key] = sortObjectKeys(value[key]);
  return output;
}
function canonicalSerializeParticleEffect2D(asset2, options = {}) {
  const source = options.normalize === false ? cloneJsonValue(asset2) : normalizeParticleEffect2D(asset2, options);
  const validation = validateParticleEffect2D(source, options);
  throwForDiagnostics(validation);
  const serialized = JSON.stringify(sortObjectKeys(source), null, options.space ?? 0);
  const limits = mergeLimits(options);
  const bytes = utf8ByteLength(serialized);
  if (bytes > limits.maxCanonicalBytes) {
    const diagnostic2 = makeDiagnostic(
      "APS_SCHEMA_LIMIT_SIZE",
      "$",
      `Canonical ParticleEffect2D exceeds ${limits.maxCanonicalBytes} bytes.`,
      { limit: limits.maxCanonicalBytes, actual: bytes }
    );
    throw new ParticleEffect2DError(diagnostic2.message, [diagnostic2]);
  }
  return serialized;
}
function indexById(items) {
  return new Map(items.map((item) => [item.id, item]));
}
function compileParticleEffect2D(asset2, options = {}) {
  const normalized = normalizeParticleEffect2D(asset2, options);
  throwForDiagnostics(validateParticleEffect2D(normalized, options));
  const compiled = {
    format: "particle-effect-2d-compiled",
    formatVersion: PARTICLE_EFFECT_2D_COMPILED_VERSION,
    sourceSchemaVersion: normalized.schemaVersion,
    asset: normalized,
    systems: normalized.systems,
    systemById: indexById(normalized.systems),
    emitterById: indexById(normalized.systems.flatMap((system) => system.emitters)),
    curveById: new Map(normalized.libraries.curves.map((curve2) => [
      curve2.id,
      compileCurve(curve2, { lutSize: options.curveLutSize ?? 0 })
    ])),
    gradientById: new Map(normalized.libraries.gradients.map((gradient2) => [
      gradient2.id,
      compileGradient(gradient2, { lutSize: options.gradientLutSize ?? 0 })
    ])),
    dependencies: /* @__PURE__ */ new Map(),
    disposed: false,
    createSeedHierarchy(seedOptions = {}) {
      if (this.disposed || !this.asset) {
        throw new ParticleEffect2DError("Compiled ParticleEffect2D has been disposed.", [
          makeDiagnostic("APS_COMPILED_DISPOSED", "$", "Compiled ParticleEffect2D has been disposed.")
        ]);
      }
      return createParticleSeedHierarchy(this.asset.effect, seedOptions);
    },
    dispose() {
      if (this.disposed) return;
      this.systemById.clear();
      this.emitterById.clear();
      this.curveById.clear();
      this.gradientById.clear();
      this.dependencies.clear();
      this.systems.length = 0;
      this.asset = null;
      this.disposed = true;
    }
  };
  for (const bucket of Object.keys(DEPENDENCY_KINDS)) {
    const references = normalized.dependencies[bucket];
    for (const reference of references) {
      compiled.dependencies.set(reference.id, { ...reference, bucket });
    }
  }
  return compiled;
}

// packages/melon-runtime/src/particle/particle-state.js
var PARTICLE_STATE_MAX_CAPACITY = 1 << 20;
var PARTICLE_STATE_INVALID_HANDLE = -1;
var PARTICLE_STATE_HANDLE_STRIDE = PARTICLE_STATE_MAX_CAPACITY;
var PARTICLE_STATE_RESIZE_POLICIES = Object.freeze(["fixed", "grow"]);
var PARTICLE_STATE_OVERFLOW_POLICIES = Object.freeze([
  "reject",
  "throw",
  "drop-oldest"
]);
var PARTICLE_FLAGS = Object.freeze({
  ALIVE: 1 << 0,
  VISIBLE: 1 << 1,
  COLLIDED: 1 << 2,
  TRIGGERED: 1 << 3,
  TRAIL_ACTIVE: 1 << 4,
  LIGHT_ACTIVE: 1 << 5
});
var PARTICLE_COLLISION_STATE = Object.freeze({
  NONE: 0,
  ENTER: 1,
  STAY: 2,
  EXIT: 3
});
var ADMIN_LAYOUT = Object.freeze({
  generations: Uint32Array,
  particleIds: Uint32Array,
  active: Uint8Array,
  freeSlots: Int32Array,
  nextActive: Int32Array,
  previousActive: Int32Array
});
var CURRENT_LAYOUT = Object.freeze({
  positionX: Float32Array,
  positionY: Float32Array,
  velocityX: Float32Array,
  velocityY: Float32Array,
  accelerationX: Float32Array,
  accelerationY: Float32Array,
  age: Float32Array,
  lifetime: Float32Array,
  rotation: Float32Array,
  angularVelocity: Float32Array,
  sizeX: Float32Array,
  sizeY: Float32Array,
  color: Uint32Array,
  flags: Uint32Array,
  randomSeed: Uint32Array
});
var START_LAYOUT = Object.freeze({
  positionX: Float32Array,
  positionY: Float32Array,
  velocityX: Float32Array,
  velocityY: Float32Array,
  lifetime: Float32Array,
  rotation: Float32Array,
  sizeX: Float32Array,
  sizeY: Float32Array,
  color: Uint32Array
});
var OPTIONAL_LAYOUTS = Object.freeze({
  animation: Object.freeze({ frame: Uint16Array, frameTime: Float32Array }),
  collision: Object.freeze({
    state: Uint8Array,
    normalX: Float32Array,
    normalY: Float32Array,
    colliderId: Int32Array
  }),
  parent: Object.freeze({ parentId: Uint32Array })
});
var PARTICLE_STATE_CHANNELS = Object.freeze({
  current: Object.freeze(Object.keys(CURRENT_LAYOUT)),
  start: Object.freeze(Object.keys(START_LAYOUT)),
  optional: Object.freeze({
    animation: Object.freeze(Object.keys(OPTIONAL_LAYOUTS.animation)),
    collision: Object.freeze(Object.keys(OPTIONAL_LAYOUTS.collision)),
    parent: Object.freeze(Object.keys(OPTIONAL_LAYOUTS.parent)),
    customVectors: "0..2 x vec4"
  })
});
function createGroup(layout, capacity) {
  return Object.fromEntries(Object.entries(layout).map(([name, Type]) => [name, new Type(capacity)]));
}
function resizeGroup(group, layout, capacity) {
  for (const [name, Type] of Object.entries(layout)) {
    const next = new Type(capacity);
    next.set(group[name].subarray(0, Math.min(group[name].length, capacity)));
    group[name] = next;
  }
}
function groupBytes(group) {
  return Object.values(group).reduce((total, channel) => total + channel.byteLength, 0);
}
function normalizeCapacity(value, name) {
  if (!Number.isInteger(value) || value < 1 || value > PARTICLE_STATE_MAX_CAPACITY) {
    throw new ParticleStateError(
      "APS_STATE_INVALID_CAPACITY",
      `${name} must be an integer from 1 to ${PARTICLE_STATE_MAX_CAPACITY}.`,
      { name, value, maximum: PARTICLE_STATE_MAX_CAPACITY }
    );
  }
  return value;
}
function clamp012(value) {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
}
function toColorByte(value) {
  return Math.round(clamp012(value) * 255) & 255;
}
function packParticleColor(red, green, blue, alpha = 1) {
  return (toColorByte(red) | toColorByte(green) << 8 | toColorByte(blue) << 16 | toColorByte(alpha) << 24) >>> 0;
}
function unpackParticleColor(packed, output = new Float32Array(4)) {
  const value = packed >>> 0;
  output[0] = (value & 255) / 255;
  output[1] = (value >>> 8 & 255) / 255;
  output[2] = (value >>> 16 & 255) / 255;
  output[3] = (value >>> 24 & 255) / 255;
  return output;
}
var ParticleStateError = class extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "ParticleStateError";
    this.code = code;
    this.details = details;
  }
};
function normalizeOptions(options) {
  const capacity = normalizeCapacity(options.capacity ?? 1024, "capacity");
  const maxCapacity = normalizeCapacity(options.maxCapacity ?? capacity, "maxCapacity");
  if (maxCapacity < capacity) {
    throw new ParticleStateError(
      "APS_STATE_INVALID_CAPACITY",
      "maxCapacity cannot be smaller than capacity.",
      { capacity, maxCapacity }
    );
  }
  const resizePolicy = options.resizePolicy ?? "fixed";
  const overflowPolicy = options.overflowPolicy ?? "reject";
  if (!PARTICLE_STATE_RESIZE_POLICIES.includes(resizePolicy)) {
    throw new ParticleStateError(
      "APS_STATE_INVALID_POLICY",
      `Unknown resize policy '${resizePolicy}'.`,
      { resizePolicy }
    );
  }
  if (!PARTICLE_STATE_OVERFLOW_POLICIES.includes(overflowPolicy)) {
    throw new ParticleStateError(
      "APS_STATE_INVALID_POLICY",
      `Unknown overflow policy '${overflowPolicy}'.`,
      { overflowPolicy }
    );
  }
  const growthFactor = options.growthFactor ?? 2;
  if (!Number.isFinite(growthFactor) || growthFactor <= 1) {
    throw new ParticleStateError(
      "APS_STATE_INVALID_POLICY",
      "growthFactor must be greater than 1.",
      { growthFactor }
    );
  }
  const features = options.features ?? {};
  const customVectorCount = features.customVectors ?? 0;
  if (!Number.isInteger(customVectorCount) || customVectorCount < 0 || customVectorCount > 2) {
    throw new ParticleStateError(
      "APS_STATE_INVALID_FEATURE",
      "customVectors must be an integer from 0 to 2.",
      { customVectorCount }
    );
  }
  return {
    capacity,
    maxCapacity,
    resizePolicy,
    overflowPolicy,
    growthFactor,
    features: {
      animation: features.animation === true,
      collision: features.collision === true,
      parent: features.parent === true,
      customVectors: customVectorCount
    }
  };
}
var ParticleStateBuffer = class {
  constructor(options = {}) {
    const normalized = normalizeOptions(options);
    this.capacity = normalized.capacity;
    this.maxCapacity = normalized.maxCapacity;
    this.resizePolicy = normalized.resizePolicy;
    this.overflowPolicy = normalized.overflowPolicy;
    this.growthFactor = normalized.growthFactor;
    this.features = { ...normalized.features };
    this.admin = createGroup(ADMIN_LAYOUT, this.capacity);
    this.current = createGroup(CURRENT_LAYOUT, this.capacity);
    this.start = createGroup(START_LAYOUT, this.capacity);
    this.optional = {
      animation: this.features.animation ? createGroup(OPTIONAL_LAYOUTS.animation, this.capacity) : null,
      collision: this.features.collision ? createGroup(OPTIONAL_LAYOUTS.collision, this.capacity) : null,
      parent: this.features.parent ? createGroup(OPTIONAL_LAYOUTS.parent, this.capacity) : null,
      customVectors: Array.from(
        { length: this.features.customVectors },
        () => new Float32Array(this.capacity * 4)
      )
    };
    this.activeCount = 0;
    this.freeCount = this.capacity;
    this.activeHead = -1;
    this.activeTail = -1;
    this.nextParticleId = 1;
    this.lastOverflowHandle = PARTICLE_STATE_INVALID_HANDLE;
    this.structureVersion = 1;
    this.disposed = false;
    this._initializeSlotLinks(0, this.capacity);
    for (let slot = this.capacity - 1, index = 0; slot >= 0; slot -= 1, index += 1) {
      this.admin.freeSlots[index] = slot;
    }
  }
  _assertAvailable() {
    if (this.disposed) {
      throw new ParticleStateError(
        "APS_STATE_DISPOSED",
        "ParticleStateBuffer has been disposed."
      );
    }
  }
  _initializeSlotLinks(start, end) {
    this.admin.nextActive.fill(-1, start, end);
    this.admin.previousActive.fill(-1, start, end);
  }
  _resetSlot(slot) {
    const current = this.current;
    const start = this.start;
    current.positionX[slot] = 0;
    current.positionY[slot] = 0;
    current.velocityX[slot] = 0;
    current.velocityY[slot] = 0;
    current.accelerationX[slot] = 0;
    current.accelerationY[slot] = 0;
    current.age[slot] = 0;
    current.lifetime[slot] = 1;
    current.rotation[slot] = 0;
    current.angularVelocity[slot] = 0;
    current.sizeX[slot] = 1;
    current.sizeY[slot] = 1;
    current.color[slot] = 4294967295;
    current.flags[slot] = PARTICLE_FLAGS.ALIVE | PARTICLE_FLAGS.VISIBLE;
    current.randomSeed[slot] = 0;
    start.positionX[slot] = 0;
    start.positionY[slot] = 0;
    start.velocityX[slot] = 0;
    start.velocityY[slot] = 0;
    start.lifetime[slot] = 1;
    start.rotation[slot] = 0;
    start.sizeX[slot] = 1;
    start.sizeY[slot] = 1;
    start.color[slot] = 4294967295;
    if (this.optional.animation) {
      this.optional.animation.frame[slot] = 0;
      this.optional.animation.frameTime[slot] = 0;
    }
    if (this.optional.collision) {
      this.optional.collision.state[slot] = PARTICLE_COLLISION_STATE.NONE;
      this.optional.collision.normalX[slot] = 0;
      this.optional.collision.normalY[slot] = 0;
      this.optional.collision.colliderId[slot] = -1;
    }
    if (this.optional.parent) this.optional.parent.parentId[slot] = 0;
    for (let channelIndex = 0; channelIndex < this.optional.customVectors.length; channelIndex += 1) {
      const channel = this.optional.customVectors[channelIndex];
      const offset = slot * 4;
      channel[offset] = 0;
      channel[offset + 1] = 0;
      channel[offset + 2] = 0;
      channel[offset + 3] = 0;
    }
  }
  _nextGeneration(slot) {
    let generation = this.admin.generations[slot] + 1 >>> 0;
    if (generation === 0) generation = 1;
    this.admin.generations[slot] = generation;
    return generation;
  }
  _nextId() {
    const id = this.nextParticleId >>> 0 || 1;
    this.nextParticleId = id + 1 >>> 0;
    if (this.nextParticleId === 0) this.nextParticleId = 1;
    return id;
  }
  _encodeHandle(slot) {
    return this.admin.generations[slot] * PARTICLE_STATE_HANDLE_STRIDE + slot;
  }
  _appendActive(slot) {
    this.admin.previousActive[slot] = this.activeTail;
    this.admin.nextActive[slot] = -1;
    if (this.activeTail === -1) this.activeHead = slot;
    else this.admin.nextActive[this.activeTail] = slot;
    this.activeTail = slot;
    this.activeCount += 1;
  }
  _releaseSlot(slot) {
    const previous = this.admin.previousActive[slot];
    const next = this.admin.nextActive[slot];
    if (previous === -1) this.activeHead = next;
    else this.admin.nextActive[previous] = next;
    if (next === -1) this.activeTail = previous;
    else this.admin.previousActive[next] = previous;
    this.admin.active[slot] = 0;
    this.current.flags[slot] = 0;
    this.admin.nextActive[slot] = -1;
    this.admin.previousActive[slot] = -1;
    this.admin.freeSlots[this.freeCount] = slot;
    this.freeCount += 1;
    this.activeCount -= 1;
  }
  _handleOverflow() {
    if (this.resizePolicy === "grow" && this.capacity < this.maxCapacity) {
      const target = Math.min(
        this.maxCapacity,
        Math.max(this.capacity + 1, Math.ceil(this.capacity * this.growthFactor))
      );
      this.resize(target);
      return true;
    }
    if (this.overflowPolicy === "drop-oldest" && this.activeHead !== -1) {
      this.lastOverflowHandle = this._encodeHandle(this.activeHead);
      this._releaseSlot(this.activeHead);
      return true;
    }
    if (this.overflowPolicy === "throw") {
      throw new ParticleStateError(
        "APS_STATE_CAPACITY",
        `ParticleStateBuffer capacity ${this.capacity} is exhausted.`,
        { capacity: this.capacity, maxCapacity: this.maxCapacity }
      );
    }
    this.lastOverflowHandle = PARTICLE_STATE_INVALID_HANDLE;
    return false;
  }
  allocate() {
    this._assertAvailable();
    if (this.freeCount === 0 && !this._handleOverflow()) {
      return PARTICLE_STATE_INVALID_HANDLE;
    }
    const slot = this.admin.freeSlots[this.freeCount - 1];
    this.freeCount -= 1;
    this._nextGeneration(slot);
    this.admin.particleIds[slot] = this._nextId();
    this.admin.active[slot] = 1;
    this._resetSlot(slot);
    this._appendActive(slot);
    return this._encodeHandle(slot);
  }
  slotFor(handle) {
    if (this.disposed) return -1;
    if (!Number.isSafeInteger(handle) || handle < 0) return -1;
    const slot = handle % PARTICLE_STATE_HANDLE_STRIDE;
    const generation = Math.floor(handle / PARTICLE_STATE_HANDLE_STRIDE);
    if (slot < 0 || slot >= this.capacity || this.admin.active[slot] !== 1) return -1;
    return this.admin.generations[slot] === generation ? slot : -1;
  }
  isAlive(handle) {
    return !this.disposed && this.slotFor(handle) !== -1;
  }
  release(handle) {
    this._assertAvailable();
    const slot = this.slotFor(handle);
    if (slot === -1) return false;
    this._releaseSlot(slot);
    return true;
  }
  initializeCurrentFromStart(handle) {
    this._assertAvailable();
    const slot = this.slotFor(handle);
    if (slot === -1) return false;
    const current = this.current;
    const start = this.start;
    current.positionX[slot] = start.positionX[slot];
    current.positionY[slot] = start.positionY[slot];
    current.velocityX[slot] = start.velocityX[slot];
    current.velocityY[slot] = start.velocityY[slot];
    current.lifetime[slot] = start.lifetime[slot];
    current.rotation[slot] = start.rotation[slot];
    current.sizeX[slot] = start.sizeX[slot];
    current.sizeY[slot] = start.sizeY[slot];
    current.color[slot] = start.color[slot];
    current.age[slot] = 0;
    return true;
  }
  normalizedAgeForSlot(slot) {
    const lifetime = this.current.lifetime[slot];
    return lifetime <= 0 ? 1 : Math.min(1, Math.max(0, this.current.age[slot] / lifetime));
  }
  firstActiveSlot() {
    return this.disposed ? -1 : this.activeHead;
  }
  nextActiveSlot(slot) {
    if (this.disposed || slot < 0 || slot >= this.capacity) return -1;
    return this.admin.nextActive[slot];
  }
  handleForSlot(slot) {
    if (this.disposed || slot < 0 || slot >= this.capacity || this.admin.active[slot] !== 1) {
      return PARTICLE_STATE_INVALID_HANDLE;
    }
    return this._encodeHandle(slot);
  }
  particleIdForSlot(slot) {
    if (this.disposed || slot < 0 || slot >= this.capacity || this.admin.active[slot] !== 1) return 0;
    return this.admin.particleIds[slot];
  }
  forEachActive(callback) {
    this._assertAvailable();
    if (typeof callback !== "function") throw new TypeError("forEachActive requires a callback.");
    let slot = this.activeHead;
    while (slot !== -1) {
      const next = this.admin.nextActive[slot];
      callback(slot, this._encodeHandle(slot), this.admin.particleIds[slot], this);
      slot = next;
    }
  }
  setCustomVector(handle, channelIndex, x, y, z, w) {
    this._assertAvailable();
    const slot = this.slotFor(handle);
    const channel = this.optional.customVectors[channelIndex];
    if (slot === -1 || !channel) return false;
    const offset = slot * 4;
    channel[offset] = x;
    channel[offset + 1] = y;
    channel[offset + 2] = z;
    channel[offset + 3] = w;
    return true;
  }
  getCustomVector(handle, channelIndex, output) {
    this._assertAvailable();
    const slot = this.slotFor(handle);
    const channel = this.optional.customVectors[channelIndex];
    if (slot === -1 || !channel || !output || output.length < 4) return false;
    const offset = slot * 4;
    output[0] = channel[offset];
    output[1] = channel[offset + 1];
    output[2] = channel[offset + 2];
    output[3] = channel[offset + 3];
    return true;
  }
  clear() {
    this._assertAvailable();
    let slot = this.activeHead;
    while (slot !== -1) {
      const next = this.admin.nextActive[slot];
      this._releaseSlot(slot);
      slot = next;
    }
    this.lastOverflowHandle = PARTICLE_STATE_INVALID_HANDLE;
  }
  resize(nextCapacity) {
    this._assertAvailable();
    const capacity = normalizeCapacity(nextCapacity, "nextCapacity");
    if (capacity > this.maxCapacity) {
      throw new ParticleStateError(
        "APS_STATE_CAPACITY",
        "Requested capacity exceeds maxCapacity.",
        { requested: capacity, maxCapacity: this.maxCapacity }
      );
    }
    if (capacity === this.capacity) return this.capacity;
    if (capacity < this.capacity && this.activeCount > 0) {
      throw new ParticleStateError(
        "APS_STATE_RESIZE_ACTIVE",
        "Cannot shrink ParticleStateBuffer while particles are active.",
        { activeCount: this.activeCount }
      );
    }
    const previousCapacity = this.capacity;
    resizeGroup(this.admin, ADMIN_LAYOUT, capacity);
    resizeGroup(this.current, CURRENT_LAYOUT, capacity);
    resizeGroup(this.start, START_LAYOUT, capacity);
    for (const [feature, layout] of Object.entries(OPTIONAL_LAYOUTS)) {
      if (this.optional[feature]) resizeGroup(this.optional[feature], layout, capacity);
    }
    for (let index = 0; index < this.optional.customVectors.length; index += 1) {
      const next = new Float32Array(capacity * 4);
      next.set(this.optional.customVectors[index].subarray(0, Math.min(
        this.optional.customVectors[index].length,
        next.length
      )));
      this.optional.customVectors[index] = next;
    }
    this.capacity = capacity;
    if (capacity > previousCapacity) {
      this._initializeSlotLinks(previousCapacity, capacity);
      for (let slot = capacity - 1; slot >= previousCapacity; slot -= 1) {
        this.admin.freeSlots[this.freeCount] = slot;
        this.freeCount += 1;
      }
    } else {
      this.freeCount = capacity;
      this.activeHead = -1;
      this.activeTail = -1;
      for (let slot = capacity - 1, index = 0; slot >= 0; slot -= 1, index += 1) {
        this.admin.freeSlots[index] = slot;
      }
      this._initializeSlotLinks(0, capacity);
    }
    this.structureVersion += 1;
    return this.capacity;
  }
  memoryStats() {
    this._assertAvailable();
    const adminBytes = groupBytes(this.admin);
    const currentBytes = groupBytes(this.current);
    const startBytes = groupBytes(this.start);
    let optionalBytes = 0;
    if (this.optional.animation) optionalBytes += groupBytes(this.optional.animation);
    if (this.optional.collision) optionalBytes += groupBytes(this.optional.collision);
    if (this.optional.parent) optionalBytes += groupBytes(this.optional.parent);
    optionalBytes += this.optional.customVectors.reduce(
      (total, channel) => total + channel.byteLength,
      0
    );
    const mandatoryBytes = adminBytes + currentBytes + startBytes;
    const totalBytes = mandatoryBytes + optionalBytes;
    return {
      capacity: this.capacity,
      activeCount: this.activeCount,
      mandatoryBytes,
      optionalBytes,
      totalBytes,
      mandatoryBytesPerParticle: mandatoryBytes / this.capacity,
      totalBytesPerParticle: totalBytes / this.capacity
    };
  }
  dispose() {
    if (this.disposed) return;
    this.clear();
    this.admin = null;
    this.current = null;
    this.start = null;
    this.optional = null;
    this.capacity = 0;
    this.freeCount = 0;
    this.activeHead = -1;
    this.activeTail = -1;
    this.disposed = true;
    this.structureVersion += 1;
  }
};
function createParticleStateBuffer(options) {
  return new ParticleStateBuffer(options);
}

// packages/melon-runtime/src/particle/particle-system-2d.js
var PARTICLE_PLAYBACK_STATE = Object.freeze({
  STOPPED: "stopped",
  PLAYING: "playing",
  PAUSED: "paused",
  COMPLETED: "completed"
});
var PARTICLE_TIMESTEP_MODE = Object.freeze({ FIXED: "fixed", VARIABLE: "variable" });
var PARTICLE_TIME_MODE = Object.freeze({ SCALED: "scaled", UNSCALED: "unscaled" });
var PARTICLE_CULLING_MODE = Object.freeze({
  ALWAYS: "always",
  PAUSE: "pause",
  CATCH_UP: "catch-up",
  AUTOMATIC: "automatic"
});
var PARTICLE_SUSPENSION_BEHAVIOR = Object.freeze({ PAUSE: "pause", CATCH_UP: "catch-up" });
var PARTICLE_STOP_ACTION = Object.freeze({
  NONE: "none",
  CLEAR: "clear",
  DISABLE: "disable",
  DISPOSE: "dispose"
});
var PARTICLE_SIMULATION_SPACE = Object.freeze({
  LOCAL: "local",
  WORLD: "world",
  CUSTOM: "custom"
});
var PARTICLE_MODULE_EVALUATION_ORDER = Object.freeze([
  "main",
  "emission",
  "shape",
  "velocityOverLifetime",
  "forceOverLifetime",
  "noise",
  "collision",
  "colorOverLifetime",
  "sizeOverLifetime",
  "rotationOverLifetime",
  "textureSheetAnimation",
  "trails",
  "lights",
  "subEmitters",
  "customData",
  "renderer"
]);
var PRE_INTEGRATE_MODULE_COUNT = 6;
var EMPTY_STEP_CONTEXT = Object.freeze({});
var TRANSFORM_X = 0;
var TRANSFORM_Y = 1;
var TRANSFORM_ROTATION = 2;
var TRANSFORM_SCALE_X = 3;
var TRANSFORM_SCALE_Y = 4;
var PARTICLE_LIFECYCLE_EVENT = Object.freeze({
  PLAY: "play",
  PAUSE: "pause",
  RESUME: "resume",
  STOP: "stop",
  CLEAR: "clear",
  RESTART: "restart",
  EMIT: "emit",
  PARTICLE_DEATH: "particle-death",
  LOOP: "loop",
  COMPLETE: "complete",
  DISABLE: "disable",
  DISPOSE: "dispose"
});
var ParticleSystem2DError = class extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "ParticleSystem2DError";
    this.code = code;
    this.details = details;
  }
};
function finiteNonNegative(value, fallback, name) {
  const normalized = value ?? fallback;
  if (!Number.isFinite(normalized) || normalized < 0) {
    throw new ParticleSystem2DError("APS_LIFECYCLE_INVALID_OPTION", `${name} must be finite and non-negative.`, { name, value: normalized });
  }
  return normalized;
}
function finitePositive(value, fallback, name) {
  const normalized = value ?? fallback;
  if (!Number.isFinite(normalized) || normalized <= 0) {
    throw new ParticleSystem2DError("APS_LIFECYCLE_INVALID_OPTION", `${name} must be finite and greater than zero.`, { name, value: normalized });
  }
  return normalized;
}
function enumValue(value, fallback, values, name) {
  const normalized = value ?? fallback;
  if (!Object.values(values).includes(normalized)) {
    throw new ParticleSystem2DError("APS_LIFECYCLE_INVALID_OPTION", `Unknown ${name} '${normalized}'.`, { name, value: normalized });
  }
  return normalized;
}
function writeTransform(target, source) {
  target[TRANSFORM_X] = Number.isFinite(source?.x) ? source.x : 0;
  target[TRANSFORM_Y] = Number.isFinite(source?.y) ? source.y : 0;
  target[TRANSFORM_ROTATION] = Number.isFinite(source?.rotation) ? source.rotation : 0;
  target[TRANSFORM_SCALE_X] = Number.isFinite(source?.scaleX) ? source.scaleX : 1;
  target[TRANSFORM_SCALE_Y] = Number.isFinite(source?.scaleY) ? source.scaleY : 1;
}
function copyTransform(target, source) {
  target.set(source);
}
function transformPosition(transform, x, y, output, ignoreScale = false) {
  const radians = transform[TRANSFORM_ROTATION] * Math.PI / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const scaledX = x * (ignoreScale ? 1 : transform[TRANSFORM_SCALE_X]);
  const scaledY = y * (ignoreScale ? 1 : transform[TRANSFORM_SCALE_Y]);
  output[0] = transform[TRANSFORM_X] + scaledX * cosine - scaledY * sine;
  output[1] = transform[TRANSFORM_Y] + scaledX * sine + scaledY * cosine;
}
function transformVector(transform, x, y, output, ignoreScale = false) {
  const radians = transform[TRANSFORM_ROTATION] * Math.PI / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const scaledX = x * (ignoreScale ? 1 : transform[TRANSFORM_SCALE_X]);
  const scaledY = y * (ignoreScale ? 1 : transform[TRANSFORM_SCALE_Y]);
  output[0] = scaledX * cosine - scaledY * sine;
  output[1] = scaledX * sine + scaledY * cosine;
}
var ParticleSystem2D = class {
  constructor(options = {}) {
    this.state = options.stateBuffer ?? new ParticleStateBuffer({
      capacity: options.capacity ?? 1e3,
      maxCapacity: options.maxCapacity ?? options.capacity ?? 1e3,
      resizePolicy: options.resizePolicy ?? "fixed",
      overflowPolicy: options.overflowPolicy ?? "reject",
      growthFactor: options.growthFactor ?? 2,
      features: options.features
    });
    if (!(this.state instanceof ParticleStateBuffer)) {
      throw new ParticleSystem2DError("APS_LIFECYCLE_INVALID_STATE", "stateBuffer must be a ParticleStateBuffer.");
    }
    this.duration = finiteNonNegative(options.duration, 5, "duration");
    this.looping = options.looping !== false;
    this.startDelay = finiteNonNegative(options.startDelay, 0, "startDelay");
    this.timestepMode = enumValue(options.timestepMode, "fixed", PARTICLE_TIMESTEP_MODE, "timestepMode");
    this.fixedTimestep = finitePositive(options.fixedTimestep, 1 / 60, "fixedTimestep");
    this.maxDelta = finitePositive(options.maxDelta, 0.25, "maxDelta");
    this.maxSubSteps = options.maxSubSteps ?? 32;
    if (!Number.isInteger(this.maxSubSteps) || this.maxSubSteps < 1) {
      throw new ParticleSystem2DError("APS_LIFECYCLE_INVALID_OPTION", "maxSubSteps must be a positive integer.");
    }
    this.timeMode = enumValue(options.timeMode, "scaled", PARTICLE_TIME_MODE, "timeMode");
    this.simulationSpeed = finiteNonNegative(options.simulationSpeed, 1, "simulationSpeed");
    const requestedCulling = options.cullingMode === "simulate" ? "always" : options.cullingMode;
    this.cullingMode = enumValue(requestedCulling, "automatic", PARTICLE_CULLING_MODE, "cullingMode");
    this.suspensionBehavior = enumValue(options.suspensionBehavior, "pause", PARTICLE_SUSPENSION_BEHAVIOR, "suspensionBehavior");
    this.maxCatchUp = finiteNonNegative(options.maxCatchUp, 1, "maxCatchUp");
    this.prewarm = finiteNonNegative(options.prewarm, 0, "prewarm");
    this.simulationSpace = enumValue(options.simulationSpace, "local", PARTICLE_SIMULATION_SPACE, "simulationSpace");
    this.scalingMode = options.scalingMode ?? "hierarchy";
    this.stopAction = enumValue(options.stopAction, "none", PARTICLE_STOP_ACTION, "stopAction");
    this.completeAction = enumValue(options.completeAction, "none", PARTICLE_STOP_ACTION, "completeAction");
    this.teleportDistance = finiteNonNegative(options.teleportDistance, 128, "teleportDistance");
    this.teleportAngle = finiteNonNegative(options.teleportAngle, 90, "teleportAngle");
    this.effectSeed = normalizeParticleSeed(options.randomSeed ?? 1);
    this.systemId = String(options.systemId ?? "system");
    this.emitterId = String(options.emitterId ?? "emitter");
    this.moduleEvaluators = options.moduleEvaluators ?? {};
    this.onScrubReset = typeof options.onScrubReset === "function" ? options.onScrubReset : null;
    this.playbackState = PARTICLE_PLAYBACK_STATE.STOPPED;
    this.enabled = options.enabled !== false;
    this.disposed = false;
    this.suspended = false;
    this.time = 0;
    this.emissionTime = 0;
    this.cycle = 0;
    this.evaluationIndex = 0;
    this.frameIndex = 0;
    this.accumulator = 0;
    this.deferredDelta = 0;
    this.delayRemaining = this.startDelay;
    this.wantsEmission = false;
    this.emissionEnded = false;
    this.emissionDelta = 0;
    this.lastEmittedHandle = PARTICLE_STATE_INVALID_HANDLE;
    this.currentTransform = new Float64Array(5);
    this.previousTransform = new Float64Array(5);
    this.customTransform = new Float64Array(5);
    this.transformScratch = new Float64Array(2);
    writeTransform(this.currentTransform, options.transform);
    copyTransform(this.previousTransform, this.currentTransform);
    writeTransform(this.customTransform, options.customTransform);
    this.teleported = false;
    this.velocityIntegratedByModule = false;
    this.listeners = /* @__PURE__ */ Object.create(null);
  }
  get playing() {
    return this.playbackState === PARTICLE_PLAYBACK_STATE.PLAYING;
  }
  get paused() {
    return this.playbackState === PARTICLE_PLAYBACK_STATE.PAUSED;
  }
  get stopped() {
    return this.playbackState === PARTICLE_PLAYBACK_STATE.STOPPED;
  }
  get completed() {
    return this.playbackState === PARTICLE_PLAYBACK_STATE.COMPLETED;
  }
  get alive() {
    return !this.disposed && this.state.activeCount > 0;
  }
  get emitting() {
    return this.playing && this.wantsEmission && !this.emissionEnded && this.delayRemaining <= 0;
  }
  _assertAvailable() {
    if (this.disposed) throw new ParticleSystem2DError("APS_LIFECYCLE_DISPOSED", "ParticleSystem2D has been disposed.");
  }
  on(eventName, listener) {
    this._assertAvailable();
    if (typeof listener !== "function") throw new TypeError("Particle lifecycle listener must be a function.");
    const listeners = this.listeners[eventName] ?? (this.listeners[eventName] = []);
    if (!listeners.includes(listener)) listeners.push(listener);
    return () => this.off(eventName, listener);
  }
  off(eventName, listener) {
    const listeners = this.listeners?.[eventName];
    if (!listeners) return false;
    const index = listeners.indexOf(listener);
    if (index === -1) return false;
    listeners.splice(index, 1);
    return true;
  }
  _emitLifecycle(eventName, first, second) {
    const listeners = this.listeners[eventName];
    if (!listeners) return;
    for (let index = 0; index < listeners.length; index += 1) {
      listeners[index](first, second, this);
    }
  }
  _resetClock() {
    this.time = 0;
    this.emissionTime = 0;
    this.cycle = 0;
    this.evaluationIndex = 0;
    this.frameIndex = 0;
    this.accumulator = 0;
    this.deferredDelta = 0;
    this.delayRemaining = this.startDelay;
    this.emissionEnded = false;
    this.emissionDelta = 0;
  }
  play(options = {}) {
    this._assertAvailable();
    if (options.restart === true || this.completed) {
      this.clear();
      this._resetClock();
    }
    this.enabled = true;
    this.playbackState = PARTICLE_PLAYBACK_STATE.PLAYING;
    this.wantsEmission = true;
    this._emitLifecycle(PARTICLE_LIFECYCLE_EVENT.PLAY);
    const prewarm = finiteNonNegative(options.prewarm, this.prewarm, "prewarm");
    if (prewarm > 0) this._advanceExact(prewarm);
    return this;
  }
  pause() {
    this._assertAvailable();
    if (!this.playing) return false;
    this.playbackState = PARTICLE_PLAYBACK_STATE.PAUSED;
    this._emitLifecycle(PARTICLE_LIFECYCLE_EVENT.PAUSE);
    return true;
  }
  resume() {
    this._assertAvailable();
    if (!this.paused) return false;
    this.playbackState = PARTICLE_PLAYBACK_STATE.PLAYING;
    this._emitLifecycle(PARTICLE_LIFECYCLE_EVENT.RESUME);
    return true;
  }
  stop(action = this.stopAction) {
    this._assertAvailable();
    const normalizedAction = enumValue(action, "none", PARTICLE_STOP_ACTION, "stopAction");
    this.wantsEmission = false;
    this.playbackState = PARTICLE_PLAYBACK_STATE.STOPPED;
    this.accumulator = 0;
    this.deferredDelta = 0;
    this._emitLifecycle(PARTICLE_LIFECYCLE_EVENT.STOP, normalizedAction);
    this._applyStopAction(normalizedAction);
    return this;
  }
  clear() {
    this._assertAvailable();
    this.state.clear();
    this.lastEmittedHandle = PARTICLE_STATE_INVALID_HANDLE;
    this._emitLifecycle(PARTICLE_LIFECYCLE_EVENT.CLEAR);
    return this;
  }
  restart(options = {}) {
    this._assertAvailable();
    this.clear();
    this._resetClock();
    this.enabled = true;
    this.wantsEmission = true;
    this.playbackState = PARTICLE_PLAYBACK_STATE.PLAYING;
    this._emitLifecycle(PARTICLE_LIFECYCLE_EVENT.RESTART);
    const prewarm = finiteNonNegative(options.prewarm, this.prewarm, "prewarm");
    if (prewarm > 0) this._advanceExact(prewarm);
    return this;
  }
  emit(count = 1, initializer) {
    this._assertAvailable();
    if (!Number.isInteger(count) || count < 0) {
      throw new ParticleSystem2DError("APS_LIFECYCLE_INVALID_EMIT", "emit count must be a non-negative integer.", { count });
    }
    if (typeof initializer !== "undefined" && typeof initializer !== "function") {
      throw new TypeError("Particle initializer must be a function.");
    }
    let emitted = 0;
    for (let index = 0; index < count; index += 1) {
      const handle = this.state.allocate();
      if (handle === PARTICLE_STATE_INVALID_HANDLE) break;
      const slot = this.state.slotFor(handle);
      const particleId = this.state.particleIdForSlot(slot);
      this.state.current.randomSeed[slot] = deriveParticleSeed(
        this.effectSeed,
        "system",
        this.systemId,
        "emitter",
        this.emitterId,
        "particle",
        particleId
      );
      if (initializer) initializer(slot, handle, particleId, this.state, this);
      this.state.initializeCurrentFromStart(handle);
      this._applySpawnTransform(slot);
      this.lastEmittedHandle = handle;
      emitted += 1;
      this._emitLifecycle(PARTICLE_LIFECYCLE_EVENT.EMIT, handle, particleId);
    }
    return emitted;
  }
  updateTransform(transform) {
    this._assertAvailable();
    copyTransform(this.previousTransform, this.currentTransform);
    writeTransform(this.currentTransform, transform);
    const deltaX = this.currentTransform[TRANSFORM_X] - this.previousTransform[TRANSFORM_X];
    const deltaY = this.currentTransform[TRANSFORM_Y] - this.previousTransform[TRANSFORM_Y];
    let deltaRotation = Math.abs(this.currentTransform[TRANSFORM_ROTATION] - this.previousTransform[TRANSFORM_ROTATION]) % 360;
    if (deltaRotation > 180) deltaRotation = 360 - deltaRotation;
    this.teleported = deltaX * deltaX + deltaY * deltaY > this.teleportDistance * this.teleportDistance || deltaRotation > this.teleportAngle;
    return this.teleported;
  }
  updateCustomTransform(transform) {
    this._assertAvailable();
    writeTransform(this.customTransform, transform);
    return this;
  }
  transformPoint(x, y, space = this.simulationSpace, output = new Float64Array(2)) {
    const normalizedSpace = enumValue(space, this.simulationSpace, PARTICLE_SIMULATION_SPACE, "simulationSpace");
    if (normalizedSpace === PARTICLE_SIMULATION_SPACE.LOCAL) {
      output[0] = x;
      output[1] = y;
    } else {
      transformPosition(
        normalizedSpace === PARTICLE_SIMULATION_SPACE.WORLD ? this.currentTransform : this.customTransform,
        x,
        y,
        output
      );
    }
    return output;
  }
  _applySpawnTransform(slot) {
    if (this.simulationSpace === PARTICLE_SIMULATION_SPACE.LOCAL) return;
    const transform = this.simulationSpace === PARTICLE_SIMULATION_SPACE.WORLD ? this.currentTransform : this.customTransform;
    const ignoreScale = this.scalingMode === "shape";
    const start = this.state.start;
    const current = this.state.current;
    transformPosition(transform, start.positionX[slot], start.positionY[slot], this.transformScratch, ignoreScale);
    start.positionX[slot] = this.transformScratch[0];
    start.positionY[slot] = this.transformScratch[1];
    current.positionX[slot] = this.transformScratch[0];
    current.positionY[slot] = this.transformScratch[1];
    transformVector(transform, start.velocityX[slot], start.velocityY[slot], this.transformScratch, ignoreScale);
    start.velocityX[slot] = this.transformScratch[0];
    start.velocityY[slot] = this.transformScratch[1];
    current.velocityX[slot] = this.transformScratch[0];
    current.velocityY[slot] = this.transformScratch[1];
  }
  setBrowserSuspended(suspended, elapsedSeconds = 0) {
    this._assertAvailable();
    const next = suspended === true;
    if (this.suspended && !next && this.suspensionBehavior === PARTICLE_SUSPENSION_BEHAVIOR.CATCH_UP) {
      this.deferredDelta = Math.min(this.maxCatchUp, this.deferredDelta + finiteNonNegative(elapsedSeconds, 0, "elapsedSeconds"));
    }
    if (!next && this.suspensionBehavior === PARTICLE_SUSPENSION_BEHAVIOR.PAUSE) this.deferredDelta = 0;
    this.suspended = next;
    return this;
  }
  step(deltaSeconds, context = EMPTY_STEP_CONTEXT) {
    this._assertAvailable();
    const delta = finiteNonNegative(deltaSeconds, 0, "deltaSeconds");
    if (!this.enabled || !this.playing || this.simulationSpeed === 0) return 0;
    this.frameIndex += 1;
    const timeScale = this.timeMode === PARTICLE_TIME_MODE.UNSCALED ? 1 : finiteNonNegative(context.timeScale, 1, "timeScale");
    const scaledDelta = Math.min(this.maxDelta, delta) * timeScale * this.simulationSpeed;
    if (context.transform) this.updateTransform(context.transform);
    if (this.suspended) {
      if (this.suspensionBehavior === PARTICLE_SUSPENSION_BEHAVIOR.CATCH_UP) {
        this.deferredDelta = Math.min(this.maxCatchUp, this.deferredDelta + scaledDelta);
      }
      return 0;
    }
    const visible = context.visible !== false;
    if (!visible && this.cullingMode !== PARTICLE_CULLING_MODE.ALWAYS) {
      if (this.cullingMode === PARTICLE_CULLING_MODE.CATCH_UP || this.cullingMode === PARTICLE_CULLING_MODE.AUTOMATIC && (this.alive || this.wantsEmission)) {
        this.deferredDelta = Math.min(this.maxCatchUp, this.deferredDelta + scaledDelta);
      }
      return 0;
    }
    const totalDelta = scaledDelta + this.deferredDelta;
    this.deferredDelta = 0;
    return this._advance(totalDelta);
  }
  _advance(delta) {
    if (delta <= 0) return 0;
    if (this.timestepMode === PARTICLE_TIMESTEP_MODE.VARIABLE) {
      this._substep(delta);
      return 1;
    }
    this.accumulator += delta;
    let steps = 0;
    while (this.accumulator + Number.EPSILON >= this.fixedTimestep && steps < this.maxSubSteps && this.playing) {
      this._substep(this.fixedTimestep);
      this.accumulator -= this.fixedTimestep;
      if (this.accumulator < Number.EPSILON) this.accumulator = 0;
      steps += 1;
    }
    return steps;
  }
  _advanceExact(duration) {
    let remaining = duration;
    while (remaining + Number.EPSILON >= this.fixedTimestep && this.playing) {
      this._substep(this.fixedTimestep);
      remaining -= this.fixedTimestep;
      if (remaining < Number.EPSILON) remaining = 0;
    }
    if (remaining > 0 && this.playing) this._substep(remaining);
  }
  _evaluateModules(start, end, delta) {
    for (let index = start; index < end; index += 1) {
      const evaluator = this.moduleEvaluators[PARTICLE_MODULE_EVALUATION_ORDER[index]];
      if (typeof evaluator === "function") evaluator(this, delta, this.evaluationIndex);
    }
  }
  _advanceEmissionClock(delta) {
    let emissionDelta = delta;
    if (this.delayRemaining > 0) {
      const consumed = Math.min(this.delayRemaining, emissionDelta);
      this.delayRemaining -= consumed;
      emissionDelta -= consumed;
    }
    if (!this.wantsEmission || this.emissionEnded || emissionDelta <= 0) return 0;
    if (this.duration === 0) {
      if (!this.looping) {
        this.emissionEnded = true;
        this.wantsEmission = false;
      }
      return this.looping ? emissionDelta : 0;
    }
    if (!this.looping) emissionDelta = Math.min(emissionDelta, Math.max(0, this.duration - this.emissionTime));
    this.emissionTime += emissionDelta;
    if (this.looping) {
      while (this.emissionTime + Number.EPSILON >= this.duration) {
        this.emissionTime -= this.duration;
        if (this.emissionTime < Number.EPSILON) this.emissionTime = 0;
        this.cycle += 1;
        this._emitLifecycle(PARTICLE_LIFECYCLE_EVENT.LOOP, this.cycle);
      }
    } else if (this.emissionTime + Number.EPSILON >= this.duration) {
      this.emissionTime = this.duration;
      this.emissionEnded = true;
      this.wantsEmission = false;
    }
    return emissionDelta;
  }
  _substep(delta) {
    this.time += delta;
    this.emissionDelta = this._advanceEmissionClock(delta);
    this.velocityIntegratedByModule = false;
    this._evaluateModules(0, PRE_INTEGRATE_MODULE_COUNT, delta);
    const current = this.state.current;
    let slot = this.state.firstActiveSlot();
    while (slot !== -1) {
      if (!this.velocityIntegratedByModule) {
        current.velocityX[slot] += current.accelerationX[slot] * delta;
        current.velocityY[slot] += current.accelerationY[slot] * delta;
      }
      current.positionX[slot] += current.velocityX[slot] * delta;
      current.positionY[slot] += current.velocityY[slot] * delta;
      current.rotation[slot] += current.angularVelocity[slot] * delta;
      current.age[slot] = Math.min(current.lifetime[slot], current.age[slot] + delta);
      slot = this.state.nextActiveSlot(slot);
    }
    this._evaluateModules(PRE_INTEGRATE_MODULE_COUNT, PARTICLE_MODULE_EVALUATION_ORDER.length, delta);
    slot = this.state.firstActiveSlot();
    while (slot !== -1) {
      const next = this.state.nextActiveSlot(slot);
      if (current.lifetime[slot] <= 0 || current.age[slot] + Number.EPSILON >= current.lifetime[slot]) {
        const handle = this.state.handleForSlot(slot);
        const particleId = this.state.particleIdForSlot(slot);
        current.flags[slot] &= ~PARTICLE_FLAGS.ALIVE;
        this.state.release(handle);
        this._emitLifecycle(PARTICLE_LIFECYCLE_EVENT.PARTICLE_DEATH, handle, particleId);
      }
      slot = next;
    }
    this.evaluationIndex += 1;
    if (this.emissionEnded && !this.alive) this._complete();
  }
  simulate(targetTime, options = {}) {
    this._assertAvailable();
    const target = finiteNonNegative(targetTime, 0, "targetTime");
    if (options.restart !== false) {
      this.clear();
      this._resetClock();
      this.enabled = true;
      this.wantsEmission = true;
      this.playbackState = PARTICLE_PLAYBACK_STATE.PLAYING;
      const reset = typeof options.onReset === "function" ? options.onReset : this.onScrubReset;
      if (reset) reset(this);
    } else if (!this.playing) {
      this.playbackState = PARTICLE_PLAYBACK_STATE.PLAYING;
    }
    this.frameIndex += 1;
    if (target < this.time) {
      throw new ParticleSystem2DError("APS_LIFECYCLE_SCRUB_REWIND", "Rewinding requires simulate(..., { restart: true }).", { targetTime: target, currentTime: this.time });
    }
    this._advanceExact(target - this.time);
    this.time = target;
    if (this.playing) this.playbackState = PARTICLE_PLAYBACK_STATE.PAUSED;
    return this.time;
  }
  _complete() {
    if (this.completed) return;
    this.playbackState = PARTICLE_PLAYBACK_STATE.COMPLETED;
    this.wantsEmission = false;
    this._emitLifecycle(PARTICLE_LIFECYCLE_EVENT.COMPLETE, this.completeAction);
    this._applyStopAction(this.completeAction);
  }
  _applyStopAction(action) {
    if (action === PARTICLE_STOP_ACTION.CLEAR) this.clear();
    else if (action === PARTICLE_STOP_ACTION.DISABLE) {
      this.enabled = false;
      this._emitLifecycle(PARTICLE_LIFECYCLE_EVENT.DISABLE);
    } else if (action === PARTICLE_STOP_ACTION.DISPOSE) this.dispose();
  }
  dispose() {
    if (this.disposed) return;
    this._emitLifecycle(PARTICLE_LIFECYCLE_EVENT.DISPOSE);
    this.state.dispose();
    this.listeners = null;
    this.moduleEvaluators = null;
    this.disposed = true;
    this.enabled = false;
    this.wantsEmission = false;
    this.playbackState = PARTICLE_PLAYBACK_STATE.STOPPED;
  }
};
function createParticleSystem2D(options) {
  return new ParticleSystem2D(options);
}

// packages/melon-runtime/src/particle/particle-module-utils.js
function deterministicUnit(seed, ...path) {
  return deriveParticleSeed(seed, ...path) / 4294967296;
}
function scalarDefinition(value, type = "scalar") {
  if (typeof value === "number") return { type, mode: "constant", value };
  return value;
}
function vectorDefinition(value) {
  if (Array.isArray(value)) return { type: "vector2", mode: "constant", value };
  if (value && typeof value === "object" && Number.isFinite(value.x) && Number.isFinite(value.y) && !value.mode && !value.separateAxes) {
    return { type: "vector2", mode: "constant", value: [value.x, value.y] };
  }
  return value;
}
function colorDefinition(value) {
  if (Array.isArray(value)) return { type: "color", mode: "constant", value, colorSpace: "linear" };
  return value;
}
function compileScalar(value, context, path, type = "scalar") {
  return compileParticleValue(scalarDefinition(value, type), context, path);
}
function compileVector(value, context, path) {
  return compileParticleValue(vectorDefinition(value), context, path);
}
function compileColor(value, context, path) {
  return compileParticleValue(colorDefinition(value), context, path);
}
function evaluateScalar(compiled, time, seed, ...path) {
  return evaluateParticleValue(compiled, time, deterministicUnit(seed, ...path));
}
function addModuleEvaluator(system, moduleName, evaluator) {
  const previous = system.moduleEvaluators[moduleName];
  if (typeof previous !== "function") {
    system.moduleEvaluators[moduleName] = evaluator;
    return () => {
      if (system.moduleEvaluators?.[moduleName] === evaluator) delete system.moduleEvaluators[moduleName];
    };
  }
  const combined = (target, delta, evaluationIndex) => {
    previous(target, delta, evaluationIndex);
    evaluator(target, delta, evaluationIndex);
  };
  system.moduleEvaluators[moduleName] = combined;
  return () => {
    if (system.moduleEvaluators?.[moduleName] === combined) system.moduleEvaluators[moduleName] = previous;
  };
}
function clamp3(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

// packages/melon-runtime/src/particle/particle-main-emission.js
var PARTICLE_EMISSION_CATCH_UP = Object.freeze(["carry", "drop"]);
var PARTICLE_SCALING_MODES = Object.freeze(["hierarchy", "local", "shape"]);
var ParticleEmissionError = class extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "ParticleEmissionError";
    this.code = code;
    this.details = details;
  }
};
function compileBurst(burst, index, context) {
  const time = burst.time ?? 0;
  const cycles = burst.cycles ?? 1;
  const interval = burst.interval ?? 0;
  const probability = burst.probability ?? 1;
  if (!Number.isFinite(time) || time < 0 || !Number.isInteger(cycles) || cycles < 1 || !Number.isFinite(interval) || interval < 0 || !Number.isFinite(probability) || probability < 0 || probability > 1) {
    throw new ParticleEmissionError("APS_EMISSION_INVALID_BURST", `Invalid burst at index ${index}.`, { index });
  }
  return {
    id: String(burst.id ?? `burst.${index}`),
    time,
    count: compileScalar(burst.count ?? 1, context, `$.emission.bursts[${index}].count`),
    cycles,
    interval,
    probability,
    repeatOnLoop: burst.repeatOnLoop !== false
  };
}
function normalizeOptions2(options, context) {
  const main = options.main ?? {};
  const emission = options.emission ?? {};
  const maximum = main.maxParticles ?? options.system.state.capacity;
  const qualityAmountRatio = emission.qualityAmountRatio ?? main.qualityAmountRatio ?? 1;
  const maxSpawnPerStep = emission.maxSpawnPerFrame ?? emission.maxSpawnPerStep ?? 1024;
  if (!Number.isInteger(maximum) || maximum < 1 || !Number.isFinite(qualityAmountRatio) || qualityAmountRatio < 0 || !Number.isInteger(maxSpawnPerStep) || maxSpawnPerStep < 1) {
    throw new ParticleEmissionError("APS_EMISSION_INVALID_LIMIT", "Invalid maxParticles, qualityAmountRatio, or maxSpawnPerFrame.");
  }
  const catchUpPolicy = emission.catchUpPolicy ?? "carry";
  const scalingMode = main.scalingMode ?? "hierarchy";
  if (!PARTICLE_EMISSION_CATCH_UP.includes(catchUpPolicy) || !PARTICLE_SCALING_MODES.includes(scalingMode)) {
    throw new ParticleEmissionError("APS_EMISSION_INVALID_POLICY", "Invalid emission catch-up or scaling policy.");
  }
  return {
    main: {
      lifetime: compileScalar(main.startLifetime ?? 1, context, "$.main.startLifetime"),
      speed: compileScalar(main.startSpeed ?? 0, context, "$.main.startSpeed"),
      sizeX: compileScalar(main.startSizeX ?? main.startSize ?? 1, context, "$.main.startSizeX"),
      sizeY: compileScalar(main.startSizeY ?? main.startSize ?? 1, context, "$.main.startSizeY"),
      rotation: compileScalar(main.startRotation ?? 0, context, "$.main.startRotation", "angle"),
      color: compileColor(main.startColor ?? colorDefinition([1, 1, 1, 1]), context, "$.main.startColor"),
      gravityModifier: compileScalar(main.gravityModifier ?? 0, context, "$.main.gravityModifier"),
      maximum,
      scalingMode,
      playOnAwake: main.playOnAwake === true,
      stopAction: main.stopAction ?? options.system.stopAction,
      overflowPolicy: main.overflowPolicy ?? options.system.state.overflowPolicy
    },
    emission: {
      enabled: emission.enabled !== false,
      rateOverTime: compileScalar(emission.rateOverTime ?? 10, context, "$.emission.rateOverTime"),
      rateOverDistance: compileScalar(emission.rateOverDistance ?? 0, context, "$.emission.rateOverDistance"),
      rateOverSpeed: compileScalar(emission.rateOverSpeed ?? 0, context, "$.emission.rateOverSpeed"),
      bursts: (emission.bursts ?? []).map((burst, index) => compileBurst(burst, index, context)),
      qualityAmountRatio,
      maxSpawnPerStep,
      catchUpPolicy,
      teleportThreshold: emission.teleportThreshold ?? options.system.teleportDistance
    }
  };
}
var ParticleMainEmissionModule = class {
  constructor(system, options = {}) {
    if (!system?.state) throw new ParticleEmissionError("APS_EMISSION_INVALID_SYSTEM", "ParticleSystem2D is required.");
    this.system = system;
    this.context = options.context ?? {};
    const normalized = normalizeOptions2({ ...options, system }, this.context);
    this.main = normalized.main;
    this.emission = normalized.emission;
    this.rateAccumulator = 0;
    this.distanceAccumulator = 0;
    this.speedAccumulator = 0;
    this.emissionElapsed = 0;
    this.spawnSequence = 0;
    this.lastTransformX = system.currentTransform[0];
    this.lastTransformY = system.currentTransform[1];
    this.lastCycle = system.cycle;
    this.lastFrameIndex = -1;
    this.frameSpawnCount = 0;
    this.burstOccurrences = new Uint32Array(this.emission.bursts.length);
    this.initializers = [];
    this.postInitializers = [];
    this.scratchColor = new Float64Array(4);
    this.onSpawnScheduled = typeof options.onSpawnScheduled === "function" ? options.onSpawnScheduled : null;
    this.detachEvaluator = null;
    this.detachRestart = null;
    this.attached = false;
    this._applySystemSettings(options.main ?? {});
  }
  _applySystemSettings(main) {
    const system = this.system;
    if (Number.isFinite(main.duration) && main.duration >= 0) system.duration = main.duration;
    if (typeof main.looping === "boolean") system.looping = main.looping;
    if (Number.isFinite(main.startDelay) && main.startDelay >= 0) {
      system.startDelay = main.startDelay;
      system.delayRemaining = main.startDelay;
    }
    if (Number.isFinite(main.simulationSpeed) && main.simulationSpeed >= 0) system.simulationSpeed = main.simulationSpeed;
    if (["local", "world", "custom"].includes(main.simulationSpace)) system.simulationSpace = main.simulationSpace;
    system.scalingMode = this.main.scalingMode;
    if (["none", "clear", "disable", "dispose"].includes(this.main.stopAction)) system.stopAction = this.main.stopAction;
    if (["reject", "throw", "drop-oldest"].includes(this.main.overflowPolicy)) system.state.overflowPolicy = this.main.overflowPolicy;
  }
  attach() {
    if (this.attached) return this;
    this.detachEvaluator = addModuleEvaluator(this.system, "emission", (_system, delta) => this.update(delta));
    this.detachRestart = this.system.on("restart", () => this.reset());
    this.attached = true;
    if (this.main.playOnAwake && this.system.stopped) this.system.play();
    return this;
  }
  addSpawnInitializer(initializer) {
    if (typeof initializer !== "function") throw new TypeError("Spawn initializer must be a function.");
    if (!this.initializers.includes(initializer)) this.initializers.push(initializer);
    return () => {
      const index = this.initializers.indexOf(initializer);
      if (index >= 0) this.initializers.splice(index, 1);
    };
  }
  addPostSpawnInitializer(initializer) {
    if (typeof initializer !== "function") throw new TypeError("Post-spawn initializer must be a function.");
    if (!this.postInitializers.includes(initializer)) this.postInitializers.push(initializer);
    return () => {
      const index = this.postInitializers.indexOf(initializer);
      if (index >= 0) this.postInitializers.splice(index, 1);
    };
  }
  reset() {
    this.rateAccumulator = 0;
    this.distanceAccumulator = 0;
    this.speedAccumulator = 0;
    this.emissionElapsed = 0;
    this.spawnSequence = 0;
    this.burstOccurrences.fill(0);
    this.lastTransformX = this.system.currentTransform[0];
    this.lastTransformY = this.system.currentTransform[1];
    this.lastCycle = this.system.cycle;
    this.lastFrameIndex = -1;
    this.frameSpawnCount = 0;
  }
  _normalizedTime() {
    return this.system.duration > 0 ? clamp3(this.system.emissionTime / this.system.duration, 0, 1) : 0;
  }
  _random(channel, index = this.spawnSequence) {
    return deterministicUnit(this.system.effectSeed, "system", this.system.systemId, "emitter", this.system.emitterId, "emission", channel, index);
  }
  _initialize(slot, _handle, particleId, state, overrides) {
    const sampleIndex = this.spawnSequence++;
    const time = 0;
    const seed = state.current.randomSeed[slot];
    const start = state.start;
    start.lifetime[slot] = Math.max(0, evaluateScalar(this.main.lifetime, time, seed, "main", "lifetime"));
    const speed = evaluateScalar(this.main.speed, time, seed, "main", "speed");
    start.velocityX[slot] = speed;
    start.velocityY[slot] = 0;
    start.sizeX[slot] = evaluateScalar(this.main.sizeX, time, seed, "main", "size-x");
    start.sizeY[slot] = evaluateScalar(this.main.sizeY, time, seed, "main", "size-y");
    start.rotation[slot] = evaluateScalar(this.main.rotation, time, seed, "main", "rotation");
    evaluateParticleValue(this.main.color, time, this._random("color", particleId), this.scratchColor);
    start.color[slot] = packParticleColor(this.scratchColor[0], this.scratchColor[1], this.scratchColor[2], this.scratchColor[3]);
    state.current.accelerationY[slot] = evaluateScalar(this.main.gravityModifier, time, seed, "main", "gravity");
    for (let index = 0; index < this.initializers.length; index += 1) {
      this.initializers[index](slot, particleId, state, this.system, sampleIndex, overrides);
    }
    if (overrides) applyParticleOverrides(start, state.current, slot, overrides);
    for (let index = 0; index < this.postInitializers.length; index += 1) {
      this.postInitializers[index](slot, particleId, state, this.system, sampleIndex, overrides);
    }
  }
  _availableCount(requested, applyQuality = true) {
    const qualityCount = applyQuality ? Math.floor(requested * this.emission.qualityAmountRatio) : requested;
    const remaining = Math.max(0, Math.min(this.main.maximum, this.system.state.capacity) - this.system.state.activeCount);
    return Math.min(qualityCount, remaining);
  }
  emit(count = 1, overrides, applyQuality = true) {
    if (!Number.isInteger(count) || count < 0) throw new ParticleEmissionError("APS_EMISSION_INVALID_COUNT", "Manual emit count must be a non-negative integer.");
    const allowed = this._availableCount(count, applyQuality);
    const emitted = this.system.emit(allowed, (slot, handle, particleId, state) => this._initialize(slot, handle, particleId, state, overrides));
    return emitted;
  }
  stopEmission() {
    this.system.wantsEmission = false;
    this.system.emissionEnded = true;
    return this;
  }
  _spawnScheduled(count, timestamp, kind, sequence) {
    if (count <= 0) return 0;
    const emitted = this.emit(count, void 0, false);
    if (this.onSpawnScheduled && emitted > 0) this.onSpawnScheduled(timestamp, emitted, kind, sequence, this.system);
    return emitted;
  }
  _drainAccumulator(name, rate, delta, budget, frameStart) {
    if (rate <= 0 || delta <= 0) return budget;
    const accumulatorName = `${name}Accumulator`;
    const before = this[accumulatorName];
    const total = before + rate * delta;
    const requested = Math.floor(total + 1e-9);
    const spawning = Math.min(requested, budget);
    let emittedTotal = 0;
    for (let index = 0; index < spawning; index += 1) {
      const offset = rate > 0 ? clamp3((index + 1 - before) / rate, 0, delta) : delta;
      const emitted = this._spawnScheduled(1, frameStart + offset, name, this.spawnSequence);
      if (emitted === 0) break;
      emittedTotal += emitted;
    }
    this[accumulatorName] = this.emission.catchUpPolicy === "carry" ? total - emittedTotal : total - Math.floor(total);
    if (this[accumulatorName] < 1e-9) this[accumulatorName] = 0;
    if (this[accumulatorName] > this.emission.maxSpawnPerStep * 4) this[accumulatorName] = this.emission.maxSpawnPerStep * 4;
    return budget - emittedTotal;
  }
  _processBursts(previousElapsed, currentElapsed, budget) {
    for (let index = 0; index < this.emission.bursts.length && budget > 0; index += 1) {
      const burst = this.emission.bursts[index];
      let occurrence = this.burstOccurrences[index];
      const loopDuration = this.system.duration > 0 ? this.system.duration : Infinity;
      while (budget > 0) {
        const localOccurrence = occurrence % burst.cycles;
        const loop = Math.floor(occurrence / burst.cycles);
        if (loop > 0 && (!this.system.looping || !burst.repeatOnLoop || !Number.isFinite(loopDuration))) break;
        const timestamp = loop * loopDuration + burst.time + localOccurrence * burst.interval;
        if (timestamp > currentElapsed + Number.EPSILON) break;
        occurrence += 1;
        this.burstOccurrences[index] = occurrence;
        if (timestamp + Number.EPSILON < previousElapsed && this.emission.catchUpPolicy === "drop") continue;
        if (this._random(`burst.${burst.id}`, occurrence) > burst.probability) continue;
        const count = Math.max(0, Math.floor(evaluateParticleValue(burst.count, 0, this._random(`burst-count.${burst.id}`, occurrence))));
        const requested = Math.min(Math.floor(count * this.emission.qualityAmountRatio), budget);
        const emitted = this._spawnScheduled(requested, this.system.startDelay + timestamp, "burst", occurrence);
        budget -= emitted;
        if (emitted < requested) return 0;
      }
    }
    return budget;
  }
  update(delta) {
    if (!this.emission.enabled || this.system.emissionDelta <= 0 || this.system.disposed) return 0;
    if (this.lastFrameIndex !== this.system.frameIndex) {
      this.lastFrameIndex = this.system.frameIndex;
      this.frameSpawnCount = 0;
    }
    const emissionDelta = this.system.emissionDelta;
    const previousElapsed = this.emissionElapsed;
    this.emissionElapsed += emissionDelta;
    let budget = Math.max(0, this.emission.maxSpawnPerStep - this.frameSpawnCount);
    const initialBudget = budget;
    budget = this._processBursts(previousElapsed, this.emissionElapsed, budget);
    const normalizedTime = this._normalizedTime();
    const frameStart = this.system.time - emissionDelta;
    const rateTime = Math.max(0, evaluateScalar(this.emission.rateOverTime, normalizedTime, this.system.effectSeed, "rate-time", this.system.evaluationIndex));
    budget = this._drainAccumulator("rate", rateTime * this.emission.qualityAmountRatio, emissionDelta, budget, frameStart);
    const x = this.system.currentTransform[0];
    const y = this.system.currentTransform[1];
    const dx = x - this.lastTransformX;
    const dy = y - this.lastTransformY;
    const distance = Math.hypot(dx, dy);
    const teleported = this.system.teleported || distance > this.emission.teleportThreshold;
    this.lastTransformX = x;
    this.lastTransformY = y;
    if (!teleported && distance > 0 && budget > 0) {
      const rateDistance = Math.max(0, evaluateScalar(this.emission.rateOverDistance, normalizedTime, this.system.effectSeed, "rate-distance", this.system.evaluationIndex));
      budget = this._drainAccumulator("distance", rateDistance * this.emission.qualityAmountRatio, distance, budget, frameStart);
      const speed = distance / emissionDelta;
      const rateSpeed = Math.max(0, evaluateScalar(this.emission.rateOverSpeed, normalizedTime, this.system.effectSeed, "rate-speed", this.system.evaluationIndex));
      budget = this._drainAccumulator("speed", rateSpeed * speed * this.emission.qualityAmountRatio, emissionDelta, budget, frameStart);
    }
    const spawned = initialBudget - budget;
    this.frameSpawnCount += spawned;
    return spawned;
  }
  dispose() {
    this.detachEvaluator?.();
    this.detachRestart?.();
    this.initializers.length = 0;
    this.postInitializers.length = 0;
    this.attached = false;
  }
};
function applyParticleOverrides(start, current, slot, overrides) {
  if (Number.isFinite(overrides.lifetime)) start.lifetime[slot] = Math.max(0, overrides.lifetime);
  if (Number.isFinite(overrides.positionX)) start.positionX[slot] = overrides.positionX;
  if (Number.isFinite(overrides.positionY)) start.positionY[slot] = overrides.positionY;
  if (Number.isFinite(overrides.velocityX)) start.velocityX[slot] = overrides.velocityX;
  if (Number.isFinite(overrides.velocityY)) start.velocityY[slot] = overrides.velocityY;
  if (Number.isFinite(overrides.sizeX)) start.sizeX[slot] = Math.max(0, overrides.sizeX);
  if (Number.isFinite(overrides.sizeY)) start.sizeY[slot] = Math.max(0, overrides.sizeY);
  if (Number.isFinite(overrides.rotation)) start.rotation[slot] = overrides.rotation;
  if (Number.isInteger(overrides.color)) start.color[slot] = overrides.color >>> 0;
  if (Number.isInteger(overrides.randomSeed)) current.randomSeed[slot] = overrides.randomSeed >>> 0;
}
function createParticleMainEmissionModule(system, options) {
  return new ParticleMainEmissionModule(system, options);
}

// packages/melon-runtime/src/particle/particle-shapes.js
var PARTICLE_SHAPE_TYPES = Object.freeze([
  "point",
  "line",
  "rectangle",
  "circle",
  "ring",
  "arc",
  "ellipse",
  "polygon",
  "polyline",
  "path",
  "capsule",
  "custom-points",
  "alpha-mask",
  "sprite-silhouette",
  "object-shape",
  "socket"
]);
var PARTICLE_SHAPE_DIRECTIONS = Object.freeze([
  "fixed",
  "shape-normal",
  "radial-out",
  "radial-in",
  "tangent",
  "target",
  "random"
]);
var PARTICLE_SHAPE_DISTRIBUTIONS = Object.freeze(["ordered", "random", "loop", "ping-pong"]);
var ParticleShapeError = class extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "ParticleShapeError";
    this.code = code;
    this.details = details;
  }
};
function finite(value, fallback, name) {
  const result = value ?? fallback;
  if (!Number.isFinite(result)) throw new ParticleShapeError("APS_SHAPE_INVALID_VALUE", `${name} must be finite.`, { name, value: result });
  return result;
}
function point(value, fallbackX = 0, fallbackY = 0) {
  const x = Array.isArray(value) ? value[0] : value?.x;
  const y = Array.isArray(value) ? value[1] : value?.y;
  return [finite(x, fallbackX, "point.x"), finite(y, fallbackY, "point.y")];
}
function normalize(x, y, output, offset = 2) {
  const length = Math.hypot(x, y);
  if (length <= 1e-12) {
    output[offset] = 1;
    output[offset + 1] = 0;
  } else {
    output[offset] = x / length;
    output[offset + 1] = y / length;
  }
}
function polygonArea(points) {
  let area = 0;
  for (let index = 0; index < points.length; index += 1) {
    const next = (index + 1) % points.length;
    area += points[index][0] * points[next][1] - points[next][0] * points[index][1];
  }
  return area * 0.5;
}
function cross(a, b, c) {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
}
function insideTriangle(pointValue, a, b, c) {
  const first = cross(a, b, pointValue);
  const second = cross(b, c, pointValue);
  const third = cross(c, a, pointValue);
  return first >= -1e-10 && second >= -1e-10 && third >= -1e-10 || first <= 1e-10 && second <= 1e-10 && third <= 1e-10;
}
function triangulate(points) {
  if (points.length < 3) throw new ParticleShapeError("APS_SHAPE_INVALID_POLYGON", "Polygon requires at least three points.");
  const order = Array.from({ length: points.length }, (_, index) => index);
  if (polygonArea(points) < 0) order.reverse();
  const triangles = [];
  let guard = points.length * points.length;
  while (order.length > 3 && guard-- > 0) {
    let clipped = false;
    for (let cursor = 0; cursor < order.length; cursor += 1) {
      const previous = order[(cursor + order.length - 1) % order.length];
      const current = order[cursor];
      const next = order[(cursor + 1) % order.length];
      if (cross(points[previous], points[current], points[next]) <= 1e-10) continue;
      let contains = false;
      for (let test = 0; test < order.length; test += 1) {
        const candidate = order[test];
        if (candidate === previous || candidate === current || candidate === next) continue;
        if (insideTriangle(points[candidate], points[previous], points[current], points[next])) {
          contains = true;
          break;
        }
      }
      if (contains) continue;
      triangles.push(previous, current, next);
      order.splice(cursor, 1);
      clipped = true;
      break;
    }
    if (!clipped) break;
  }
  if (order.length === 3) triangles.push(order[0], order[1], order[2]);
  if (triangles.length < 3) throw new ParticleShapeError("APS_SHAPE_INVALID_POLYGON", "Polygon cannot be triangulated.");
  return new Uint32Array(triangles);
}
function cumulativeEdges(points, closed) {
  const count = closed ? points.length : points.length - 1;
  const cumulative = new Float64Array(Math.max(0, count));
  let total = 0;
  for (let index = 0; index < count; index += 1) {
    const next = (index + 1) % points.length;
    total += Math.hypot(points[next][0] - points[index][0], points[next][1] - points[index][1]);
    cumulative[index] = total;
  }
  return { cumulative, total };
}
function cumulativeTriangles(points, triangles) {
  const cumulative = new Float64Array(triangles.length / 3);
  let total = 0;
  for (let index = 0; index < triangles.length; index += 3) {
    total += Math.abs(cross(points[triangles[index]], points[triangles[index + 1]], points[triangles[index + 2]])) * 0.5;
    cumulative[index / 3] = total;
  }
  return { cumulative, total };
}
function compileMask(mask, threshold) {
  if (!mask || !Number.isInteger(mask.width) || !Number.isInteger(mask.height) || mask.width < 1 || mask.height < 1 || !mask.data || mask.data.length < mask.width * mask.height) {
    throw new ParticleShapeError("APS_SHAPE_OPTIONAL_SOURCE", "Alpha mask requires width, height, and alpha data.");
  }
  const points = [];
  for (let y = 0; y < mask.height; y += 1) {
    for (let x = 0; x < mask.width; x += 1) {
      const alpha = mask.data[y * mask.width + x];
      const normalized = alpha > 1 ? alpha / 255 : alpha;
      if (normalized >= threshold) points.push([x + 0.5 - mask.width / 2, y + 0.5 - mask.height / 2]);
    }
  }
  if (points.length === 0) throw new ParticleShapeError("APS_SHAPE_EMPTY_SOURCE", "Alpha mask has no sampleable pixels.");
  return points;
}
function validateEnum(value, values, name) {
  if (!values.includes(value)) throw new ParticleShapeError("APS_SHAPE_INVALID_VALUE", `Unknown ${name} '${value}'.`);
  return value;
}
function compileParticleShape(source = {}, options = {}) {
  const type = validateEnum(source.type ?? "point", PARTICLE_SHAPE_TYPES, "shape type");
  const emitFrom = source.emitFrom ?? (type === "polygon" ? "interior" : "area");
  let points = (source.points ?? []).map((value) => point(value));
  if (["alpha-mask", "sprite-silhouette"].includes(type)) points = compileMask(source.mask ?? options.mask, source.alphaThreshold ?? 0.5);
  if (["object-shape", "socket"].includes(type)) {
    const resolved = options.resolveObjectPoints?.(source.objectId, source.socketId, type);
    if (!resolved) throw new ParticleShapeError("APS_SHAPE_OPTIONAL_SOURCE", `${type} requires resolveObjectPoints integration.`);
    points = resolved.map((value) => point(value));
  }
  if (["polygon", "polyline", "path"].includes(type) && points.length < (type === "polygon" ? 3 : 2)) {
    throw new ParticleShapeError("APS_SHAPE_INVALID_POINTS", `${type} has insufficient points.`);
  }
  if (type === "custom-points" && points.length < 1) throw new ParticleShapeError("APS_SHAPE_INVALID_POINTS", "custom-points requires at least one point.");
  const triangles = type === "polygon" ? triangulate(points) : null;
  const triangleWeights = triangles ? cumulativeTriangles(points, triangles) : null;
  const closedEdges = type === "polygon";
  const edgeWeights = points.length > 1 ? cumulativeEdges(points, closedEdges) : null;
  const position = point(source.position);
  const scale = point(source.scale, 1, 1);
  const fixedDirection = point(source.fixedDirection, 1, 0);
  const target = point(source.target, 0, 0);
  const radius = Math.max(0, finite(source.radius, 1, "radius"));
  const innerRadius = clamp3(finite(source.innerRadius, type === "ring" ? radius * 0.5 : 0, "innerRadius"), 0, radius);
  const compiled = {
    kind: "particle-shape-compiled",
    type,
    emitFrom,
    distribution: validateEnum(source.distribution ?? "random", PARTICLE_SHAPE_DISTRIBUTIONS, "distribution"),
    direction: validateEnum(source.direction ?? "shape-normal", PARTICLE_SHAPE_DIRECTIONS, "direction"),
    position: new Float64Array(position),
    rotation: finite(source.rotation, 0, "rotation"),
    scale: new Float64Array(scale),
    width: Math.max(0, finite(source.width ?? source.dimensions?.x, 1, "width")),
    height: Math.max(0, finite(source.height ?? source.dimensions?.y, 1, "height")),
    length: Math.max(0, finite(source.length, 1, "length")),
    radius,
    innerRadius,
    thickness: Math.max(0, finite(source.thickness, 0, "thickness")),
    arcStart: finite(source.arcStart, 0, "arcStart"),
    arcRange: clamp3(finite(source.arcRange, 360, "arcRange"), -360, 360),
    positionJitter: Math.max(0, finite(source.positionJitter, 0, "positionJitter")),
    directionBlend: clamp3(finite(source.directionBlend, 0, "directionBlend"), 0, 1),
    sequenceLength: Math.max(2, Math.floor(finite(source.sequenceLength, 64, "sequenceLength"))),
    fixedDirection: new Float64Array(fixedDirection),
    target: new Float64Array(target),
    tangentSign: source.tangentSign === -1 ? -1 : 1,
    seed: source.seed ?? options.seed ?? 1,
    points,
    triangles,
    triangleWeights,
    edgeWeights,
    sourceRef: source.objectId ?? source.textureId ?? null,
    disposed: false,
    dispose() {
      this.points = null;
      this.triangles = null;
      this.triangleWeights = null;
      this.edgeWeights = null;
      this.disposed = true;
    }
  };
  return compiled;
}
function random(compiled, sampleIndex, channel) {
  return deterministicUnit(compiled.seed, "shape", compiled.type, sampleIndex, channel);
}
function sequenceFraction(compiled, sampleIndex) {
  const count = compiled.sequenceLength;
  if (compiled.distribution === "random") return random(compiled, sampleIndex, "distribution");
  if (compiled.distribution === "ordered") return Math.min(sampleIndex, count - 1) / (count - 1);
  if (compiled.distribution === "loop") return sampleIndex % count / (count - 1);
  const period = (count - 1) * 2;
  const cursor = sampleIndex % period;
  return (cursor <= count - 1 ? cursor : period - cursor) / (count - 1);
}
function discreteIndex(compiled, sampleIndex, count) {
  if (compiled.distribution === "random") return Math.min(count - 1, Math.floor(random(compiled, sampleIndex, "discrete") * count));
  if (compiled.distribution === "ordered") return Math.min(sampleIndex, count - 1);
  if (compiled.distribution === "loop") return sampleIndex % count;
  if (count === 1) return 0;
  const period = (count - 1) * 2;
  const cursor = sampleIndex % period;
  return cursor <= count - 1 ? cursor : period - cursor;
}
function weightedIndex(cumulative, total, amount) {
  const target = amount * total;
  let low = 0;
  let high = cumulative.length - 1;
  while (low < high) {
    const middle = low + high >>> 1;
    if (target <= cumulative[middle]) high = middle;
    else low = middle + 1;
  }
  return low;
}
function sampleEdge(compiled, sampleIndex, output, closed) {
  const weights = compiled.edgeWeights;
  const amount = sequenceFraction(compiled, sampleIndex);
  const edge = weightedIndex(weights.cumulative, weights.total, amount);
  const previous = edge === 0 ? 0 : weights.cumulative[edge - 1];
  const local = weights.cumulative[edge] === previous ? 0 : (amount * weights.total - previous) / (weights.cumulative[edge] - previous);
  const a = compiled.points[edge];
  const b = compiled.points[(edge + 1) % compiled.points.length];
  output[0] = a[0] + (b[0] - a[0]) * clamp3(local, 0, 1);
  output[1] = a[1] + (b[1] - a[1]) * clamp3(local, 0, 1);
  const winding = closed && polygonArea(compiled.points) < 0 ? -1 : 1;
  normalize((b[1] - a[1]) * winding, -(b[0] - a[0]) * winding, output);
}
function samplePolygonInterior(compiled, sampleIndex, output) {
  const weights = compiled.triangleWeights;
  const triangle = weightedIndex(weights.cumulative, weights.total, random(compiled, sampleIndex, "triangle"));
  const offset = triangle * 3;
  const a = compiled.points[compiled.triangles[offset]];
  const b = compiled.points[compiled.triangles[offset + 1]];
  const c = compiled.points[compiled.triangles[offset + 2]];
  const root = Math.sqrt(random(compiled, sampleIndex, "barycentric-a"));
  const second = random(compiled, sampleIndex, "barycentric-b");
  const wa = 1 - root;
  const wb = root * (1 - second);
  const wc = root * second;
  output[0] = a[0] * wa + b[0] * wb + c[0] * wc;
  output[1] = a[1] * wa + b[1] * wb + c[1] * wc;
  normalize(output[0], output[1], output);
}
function sampleRectangle(compiled, sampleIndex, output) {
  const halfWidth = compiled.width * 0.5;
  const halfHeight = compiled.height * 0.5;
  if (compiled.emitFrom !== "edge") {
    output[0] = (random(compiled, sampleIndex, "rect-x") * 2 - 1) * halfWidth;
    output[1] = (random(compiled, sampleIndex, "rect-y") * 2 - 1) * halfHeight;
    normalize(output[0], output[1], output);
    return;
  }
  const perimeter = 2 * (compiled.width + compiled.height);
  let cursor = sequenceFraction(compiled, sampleIndex) * perimeter;
  if (cursor < compiled.width) {
    output[0] = -halfWidth + cursor;
    output[1] = -halfHeight;
    output[2] = 0;
    output[3] = -1;
    return;
  }
  cursor -= compiled.width;
  if (cursor < compiled.height) {
    output[0] = halfWidth;
    output[1] = -halfHeight + cursor;
    output[2] = 1;
    output[3] = 0;
    return;
  }
  cursor -= compiled.height;
  if (cursor < compiled.width) {
    output[0] = halfWidth - cursor;
    output[1] = halfHeight;
    output[2] = 0;
    output[3] = 1;
    return;
  }
  output[0] = -halfWidth;
  output[1] = halfHeight - (cursor - compiled.width);
  output[2] = -1;
  output[3] = 0;
}
function sampleRadial(compiled, sampleIndex, output, ellipse = false) {
  const angle = (compiled.arcStart + compiled.arcRange * sequenceFraction(compiled, sampleIndex)) * Math.PI / 180;
  let radius = compiled.radius;
  if (compiled.emitFrom !== "edge") {
    const minimumSquared = compiled.innerRadius * compiled.innerRadius;
    radius = Math.sqrt(minimumSquared + random(compiled, sampleIndex, "radius") * (compiled.radius * compiled.radius - minimumSquared));
  }
  const radiusX = ellipse ? compiled.width * 0.5 : radius;
  const radiusY = ellipse ? compiled.height * 0.5 : radius;
  const radialScale = ellipse && compiled.emitFrom !== "edge" ? radius / Math.max(compiled.radius, 1e-12) : 1;
  output[0] = Math.cos(angle) * radiusX * radialScale;
  output[1] = Math.sin(angle) * radiusY * radialScale;
  normalize(output[0] / Math.max(radiusX * radiusX, 1e-12), output[1] / Math.max(radiusY * radiusY, 1e-12), output);
}
function sampleCapsule(compiled, sampleIndex, output) {
  const rectangleArea = compiled.length * compiled.radius * 2;
  const capsArea = Math.PI * compiled.radius * compiled.radius;
  const choose = random(compiled, sampleIndex, "capsule-region") * (rectangleArea + capsArea);
  if (choose < rectangleArea) {
    output[0] = (random(compiled, sampleIndex, "capsule-x") - 0.5) * compiled.length;
    output[1] = (random(compiled, sampleIndex, "capsule-y") * 2 - 1) * compiled.radius;
    normalize(output[0], output[1], output);
    return;
  }
  const right = random(compiled, sampleIndex, "capsule-side") >= 0.5;
  const radial = Math.sqrt(random(compiled, sampleIndex, "capsule-radius")) * compiled.radius;
  const angle = (random(compiled, sampleIndex, "capsule-angle") - 0.5) * Math.PI + (right ? 0 : Math.PI);
  output[0] = (right ? 0.5 : -0.5) * compiled.length + Math.cos(angle) * radial;
  output[1] = Math.sin(angle) * radial;
  normalize(Math.cos(angle), Math.sin(angle), output);
}
function applyDirection(compiled, sampleIndex, output) {
  const radialX = output[0];
  const radialY = output[1];
  if (compiled.direction === "fixed") normalize(compiled.fixedDirection[0], compiled.fixedDirection[1], output);
  else if (compiled.direction === "radial-out") normalize(radialX, radialY, output);
  else if (compiled.direction === "radial-in") normalize(-radialX, -radialY, output);
  else if (compiled.direction === "tangent") normalize(-radialY * compiled.tangentSign, radialX * compiled.tangentSign, output);
  else if (compiled.direction === "target") normalize(radialX, radialY, output);
  else if (compiled.direction === "random") {
    const angle = random(compiled, sampleIndex, "direction") * Math.PI * 2;
    output[2] = Math.cos(angle);
    output[3] = Math.sin(angle);
  }
  if (compiled.directionBlend > 0) {
    normalize(
      output[2] * (1 - compiled.directionBlend) + compiled.fixedDirection[0] * compiled.directionBlend,
      output[3] * (1 - compiled.directionBlend) + compiled.fixedDirection[1] * compiled.directionBlend,
      output
    );
  }
}
function sampleParticleShape(compiled, sampleIndex, output = new Float64Array(4)) {
  if (!compiled || compiled.kind !== "particle-shape-compiled" || compiled.disposed) throw new ParticleShapeError("APS_SHAPE_DISPOSED", "Compiled shape is unavailable.");
  if (!Number.isInteger(sampleIndex) || sampleIndex < 0) throw new ParticleShapeError("APS_SHAPE_INVALID_INDEX", "sampleIndex must be non-negative integer.");
  output[0] = 0;
  output[1] = 0;
  output[2] = 1;
  output[3] = 0;
  if (compiled.type === "line") {
    const amount = sequenceFraction(compiled, sampleIndex);
    output[0] = (amount - 0.5) * compiled.length;
    output[2] = 0;
    output[3] = 1;
  } else if (compiled.type === "rectangle") sampleRectangle(compiled, sampleIndex, output);
  else if (["circle", "ring", "arc"].includes(compiled.type)) sampleRadial(compiled, sampleIndex, output);
  else if (compiled.type === "ellipse") sampleRadial(compiled, sampleIndex, output, true);
  else if (compiled.type === "polygon") {
    if (compiled.emitFrom === "vertices") {
      const selected = compiled.points[discreteIndex(compiled, sampleIndex, compiled.points.length)];
      output[0] = selected[0];
      output[1] = selected[1];
      normalize(output[0], output[1], output);
    } else if (compiled.emitFrom === "edge") sampleEdge(compiled, sampleIndex, output, true);
    else samplePolygonInterior(compiled, sampleIndex, output);
  } else if (["polyline", "path"].includes(compiled.type)) sampleEdge(compiled, sampleIndex, output, false);
  else if (compiled.type === "capsule") sampleCapsule(compiled, sampleIndex, output);
  else if (["custom-points", "alpha-mask", "sprite-silhouette", "object-shape", "socket"].includes(compiled.type)) {
    const selected = compiled.points[discreteIndex(compiled, sampleIndex, compiled.points.length)];
    output[0] = selected[0];
    output[1] = selected[1];
    normalize(output[0], output[1], output);
  }
  if (compiled.thickness > 0 && compiled.emitFrom === "edge") {
    const offset = (random(compiled, sampleIndex, "thickness") - 0.5) * compiled.thickness;
    output[0] += output[2] * offset;
    output[1] += output[3] * offset;
  }
  if (compiled.positionJitter > 0) {
    const angle = random(compiled, sampleIndex, "jitter-angle") * Math.PI * 2;
    const radius = Math.sqrt(random(compiled, sampleIndex, "jitter-radius")) * compiled.positionJitter;
    output[0] += Math.cos(angle) * radius;
    output[1] += Math.sin(angle) * radius;
  }
  applyDirection(compiled, sampleIndex, output);
  const radians = compiled.rotation * Math.PI / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const x = output[0] * compiled.scale[0];
  const y = output[1] * compiled.scale[1];
  output[0] = compiled.position[0] + x * cosine - y * sine;
  output[1] = compiled.position[1] + x * sine + y * cosine;
  const directionX = output[2] * compiled.scale[0];
  const directionY = output[3] * compiled.scale[1];
  normalize(directionX * cosine - directionY * sine, directionX * sine + directionY * cosine, output);
  if (compiled.direction === "target") {
    normalize(compiled.target[0] - output[0], compiled.target[1] - output[1], output);
  }
  return output;
}
function attachParticleShape(emissionModule, compiled) {
  const output = new Float64Array(4);
  return emissionModule.addSpawnInitializer((slot, _particleId, state, _system, sampleIndex) => {
    sampleParticleShape(compiled, sampleIndex, output);
    const start = state.start;
    start.positionX[slot] += output[0];
    start.positionY[slot] += output[1];
    let speed = Math.hypot(start.velocityX[slot], start.velocityY[slot]);
    if (start.velocityX[slot] < 0) speed = -speed;
    start.velocityX[slot] = output[2] * speed;
    start.velocityY[slot] = output[3] * speed;
  });
}
function particleShapeGizmoData(compiled) {
  if (!compiled || compiled.disposed) throw new ParticleShapeError("APS_SHAPE_DISPOSED", "Compiled shape is unavailable.");
  return {
    type: compiled.type,
    emitFrom: compiled.emitFrom,
    position: Array.from(compiled.position),
    rotation: compiled.rotation,
    scale: Array.from(compiled.scale),
    dimensions: { width: compiled.width, height: compiled.height, length: compiled.length },
    radius: compiled.radius,
    innerRadius: compiled.innerRadius,
    arc: { start: compiled.arcStart, range: compiled.arcRange },
    points: compiled.points ? compiled.points.map((value) => [...value]) : []
  };
}

// packages/melon-runtime/src/particle/particle-motion.js
var PARTICLE_COMPOSITION_MODES = Object.freeze(["add", "override", "multiply"]);
var PARTICLE_INTEGRATORS = Object.freeze(["semi-implicit-euler"]);
var ParticleMotionError = class extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "ParticleMotionError";
    this.code = code;
    this.details = details;
  }
};
function composition(value, fallback, path) {
  const result = value ?? fallback;
  if (!PARTICLE_COMPOSITION_MODES.includes(result)) throw new ParticleMotionError("APS_MOTION_INVALID_COMPOSITION", `Invalid composition at ${path}.`, { value: result });
  return result;
}
function finite2(value, fallback, path, minimum = -Infinity) {
  const result = value ?? fallback;
  if (!Number.isFinite(result) || result < minimum) throw new ParticleMotionError("APS_MOTION_INVALID_VALUE", `${path} must be finite and >= ${minimum}.`, { value: result });
  return result;
}
function scalarInput(value) {
  return typeof value === "number" ? { type: "scalar", mode: "constant", value } : value;
}
function vectorInput(value, x = 0, y = 0) {
  if (Array.isArray(value)) return value;
  const source = value && typeof value === "object" ? value : { x, y };
  if (source.type === "vector2" || source.separateAxes === true) return source;
  if (Number.isFinite(source.x) && Number.isFinite(source.y)) return source;
  return { type: "vector2", separateAxes: true, x: scalarInput(source.x ?? x), y: scalarInput(source.y ?? y) };
}
function normalizeConfig(options, context) {
  const velocity = options.velocityOverLifetime ?? {};
  const force = options.forceOverLifetime ?? {};
  const inherit = options.inheritVelocity ?? {};
  const lifetime = options.lifetimeByEmitterSpeed ?? {};
  const limit = options.limitVelocity ?? {};
  const align = options.alignToVelocity ?? {};
  const initial = options.initialVelocity ?? {};
  const integrator = options.integrator ?? "semi-implicit-euler";
  if (!PARTICLE_INTEGRATORS.includes(integrator)) throw new ParticleMotionError("APS_MOTION_INVALID_INTEGRATOR", `Unsupported integrator '${integrator}'.`);
  const mass = compileScalar(force.mass ?? 1, context, "$.forceOverLifetime.mass");
  if (mass.mode === "constant" && mass.value <= 0) throw new ParticleMotionError("APS_MOTION_ZERO_MASS", "Particle mass must be greater than zero.");
  return {
    integrator,
    initial: {
      enabled: initial.enabled !== false,
      value: compileVector(vectorInput(initial.value ?? initial.velocity, initial.x ?? 0, initial.y ?? 0), context, "$.initialVelocity.value"),
      space: initial.space ?? "local",
      composition: composition(initial.composition, "add", "$.initialVelocity.composition")
    },
    velocity: {
      enabled: velocity.enabled === true,
      value: compileVector(vectorInput(velocity.value, velocity.x ?? 0, velocity.y ?? 0), context, "$.velocityOverLifetime.value"),
      orbital: compileScalar(velocity.orbital ?? 0, context, "$.velocityOverLifetime.orbital", "angle"),
      radial: compileScalar(velocity.radial ?? 0, context, "$.velocityOverLifetime.radial"),
      tangential: compileScalar(velocity.tangential ?? 0, context, "$.velocityOverLifetime.tangential"),
      speedModifier: compileScalar(velocity.speedModifier ?? 1, context, "$.velocityOverLifetime.speedModifier"),
      space: velocity.space ?? "local",
      composition: composition(velocity.composition, "add", "$.velocityOverLifetime.composition")
    },
    force: {
      enabled: force.enabled === true,
      value: compileVector(vectorInput(force.value, force.x ?? 0, force.y ?? 0), context, "$.forceOverLifetime.value"),
      gravity: compileVector(vectorInput(force.gravity, 0, 0), context, "$.forceOverLifetime.gravity"),
      gravityModifier: compileScalar(force.gravityModifier ?? 1, context, "$.forceOverLifetime.gravityModifier"),
      mass,
      linearDrag: compileScalar(force.linearDrag ?? 0, context, "$.forceOverLifetime.linearDrag"),
      quadraticDrag: compileScalar(force.quadraticDrag ?? 0, context, "$.forceOverLifetime.quadraticDrag"),
      linearAcceleration: compileScalar(force.linearAcceleration ?? force.linearAccel ?? 0, context, "$.forceOverLifetime.linearAcceleration"),
      radialAcceleration: compileScalar(force.radialAcceleration ?? force.radialAccel ?? 0, context, "$.forceOverLifetime.radialAcceleration"),
      tangentialAcceleration: compileScalar(force.tangentialAcceleration ?? force.tangentialAccel ?? 0, context, "$.forceOverLifetime.tangentialAcceleration"),
      damping: compileScalar(force.damping ?? force.linearDamping ?? 0, context, "$.forceOverLifetime.damping"),
      space: force.space ?? "world",
      composition: composition(force.composition, "add", "$.forceOverLifetime.composition")
    },
    inherit: {
      translational: finite2(inherit.translational, 0, "$.inheritVelocity.translational"),
      angular: finite2(inherit.angular, 0, "$.inheritVelocity.angular")
    },
    lifetime: {
      enabled: lifetime.enabled === true,
      multiplier: compileScalar(lifetime.multiplier ?? 1, context, "$.lifetimeByEmitterSpeed.multiplier"),
      referenceSpeed: finite2(lifetime.referenceSpeed, 100, "$.lifetimeByEmitterSpeed.referenceSpeed", 1e-6)
    },
    limit: {
      enabled: limit.enabled === true,
      magnitude: finite2(limit.magnitude, Number.MAX_VALUE, "$.limitVelocity.magnitude", 0),
      x: finite2(limit.x, Number.MAX_VALUE, "$.limitVelocity.x", 0),
      y: finite2(limit.y, Number.MAX_VALUE, "$.limitVelocity.y", 0),
      dampening: clamp3(finite2(limit.dampening, 1, "$.limitVelocity.dampening", 0), 0, 1)
    },
    align: {
      enabled: align.enabled === true,
      offset: compileScalar(align.trajectoryOffset ?? align.offset ?? 0, context, "$.alignToVelocity.trajectoryOffset", "angle")
    },
    maxNumericSpeed: finite2(options.maxNumericSpeed, 1e6, "$.maxNumericSpeed", 1)
  };
}
function rotate(x, y, degrees2, output) {
  const radians = degrees2 * Math.PI / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  output[0] = x * cosine - y * sine;
  output[1] = x * sine + y * cosine;
}
function angleDelta(current, previous) {
  let result = (current - previous) % 360;
  if (result > 180) result -= 360;
  if (result < -180) result += 360;
  return result;
}
var ParticleMotionModule = class {
  constructor(system, options = {}) {
    if (!system?.state) throw new ParticleMotionError("APS_MOTION_INVALID_SYSTEM", "ParticleSystem2D is required.");
    this.system = system;
    this.context = options.context ?? {};
    this.config = normalizeConfig(options, this.context);
    this.capacity = system.state.capacity;
    this.structureVersion = system.state.structureVersion;
    this.baseVelocityX = new Float32Array(this.capacity);
    this.baseVelocityY = new Float32Array(this.capacity);
    this.moduleVelocityX = new Float32Array(this.capacity);
    this.moduleVelocityY = new Float32Array(this.capacity);
    this.baseAccelerationX = new Float32Array(this.capacity);
    this.baseAccelerationY = new Float32Array(this.capacity);
    this.seenGeneration = new Uint32Array(this.capacity);
    this.vectorScratch = new Float64Array(2);
    this.spaceScratch = new Float64Array(2);
    this.lastTransform = new Float64Array(system.currentTransform);
    this.emitterVelocityX = 0;
    this.emitterVelocityY = 0;
    this.emitterAngularVelocity = 0;
    this.attached = false;
    this.detachVelocity = null;
    this.detachForce = null;
    this.detachRestart = null;
  }
  _ensureCapacity() {
    if (this.structureVersion === this.system.state.structureVersion && this.capacity === this.system.state.capacity) return;
    const capacity = this.system.state.capacity;
    for (const name of ["baseVelocityX", "baseVelocityY", "moduleVelocityX", "moduleVelocityY", "baseAccelerationX", "baseAccelerationY", "seenGeneration"]) {
      const previous = this[name];
      const next = new previous.constructor(capacity);
      next.set(previous.subarray(0, Math.min(previous.length, capacity)));
      this[name] = next;
    }
    this.capacity = capacity;
    this.structureVersion = this.system.state.structureVersion;
  }
  attach() {
    if (this.attached) return this;
    this.detachVelocity = addModuleEvaluator(this.system, "velocityOverLifetime", (_system, delta) => this.evaluateVelocity(delta));
    this.detachForce = addModuleEvaluator(this.system, "forceOverLifetime", (_system, delta) => this.evaluateForce(delta));
    this.detachRestart = this.system.on("restart", () => this.reset());
    this.attached = true;
    return this;
  }
  reset() {
    this.seenGeneration.fill(0);
    this.baseVelocityX.fill(0);
    this.baseVelocityY.fill(0);
    this.moduleVelocityX.fill(0);
    this.moduleVelocityY.fill(0);
    this.baseAccelerationX.fill(0);
    this.baseAccelerationY.fill(0);
    this.lastTransform.set(this.system.currentTransform);
  }
  adoptCurrentVelocity(slot) {
    this._ensureCapacity();
    this._initializeSlot(slot);
    const current = this.system.state.current;
    const velocity = this.config.velocity;
    const outgoingX = current.velocityX[slot];
    const outgoingY = current.velocityY[slot];
    if (!velocity.enabled) {
      this.baseVelocityX[slot] = outgoingX;
      this.baseVelocityY[slot] = outgoingY;
    } else if (velocity.composition === "add") {
      this.baseVelocityX[slot] = outgoingX - this.moduleVelocityX[slot];
      this.baseVelocityY[slot] = outgoingY - this.moduleVelocityY[slot];
    } else if (velocity.composition === "multiply") {
      const multiplierX = this.moduleVelocityX[slot];
      const multiplierY = this.moduleVelocityY[slot];
      this.baseVelocityX[slot] = Math.abs(multiplierX) > 1e-12 ? outgoingX / multiplierX : outgoingX;
      this.baseVelocityY[slot] = Math.abs(multiplierY) > 1e-12 ? outgoingY / multiplierY : outgoingY;
    }
    return this;
  }
  _random(slot, channel) {
    return deterministicUnit(this.system.state.current.randomSeed[slot], "motion", channel);
  }
  _convertVector(x, y, space, output = this.spaceScratch) {
    const simulation = this.system.simulationSpace;
    if (space === simulation || space === "local" && simulation === "local" || space === "world" && simulation === "world") {
      output[0] = x;
      output[1] = y;
      return output;
    }
    const emitterRotation = this.system.currentTransform[2];
    const customRotation = this.system.customTransform[2];
    let worldX = x;
    let worldY = y;
    if (space === "local") {
      rotate(x, y, emitterRotation, output);
      worldX = output[0];
      worldY = output[1];
    } else if (space === "custom") {
      rotate(x, y, customRotation, output);
      worldX = output[0];
      worldY = output[1];
    }
    if (simulation === "world") {
      output[0] = worldX;
      output[1] = worldY;
      return output;
    }
    const inverse = simulation === "local" ? -emitterRotation : -customRotation;
    rotate(worldX, worldY, inverse, output);
    return output;
  }
  _updateEmitterVelocity(delta) {
    if (delta <= 0 || this.system.teleported) {
      this.emitterVelocityX = 0;
      this.emitterVelocityY = 0;
      this.emitterAngularVelocity = 0;
    } else {
      this.emitterVelocityX = (this.system.currentTransform[0] - this.lastTransform[0]) / delta;
      this.emitterVelocityY = (this.system.currentTransform[1] - this.lastTransform[1]) / delta;
      this.emitterAngularVelocity = angleDelta(this.system.currentTransform[2], this.lastTransform[2]) / delta;
    }
    this.lastTransform.set(this.system.currentTransform);
  }
  _emitterOrigin(output = this.spaceScratch) {
    if (this.system.simulationSpace === "local") {
      output[0] = 0;
      output[1] = 0;
    } else {
      const transform = this.system.simulationSpace === "world" ? this.system.currentTransform : this.system.customTransform;
      output[0] = transform[0];
      output[1] = transform[1];
    }
    return output;
  }
  _initializeSlot(slot) {
    const state = this.system.state;
    const current = state.current;
    const generation = state.admin.generations[slot];
    if (this.seenGeneration[slot] === generation) return;
    this.seenGeneration[slot] = generation;
    let velocityX = current.velocityX[slot];
    let velocityY = current.velocityY[slot];
    if (this.config.initial.enabled) {
      evaluateParticleValue(this.config.initial.value, 0, this._random(slot, "initial"), this.vectorScratch);
      const converted = this._convertVector(this.vectorScratch[0], this.vectorScratch[1], this.config.initial.space);
      if (this.config.initial.composition === "override") {
        velocityX = converted[0];
        velocityY = converted[1];
      } else if (this.config.initial.composition === "multiply") {
        velocityX *= converted[0];
        velocityY *= converted[1];
      } else {
        velocityX += converted[0];
        velocityY += converted[1];
      }
    }
    if (!this.system.teleported && this.config.inherit.translational !== 0) {
      velocityX += this.emitterVelocityX * this.config.inherit.translational;
      velocityY += this.emitterVelocityY * this.config.inherit.translational;
    }
    if (!this.system.teleported && this.config.inherit.angular !== 0 && this.emitterAngularVelocity !== 0) {
      const originX = this.system.simulationSpace === "world" ? this.system.currentTransform[0] : 0;
      const originY = this.system.simulationSpace === "world" ? this.system.currentTransform[1] : 0;
      const offsetX = current.positionX[slot] - originX;
      const offsetY = current.positionY[slot] - originY;
      const radians = this.emitterAngularVelocity * Math.PI / 180 * this.config.inherit.angular;
      velocityX += -offsetY * radians;
      velocityY += offsetX * radians;
    }
    this.baseVelocityX[slot] = velocityX;
    this.baseVelocityY[slot] = velocityY;
    this.baseAccelerationX[slot] = current.accelerationX[slot];
    this.baseAccelerationY[slot] = current.accelerationY[slot];
    if (this.config.lifetime.enabled) {
      const speed = Math.hypot(this.emitterVelocityX, this.emitterVelocityY);
      const normalized = clamp3(speed / this.config.lifetime.referenceSpeed, 0, 1);
      const multiplier = Math.max(0, evaluateParticleValue(this.config.lifetime.multiplier, normalized, this._random(slot, "lifetime")));
      current.lifetime[slot] *= multiplier;
      state.start.lifetime[slot] = current.lifetime[slot];
    }
  }
  evaluateVelocity(delta) {
    this._ensureCapacity();
    this._updateEmitterVelocity(delta);
    const state = this.system.state;
    const current = state.current;
    let slot = state.firstActiveSlot();
    while (slot !== -1) {
      this._initializeSlot(slot);
      if (this.config.velocity.enabled) {
        const age = state.normalizedAgeForSlot(slot);
        evaluateParticleValue(this.config.velocity.value, age, this._random(slot, "velocity"), this.vectorScratch);
        const converted = this._convertVector(this.vectorScratch[0], this.vectorScratch[1], this.config.velocity.space);
        let x = converted[0];
        let y = converted[1];
        const positionX = current.positionX[slot];
        const positionY = current.positionY[slot];
        const radius = Math.hypot(positionX, positionY);
        const radialX = radius > 1e-12 ? positionX / radius : 1;
        const radialY = radius > 1e-12 ? positionY / radius : 0;
        const radial = evaluateScalar(this.config.velocity.radial, age, current.randomSeed[slot], "radial");
        const tangential = evaluateScalar(this.config.velocity.tangential, age, current.randomSeed[slot], "tangential");
        const orbital = evaluateScalar(this.config.velocity.orbital, age, current.randomSeed[slot], "orbital") * Math.PI / 180;
        x += radialX * radial - radialY * tangential - positionY * orbital;
        y += radialY * radial + radialX * tangential + positionX * orbital;
        this.moduleVelocityX[slot] = x;
        this.moduleVelocityY[slot] = y;
      } else {
        this.moduleVelocityX[slot] = 0;
        this.moduleVelocityY[slot] = 0;
      }
      slot = state.nextActiveSlot(slot);
    }
  }
  _composeVelocity(slot, age) {
    const config = this.config.velocity;
    let x = this.baseVelocityX[slot];
    let y = this.baseVelocityY[slot];
    if (config.enabled) {
      if (config.composition === "override") {
        x = this.moduleVelocityX[slot];
        y = this.moduleVelocityY[slot];
      } else if (config.composition === "multiply") {
        x *= this.moduleVelocityX[slot];
        y *= this.moduleVelocityY[slot];
      } else {
        x += this.moduleVelocityX[slot];
        y += this.moduleVelocityY[slot];
      }
      const modifier = evaluateScalar(config.speedModifier, age, this.system.state.current.randomSeed[slot], "speed-modifier");
      x *= modifier;
      y *= modifier;
    }
    return this._limitAndAlign(slot, x, y, age);
  }
  _limitAndAlign(slot, x, y, age) {
    const limit = this.config.limit;
    if (limit.enabled) {
      const targetX = clamp3(x, -limit.x, limit.x);
      const targetY = clamp3(y, -limit.y, limit.y);
      x += (targetX - x) * limit.dampening;
      y += (targetY - y) * limit.dampening;
      const magnitude2 = Math.hypot(x, y);
      if (magnitude2 > limit.magnitude && magnitude2 > 0) {
        const scale = limit.magnitude / magnitude2;
        const limitedX = x * scale;
        const limitedY = y * scale;
        x += (limitedX - x) * limit.dampening;
        y += (limitedY - y) * limit.dampening;
      }
    }
    const magnitude = Math.hypot(x, y);
    if (!Number.isFinite(magnitude)) {
      x = 0;
      y = 0;
    } else if (magnitude > this.config.maxNumericSpeed) {
      const scale = this.config.maxNumericSpeed / magnitude;
      x *= scale;
      y *= scale;
    }
    const current = this.system.state.current;
    current.velocityX[slot] = x;
    current.velocityY[slot] = y;
    if (this.config.align.enabled && Math.abs(x) + Math.abs(y) > 1e-12) {
      current.rotation[slot] = Math.atan2(y, x) * 180 / Math.PI + evaluateScalar(this.config.align.offset, age, current.randomSeed[slot], "trajectory-offset");
    }
    return current;
  }
  evaluateForce(delta) {
    this._ensureCapacity();
    this.system.velocityIntegratedByModule = true;
    const state = this.system.state;
    const current = state.current;
    let slot = state.firstActiveSlot();
    while (slot !== -1) {
      this._initializeSlot(slot);
      const age = state.normalizedAgeForSlot(slot);
      let accelerationX = 0;
      let accelerationY = 0;
      let mass = 1;
      let linearDrag = 0;
      let quadraticDrag = 0;
      let damping = 0;
      if (this.config.force.enabled) {
        evaluateParticleValue(this.config.force.value, age, this._random(slot, "force"), this.vectorScratch);
        const force = this._convertVector(this.vectorScratch[0], this.vectorScratch[1], this.config.force.space);
        evaluateParticleValue(this.config.force.gravity, age, this._random(slot, "gravity"), this.vectorScratch);
        const gravity = this._convertVector(this.vectorScratch[0], this.vectorScratch[1], this.config.force.space, this.vectorScratch);
        const gravityModifier = evaluateScalar(this.config.force.gravityModifier, age, current.randomSeed[slot], "gravity-modifier");
        mass = Math.max(1e-6, evaluateScalar(this.config.force.mass, age, current.randomSeed[slot], "mass"));
        const forceX = force[0] / mass + gravity[0] * gravityModifier;
        const forceY = force[1] / mass + gravity[1] * gravityModifier;
        if (this.config.force.composition === "override") {
          accelerationX = forceX;
          accelerationY = forceY;
        } else if (this.config.force.composition === "multiply") {
          accelerationX = this.baseAccelerationX[slot] * forceX;
          accelerationY = this.baseAccelerationY[slot] * forceY;
        } else {
          accelerationX = this.baseAccelerationX[slot] + forceX;
          accelerationY = this.baseAccelerationY[slot] + forceY;
        }
        const velocityX = this.baseVelocityX[slot];
        const velocityY = this.baseVelocityY[slot];
        const speed2 = Math.hypot(velocityX, velocityY);
        if (speed2 > 1e-12) {
          const linear = evaluateScalar(this.config.force.linearAcceleration, age, current.randomSeed[slot], "linear-acceleration");
          accelerationX += velocityX / speed2 * linear;
          accelerationY += velocityY / speed2 * linear;
        }
        const origin = this._emitterOrigin();
        const offsetX = current.positionX[slot] - origin[0];
        const offsetY = current.positionY[slot] - origin[1];
        const radius = Math.hypot(offsetX, offsetY);
        if (radius > 1e-12) {
          const radialX = offsetX / radius;
          const radialY = offsetY / radius;
          const radial = evaluateScalar(this.config.force.radialAcceleration, age, current.randomSeed[slot], "radial-acceleration");
          const tangential = evaluateScalar(this.config.force.tangentialAcceleration, age, current.randomSeed[slot], "tangential-acceleration");
          accelerationX += radialX * radial - radialY * tangential;
          accelerationY += radialY * radial + radialX * tangential;
        }
        linearDrag = Math.max(0, evaluateScalar(this.config.force.linearDrag, age, current.randomSeed[slot], "linear-drag"));
        quadraticDrag = Math.max(0, evaluateScalar(this.config.force.quadraticDrag, age, current.randomSeed[slot], "quadratic-drag"));
        damping = Math.max(0, evaluateScalar(this.config.force.damping, age, current.randomSeed[slot], "damping"));
      }
      current.accelerationX[slot] = accelerationX;
      current.accelerationY[slot] = accelerationY;
      let baseX = this.baseVelocityX[slot] + accelerationX * delta;
      let baseY = this.baseVelocityY[slot] + accelerationY * delta;
      const speed = Math.hypot(baseX, baseY);
      const drag = Math.max(0, 1 - (linearDrag + quadraticDrag * speed) * delta / mass);
      baseX *= drag;
      baseY *= drag;
      const dampedSpeed = Math.hypot(baseX, baseY);
      if (damping > 0 && dampedSpeed > 0) {
        const dampedScale = Math.max(0, dampedSpeed - damping * delta) / dampedSpeed;
        baseX *= dampedScale;
        baseY *= dampedScale;
      }
      this.baseVelocityX[slot] = baseX;
      this.baseVelocityY[slot] = baseY;
      this._composeVelocity(slot, age);
      slot = state.nextActiveSlot(slot);
    }
  }
  dispose() {
    this.detachVelocity?.();
    this.detachForce?.();
    this.detachRestart?.();
    this.baseVelocityX = null;
    this.baseVelocityY = null;
    this.moduleVelocityX = null;
    this.moduleVelocityY = null;
    this.baseAccelerationX = null;
    this.baseAccelerationY = null;
    this.seenGeneration = null;
    this.attached = false;
  }
};
function createParticleMotionModule(system, options) {
  return new ParticleMotionModule(system, options);
}

// packages/melon-runtime/src/particle/particle-visual-properties.js
var PARTICLE_VISUAL_COMPOSITION_ORDER = Object.freeze({
  color: "start * lifetime * speed",
  size: "start * lifetime * speed, then aspect and negative-size policy",
  rotation: "start + integrated angular velocity + lifetime + speed, then orientation override"
});
var PARTICLE_DEFAULT_COLOR_GRADIENT = Object.freeze({
  id: "aps.gradient.visible",
  colorKeys: [{ time: 0, color: [1, 1, 1] }, { time: 1, color: [1, 1, 1] }],
  alphaKeys: [{ time: 0, alpha: 1 }, { time: 1, alpha: 1 }]
});
var ParticleVisualPropertiesError = class extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "ParticleVisualPropertiesError";
    this.code = code;
    this.details = details;
  }
};
function speedTime(speed, range) {
  const minimum = range?.min ?? 0;
  const maximum = range?.max ?? 1;
  return maximum === minimum ? speed >= maximum ? 1 : 0 : clamp3((speed - minimum) / (maximum - minimum), 0, 1);
}
function compileOptionalScalar(value, fallback, context, path, type = "scalar") {
  return compileScalar(value ?? fallback, context, path, type);
}
function compileColorModule(source, context, path) {
  const value = source.gradientId ? { type: "color", mode: "gradient", gradientId: source.gradientId } : source.color ?? [1, 1, 1, 1];
  return {
    enabled: source.enabled === true,
    value: compileColor(value, context, `${path}.color`),
    speedRange: source.speedRange ?? { min: 0, max: 1 }
  };
}
var ParticleVisualPropertiesModule = class {
  constructor(system, options = {}) {
    if (!system?.state) throw new ParticleVisualPropertiesError("APS_VISUAL_INVALID_SYSTEM", "ParticleSystem2D is required.");
    this.system = system;
    this.context = options.context ?? {};
    this.colorLifetime = compileColorModule(options.colorOverLifetime ?? {}, this.context, "$.colorOverLifetime");
    this.colorSpeed = compileColorModule(options.colorBySpeed ?? {}, this.context, "$.colorBySpeed");
    const size = options.sizeOverLifetime ?? {};
    const sizeSpeed = options.sizeBySpeed ?? {};
    this.size = {
      enabled: size.enabled === true,
      x: compileOptionalScalar(size.x ?? (size.curveId ? { type: "scalar", mode: "curve", curveId: size.curveId } : void 0), size.value ?? 1, this.context, "$.sizeOverLifetime.x"),
      y: compileOptionalScalar(size.y ?? (size.curveId ? { type: "scalar", mode: "curve", curveId: size.curveId } : void 0), size.value ?? 1, this.context, "$.sizeOverLifetime.y"),
      separateAxes: size.separateAxes === true,
      aspectRatio: Number.isFinite(size.aspectRatio) && size.aspectRatio > 0 ? size.aspectRatio : null,
      negativeSize: size.negativeSize ?? "flip",
      pivot: size.pivot ?? { x: 0.5, y: 0.5 }
    };
    this.sizeSpeed = {
      enabled: sizeSpeed.enabled === true,
      x: compileOptionalScalar(sizeSpeed.x ?? (sizeSpeed.curveId ? { type: "scalar", mode: "curve", curveId: sizeSpeed.curveId } : void 0), sizeSpeed.value ?? 1, this.context, "$.sizeBySpeed.x"),
      y: compileOptionalScalar(sizeSpeed.y ?? (sizeSpeed.curveId ? { type: "scalar", mode: "curve", curveId: sizeSpeed.curveId } : void 0), sizeSpeed.value ?? 1, this.context, "$.sizeBySpeed.y"),
      separateAxes: sizeSpeed.separateAxes === true,
      speedRange: sizeSpeed.speedRange ?? { min: 0, max: 1 }
    };
    if (!["flip", "clamp-zero", "absolute"].includes(this.size.negativeSize)) {
      throw new ParticleVisualPropertiesError("APS_VISUAL_INVALID_SIZE_POLICY", `Unknown negative-size policy '${this.size.negativeSize}'.`);
    }
    const rotation = options.rotationOverLifetime ?? {};
    const rotationSpeed = options.rotationBySpeed ?? {};
    this.rotation = {
      enabled: rotation.enabled === true,
      value: compileOptionalScalar(rotation.curveId ? { type: "angle", mode: "curve", curveId: rotation.curveId } : rotation.value, 0, this.context, "$.rotationOverLifetime.value", "angle"),
      angularVelocity: compileOptionalScalar(rotation.angularVelocity, 0, this.context, "$.rotationOverLifetime.angularVelocity", "angle"),
      space: rotation.space ?? "local",
      orientation: rotation.orientation ?? "free",
      trajectoryOffset: rotation.trajectoryOffset ?? 0,
      target: rotation.target ?? null
    };
    this.rotationSpeed = {
      enabled: rotationSpeed.enabled === true,
      value: compileOptionalScalar(rotationSpeed.curveId ? { type: "angle", mode: "curve", curveId: rotationSpeed.curveId } : rotationSpeed.value, 0, this.context, "$.rotationBySpeed.value", "angle"),
      speedRange: rotationSpeed.speedRange ?? { min: 0, max: 1 }
    };
    if (!["local", "world"].includes(this.rotation.space) || !["free", "velocity", "target"].includes(this.rotation.orientation)) {
      throw new ParticleVisualPropertiesError("APS_VISUAL_INVALID_ROTATION", "Rotation space/orientation is invalid.");
    }
    this.colorA = new Float64Array(4);
    this.colorB = new Float64Array(4);
    this.colorStart = new Float64Array(4);
    this.detach = [];
  }
  attach(mainEmission) {
    if (mainEmission) {
      this.detach.push(mainEmission.addSpawnInitializer((slot, particleId, state) => {
        const seed = state.current.randomSeed[slot];
        state.current.angularVelocity[slot] = this.rotation.enabled ? evaluateScalar(this.rotation.angularVelocity, 0, seed, "rotation", "angular-velocity", particleId) : 0;
      }));
    }
    this.detach.push(addModuleEvaluator(this.system, "colorOverLifetime", () => this.updateColor()));
    this.detach.push(addModuleEvaluator(this.system, "sizeOverLifetime", () => this.updateSize()));
    this.detach.push(addModuleEvaluator(this.system, "rotationOverLifetime", () => this.updateRotation()));
    return this;
  }
  _time(slot) {
    const current = this.system.state.current;
    return current.lifetime[slot] > 0 ? clamp3(current.age[slot] / current.lifetime[slot], 0, 1) : 1;
  }
  _random(slot, channel) {
    const state = this.system.state;
    return deterministicUnit(state.current.randomSeed[slot], "visual", channel, state.particleIdForSlot(slot));
  }
  updateColor() {
    if (!this.colorLifetime.enabled && !this.colorSpeed.enabled) return;
    const state = this.system.state;
    let slot = state.firstActiveSlot();
    while (slot !== -1) {
      const current = state.current;
      unpackParticleColor(state.start.color[slot], this.colorStart);
      this.colorA.fill(1);
      this.colorB.fill(1);
      if (this.colorLifetime.enabled) evaluateParticleValue(this.colorLifetime.value, this._time(slot), this._random(slot, "color-lifetime"), this.colorA);
      if (this.colorSpeed.enabled) {
        const speed = Math.hypot(current.velocityX[slot], current.velocityY[slot]);
        evaluateParticleValue(this.colorSpeed.value, speedTime(speed, this.colorSpeed.speedRange), this._random(slot, "color-speed"), this.colorB);
      }
      current.color[slot] = packParticleColor(
        this.colorStart[0] * this.colorA[0] * this.colorB[0],
        this.colorStart[1] * this.colorA[1] * this.colorB[1],
        this.colorStart[2] * this.colorA[2] * this.colorB[2],
        this.colorStart[3] * this.colorA[3] * this.colorB[3]
      );
      slot = state.nextActiveSlot(slot);
    }
  }
  updateSize() {
    if (!this.size.enabled && !this.sizeSpeed.enabled) return;
    const state = this.system.state;
    let slot = state.firstActiveSlot();
    while (slot !== -1) {
      const current = state.current;
      const time = this._time(slot);
      const speed = Math.hypot(current.velocityX[slot], current.velocityY[slot]);
      const speedAmount = speedTime(speed, this.sizeSpeed.speedRange);
      const seed = current.randomSeed[slot];
      const lifetimeX = this.size.enabled ? evaluateScalar(this.size.x, time, seed, "size", "lifetime-x") : 1;
      const lifetimeY = this.size.enabled && this.size.separateAxes ? evaluateScalar(this.size.y, time, seed, "size", "lifetime-y") : lifetimeX;
      const speedX = this.sizeSpeed.enabled ? evaluateScalar(this.sizeSpeed.x, speedAmount, seed, "size", "speed-x") : 1;
      const speedY = this.sizeSpeed.enabled && this.sizeSpeed.separateAxes ? evaluateScalar(this.sizeSpeed.y, speedAmount, seed, "size", "speed-y") : speedX;
      let x = state.start.sizeX[slot] * lifetimeX * speedX;
      let y = state.start.sizeY[slot] * lifetimeY * speedY;
      if (this.size.aspectRatio) y = x / this.size.aspectRatio;
      if (this.size.negativeSize === "clamp-zero") {
        x = Math.max(0, x);
        y = Math.max(0, y);
      } else if (this.size.negativeSize === "absolute") {
        x = Math.abs(x);
        y = Math.abs(y);
      }
      current.sizeX[slot] = x;
      current.sizeY[slot] = y;
      slot = state.nextActiveSlot(slot);
    }
  }
  updateRotation() {
    if (!this.rotation.enabled && !this.rotationSpeed.enabled) return;
    const state = this.system.state;
    let slot = state.firstActiveSlot();
    while (slot !== -1) {
      const current = state.current;
      const time = this._time(slot);
      const speed = Math.hypot(current.velocityX[slot], current.velocityY[slot]);
      const lifetime = this.rotation.enabled ? evaluateScalar(this.rotation.value, time, current.randomSeed[slot], "rotation", "lifetime") : 0;
      const bySpeed = this.rotationSpeed.enabled ? evaluateScalar(this.rotationSpeed.value, speedTime(speed, this.rotationSpeed.speedRange), current.randomSeed[slot], "rotation", "speed") : 0;
      const integrated = current.angularVelocity[slot] * current.age[slot];
      let angle = state.start.rotation[slot] + integrated + lifetime + bySpeed;
      if (this.rotation.orientation === "velocity" && speed > 1e-9) angle = Math.atan2(current.velocityY[slot], current.velocityX[slot]) * 180 / Math.PI + this.rotation.trajectoryOffset;
      else if (this.rotation.orientation === "target" && this.rotation.target) angle = Math.atan2(this.rotation.target.y - current.positionY[slot], this.rotation.target.x - current.positionX[slot]) * 180 / Math.PI + this.rotation.trajectoryOffset;
      if (this.rotation.space === "local" && this.system.simulationSpace === "world") angle += this.system.currentTransform[2];
      current.rotation[slot] = angle;
      slot = state.nextActiveSlot(slot);
    }
  }
  dispose() {
    for (const detach of this.detach.splice(0)) detach?.();
  }
};

// packages/melon-runtime/src/particle/particle-noise-fields.js
var ParticleNoiseFieldError = class extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "ParticleNoiseFieldError";
    this.code = code;
    this.details = details;
  }
};
function fade(value) {
  return value * value * (3 - 2 * value);
}
function lattice(seed, x, y, phase) {
  return deriveParticleSeed(seed, "noise", x | 0, y | 0, phase | 0) / 2147483647 - 1;
}
function deterministicNoise2D(seed, x, y, phase = 0) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = fade(x - x0);
  const ty = fade(y - y0);
  const a = lattice(seed, x0, y0, phase);
  const b = lattice(seed, x0 + 1, y0, phase);
  const c = lattice(seed, x0, y0 + 1, phase);
  const d = lattice(seed, x0 + 1, y0 + 1, phase);
  return a + (b - a) * tx + (c + (d - c) * tx - (a + (b - a) * tx)) * ty;
}
function deterministicCurlNoise2D(seed, x, y, phase = 0, epsilon = 1 / 128, output = new Float64Array(2)) {
  const dy = deterministicNoise2D(seed, x, y + epsilon, phase) - deterministicNoise2D(seed, x, y - epsilon, phase);
  const dx = deterministicNoise2D(seed, x + epsilon, y, phase) - deterministicNoise2D(seed, x - epsilon, y, phase);
  output[0] = dy / (2 * epsilon);
  output[1] = -dx / (2 * epsilon);
  return output;
}
function intersects(field, bounds) {
  if (!bounds || !field.bounds) return true;
  const a = field.bounds;
  return a.maxX >= bounds.minX && a.minX <= bounds.maxX && a.maxY >= bounds.minY && a.minY <= bounds.maxY;
}
var ParticleForceFieldRegistry = class {
  constructor() {
    this.fields = /* @__PURE__ */ new Map();
    this.version = 0;
  }
  add(field) {
    if (!field?.id) throw new ParticleNoiseFieldError("APS_FIELD_ID_REQUIRED", "Force fields require a stable ID.");
    this.fields.set(String(field.id), { enabled: true, priority: 0, layerMask: 4294967295, ...field, id: String(field.id) });
    this.version += 1;
    return () => this.remove(field.id);
  }
  remove(id) {
    const removed = this.fields.delete(String(id));
    if (removed) this.version += 1;
    return removed;
  }
  query(bounds, layerMask = 4294967295, maximum = 64) {
    return [...this.fields.values()].filter((field) => field.enabled !== false && (field.layerMask >>> 0 & layerMask >>> 0) !== 0 && intersects(field, bounds)).sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.id.localeCompare(b.id)).slice(0, maximum);
  }
};
function fieldFalloff(field, x, y) {
  const cx = field.x ?? 0;
  const cy = field.y ?? 0;
  if (field.shape === "box") {
    const halfX = Math.max(1e-9, (field.width ?? 1) / 2);
    const halfY = Math.max(1e-9, (field.height ?? 1) / 2);
    const normalized2 = Math.max(Math.abs(x - cx) / halfX, Math.abs(y - cy) / halfY);
    if (normalized2 > 1) return 0;
    const linear2 = 1 - normalized2;
    return typeof field.evaluateFalloff === "function" ? field.evaluateFalloff(linear2) : Math.pow(linear2, field.falloffPower ?? 1);
  }
  const radius = Math.max(1e-9, field.radius ?? Infinity);
  const normalized = Math.hypot(x - cx, y - cy) / radius;
  if (normalized > 1) return 0;
  const linear = 1 - normalized;
  return typeof field.evaluateFalloff === "function" ? field.evaluateFalloff(linear) : Math.pow(linear, field.falloffPower ?? 1);
}
function evaluateField(field, x, y, time, output) {
  const falloff = fieldFalloff(field, x, y);
  output[0] = 0;
  output[1] = 0;
  if (falloff === 0) return output;
  const strength = (field.strength ?? 0) * falloff;
  const dx = x - (field.x ?? 0);
  const dy = y - (field.y ?? 0);
  const distance = Math.hypot(dx, dy) || 1;
  if (field.type === "point") {
    output[0] = -dx / distance * strength;
    output[1] = -dy / distance * strength;
  } else if (field.type === "repulsor") {
    output[0] = dx / distance * strength;
    output[1] = dy / distance * strength;
  } else if (field.type === "vortex") {
    output[0] = -dy / distance * strength;
    output[1] = dx / distance * strength;
  } else if (field.type === "vector-texture") {
    if (typeof field.sample !== "function") return output;
    const sampled = field.sample(x, y, time, output);
    output[0] = (sampled?.[0] ?? output[0]) * strength;
    output[1] = (sampled?.[1] ?? output[1]) * strength;
  } else {
    output[0] = (field.directionX ?? field.xStrength ?? 1) * strength;
    output[1] = (field.directionY ?? field.yStrength ?? 0) * strength;
  }
  return output;
}
var ParticleNoiseForceFieldModule = class {
  constructor(system, options = {}) {
    if (!system?.state) throw new ParticleNoiseFieldError("APS_NOISE_INVALID_SYSTEM", "ParticleSystem2D is required.");
    this.system = system;
    const noise = options.noise ?? {};
    this.noise = {
      enabled: noise.enabled === true,
      mode: noise.mode ?? "curl",
      strengthX: noise.strengthX ?? noise.strength ?? 0,
      strengthY: noise.strengthY ?? noise.strength ?? 0,
      frequency: noise.frequency ?? 0.5,
      scrollX: noise.scrollX ?? noise.scrollSpeed ?? 0,
      scrollY: noise.scrollY ?? 0,
      octaves: Math.max(1, Math.min(8, Math.floor((noise.octaves ?? 1) * (options.quality?.noiseOctaveRatio ?? 1)))),
      scale: noise.scale ?? 1,
      multiplier: noise.multiplier ?? 1,
      damping: clamp3(noise.damping ?? 0, 0, 1),
      influence: { position: 0, velocity: 1, rotation: 0, size: 0, ...noise.influence },
      space: noise.space ?? "world",
      perParticlePhase: noise.perParticlePhase !== false
    };
    this.registry = options.fieldRegistry ?? new ParticleForceFieldRegistry();
    const fields = options.forceFields ?? {};
    this.fields = {
      enabled: fields.enabled === true,
      layerMask: fields.layerMask ?? 4294967295,
      maximum: Math.max(0, Math.floor(fields.maxFieldsPerStep ?? 64)),
      evaluationInterval: Math.max(1, Math.floor((fields.evaluationInterval ?? 1) / (options.quality?.fieldEvaluationRatio ?? 1))),
      maxSpeed: fields.maxSpeed ?? Infinity,
      attractorInteraction: compileScalar(options.attractorInteraction ?? fields.attractorInteraction ?? 1, options.context ?? {}, "$.forceOverLifetime.attractorInteraction")
    };
    if (!["local", "world"].includes(this.noise.space)) throw new ParticleNoiseFieldError("APS_NOISE_INVALID_SPACE", "Noise space must be local or world.");
    this.scratch = new Float64Array(2);
    this.cachedFields = [];
    this.cachedVersion = -1;
    this.detachEvaluator = null;
  }
  attach() {
    if (!this.noise.enabled && !this.fields.enabled) return this;
    this.detachEvaluator = addModuleEvaluator(this.system, "noise", (_system, delta, evaluationIndex) => this.update(delta, evaluationIndex));
    return this;
  }
  _fieldsForStep(evaluationIndex) {
    if (!this.fields.enabled) return [];
    const due = evaluationIndex % this.fields.evaluationInterval === 0 || this.registry.version !== this.cachedVersion;
    if (due) {
      this.cachedFields = this.registry.query(null, this.fields.layerMask, this.fields.maximum);
      this.cachedVersion = this.registry.version;
    }
    return due ? this.cachedFields : [];
  }
  update(delta, evaluationIndex) {
    const state = this.system.state;
    const fields = this._fieldsForStep(evaluationIndex);
    let slot = state.firstActiveSlot();
    while (slot !== -1) {
      const current = state.current;
      let nx = 0;
      let ny = 0;
      if (this.noise.enabled) {
        const phase = this.noise.perParticlePhase ? current.randomSeed[slot] : 0;
        let amplitude = 1;
        let frequency = this.noise.frequency;
        let normalization = 0;
        let coordinateX = current.positionX[slot];
        let coordinateY = current.positionY[slot];
        if (this.noise.space === "local" && this.system.simulationSpace === "world") {
          const dx = coordinateX - this.system.currentTransform[0];
          const dy = coordinateY - this.system.currentTransform[1];
          const radians = -this.system.currentTransform[2] * Math.PI / 180;
          const cosine = Math.cos(radians);
          const sine = Math.sin(radians);
          coordinateX = dx * cosine - dy * sine;
          coordinateY = dx * sine + dy * cosine;
        }
        for (let octave = 0; octave < this.noise.octaves; octave += 1) {
          const x = (coordinateX / this.noise.scale + this.system.time * this.noise.scrollX) * frequency;
          const y = (coordinateY / this.noise.scale + this.system.time * this.noise.scrollY) * frequency;
          if (this.noise.mode === "curl") deterministicCurlNoise2D(this.system.effectSeed, x, y, phase + octave, 1 / 128, this.scratch);
          else {
            this.scratch[0] = deterministicNoise2D(this.system.effectSeed, x, y, phase + octave);
            this.scratch[1] = deterministicNoise2D(this.system.effectSeed, x, y, phase + octave + 4096);
          }
          nx += this.scratch[0] * amplitude;
          ny += this.scratch[1] * amplitude;
          normalization += amplitude;
          amplitude *= 0.5;
          frequency *= 2;
        }
        nx = nx / normalization * this.noise.strengthX * this.noise.multiplier;
        ny = ny / normalization * this.noise.strengthY * this.noise.multiplier;
      }
      for (const field of fields) {
        evaluateField(field, current.positionX[slot], current.positionY[slot], this.system.time, this.scratch);
        const interaction = evaluateScalar(this.fields.attractorInteraction, state.normalizedAgeForSlot(slot), current.randomSeed[slot], "attractor-interaction");
        nx += this.scratch[0] * interaction;
        ny += this.scratch[1] * interaction;
      }
      current.velocityX[slot] = current.velocityX[slot] * (1 - this.noise.damping * delta) + nx * this.noise.influence.velocity * delta;
      current.velocityY[slot] = current.velocityY[slot] * (1 - this.noise.damping * delta) + ny * this.noise.influence.velocity * delta;
      current.positionX[slot] += nx * this.noise.influence.position * delta;
      current.positionY[slot] += ny * this.noise.influence.position * delta;
      current.rotation[slot] += (nx + ny) * this.noise.influence.rotation * delta;
      const sizeDelta = (nx + ny) * 0.5 * this.noise.influence.size * delta;
      current.sizeX[slot] += sizeDelta;
      current.sizeY[slot] += sizeDelta;
      const speed = Math.hypot(current.velocityX[slot], current.velocityY[slot]);
      if (speed > this.fields.maxSpeed) {
        const ratio = this.fields.maxSpeed / speed;
        current.velocityX[slot] *= ratio;
        current.velocityY[slot] *= ratio;
      }
      slot = state.nextActiveSlot(slot);
    }
  }
  dispose() {
    this.detachEvaluator?.();
    this.detachEvaluator = null;
    this.cachedFields.length = 0;
  }
};

// packages/melon-runtime/src/particle/particle-texture-renderer.js
var PARTICLE_RENDER_MODES = Object.freeze(["billboard", "stretched-billboard", "aligned-sprite", "trail"]);
var PARTICLE_BLEND_MODES = Object.freeze(["normal", "premultiplied-alpha", "additive", "multiply", "screen", "subtract"]);
var PARTICLE_SORT_MODES = Object.freeze(["none", "emission", "lifetime", "depth", "custom"]);
var ParticleRendererError = class extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "ParticleRendererError";
    this.code = code;
    this.details = details;
  }
};
function pingPong(index, count) {
  if (count <= 1) return 0;
  const period = count * 2 - 2;
  const value = (index % period + period) % period;
  return value < count ? value : period - value;
}
function normalizeFrames(source) {
  if (Array.isArray(source.frames) && source.frames.length > 0) return source.frames.map((frame, index) => ({ index, ...frame }));
  const columns = Math.max(1, Math.floor(source.columns ?? 1));
  const rows = Math.max(1, Math.floor(source.rows ?? 1));
  const count = Math.max(1, Math.min(columns * rows, Math.floor(source.frameCount ?? columns * rows)));
  const padding = source.uvPadding ?? 0;
  const maximumPadding = Math.min(0.5 / columns, 0.5 / rows);
  if (!Number.isFinite(padding) || padding < 0 || padding >= maximumPadding) {
    throw new ParticleRendererError(
      "APS_TEXTURE_INVALID_UV_PADDING",
      `Texture sheet UV padding must be at least 0 and less than ${maximumPadding} for a ${columns}x${rows} grid.`,
      { padding, columns, rows, maximumPadding }
    );
  }
  return Array.from({ length: count }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    return {
      index,
      column,
      row,
      u0: column / columns + padding,
      v0: row / rows + padding,
      u1: (column + 1) / columns - padding,
      v1: (row + 1) / rows - padding,
      atlasRegionId: source.atlasRegionId ?? null,
      textureId: source.textureId ?? null
    };
  });
}
function compileParticleTextureAnimation(source = {}, context = {}) {
  const variants = (source.variants?.length ? source.variants : [source]).map((variant, index) => {
    var _a;
    const frames = normalizeFrames({ ...source, ...variant });
    const framesByRow = [];
    for (const frame of frames) (framesByRow[_a = frame.row ?? 0] ?? (framesByRow[_a] = [])).push(frame);
    return { id: String(variant.id ?? `variant.${index}`), weight: Math.max(0, variant.weight ?? 1), frames, framesByRow };
  });
  const totalWeight = variants.reduce((total, variant) => total + variant.weight, 0);
  if (totalWeight <= 0) throw new ParticleRendererError("APS_TEXTURE_INVALID_VARIANTS", "Texture variants require positive total weight.");
  return {
    enabled: source.enabled === true,
    mode: source.mode ?? "lifetime",
    fps: source.fps ?? source.frameRate ?? 0,
    startFrame: compileScalar(source.startFrame ?? 0, context, "$.textureSheetAnimation.startFrame"),
    cycles: source.cycles ?? 1,
    loop: source.loop !== false,
    pingPong: source.pingPong === true,
    randomStart: source.randomStart === true,
    randomRow: source.randomRow === true,
    frameOverLifetime: source.frameOverLifetime ? compileScalar(source.frameOverLifetime, context, "$.textureSheetAnimation.frameOverLifetime") : null,
    speedBySpeed: source.animationSpeedBySpeed ? compileScalar(source.animationSpeedBySpeed, context, "$.textureSheetAnimation.animationSpeedBySpeed") : null,
    speedRange: source.speedRange ?? { min: 0, max: 1 },
    variants,
    totalWeight
  };
}
function chooseVariant(compiled, random2) {
  let cursor = random2 * compiled.totalWeight;
  for (const variant of compiled.variants) {
    cursor -= variant.weight;
    if (cursor <= 0) return variant;
  }
  return compiled.variants[compiled.variants.length - 1];
}
function framesForParticle(compiled, variant, seed) {
  if (!compiled.randomRow) return variant.frames;
  const row = Math.floor(deterministicUnit(seed, "texture", "row") * variant.framesByRow.length);
  return variant.framesByRow[row] ?? variant.frames;
}
var ParticleTextureAnimationModule = class {
  constructor(system, source = {}, options = {}) {
    this.system = system;
    this.compiled = compileParticleTextureAnimation(source, options.context);
    this.detach = [];
    if (this.compiled.enabled && !system.state.optional.animation) {
      throw new ParticleRendererError("APS_TEXTURE_STATE_REQUIRED", "Animation state channels must be enabled before constructing the system.");
    }
  }
  attach(mainEmission) {
    if (!this.compiled.enabled) return this;
    if (mainEmission) this.detach.push(mainEmission.addSpawnInitializer((slot, particleId, state) => {
      const variant = chooseVariant(this.compiled, deterministicUnit(state.current.randomSeed[slot], "texture", "variant", particleId));
      const frames = framesForParticle(this.compiled, variant, state.current.randomSeed[slot]);
      const start = evaluateScalar(this.compiled.startFrame, 0, state.current.randomSeed[slot], "texture", "start");
      const random2 = this.compiled.randomStart ? deterministicUnit(state.current.randomSeed[slot], "texture", "start-random") * frames.length : 0;
      state.optional.animation.frame[slot] = (Math.floor(start + random2) % frames.length + frames.length) % frames.length;
      state.optional.animation.frameTime[slot] = 0;
    }));
    this.detach.push(addModuleEvaluator(this.system, "textureSheetAnimation", (_system, delta) => this.update(delta)));
    return this;
  }
  frameForSlot(slot) {
    const state = this.system.state;
    if (!this.compiled.enabled || !state.optional.animation) return null;
    const variant = chooseVariant(this.compiled, deterministicUnit(state.current.randomSeed[slot], "texture", "variant", state.particleIdForSlot(slot)));
    const frames = framesForParticle(this.compiled, variant, state.current.randomSeed[slot]);
    return frames[state.optional.animation.frame[slot] % frames.length];
  }
  update(delta) {
    const state = this.system.state;
    let slot = state.firstActiveSlot();
    while (slot !== -1) {
      const current = state.current;
      const animation = state.optional.animation;
      const variant = chooseVariant(this.compiled, deterministicUnit(current.randomSeed[slot], "texture", "variant", state.particleIdForSlot(slot)));
      const frames = framesForParticle(this.compiled, variant, current.randomSeed[slot]);
      const count = frames.length;
      const lifetime = current.lifetime[slot] > 0 ? clamp3(current.age[slot] / current.lifetime[slot], 0, 1) : 1;
      const speed = Math.hypot(current.velocityX[slot], current.velocityY[slot]);
      const speedTime2 = clamp3((speed - this.compiled.speedRange.min) / Math.max(1e-9, this.compiled.speedRange.max - this.compiled.speedRange.min), 0, 1);
      const speedMultiplier = this.compiled.speedBySpeed ? evaluateScalar(this.compiled.speedBySpeed, speedTime2, current.randomSeed[slot], "texture", "speed") : 1;
      const start = evaluateScalar(this.compiled.startFrame, 0, current.randomSeed[slot], "texture", "start");
      const random2 = this.compiled.randomStart ? deterministicUnit(current.randomSeed[slot], "texture", "start-random") * count : 0;
      let raw;
      if (this.compiled.frameOverLifetime) raw = start + random2 + evaluateScalar(this.compiled.frameOverLifetime, lifetime, current.randomSeed[slot], "texture", "frame") * Math.max(1, count - 1);
      else if (this.compiled.mode === "fps") {
        animation.frameTime[slot] += delta * this.compiled.fps * speedMultiplier;
        raw = start + random2 + animation.frameTime[slot];
      } else raw = start + random2 + lifetime * count * this.compiled.cycles * speedMultiplier;
      let frame = Math.floor(raw);
      if (this.compiled.pingPong) frame = pingPong(frame, count);
      else if (this.compiled.loop) frame = (frame % count + count) % count;
      else frame = clamp3(frame, 0, count - 1);
      animation.frame[slot] = frame;
      slot = state.nextActiveSlot(slot);
    }
  }
  dispose() {
    for (const detach of this.detach.splice(0)) detach?.();
  }
};
function blendFallback(requested, backend) {
  const canvas = ["normal", "premultiplied-alpha", "additive", "multiply", "screen"];
  return backend === "canvas2d" && !canvas.includes(requested) ? "normal" : requested;
}
var ParticleRenderer2D = class {
  constructor(system, source = {}, options = {}) {
    this.system = system;
    this.source = {
      enabled: source.enabled !== false,
      type: source.type === "sprite" ? "billboard" : source.type ?? "billboard",
      sortMode: source.sortMode ?? "none",
      blendMode: source.blendMode ?? "normal",
      anchor: source.anchor ?? source.pivot ?? { x: 0.5, y: 0.5 },
      flipX: source.flipX === true,
      flipY: source.flipY === true,
      stretchLength: source.stretchLength ?? 1,
      speedScale: source.speedScale ?? 0,
      renderLayer: source.renderLayer ?? "default",
      z: source.z ?? 0,
      mask: source.mask ?? null,
      clip: source.clip ?? null,
      filtering: source.filtering ?? "linear",
      pixelSnap: source.pixelSnap === true,
      material: source.material ?? null,
      bounds: source.bounds ?? { mode: "auto", padding: 0 },
      customSort: source.customSort ?? null,
      textureId: source.textureId ?? null,
      atlasRegionId: source.atlasRegionId ?? null,
      textureMode: source.textureMode ?? "image",
      gradientTexture: { gradientId: null, mode: "linear", angle: 0, ...source.gradientTexture }
    };
    if (!PARTICLE_RENDER_MODES.includes(this.source.type) || !PARTICLE_SORT_MODES.includes(this.source.sortMode) || !PARTICLE_BLEND_MODES.includes(this.source.blendMode) || !["image", "color", "gradient"].includes(this.source.textureMode) || !["linear", "radial"].includes(this.source.gradientTexture.mode)) {
      throw new ParticleRendererError("APS_RENDER_INVALID_OPTION", "Renderer type, sort, or blend mode is invalid.");
    }
    this.backend = options.backend ?? "canvas2d";
    this.textureAnimation = this.source.textureMode === "image" ? options.textureAnimation ?? null : null;
    this.trailHook = options.trailHook ?? null;
    this.warnings = [];
    this.blendMode = blendFallback(this.source.blendMode, this.backend);
    if (this.blendMode !== this.source.blendMode) this.warnings.push({ code: "APS_CAP_FALLBACK", feature: "particle.blend.subtract", requested: this.source.blendMode, actual: this.blendMode });
    if (this.source.material && this.backend !== "webgl") this.warnings.push({ code: this.source.material.required ? "APS_CAP_UNSUPPORTED" : "APS_CAP_FALLBACK", feature: "particle.custom-material", requested: this.source.material.id ?? null, actual: null });
    this.bufferCapacity = 0;
    this.viewCount = -1;
    this.buffers = null;
    this.sortSlots = [];
    this.batch = {
      backend: this.backend,
      primitive: "cpu-batched-quad",
      drawCallGroups: 0,
      count: 0,
      slots: null,
      transforms: null,
      colors: null,
      uvs: null,
      frames: [],
      customData: null,
      textureId: this.source.textureMode === "image" ? this.source.textureId : null,
      atlasRegionId: this.source.textureMode === "image" ? this.source.atlasRegionId : null,
      textureMode: this.source.textureMode,
      gradientTexture: this.source.gradientTexture,
      material: this.backend === "webgl" ? this.source.material : null,
      blendMode: this.blendMode,
      renderLayer: this.source.renderLayer,
      mask: this.source.mask,
      clip: this.source.clip,
      filtering: this.source.filtering,
      anchor: this.source.anchor,
      bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 }
    };
    this._ensureCapacity(system.state.capacity);
  }
  _ensureCapacity(capacity) {
    if (capacity <= this.bufferCapacity) return;
    this.bufferCapacity = capacity;
    this.buffers = {
      slots: new Uint32Array(capacity),
      transforms: new Float32Array(capacity * 6),
      colors: new Uint32Array(capacity),
      uvs: new Float32Array(capacity * 4),
      customData: this.system.state.optional.customVectors.length > 0 ? new Float32Array(capacity * 8) : null
    };
    this.viewCount = -1;
  }
  _setCountViews(count) {
    if (count === this.viewCount) return;
    this.viewCount = count;
    const buffers = this.buffers;
    this.batch.slots = buffers.slots.subarray(0, count);
    this.batch.transforms = buffers.transforms.subarray(0, count * 6);
    this.batch.colors = buffers.colors.subarray(0, count);
    this.batch.uvs = buffers.uvs.subarray(0, count * 4);
    this.batch.customData = buffers.customData?.subarray(0, count * 8) ?? null;
  }
  visibilityBounds() {
    if (this.source.bounds.mode === "manual") return { ...this.source.bounds };
    const state = this.system.state;
    if (state.activeCount === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let slot = state.firstActiveSlot();
    while (slot !== -1) {
      const current = state.current;
      const hx = Math.abs(current.sizeX[slot]) / 2;
      const hy = Math.abs(current.sizeY[slot]) / 2;
      minX = Math.min(minX, current.positionX[slot] - hx);
      maxX = Math.max(maxX, current.positionX[slot] + hx);
      minY = Math.min(minY, current.positionY[slot] - hy);
      maxY = Math.max(maxY, current.positionY[slot] + hy);
      slot = state.nextActiveSlot(slot);
    }
    const padding = this.source.bounds.padding ?? 0;
    return { minX: minX - padding, minY: minY - padding, maxX: maxX + padding, maxY: maxY + padding };
  }
  buildBatch() {
    if (!this.source.enabled) return null;
    if (this.source.type === "trail") return this.trailHook?.(this.system) ?? null;
    const state = this.system.state;
    this._ensureCapacity(state.capacity);
    const slots = this.sortSlots;
    slots.length = 0;
    for (let slot = state.firstActiveSlot(); slot !== -1; slot = state.nextActiveSlot(slot)) slots.push(slot);
    const current = state.current;
    const sort = this.source.sortMode;
    if (sort === "lifetime") slots.sort((a, b) => current.age[b] / current.lifetime[b] - current.age[a] / current.lifetime[a] || state.particleIdForSlot(a) - state.particleIdForSlot(b));
    else if (sort === "depth") slots.sort((a, b) => current.positionY[a] - current.positionY[b] || state.particleIdForSlot(a) - state.particleIdForSlot(b));
    else if (sort === "custom" && typeof this.source.customSort === "function") slots.sort((a, b) => this.source.customSort(a, b, state) || state.particleIdForSlot(a) - state.particleIdForSlot(b));
    const count = slots.length;
    const batch = this.batch;
    const transforms = this.buffers.transforms;
    const colors = this.buffers.colors;
    const uvs = this.buffers.uvs;
    const customData = this.buffers.customData;
    const frameGroups = /* @__PURE__ */ new Set();
    batch.frames.length = count;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let index = 0; index < count; index += 1) {
      const slot = slots[index];
      const offset = index * 6;
      let x = current.positionX[slot];
      let y = current.positionY[slot];
      if (this.source.pixelSnap) {
        x = Math.round(x);
        y = Math.round(y);
      }
      let sx = current.sizeX[slot] * (this.source.flipX ? -1 : 1);
      let sy = current.sizeY[slot] * (this.source.flipY ? -1 : 1);
      if (this.source.type === "stretched-billboard") sx *= this.source.stretchLength + Math.hypot(current.velocityX[slot], current.velocityY[slot]) * this.source.speedScale;
      transforms[offset] = x;
      transforms[offset + 1] = y;
      transforms[offset + 2] = sx;
      transforms[offset + 3] = sy;
      transforms[offset + 4] = current.rotation[slot];
      transforms[offset + 5] = this.source.z;
      colors[index] = current.color[slot];
      this.buffers.slots[index] = slot;
      const halfX = Math.abs(sx) / 2;
      const halfY = Math.abs(sy) / 2;
      minX = Math.min(minX, x - halfX);
      minY = Math.min(minY, y - halfY);
      maxX = Math.max(maxX, x + halfX);
      maxY = Math.max(maxY, y + halfY);
      const frame = this.textureAnimation?.frameForSlot(slot) ?? null;
      const uvOffset = index * 4;
      batch.frames[index] = frame;
      uvs[uvOffset] = frame?.u0 ?? 0;
      uvs[uvOffset + 1] = frame?.v0 ?? 0;
      uvs[uvOffset + 2] = frame?.u1 ?? 1;
      uvs[uvOffset + 3] = frame?.v1 ?? 1;
      const frameTextureId = frame?.textureId ?? this.source.textureId ?? "";
      const frameAtlasRegionId = frame && Object.prototype.hasOwnProperty.call(frame, "atlasRegionId") ? frame.atlasRegionId : this.source.atlasRegionId;
      frameGroups.add(`${frameTextureId}\0${frameAtlasRegionId ?? ""}`);
      if (customData) for (let channel = 0; channel < 2; channel += 1) {
        const source = state.optional.customVectors[channel];
        if (source) {
          const sourceOffset = slot * 4;
          const targetOffset = index * 8 + channel * 4;
          customData[targetOffset] = source[sourceOffset];
          customData[targetOffset + 1] = source[sourceOffset + 1];
          customData[targetOffset + 2] = source[sourceOffset + 2];
          customData[targetOffset + 3] = source[sourceOffset + 3];
        }
      }
    }
    this._setCountViews(count);
    batch.count = count;
    batch.drawCallGroups = count > 0 ? frameGroups.size : 0;
    const bounds = batch.bounds;
    const padding = this.source.bounds.padding ?? 0;
    if (this.source.bounds.mode === "manual") {
      bounds.minX = this.source.bounds.minX;
      bounds.minY = this.source.bounds.minY;
      bounds.maxX = this.source.bounds.maxX;
      bounds.maxY = this.source.bounds.maxY;
    } else if (count === 0) {
      bounds.minX = 0;
      bounds.minY = 0;
      bounds.maxX = 0;
      bounds.maxY = 0;
    } else {
      bounds.minX = minX - padding;
      bounds.minY = minY - padding;
      bounds.maxX = maxX + padding;
      bounds.maxY = maxY + padding;
    }
    return batch;
  }
  dispose() {
    this.sortSlots.length = 0;
    this.batch = null;
    this.buffers = null;
    this.bufferCapacity = 0;
    this.viewCount = -1;
  }
};

// packages/melon-runtime/src/particle/particle-collision.js
var PARTICLE_COLLISION_AUTHORITY = "visual-only";
var PARTICLE_COLLISION_MODES = Object.freeze(["discrete", "swept"]);
var PARTICLE_TRIGGER_PHASES = Object.freeze(["enter", "inside", "exit", "outside"]);
var ParticleCollisionError = class extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "ParticleCollisionError";
    this.code = code;
    this.details = details;
  }
};
function intersects2(a, b) {
  return a.maxX >= b.minX && a.minX <= b.maxX && a.maxY >= b.minY && a.minY <= b.maxY;
}
function finiteBounds(bounds) {
  if (!bounds) return null;
  const minX = Number(bounds.minX);
  const minY = Number(bounds.minY);
  const maxX = Number(bounds.maxX);
  const maxY = Number(bounds.maxY);
  if (![minX, minY, maxX, maxY].every(Number.isFinite)) return null;
  return { minX: Math.min(minX, maxX), minY: Math.min(minY, maxY), maxX: Math.max(minX, maxX), maxY: Math.max(minY, maxY) };
}
function colliderBroadphaseBounds(collider) {
  const explicit = finiteBounds(collider.bounds);
  if (explicit) return explicit;
  if (collider.type === "circle") {
    const x = Number(collider.x ?? 0);
    const y = Number(collider.y ?? 0);
    const radius = Math.max(0, Number(collider.radius ?? 0));
    if ([x, y, radius].every(Number.isFinite)) return { minX: x - radius, minY: y - radius, maxX: x + radius, maxY: y + radius };
  }
  if (collider.type === "segment" || collider.type === "line" || collider.type == null) {
    const ax = Number(collider.ax ?? collider.x1);
    const ay = Number(collider.ay ?? collider.y1);
    const bx = Number(collider.bx ?? collider.x2);
    const by = Number(collider.by ?? collider.y2);
    if ([ax, ay, bx, by].every(Number.isFinite)) return { minX: Math.min(ax, bx), minY: Math.min(ay, by), maxX: Math.max(ax, bx), maxY: Math.max(ay, by) };
  }
  return null;
}
var ParticleColliderRegistry = class {
  constructor(options = {}) {
    this.colliders = /* @__PURE__ */ new Map();
    this.spatialQuery = options.spatialQuery ?? null;
    this.version = 0;
    this.cellSize = Math.max(1, Number(options.cellSize) || 128);
    this.maximumCellsPerCollider = Math.max(1, Math.floor(options.maximumCellsPerCollider ?? 256));
    this.maximumCellsPerQuery = Math.max(1, Math.floor(options.maximumCellsPerQuery ?? 256));
    this.cells = /* @__PURE__ */ new Map();
    this.colliderCells = /* @__PURE__ */ new Map();
    this.overflow = /* @__PURE__ */ new Set();
  }
  _range(bounds) {
    return {
      minX: Math.floor(bounds.minX / this.cellSize),
      minY: Math.floor(bounds.minY / this.cellSize),
      maxX: Math.floor(bounds.maxX / this.cellSize),
      maxY: Math.floor(bounds.maxY / this.cellSize)
    };
  }
  _cellCount(range) {
    return (range.maxX - range.minX + 1) * (range.maxY - range.minY + 1);
  }
  _unindex(id) {
    const keys = this.colliderCells.get(id);
    if (keys) for (const key of keys) {
      const cell = this.cells.get(key);
      cell?.delete(id);
      if (cell?.size === 0) this.cells.delete(key);
    }
    this.colliderCells.delete(id);
    this.overflow.delete(id);
  }
  _index(collider) {
    const bounds = colliderBroadphaseBounds(collider);
    if (!bounds) {
      this.overflow.add(collider.id);
      return;
    }
    const range = this._range(bounds);
    if (this._cellCount(range) > this.maximumCellsPerCollider) {
      this.overflow.add(collider.id);
      return;
    }
    const keys = [];
    for (let y = range.minY; y <= range.maxY; y += 1) for (let x = range.minX; x <= range.maxX; x += 1) {
      const key = `${x}:${y}`;
      let cell = this.cells.get(key);
      if (!cell) {
        cell = /* @__PURE__ */ new Set();
        this.cells.set(key, cell);
      }
      cell.add(collider.id);
      keys.push(key);
    }
    this.colliderCells.set(collider.id, keys);
  }
  add(collider) {
    if (!collider?.id) throw new ParticleCollisionError("APS_COLLIDER_ID_REQUIRED", "Collider requires a stable ID.");
    const normalized = { enabled: true, layer: 1, mask: 4294967295, trigger: false, oneSided: false, ...collider, id: String(collider.id) };
    this._unindex(normalized.id);
    this.colliders.set(normalized.id, normalized);
    this._index(normalized);
    this.version += 1;
    return () => this.remove(normalized.id);
  }
  remove(id) {
    const key = String(id);
    const removed = this.colliders.delete(key);
    if (removed) {
      this._unindex(key);
      this.version += 1;
    }
    return removed;
  }
  query(bounds, layerMask = 4294967295) {
    const queryBounds = finiteBounds(bounds);
    const ids = new Set(this.overflow);
    if (!queryBounds) for (const id of this.colliders.keys()) ids.add(id);
    else {
      const range = this._range(queryBounds);
      if (this._cellCount(range) > this.maximumCellsPerQuery) for (const id of this.colliders.keys()) ids.add(id);
      else for (let y = range.minY; y <= range.maxY; y += 1) for (let x = range.minX; x <= range.maxX; x += 1) {
        const cell = this.cells.get(`${x}:${y}`);
        if (cell) for (const id of cell) ids.add(id);
      }
    }
    const local = [];
    for (const id of ids) {
      const collider = this.colliders.get(id);
      if (collider?.enabled !== false && (collider.layer >>> 0 & layerMask >>> 0) !== 0 && (!collider.bounds || !queryBounds || intersects2(collider.bounds, queryBounds))) local.push(collider);
    }
    const external = typeof this.spatialQuery === "function" ? this.spatialQuery(bounds, layerMask) ?? [] : [];
    return [...local, ...external].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  }
};
function segmentHit(x0, y0, x1, y1, ax, ay, bx, by, oneSided) {
  const rx = x1 - x0;
  const ry = y1 - y0;
  const sx = bx - ax;
  const sy = by - ay;
  const denominator = rx * sy - ry * sx;
  if (Math.abs(denominator) < 1e-10) return null;
  const qx = ax - x0;
  const qy = ay - y0;
  const t = (qx * sy - qy * sx) / denominator;
  const u = (qx * ry - qy * rx) / denominator;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;
  let nx = -sy;
  let ny = sx;
  const length = Math.hypot(nx, ny) || 1;
  nx /= length;
  ny /= length;
  if (nx * rx + ny * ry > 0) {
    nx = -nx;
    ny = -ny;
  }
  if (oneSided && rx * nx + ry * ny >= 0) return null;
  return { t, x: x0 + rx * t, y: y0 + ry * t, nx, ny };
}
function pointSegmentHit(x, y, radius, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const length2 = dx * dx + dy * dy;
  const amount = length2 === 0 ? 0 : clamp3(((x - ax) * dx + (y - ay) * dy) / length2, 0, 1);
  const pointX = ax + dx * amount;
  const pointY = ay + dy * amount;
  const nxRaw = x - pointX;
  const nyRaw = y - pointY;
  const distance = Math.hypot(nxRaw, nyRaw);
  if (distance > radius) return null;
  const inverse = distance > 1e-9 ? 1 / distance : 1 / (Math.hypot(dx, dy) || 1);
  return { t: 1, x: pointX, y: pointY, nx: distance > 1e-9 ? nxRaw * inverse : -dy * inverse, ny: distance > 1e-9 ? nyRaw * inverse : dx * inverse };
}
function circleInside(x, y, radius, collider) {
  const dx = x - (collider.x ?? 0);
  const dy = y - (collider.y ?? 0);
  const distance = Math.hypot(dx, dy);
  if (distance > (collider.radius ?? 0) + radius) return null;
  const safe = distance || 1;
  return { t: 1, x, y, nx: dx / safe, ny: dy / safe };
}
function boundsHit(x0, y0, x1, y1, radius, collider) {
  const bounds = collider.bounds ?? collider;
  if (x1 >= bounds.minX + radius && x1 <= bounds.maxX - radius && y1 >= bounds.minY + radius && y1 <= bounds.maxY - radius) return null;
  const hits = [];
  if (x1 < bounds.minX + radius) hits.push({ nx: 1, ny: 0, x: bounds.minX + radius, y: y1 });
  if (x1 > bounds.maxX - radius) hits.push({ nx: -1, ny: 0, x: bounds.maxX - radius, y: y1 });
  if (y1 < bounds.minY + radius) hits.push({ nx: 0, ny: 1, x: x1, y: bounds.minY + radius });
  if (y1 > bounds.maxY - radius) hits.push({ nx: 0, ny: -1, x: x1, y: bounds.maxY - radius });
  if (!hits.length) return null;
  let nx = 0;
  let ny = 0;
  for (const hit of hits) {
    nx += hit.nx;
    ny += hit.ny;
  }
  const normalLength = Math.hypot(nx, ny) || 1;
  const x = clamp3(x1, bounds.minX + radius, bounds.maxX - radius);
  const y = clamp3(y1, bounds.minY + radius, bounds.maxY - radius);
  return { nx: nx / normalLength, ny: ny / normalLength, x, y, t: Math.hypot(x - x0, y - y0) / Math.max(1e-9, Math.hypot(x1 - x0, y1 - y0)) };
}
function solidBoundsHit(x0, y0, x1, y1, radius, bounds) {
  const expanded = { minX: bounds.minX - radius, minY: bounds.minY - radius, maxX: bounds.maxX + radius, maxY: bounds.maxY + radius };
  const edges = [
    [expanded.minX, expanded.minY, expanded.minX, expanded.maxY],
    [expanded.maxX, expanded.maxY, expanded.maxX, expanded.minY],
    [expanded.maxX, expanded.minY, expanded.minX, expanded.minY],
    [expanded.minX, expanded.maxY, expanded.maxX, expanded.maxY]
  ];
  let nearest = null;
  for (const edge of edges) {
    const hit = segmentHit(x0, y0, x1, y1, ...edge, false);
    if (hit && (!nearest || hit.t < nearest.t)) nearest = hit;
  }
  return nearest;
}
function hitCollider(mode, x0, y0, x1, y1, radius, collider) {
  if (collider.type === "bounds" || collider.type === "viewport-bounds" || collider.type === "world-bounds") return boundsHit(x0, y0, x1, y1, radius, collider);
  if (collider.type === "circle") return circleInside(x1, y1, radius, collider);
  if (collider.type === "tilemap") {
    const tiles = collider.query?.({ minX: Math.min(x0, x1) - radius, minY: Math.min(y0, y1) - radius, maxX: Math.max(x0, x1) + radius, maxY: Math.max(y0, y1) + radius }) ?? [];
    for (const tile of tiles.sort((a, b) => String(a.id).localeCompare(String(b.id)))) {
      const hit = solidBoundsHit(x0, y0, x1, y1, radius, tile);
      if (hit) return hit;
    }
    return null;
  }
  const ax = collider.ax ?? collider.x1 ?? 0;
  const ay = collider.ay ?? collider.y1 ?? 0;
  const bx = collider.bx ?? collider.x2 ?? 0;
  const by = collider.by ?? collider.y2 ?? 0;
  if (collider.oneSided && mode === "swept") {
    const length = Math.hypot(bx - ax, by - ay) || 1;
    const frontX = -(by - ay) / length;
    const frontY = (bx - ax) / length;
    if ((x1 - x0) * frontX + (y1 - y0) * frontY >= 0) return null;
  }
  if (mode === "discrete") {
    const hit = pointSegmentHit(x1, y1, radius, ax, ay, bx, by);
    if (!hit || !collider.oneSided) return hit;
    const length = Math.hypot(bx - ax, by - ay) || 1;
    const frontX = -(by - ay) / length;
    const frontY = (bx - ax) / length;
    if ((x1 - ax) * frontX + (y1 - ay) * frontY < 0) return null;
    hit.nx = frontX;
    hit.ny = frontY;
    return hit;
  }
  return segmentHit(x0, y0, x1, y1, ax, ay, bx, by, false);
}
function applyResponse(current, slot, hit, source) {
  const incomingX = current.velocityX[slot];
  const incomingY = current.velocityY[slot];
  const normalSpeed = incomingX * hit.nx + incomingY * hit.ny;
  const tangentX = incomingX - normalSpeed * hit.nx;
  const tangentY = incomingY - normalSpeed * hit.ny;
  const bounce = clamp3(source.bounce ?? 0, 0, 1);
  const friction = clamp3(source.friction ?? 0, 0, 1);
  const damping = clamp3(source.damping ?? source.dampen ?? 0, 0, 1);
  current.velocityX[slot] = (tangentX * (1 - friction) - normalSpeed * hit.nx * bounce) * (1 - damping);
  current.velocityY[slot] = (tangentY * (1 - friction) - normalSpeed * hit.ny * bounce) * (1 - damping);
  current.positionX[slot] = hit.x + hit.nx * 1e-4;
  current.positionY[slot] = hit.y + hit.ny * 1e-4;
  current.lifetime[slot] = Math.max(current.age[slot], current.lifetime[slot] - (source.lifetimeLoss ?? 0));
  return { incomingX, incomingY, outgoingX: current.velocityX[slot], outgoingY: current.velocityY[slot] };
}
var ParticleCollisionModule = class {
  constructor(system, source = {}, options = {}) {
    if (!system?.state?.optional?.collision) throw new ParticleCollisionError("APS_COLLISION_STATE_REQUIRED", "Collision state channels must be enabled before constructing the system.");
    if (source.authority === "gameplay" || source.preciseGameplay === true) throw new ParticleCollisionError("APS_CAP_UNSUPPORTED", "Per-particle gameplay-authoritative collision is outside the advanced CPU particle contract.");
    this.system = system;
    this.source = {
      enabled: source.enabled === true,
      mode: source.simulation === "swept" || source.mode === "swept" ? "swept" : "discrete",
      layerMask: source.layerMask ?? 4294967295,
      particleLayer: source.particleLayer ?? 1,
      radiusMultiplier: source.radiusMultiplier ?? 0.5,
      bounce: source.bounce ?? 0,
      friction: source.friction ?? 0,
      damping: source.damping ?? source.dampen ?? 0,
      speedLoss: source.speedLoss ?? 0,
      lifetimeLoss: source.lifetimeLoss ?? 0,
      killOnContact: source.killOnContact === true,
      maximumCollisions: Math.max(1, Math.floor(source.maxCollisions ?? 1)),
      minimumSpeed: source.minimumSpeed ?? 0,
      frameBudget: Math.max(0, Math.floor(source.frameBudget ?? 4096)),
      triggerActions: source.triggerActions ?? {}
    };
    this.registry = options.colliderRegistry ?? new ParticleColliderRegistry({ spatialQuery: options.spatialQuery });
    this.onEvents = options.onEvents ?? null;
    this.onVelocityResponse = options.onVelocityResponse ?? null;
    this.subEmitterHook = options.subEmitterHook ?? null;
    this.previousInside = /* @__PURE__ */ new Set();
    this.events = [];
    this.lastBatch = Object.freeze({ authority: PARTICLE_COLLISION_AUTHORITY, events: [] });
    this.detachEvaluator = null;
  }
  attach() {
    if (this.source.enabled) this.detachEvaluator = addModuleEvaluator(this.system, "collision", (_system, delta) => this.update(delta));
    return this;
  }
  _event(phase, slot, collider, hit, velocities) {
    const state = this.system.state;
    this.events.push({
      phase,
      particleId: state.particleIdForSlot(slot),
      colliderId: collider.id,
      pointX: hit?.x ?? state.current.positionX[slot],
      pointY: hit?.y ?? state.current.positionY[slot],
      normalX: hit?.nx ?? 0,
      normalY: hit?.ny ?? 0,
      incomingVelocityX: velocities?.incomingX ?? state.current.velocityX[slot],
      incomingVelocityY: velocities?.incomingY ?? state.current.velocityY[slot],
      outgoingVelocityX: velocities?.outgoingX ?? state.current.velocityX[slot],
      outgoingVelocityY: velocities?.outgoingY ?? state.current.velocityY[slot]
    });
  }
  update(delta) {
    const state = this.system.state;
    const current = state.current;
    const collision = state.optional.collision;
    const insideNow = /* @__PURE__ */ new Set();
    this.events.length = 0;
    let budget = this.source.frameBudget;
    let slot = state.firstActiveSlot();
    while (slot !== -1 && budget > 0) {
      const speed = Math.hypot(current.velocityX[slot], current.velocityY[slot]);
      const radius = Math.max(Math.abs(current.sizeX[slot]), Math.abs(current.sizeY[slot])) * this.source.radiusMultiplier;
      const x1 = current.positionX[slot];
      const y1 = current.positionY[slot];
      const x0 = this.source.mode === "swept" ? x1 - current.velocityX[slot] * delta : x1;
      const y0 = this.source.mode === "swept" ? y1 - current.velocityY[slot] * delta : y1;
      const bounds = { minX: Math.min(x0, x1) - radius, minY: Math.min(y0, y1) - radius, maxX: Math.max(x0, x1) + radius, maxY: Math.max(y0, y1) + radius };
      const candidates = this.registry.query(bounds, this.source.layerMask);
      let collisions = 0;
      for (const collider of candidates) {
        if (budget <= 0) break;
        budget -= 1;
        if (((collider.mask ?? 4294967295) & this.source.particleLayer) === 0) continue;
        const hit = hitCollider(this.source.mode, x0, y0, x1, y1, radius, collider);
        const key = `${state.particleIdForSlot(slot)}:${collider.id}`;
        if (collider.trigger) {
          if (hit) {
            insideNow.add(key);
            const phase = this.previousInside.has(key) ? "inside" : "enter";
            this._event(phase, slot, collider, hit);
            this.subEmitterHook?.("trigger", state.handleForSlot(slot), collider.id, { phase });
          } else if (!this.previousInside.has(key)) this._event("outside", slot, collider, null);
          continue;
        }
        if (!hit || speed < this.source.minimumSpeed || collisions >= this.source.maximumCollisions) continue;
        collisions += 1;
        const velocities = applyResponse(current, slot, hit, this.source);
        const retained = clamp3(1 - this.source.speedLoss, 0, 1);
        current.velocityX[slot] *= retained;
        current.velocityY[slot] *= retained;
        velocities.outgoingX = current.velocityX[slot];
        velocities.outgoingY = current.velocityY[slot];
        this.onVelocityResponse?.(slot, current.velocityX[slot], current.velocityY[slot], hit, collider);
        current.flags[slot] |= PARTICLE_FLAGS.COLLIDED;
        collision.state[slot] = PARTICLE_COLLISION_STATE.ENTER;
        collision.normalX[slot] = hit.nx;
        collision.normalY[slot] = hit.ny;
        collision.colliderId[slot] = Number.isInteger(collider.numericId) ? collider.numericId : 0;
        this._event("collision", slot, collider, hit, velocities);
        this.subEmitterHook?.("collision", state.handleForSlot(slot), collider.id);
        if (this.source.killOnContact) current.lifetime[slot] = current.age[slot];
      }
      slot = state.nextActiveSlot(slot);
    }
    for (const key of this.previousInside) if (!insideNow.has(key)) {
      const separator = key.indexOf(":");
      this.events.push({ phase: "exit", particleId: Number(key.slice(0, separator)), colliderId: key.slice(separator + 1) });
    }
    this.previousInside = insideNow;
    this.events.sort((a, b) => a.particleId - b.particleId || String(a.colliderId).localeCompare(String(b.colliderId)) || a.phase.localeCompare(b.phase));
    for (const event2 of this.events) {
      const action = this.source.triggerActions[event2.phase] ?? "callback";
      if (action === "kill") {
        for (let candidate = state.firstActiveSlot(); candidate !== -1; candidate = state.nextActiveSlot(candidate)) if (state.particleIdForSlot(candidate) === event2.particleId) current.lifetime[candidate] = current.age[candidate];
      }
    }
    const deliveredEvents = this.events.filter((event2) => (this.source.triggerActions[event2.phase] ?? "callback") !== "ignore");
    this.lastBatch = { authority: PARTICLE_COLLISION_AUTHORITY, budgetUsed: this.source.frameBudget - budget, budgetExhausted: budget <= 0, events: deliveredEvents.map((event2) => ({ ...event2 })) };
    if (deliveredEvents.length) this.onEvents?.(this.lastBatch);
    return this.lastBatch;
  }
  dispose() {
    this.detachEvaluator?.();
    this.detachEvaluator = null;
    this.previousInside.clear();
    this.events.length = 0;
  }
};

// packages/melon-runtime/src/particle/particle-subemitters-events.js
var PARTICLE_EVENT_ORDER = Object.freeze([
  "system-play",
  "system-restart",
  "burst",
  "particle-birth",
  "particle-continuous",
  "particle-collision",
  "particle-trigger",
  "custom",
  "particle-death",
  "system-loop",
  "system-complete"
]);
var ParticleEventsError = class extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "ParticleEventsError";
    this.code = code;
    this.details = details;
  }
};
var ParticleEventQueue = class {
  constructor(options = {}) {
    this.maximum = Math.max(1, Math.floor(options.maximum ?? 4096));
    this.events = [];
    this.subscribers = /* @__PURE__ */ new Map();
    this.sequence = 0;
    this.dropped = 0;
    this.disposed = false;
    this.onSubscriberError = options.onSubscriberError ?? null;
  }
  enqueue(type, payload = {}, time = 0) {
    if (this.disposed) return false;
    if (this.events.length >= this.maximum) {
      this.dropped += 1;
      return false;
    }
    this.events.push({ type, time, sequence: this.sequence++, ...payload });
    return true;
  }
  subscribe(type, listener) {
    if (this.disposed || typeof listener !== "function") throw new ParticleEventsError("APS_EVENTS_INVALID_SUBSCRIBER", "A live queue and listener are required.");
    const bucket = this.subscribers.get(type) ?? [];
    if (!bucket.includes(listener)) bucket.push(listener);
    this.subscribers.set(type, bucket);
    return () => this.unsubscribe(type, listener);
  }
  unsubscribe(type, listener) {
    const bucket = this.subscribers.get(type);
    if (!bucket) return false;
    const index = bucket.indexOf(listener);
    if (index < 0) return false;
    bucket.splice(index, 1);
    if (bucket.length === 0) this.subscribers.delete(type);
    return true;
  }
  clear() {
    const removed = this.events.length;
    this.events.length = 0;
    return removed;
  }
  flush() {
    if (this.events.length === 0) return Object.freeze({ events: [], dropped: this.dropped });
    const events = this.events.splice(0).sort((a, b) => a.time - b.time || a.sequence - b.sequence);
    const byType = /* @__PURE__ */ new Map();
    for (const event2 of events) (byType.get(event2.type) ?? (byType.set(event2.type, []), byType.get(event2.type))).push(event2);
    for (const [type, batch] of byType) {
      const listeners = [...this.subscribers.get(type) ?? [], ...this.subscribers.get("*") ?? []];
      for (const listener of listeners) {
        try {
          listener(Object.freeze({ type, events: batch, dropped: this.dropped }));
        } catch (error) {
          this.onSubscriberError?.(error, type, listener);
        }
      }
    }
    const result = Object.freeze({ events, dropped: this.dropped });
    this.dropped = 0;
    return result;
  }
  dispose() {
    this.clear();
    this.subscribers.clear();
    this.disposed = true;
  }
};
function detectParticleEffectCycles(effectId, linksByEffect, maximumDepth = 8) {
  const errors = [];
  const visit = (id, path) => {
    if (path.length > maximumDepth) {
      errors.push({ code: "APS_SUBEMITTER_DEPTH_LIMIT", path: [...path, id] });
      return;
    }
    const cycleIndex = path.indexOf(id);
    if (cycleIndex >= 0) {
      errors.push({ code: "APS_SUBEMITTER_CYCLE", path: [...path.slice(cycleIndex), id] });
      return;
    }
    for (const next of linksByEffect.get(id) ?? []) visit(next, [...path, id]);
  };
  visit(effectId, []);
  return errors;
}
function compileLink(link, index, context) {
  const event2 = link.event ?? "birth";
  if (!["birth", "continuous", "death", "collision", "trigger", "custom"].includes(event2)) throw new ParticleEventsError("APS_SUBEMITTER_INVALID_EVENT", `Unknown sub-emitter event '${event2}'.`, { index });
  return {
    ...link,
    id: String(link.id ?? `link.${index}`),
    event: event2,
    enabled: link.enabled !== false,
    probability: compileScalar(link.probability ?? 1, context, `$.subEmitters.links[${index}].probability`, "probability"),
    count: compileScalar(link.count ?? 1, context, `$.subEmitters.links[${index}].count`),
    delay: Math.max(0, link.delay ?? 0),
    maximumSpawn: Math.max(0, Math.floor(link.maximumSpawn ?? 256)),
    interval: Math.max(1e-6, link.interval ?? 0.1),
    inherit: { position: true, velocity: false, rotation: false, size: false, color: false, lifetimeRatio: false, seed: true, customData: false, ...link.inherit ?? {} },
    followParent: link.followParent === true,
    spawned: 0
  };
}
var ParticleSubEmitterModule = class {
  constructor(system, source = {}, options = {}) {
    this.system = system;
    this.source = {
      enabled: source.enabled === true,
      maximumDepth: Math.max(1, Math.floor(source.maximumDepth ?? 4)),
      eventBudget: Math.max(1, Math.floor(source.eventBudget ?? 1024)),
      spawnBudget: Math.max(0, Math.floor(source.spawnBudget ?? 256))
    };
    this.context = options.context ?? {};
    this.links = (source.links ?? []).map((link, index) => compileLink(link, index, this.context));
    this.eventQueue = options.eventQueue ?? new ParticleEventQueue({ maximum: this.source.eventBudget, onSubscriberError: options.onSubscriberError });
    this.ownsQueue = !options.eventQueue;
    this.spawnEffect = options.spawnEffect ?? null;
    this.readCustomData = options.readCustomData ?? null;
    this.effectId = String(options.effectId ?? system.systemId);
    this.ancestry = [...options.ancestry ?? []];
    if (this.ancestry.includes(this.effectId) || this.ancestry.length >= this.source.maximumDepth) throw new ParticleEventsError(this.ancestry.includes(this.effectId) ? "APS_SUBEMITTER_CYCLE" : "APS_SUBEMITTER_DEPTH_LIMIT", "Sub-emitter recursion is not allowed.");
    for (const link of this.links) if ((link.subEffectId ?? link.systemId) === this.effectId) throw new ParticleEventsError("APS_SUBEMITTER_CYCLE", `Sub-emitter link '${link.id}' references itself.`);
    this.snapshots = /* @__PURE__ */ new Map();
    this.nextContinuous = /* @__PURE__ */ new Map();
    this.delayed = [];
    this.followers = [];
    this.frameSpawned = 0;
    this.detach = [];
    this.disposed = false;
    this.colorScratch = new Float32Array(4);
  }
  subscribe(type, listener) {
    return this.eventQueue.subscribe(type, listener);
  }
  unsubscribe(type, listener) {
    return this.eventQueue.unsubscribe(type, listener);
  }
  clearEvents() {
    return this.eventQueue.clear();
  }
  attach(mainEmission) {
    if (!this.source.enabled) return this;
    if (mainEmission) this.detach.push(mainEmission.addPostSpawnInitializer((slot, particleId, state, _system, _sequence, overrides) => {
      const snapshot2 = this._snapshot(slot, particleId, state, true, overrides?.customData);
      this.snapshots.set(particleId, snapshot2);
    }));
    this.detach.push(this.system.on("emit", (handle, particleId) => {
      const snapshot2 = this._snapshot(this.system.state.slotFor(handle), particleId, this.system.state, true, this.snapshots.get(particleId)?.customData);
      this.snapshots.set(particleId, snapshot2);
      this.eventQueue.enqueue("particle-birth", { particleId, snapshot: snapshot2 }, this.system.time);
      this._scheduleLinks("birth", snapshot2);
    }));
    const reset = () => {
      this.delayed.length = 0;
      this.followers.length = 0;
      this.snapshots.clear();
      this.nextContinuous.clear();
      for (const link of this.links) link.spawned = 0;
      this.eventQueue.clear();
      this.frameSpawned = 0;
    };
    this.detach.push(this.system.on("restart", reset), this.system.on("clear", reset));
    const lifecycle = [["play", "system-play"], ["restart", "system-restart"], ["loop", "system-loop"]];
    for (const [event2, type] of lifecycle) this.detach.push(this.system.on(event2, (value) => this.eventQueue.enqueue(type, { value }, this.system.time)));
    this.detach.push(this.system.on("complete", (value) => {
      this.eventQueue.enqueue("system-complete", { value }, this.system.time);
      this.frameSpawned = 0;
      while (this.delayed.length && this.delayed[0].due <= this.system.time + Number.EPSILON && this.frameSpawned < this.source.spawnBudget) this._spawn(this.delayed.shift());
      this.eventQueue.flush();
    }));
    this.detach.push(this.system.on("particle-death", (_handle, particleId) => {
      const snapshot2 = this.snapshots.get(particleId) ?? { particleId };
      this.eventQueue.enqueue("particle-death", { particleId, snapshot: snapshot2 }, this.system.time);
      this._scheduleLinks("death", snapshot2);
      this.snapshots.delete(particleId);
      for (const key of this.nextContinuous.keys()) if (key.startsWith(`${particleId}:`)) this.nextContinuous.delete(key);
    }));
    this.detach.push(addModuleEvaluator(this.system, "subEmitters", (_system, delta) => this.update(delta)));
    return this;
  }
  recordBurst(payload) {
    this.eventQueue.enqueue("burst", payload, payload.time ?? this.system.time);
  }
  handleExternalEvent(type, handle, colliderId, payload = {}) {
    if (!this.source.enabled || this.disposed) return false;
    const slot = this.system.state.slotFor(handle);
    const particleId = slot >= 0 ? this.system.state.particleIdForSlot(slot) : payload.particleId;
    const snapshot2 = slot >= 0 ? this._snapshot(slot, particleId, this.system.state) : this.snapshots.get(particleId) ?? { particleId };
    const event2 = type === "trigger" ? "trigger" : "collision";
    this.eventQueue.enqueue(`particle-${event2}`, { particleId, colliderId, snapshot: snapshot2, ...payload }, this.system.time);
    this._scheduleLinks(event2, snapshot2, { colliderId, ...payload });
    return true;
  }
  emitCustom(name, payload = {}, particleId = null) {
    if (!this.source.enabled || this.disposed) return false;
    const snapshot2 = particleId === null ? { particleId: null } : this.snapshots.get(particleId) ?? { particleId };
    this.eventQueue.enqueue("custom", { name, payload, particleId, snapshot: snapshot2 }, this.system.time);
    this._scheduleLinks("custom", snapshot2, { name, payload });
    return true;
  }
  _snapshot(slot, particleId, state, fromStart = false, customOverride) {
    const values = fromStart ? state.start : state.current;
    const current = state.current;
    unpackParticleColor(values.color[slot], this.colorScratch);
    return {
      particleId,
      parentParticleId: null,
      position: { x: values.positionX[slot], y: values.positionY[slot] },
      velocity: { x: values.velocityX[slot], y: values.velocityY[slot] },
      rotation: values.rotation[slot],
      size: { x: values.sizeX[slot], y: values.sizeY[slot] },
      color: Array.from(this.colorScratch),
      lifetimeRatio: fromStart ? 0 : current.lifetime[slot] > 0 ? current.age[slot] / current.lifetime[slot] : 1,
      seed: current.randomSeed[slot],
      customData: customOverride ?? this.readCustomData?.(slot, particleId, state) ?? null
    };
  }
  _scheduleLinks(event2, snapshot2, extra = {}, onlyLink = null) {
    for (const link of this.links) {
      if (onlyLink && link !== onlyLink) continue;
      if (!link.enabled || link.event !== event2 || link.spawned >= link.maximumSpawn) continue;
      if (this.delayed.length >= this.source.eventBudget) break;
      const random2 = deterministicUnit(snapshot2.seed ?? this.system.effectSeed, "sub-emitter", link.id, snapshot2.particleId ?? 0, link.spawned);
      if (evaluateParticleValue(link.probability, snapshot2.lifetimeRatio ?? 0, random2) < random2) continue;
      const count = Math.max(0, Math.floor(evaluateParticleValue(link.count, snapshot2.lifetimeRatio ?? 0, random2)));
      const request = { due: this.system.time + link.delay, link, snapshot: snapshot2, extra, count, sequence: this.eventQueue.sequence++ };
      this.delayed.push(request);
    }
    this.delayed.sort((a, b) => a.due - b.due || a.sequence - b.sequence);
  }
  _inherit(link, snapshot2) {
    const payload = { parentParticleId: snapshot2.particleId, linkId: link.id };
    for (const key of ["position", "velocity", "rotation", "size", "color", "lifetimeRatio", "seed", "customData"]) if (link.inherit[key]) payload[key] = snapshot2[key];
    return payload;
  }
  _spawn(request) {
    const available = Math.min(request.count, request.link.maximumSpawn - request.link.spawned, this.source.spawnBudget - this.frameSpawned);
    if (available <= 0) return 0;
    const inherited = this._inherit(request.link, request.snapshot);
    const result = this.spawnEffect?.({
      target: { subEffectId: request.link.subEffectId ?? null, systemId: request.link.systemId ?? null, emitterId: request.link.emitterId ?? null },
      count: available,
      inherited,
      parentParticleId: request.snapshot.particleId,
      ancestry: [...this.ancestry, this.effectId],
      depth: this.ancestry.length + 1,
      followParent: request.link.followParent,
      extra: request.extra,
      scheduledTime: request.due,
      startDelay: Math.max(0, request.due - this.system.time)
    }) ?? { spawned: 0, particleIds: [] };
    const spawned = Math.min(available, Math.max(0, Math.floor(result.spawned ?? result.particleIds?.length ?? 0)));
    request.link.spawned += spawned;
    this.frameSpawned += spawned;
    this.eventQueue.enqueue("sub-emitter-spawn", { linkId: request.link.id, parentParticleId: request.snapshot.particleId, childParticleIds: [...result.particleIds ?? []], count: spawned }, this.system.time);
    if (request.link.followParent && typeof result.setTransform === "function") this.followers.push({ parentParticleId: request.snapshot.particleId, setTransform: result.setTransform, dispose: result.dispose });
    return spawned;
  }
  update() {
    if (this.disposed) return null;
    this.frameSpawned = 0;
    const state = this.system.state;
    let slot = state.firstActiveSlot();
    while (slot !== -1) {
      const particleId = state.particleIdForSlot(slot);
      const snapshot2 = this._snapshot(slot, particleId, state);
      this.snapshots.set(particleId, snapshot2);
      for (const link of this.links) if (link.enabled && link.event === "continuous") {
        const key = `${particleId}:${link.id}`;
        const next = this.nextContinuous.get(key) ?? this.system.time;
        if (this.system.time + Number.EPSILON >= next) {
          this.eventQueue.enqueue("particle-continuous", { particleId, linkId: link.id, snapshot: snapshot2 }, this.system.time);
          this._scheduleLinks("continuous", snapshot2, {}, link);
          this.nextContinuous.set(key, this.system.time + link.interval);
        }
      }
      slot = state.nextActiveSlot(slot);
    }
    while (this.delayed.length && this.delayed[0].due <= this.system.time + Number.EPSILON && this.frameSpawned < this.source.spawnBudget) this._spawn(this.delayed.shift());
    for (let index = this.followers.length - 1; index >= 0; index -= 1) {
      const follower = this.followers[index];
      const snapshot2 = this.snapshots.get(follower.parentParticleId);
      if (snapshot2 && follower.setTransform(snapshot2.position, snapshot2.rotation, snapshot2.size) !== false) continue;
      else {
        follower.dispose?.();
        this.followers.splice(index, 1);
      }
    }
    return this.eventQueue.flush();
  }
  dispose() {
    if (this.disposed) return;
    for (const detach of this.detach.splice(0)) detach?.();
    for (const follower of this.followers) follower.dispose?.();
    this.followers.length = 0;
    this.delayed.length = 0;
    this.snapshots.clear();
    this.nextContinuous.clear();
    if (this.ownsQueue) this.eventQueue.dispose();
    this.disposed = true;
  }
};

// packages/melon-runtime/src/particle/particle-trails-lights-custom.js
var ParticleOptionalFeatureError = class extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "ParticleOptionalFeatureError";
    this.code = code;
    this.details = details;
  }
};
var ParticleTrailsModule = class {
  constructor(system, source = {}, options = {}) {
    this.system = system;
    this.source = {
      enabled: source.enabled === true,
      lifetime: Math.max(0, source.lifetime ?? 0.5),
      minimumVertexDistance: Math.max(0, source.minimumVertexDistance ?? source.minVertexDistance ?? 1),
      maxPoints: Math.max(2, Math.floor(source.maxPoints ?? 32)),
      smoothing: clamp3(source.smoothing ?? 0, 0, 1),
      textureMode: source.textureMode ?? "stretch",
      appearanceMode: source.appearanceMode ?? "particle",
      textureTileLength: Math.max(1, source.textureTileLength ?? 64),
      cap: source.cap ?? "butt",
      space: source.space ?? "world",
      dieWithParticle: source.dieWithParticle !== false,
      ribbonGroup: source.ribbonGroup ?? system.systemId
    };
    if (!["stretch", "tile"].includes(this.source.textureMode) || !["butt", "round", "square"].includes(this.source.cap) || !["local", "world"].includes(this.source.space)) throw new ParticleOptionalFeatureError("APS_TRAIL_INVALID_OPTION", "Trail texture/cap/space option is invalid.");
    this.context = options.context ?? {};
    if (!["particle", "particleImage", "color"].includes(this.source.appearanceMode)) throw new ParticleOptionalFeatureError("APS_TRAIL_INVALID_OPTION", "Trail appearance mode is invalid.");
    this.textureAnimation = options.textureAnimation ?? null;
    this.width = compileScalar(source.width ?? 1, this.context, "$.trails.width");
    this.color = compileColor(source.color ?? [1, 1, 1, 1], this.context, "$.trails.color");
    this.widthOverParticle = source.widthOverParticle ? compileScalar(source.widthOverParticle, this.context, "$.trails.widthOverParticle") : null;
    this.colorOverParticle = source.colorOverParticle ? compileColor(source.colorOverParticle, this.context, "$.trails.colorOverParticle") : null;
    this.capacity = this.source.enabled ? system.state.capacity : 0;
    const pointCapacity = this.capacity * this.source.maxPoints;
    this.x = new Float32Array(pointCapacity);
    this.y = new Float32Array(pointCapacity);
    this.age = new Float32Array(pointCapacity);
    this.pointColor = new Uint32Array(pointCapacity);
    this.particleTime = new Float32Array(pointCapacity);
    this.count = new Uint16Array(this.capacity);
    this.head = new Uint16Array(this.capacity);
    this.generation = new Uint32Array(this.capacity);
    this.detached = [];
    this.scratchColor = new Float64Array(4);
    this.detach = [];
    this.geometryRanges = [];
    this.geometryVertices = new Float32Array(pointCapacity * 3);
    this.geometryColors = new Uint32Array(pointCapacity);
    this.geometryBounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    this.geometry = {
      primitive: "trail-strip-batch",
      group: this.source.ribbonGroup,
      count: 0,
      ranges: this.geometryRanges,
      vertices: this.geometryVertices,
      colors: this.geometryColors,
      bounds: this.geometryBounds,
      drawCallGroups: 0,
      smoothing: this.source.smoothing,
      textureMode: this.source.textureMode,
      appearanceMode: this.source.appearanceMode,
      textureTileLength: this.source.textureTileLength,
      cap: this.source.cap,
      space: this.source.space
    };
  }
  attach() {
    if (!this.source.enabled) return this;
    this.detach.push(addModuleEvaluator(this.system, "trails", (_system, delta) => this.update(delta)));
    this.detach.push(this.system.on("particle-death", (handle) => this._onDeath(handle)));
    const reset = () => {
      this.count.fill(0);
      this.head.fill(0);
      this.generation.fill(0);
      this.detached.length = 0;
      this.geometryRanges.length = 0;
      this.geometry.count = 0;
      this.geometry.drawCallGroups = 0;
      this.geometryBounds.minX = this.geometryBounds.minY = this.geometryBounds.maxX = this.geometryBounds.maxY = 0;
    };
    this.detach.push(this.system.on("clear", reset), this.system.on("restart", reset));
    return this;
  }
  _base(slot) {
    return slot * this.source.maxPoints;
  }
  _onDeath(handle) {
    const slot = handle % (1 << 20);
    const count = this.count[slot];
    if (this.source.dieWithParticle || count === 0) {
      this.count[slot] = 0;
      return;
    }
    const points = [];
    const base = this._base(slot);
    for (let index = 0; index < count; index += 1) {
      const point2 = base + (this.head[slot] + index) % this.source.maxPoints;
      points.push({ x: this.x[point2], y: this.y[point2], age: this.age[point2], color: this.pointColor[point2], particleTime: this.particleTime[point2] });
    }
    points.color = this.system.state.current.color[slot];
    points.seed = this.system.state.current.randomSeed[slot];
    points.particleTime = this.system.state.normalizedAgeForSlot(slot);
    points.frame = this.textureAnimation?.frameForSlot(slot) ?? null;
    this.detached.push(points);
    this.count[slot] = 0;
  }
  _append(slot, x, y) {
    const maximum = this.source.maxPoints;
    let count = this.count[slot];
    let head = this.head[slot];
    const index = count < maximum ? (head + count) % maximum : head;
    if (count < maximum) count += 1;
    else head = (head + 1) % maximum;
    const point2 = this._base(slot) + index;
    this.x[point2] = x;
    this.y[point2] = y;
    this.age[point2] = 0;
    this.pointColor[point2] = this.system.state.current.color[slot];
    this.particleTime[point2] = this.system.state.normalizedAgeForSlot(slot);
    this.count[slot] = count;
    this.head[slot] = head;
  }
  update(delta) {
    const state = this.system.state;
    let slot = state.firstActiveSlot();
    while (slot !== -1) {
      const generation = state.admin.generations[slot];
      if (this.generation[slot] !== generation) {
        this.generation[slot] = generation;
        this.count[slot] = 0;
        this.head[slot] = 0;
      }
      const base = this._base(slot);
      let count = this.count[slot];
      let head = this.head[slot];
      for (let index = 0; index < count; index += 1) this.age[base + (head + index) % this.source.maxPoints] += delta;
      while (count && this.age[base + head] > this.source.lifetime) {
        head = (head + 1) % this.source.maxPoints;
        count -= 1;
      }
      this.count[slot] = count;
      this.head[slot] = head;
      const current = state.current;
      const x = current.positionX[slot];
      const y = current.positionY[slot];
      const last = count ? base + (head + count - 1) % this.source.maxPoints : -1;
      if (last < 0 || Math.hypot(x - this.x[last], y - this.y[last]) >= this.source.minimumVertexDistance) this._append(slot, x, y);
      slot = state.nextActiveSlot(slot);
    }
    for (let trail = this.detached.length - 1; trail >= 0; trail -= 1) {
      for (const point2 of this.detached[trail]) point2.age += delta;
      while (this.detached[trail].length && this.detached[trail][0].age > this.source.lifetime) this.detached[trail].shift();
      if (!this.detached[trail].length) this.detached.splice(trail, 1);
    }
  }
  _ensureGeometryCapacity(count) {
    if (this.geometryColors.length >= count) return;
    const capacity = Math.max(count, Math.max(2, this.geometryColors.length * 2));
    this.geometryVertices = new Float32Array(capacity * 3);
    this.geometryColors = new Uint32Array(capacity);
    this.geometry.vertices = this.geometryVertices;
    this.geometry.colors = this.geometryColors;
  }
  _pointColor(particleColor, trailTime, particleTime, seed) {
    if (this.source.appearanceMode === "particle") return particleColor;
    if (this.source.appearanceMode === "particleImage") return 4294967295;
    evaluateParticleValue(this.colorOverParticle ?? this.color, this.colorOverParticle ? particleTime : trailTime, deterministicUnit(seed, "trail", "color"), this.scratchColor);
    return packParticleColor(...this.scratchColor);
  }
  buildGeometry() {
    if (!this.source.enabled) return null;
    const state = this.system.state;
    let required = 0;
    let slot = state.firstActiveSlot();
    while (slot !== -1) {
      required += this.count[slot];
      slot = state.nextActiveSlot(slot);
    }
    for (const trail of this.detached) required += trail.length;
    this._ensureGeometryCapacity(required);
    const vertices = this.geometryVertices;
    const colors = this.geometryColors;
    const ranges = this.geometryRanges;
    const bounds = this.geometryBounds;
    bounds.minX = Infinity;
    bounds.minY = Infinity;
    bounds.maxX = -Infinity;
    bounds.maxY = -Infinity;
    let recordCount = 0;
    let rangeCount = 0;
    const writeRecord = (x, y, width, color) => {
      const offset = recordCount * 3;
      vertices[offset] = x;
      vertices[offset + 1] = y;
      vertices[offset + 2] = width;
      colors[recordCount] = color;
      const radius = Math.abs(width);
      bounds.minX = Math.min(bounds.minX, x - radius);
      bounds.minY = Math.min(bounds.minY, y - radius);
      bounds.maxX = Math.max(bounds.maxX, x + radius);
      bounds.maxY = Math.max(bounds.maxY, y + radius);
      recordCount += 1;
    };
    slot = state.firstActiveSlot();
    while (slot !== -1) {
      const count = this.count[slot];
      const base = this._base(slot);
      const head = this.head[slot];
      const rangeStart = recordCount;
      for (let index = 0; index < count; index += 1) {
        const point2 = base + (head + index) % this.source.maxPoints;
        const trailTime = this.source.lifetime > 0 ? clamp3(this.age[point2] / this.source.lifetime, 0, 1) : 1;
        const particleTime = this.particleTime[point2];
        const width = evaluateScalar(this.width, trailTime, state.current.randomSeed[slot], "trail", "width") * (this.widthOverParticle ? evaluateScalar(this.widthOverParticle, particleTime, state.current.randomSeed[slot], "trail", "particle-width") : 1);
        writeRecord(this.x[point2], this.y[point2], width, this._pointColor(this.pointColor[point2], trailTime, particleTime, state.current.randomSeed[slot]));
      }
      if (recordCount - rangeStart >= 2) {
        const range = ranges[rangeCount] ?? (ranges[rangeCount] = {});
        range.start = rangeStart;
        range.count = recordCount - rangeStart;
        range.particleId = state.particleIdForSlot(slot);
        rangeCount += 1;
        range.frame = this.textureAnimation?.frameForSlot(slot) ?? null;
      }
      slot = state.nextActiveSlot(slot);
    }
    for (const trail of this.detached) {
      const rangeStart = recordCount;
      for (const point2 of trail) {
        const trailTime = this.source.lifetime > 0 ? clamp3(point2.age / this.source.lifetime, 0, 1) : 1;
        const seed = trail.seed ?? this.system.effectSeed;
        const particleTime = point2.particleTime ?? trail.particleTime ?? 1;
        const width = evaluateScalar(this.width, trailTime, seed, "trail", "width") * (this.widthOverParticle ? evaluateScalar(this.widthOverParticle, particleTime, seed, "trail", "particle-width") : 1);
        writeRecord(point2.x, point2.y, width, this._pointColor(point2.color ?? trail.color ?? 4294967295, trailTime, particleTime, seed));
      }
      if (recordCount - rangeStart >= 2) {
        const range = ranges[rangeCount] ?? (ranges[rangeCount] = {});
        range.start = rangeStart;
        range.count = recordCount - rangeStart;
        range.particleId = null;
        rangeCount += 1;
        range.frame = trail.frame ?? null;
      }
    }
    ranges.length = rangeCount;
    if (!recordCount) bounds.minX = bounds.minY = bounds.maxX = bounds.maxY = 0;
    this.geometry.count = recordCount;
    this.geometry.drawCallGroups = rangeCount;
    return this.geometry;
  }
  dispose() {
    for (const detach of this.detach.splice(0)) detach?.();
    this.detached.length = 0;
    this.geometryRanges.length = 0;
    this.geometryVertices = this.geometryColors = null;
    this.geometry.vertices = this.geometry.colors = null;
    this.x = this.y = this.age = this.pointColor = this.particleTime = null;
  }
};
var ParticleLightsModule = class {
  constructor(system, source = {}, options = {}) {
    this.system = system;
    this.source = { enabled: source.enabled === true, lightReference: source.lightReference ?? source.lightId ?? null, ratio: clamp3(source.ratio ?? 1, 0, 1), maxLights: Math.max(0, Math.floor(source.maxLights ?? 32)), inheritColor: source.inheritColor !== false, renderMask: source.renderMask ?? 4294967295 };
    this.context = options.context ?? {};
    this.intensity = compileScalar(source.intensity ?? 1, this.context, "$.lights.intensity");
    this.range = compileScalar(source.range ?? 32, this.context, "$.lights.range");
    this.color = compileColor(source.color ?? [1, 1, 1, 1], this.context, "$.lights.color");
    this.backend = options.backend ?? "canvas2d";
    this.warnings = this.source.enabled && this.backend === "canvas2d" ? [{ code: "APS_CAP_FALLBACK", feature: "particle.lights", actual: "emissive-quad" }] : [];
    const maximum = this.source.enabled ? this.source.maxLights : 0;
    this.position = new Float32Array(maximum * 2);
    this.values = new Float32Array(maximum * 2);
    this.colors = new Uint32Array(maximum);
    this.particleIds = new Uint32Array(maximum);
    this.count = 0;
    this.scratch = new Float64Array(4);
    this.inherited = new Float64Array(4);
    this.detachEvaluator = null;
  }
  attach() {
    if (this.source.enabled) this.detachEvaluator = addModuleEvaluator(this.system, "lights", () => this.update());
    return this;
  }
  update() {
    this.count = 0;
    const state = this.system.state;
    let slot = state.firstActiveSlot();
    while (slot !== -1 && this.count < this.source.maxLights) {
      const current = state.current;
      const seed = current.randomSeed[slot];
      if (deterministicUnit(seed, "light", "ratio") <= this.source.ratio) {
        const time = state.normalizedAgeForSlot(slot);
        const index = this.count++;
        this.position[index * 2] = current.positionX[slot];
        this.position[index * 2 + 1] = current.positionY[slot];
        this.values[index * 2] = Math.max(0, evaluateScalar(this.intensity, time, seed, "light", "intensity"));
        this.values[index * 2 + 1] = Math.max(0, evaluateScalar(this.range, time, seed, "light", "range"));
        evaluateParticleValue(this.color, time, deterministicUnit(seed, "light", "color"), this.scratch);
        if (this.source.inheritColor) {
          unpackParticleColor(current.color[slot], this.inherited);
          for (let c = 0; c < 4; c += 1) this.scratch[c] *= this.inherited[c];
        }
        this.colors[index] = packParticleColor(...this.scratch);
        this.particleIds[index] = state.particleIdForSlot(slot);
      }
      slot = state.nextActiveSlot(slot);
    }
    return this.batch();
  }
  batch() {
    return { primitive: this.backend === "canvas2d" ? "emissive-quad-batch" : "light-reference-batch", lightReference: this.source.lightReference, count: this.count, positions: this.position.subarray(0, this.count * 2), values: this.values.subarray(0, this.count * 2), colors: this.colors.subarray(0, this.count), particleIds: this.particleIds.subarray(0, this.count), renderMask: this.source.renderMask, warnings: this.warnings };
  }
  dispose() {
    this.detachEvaluator?.();
    this.detachEvaluator = null;
    this.position = this.values = this.colors = this.particleIds = null;
  }
};
function normalizeChannel(channel, index, context) {
  const components = channel.components ?? channel.value ?? [0, 0, 0, 0];
  return { index: channel.index ?? index, name: channel.name ?? `custom${index}`, aliases: channel.aliases ?? [], components: Array.from({ length: 4 }, (_, component) => compileScalar(components[component] ?? 0, context, `$.customData.channels[${index}].components[${component}]`)) };
}
var ParticleCustomDataModule = class {
  constructor(system, source = {}, options = {}) {
    this.system = system;
    this.source = { enabled: source.enabled === true, flags: source.flags ?? {} };
    this.context = options.context ?? {};
    this.channels = (Array.isArray(source.channels) ? source.channels : Object.entries(source.channels ?? {}).map(([name, channel]) => ({
      name,
      ...channel && typeof channel === "object" ? channel : { components: [channel ?? 0, 0, 0, 0] }
    }))).slice(0, 2).map((channel, index) => normalizeChannel(channel, index, this.context));
    if (this.source.enabled && system.state.optional.customVectors.length < 2) throw new ParticleOptionalFeatureError("APS_CUSTOM_STATE_REQUIRED", "Two custom Vector4 state channels must be enabled before constructing the system.");
    this.aliases = /* @__PURE__ */ new Map();
    for (const channel of this.channels) {
      this.aliases.set(channel.name, channel.index);
      for (const alias of channel.aliases) this.aliases.set(alias, channel.index);
    }
    this.integerFlags = new Uint32Array(this.source.enabled ? system.state.capacity : 0);
    this.detach = [];
  }
  attach(mainEmission) {
    if (!this.source.enabled) return this;
    if (mainEmission) this.detach.push(mainEmission.addSpawnInitializer((slot, particleId, state, _system, _sequence, overrides) => this.initialize(slot, particleId, state, overrides?.customData)));
    this.detach.push(addModuleEvaluator(this.system, "customData", () => this.update()));
    return this;
  }
  initialize(slot, particleId, state, override = {}) {
    const seed = state.current.randomSeed[slot];
    for (const channel of this.channels) {
      const target = state.optional.customVectors[channel.index];
      const values = override[channel.name] ?? override[channel.index];
      for (let component = 0; component < 4; component += 1) target[slot * 4 + component] = values?.[component] ?? evaluateScalar(channel.components[component], 0, seed, "custom", channel.name, component, particleId);
    }
    this.integerFlags[slot] = Number.isInteger(override.flags) ? override.flags >>> 0 : 0;
  }
  update() {
    const state = this.system.state;
    let slot = state.firstActiveSlot();
    while (slot !== -1) {
      const time = state.normalizedAgeForSlot(slot);
      const seed = state.current.randomSeed[slot];
      for (const channel of this.channels) {
        const target = state.optional.customVectors[channel.index];
        for (let component = 0; component < 4; component += 1) if (channel.components[component].mode === "curve" || channel.components[component].mode === "randomBetweenCurves") target[slot * 4 + component] = evaluateScalar(channel.components[component], time, seed, "custom", channel.name, component);
      }
      slot = state.nextActiveSlot(slot);
    }
  }
  read(handle, output = {}) {
    const slot = this.system.state.slotFor(handle);
    if (slot < 0) return null;
    output.particleId = this.system.state.particleIdForSlot(slot);
    output.flags = this.integerFlags[slot];
    output.channels ?? (output.channels = {});
    for (const channel of this.channels) output.channels[channel.name] = this.system.state.optional.customVectors[channel.index].subarray(slot * 4, slot * 4 + 4);
    return output;
  }
  channelIndex(name) {
    return this.aliases.get(name) ?? -1;
  }
  dispose() {
    for (const detach of this.detach.splice(0)) detach?.();
    this.integerFlags = null;
    this.aliases.clear();
  }
};

// packages/melon-runtime/src/particle/particle-performance.js
var PARTICLE_PERFORMANCE_BUDGETS = Object.freeze({
  desktopWebgl: Object.freeze({ particleCount: 1e4, targetFps: 60, updateP95Ms: 4, drawCalls: 8, memoryBytes: 16 * 1024 * 1024 }),
  desktopCanvas2d: Object.freeze({ particleCount: 1e3, targetFps: 60, updateP95Ms: 4, drawCalls: null, memoryBytes: 4 * 1024 * 1024 }),
  mobileWebgl: Object.freeze({ particleCount: 3e3, targetFps: 30, updateP95Ms: 6, drawCalls: 8, memoryBytes: 6 * 1024 * 1024 }),
  mobileCanvas2d: Object.freeze({ particleCount: 500, targetFps: 30, updateP95Ms: 6, drawCalls: null, memoryBytes: 3 * 1024 * 1024 })
});
var PARTICLE_QUALITY_TIERS = Object.freeze({
  low: Object.freeze({ amountRatio: 0.35, noiseOctaveRatio: 0.5, collisionBudgetRatio: 0.35, eventBudgetRatio: 0.5, spawnBudgetRatio: 0.5, trailPointRatio: 0.5, lightRatio: 0.35, fieldEvaluationRatio: 0.5 }),
  medium: Object.freeze({ amountRatio: 0.65, noiseOctaveRatio: 0.75, collisionBudgetRatio: 0.65, eventBudgetRatio: 0.75, spawnBudgetRatio: 0.75, trailPointRatio: 0.75, lightRatio: 0.65, fieldEvaluationRatio: 0.75 }),
  high: Object.freeze({ amountRatio: 1, noiseOctaveRatio: 1, collisionBudgetRatio: 1, eventBudgetRatio: 1, spawnBudgetRatio: 1, trailPointRatio: 1, lightRatio: 1, fieldEvaluationRatio: 1 }),
  ultra: Object.freeze({ amountRatio: 1, noiseOctaveRatio: 1, collisionBudgetRatio: 1, eventBudgetRatio: 1, spawnBudgetRatio: 1, trailPointRatio: 1, lightRatio: 1, fieldEvaluationRatio: 1 })
});
var ParticlePerformanceError = class extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "ParticlePerformanceError";
    this.code = code;
    this.details = details;
  }
};
function resolveParticleQualityOptions(quality = "high") {
  if (typeof quality === "string") {
    const tier = PARTICLE_QUALITY_TIERS[quality];
    if (!tier) throw new ParticlePerformanceError("APS_QUALITY_UNKNOWN", `Unknown particle quality tier '${quality}'.`, { quality });
    return tier;
  }
  if (!quality || typeof quality !== "object") throw new ParticlePerformanceError("APS_QUALITY_INVALID", "Particle quality must be a tier name or options object.");
  return Object.freeze({ ...PARTICLE_QUALITY_TIERS.high, ...quality });
}
function scaleParticleBudget(value, ratio, minimum = 0) {
  return Math.max(minimum, Math.floor(Math.max(0, Number(value) || 0) * Math.max(0, Number(ratio) || 0)));
}
function percentile(samples, ratio = 0.95) {
  if (!Array.isArray(samples) || samples.length === 0) return 0;
  const ordered = [...samples].sort((a, b) => a - b);
  return ordered[Math.min(ordered.length - 1, Math.max(0, Math.ceil(ordered.length * ratio) - 1))];
}
function createParticleBenchmarkReport({ target, particleCount, emitterCount = 1, updateSamples = [], renderSamples = [], memoryBytes = 0, drawCalls = 0, overdrawPeak = 0, allocationStable = false }) {
  return Object.freeze({
    target,
    particleCount,
    emitterCount,
    updateP95Ms: percentile(updateSamples),
    renderP95Ms: percentile(renderSamples),
    memoryBytes,
    drawCalls,
    overdrawPeak,
    allocationStable: allocationStable === true,
    samples: Object.freeze({ update: updateSamples.length, render: renderSamples.length })
  });
}
function validateParticlePerformanceReport(report, budget = PARTICLE_PERFORMANCE_BUDGETS[report?.target]) {
  if (!budget) throw new ParticlePerformanceError("APS_PERF_TARGET_UNKNOWN", `No performance budget for '${report?.target}'.`);
  const failures = [];
  if (report.particleCount < budget.particleCount) failures.push({ metric: "particleCount", actual: report.particleCount, expected: budget.particleCount });
  if (report.updateP95Ms > budget.updateP95Ms) failures.push({ metric: "updateP95Ms", actual: report.updateP95Ms, expected: budget.updateP95Ms });
  if (report.memoryBytes > budget.memoryBytes) failures.push({ metric: "memoryBytes", actual: report.memoryBytes, expected: budget.memoryBytes });
  if (budget.drawCalls !== null && report.drawCalls > budget.drawCalls) failures.push({ metric: "drawCalls", actual: report.drawCalls, expected: budget.drawCalls });
  if (!report.allocationStable) failures.push({ metric: "allocationStable", actual: false, expected: true });
  return Object.freeze({ ok: failures.length === 0, failures: Object.freeze(failures) });
}

// packages/melon-runtime/src/particle/particle-runtime-modules.js
var ParticleRuntimeModulesError = class extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "ParticleRuntimeModulesError";
    this.code = code;
    this.details = details;
  }
};
function createParticleSystem2DFromEmitter(compiledEffect, systemId, emitterId, options = {}) {
  if (!compiledEffect || compiledEffect.disposed || !compiledEffect.asset) {
    throw new ParticleRuntimeModulesError("APS_MODULES_INVALID_EFFECT", "A live compiled ParticleEffect2D is required.");
  }
  const systemAsset = compiledEffect.systemById.get(systemId);
  const emitter = compiledEffect.emitterById.get(emitterId);
  if (!systemAsset || !emitter || !systemAsset.emitters.includes(emitter)) {
    throw new ParticleRuntimeModulesError("APS_MODULES_EMITTER_MISSING", `Emitter '${emitterId}' is not part of system '${systemId}'.`);
  }
  const modules = emitter.modules;
  const main = modules.main;
  const quality = resolveParticleQualityOptions(options.quality ?? "high");
  const seedHierarchy = compiledEffect.createSeedHierarchy(options.seedOptions).system(systemId).emitter(emitterId);
  const qualityAmountRatio = options.qualityAmountRatio ?? quality.amountRatio;
  const capacity = Math.max(1, Math.floor(main.maxParticles * (main.qualityAmountRatio ?? 1) * qualityAmountRatio));
  const systemOptions = options.systemOptions ?? {};
  const particleSystem = new ParticleSystem2D({
    capacity,
    maxCapacity: options.maxCapacity ?? capacity,
    resizePolicy: options.resizePolicy ?? "fixed",
    overflowPolicy: main.overflowPolicy,
    duration: main.duration,
    looping: main.looping,
    startDelay: main.startDelay,
    simulationSpace: main.simulationSpace,
    simulationSpeed: main.simulationSpeed,
    cullingMode: main.cullingMode,
    stopAction: main.stopAction,
    randomSeed: seedHierarchy.seed,
    systemId,
    emitterId,
    ...systemOptions,
    features: {
      ...systemOptions.features,
      animation: modules.textureSheetAnimation.enabled === true || systemOptions.features?.animation === true,
      collision: modules.collision.enabled === true || systemOptions.features?.collision === true,
      parent: modules.subEmitters.enabled === true || systemOptions.features?.parent === true,
      customVectors: modules.customData.enabled === true ? 2 : systemOptions.features?.customVectors ?? 0
    }
  });
  const context = { curves: compiledEffect.curveById, gradients: compiledEffect.gradientById };
  const mainEmission = new ParticleMainEmissionModule(particleSystem, {
    main,
    emission: { ...modules.emission, qualityAmountRatio: (modules.emission.qualityAmountRatio ?? 1) * qualityAmountRatio },
    context,
    onSpawnScheduled: options.onSpawnScheduled
  });
  let shape = null;
  let detachShape = null;
  if (modules.shape.enabled !== false) {
    shape = compileParticleShape(modules.shape, {
      seed: seedHierarchy.seed,
      mask: options.mask,
      resolveObjectPoints: options.resolveObjectPoints
    });
    detachShape = attachParticleShape(mainEmission, shape);
  }
  const velocity = modules.velocityOverLifetime;
  const motion = new ParticleMotionModule(particleSystem, {
    context,
    initialVelocity: velocity.initialVelocity,
    velocityOverLifetime: velocity,
    forceOverLifetime: {
      ...modules.forceOverLifetime,
      gravityModifier: modules.forceOverLifetime.gravityModifier ?? main.gravityModifier
    },
    inheritVelocity: velocity.inheritVelocity,
    lifetimeByEmitterSpeed: velocity.lifetimeByEmitterSpeed,
    limitVelocity: velocity.limitVelocity,
    alignToVelocity: velocity.alignToVelocity
  });
  motion.attach();
  const visual = new ParticleVisualPropertiesModule(particleSystem, {
    context,
    colorOverLifetime: modules.colorOverLifetime,
    colorBySpeed: modules.colorBySpeed,
    sizeOverLifetime: modules.sizeOverLifetime,
    sizeBySpeed: modules.sizeBySpeed,
    rotationOverLifetime: modules.rotationOverLifetime,
    rotationBySpeed: modules.rotationBySpeed
  }).attach(mainEmission);
  const noiseFields = new ParticleNoiseForceFieldModule(particleSystem, {
    noise: modules.noise,
    forceFields: modules.forceFields,
    attractorInteraction: modules.forceOverLifetime.attractorInteraction,
    context,
    fieldRegistry: options.fieldRegistry,
    quality
  }).attach();
  const textureAnimation = new ParticleTextureAnimationModule(particleSystem, modules.textureSheetAnimation, { context }).attach(mainEmission);
  if (particleSystem.state.optional.parent && Number.isInteger(options.parentParticleId)) {
    mainEmission.addSpawnInitializer((slot) => {
      particleSystem.state.optional.parent.parentId[slot] = options.parentParticleId >>> 0;
    });
  }
  const eventQueue = options.eventQueue ?? new ParticleEventQueue({ maximum: modules.subEmitters.eventBudget, onSubscriberError: options.onSubscriberError });
  const subEmitters = new ParticleSubEmitterModule(particleSystem, {
    ...modules.subEmitters,
    eventBudget: scaleParticleBudget(modules.subEmitters.eventBudget, quality.eventBudgetRatio, 1),
    spawnBudget: scaleParticleBudget(modules.subEmitters.spawnBudget, quality.spawnBudgetRatio, 1)
  }, {
    context,
    eventQueue,
    spawnEffect: options.spawnSubEffect,
    effectId: options.effectId ?? compiledEffect.asset.effect?.id ?? systemId,
    ancestry: options.ancestry,
    onSubscriberError: options.onSubscriberError
  }).attach(mainEmission);
  const scheduledListener = mainEmission.onSpawnScheduled;
  mainEmission.onSpawnScheduled = (time, count, kind, sequence, target) => {
    scheduledListener?.(time, count, kind, sequence, target);
    if (kind === "burst") subEmitters.recordBurst({ time, count, sequence });
  };
  const collision = modules.collision.enabled === true ? new ParticleCollisionModule(particleSystem, { ...modules.collision, frameBudget: scaleParticleBudget(modules.collision.frameBudget, quality.collisionBudgetRatio, 1) }, {
    colliderRegistry: options.colliderRegistry,
    spatialQuery: options.collisionSpatialQuery,
    onEvents: options.onCollisionEvents,
    onVelocityResponse: (slot) => motion.adoptCurrentVelocity(slot),
    subEmitterHook: (type, handle, colliderId, payload) => {
      subEmitters.handleExternalEvent(type, handle, colliderId, payload);
      options.subEmitterHook?.(type, handle, colliderId, payload);
    }
  }).attach() : null;
  const trails = new ParticleTrailsModule(particleSystem, { ...modules.trails, maxPoints: scaleParticleBudget(modules.trails.maxPoints, quality.trailPointRatio, 1) }, { context, textureAnimation }).attach();
  const lights = new ParticleLightsModule(particleSystem, { ...modules.lights, ratio: modules.lights.ratio * quality.lightRatio, maxLights: scaleParticleBudget(modules.lights.maxLights, quality.lightRatio, 1) }, { context, backend: options.rendererBackend }).attach();
  const customData = new ParticleCustomDataModule(particleSystem, modules.customData, { context }).attach(mainEmission);
  subEmitters.readCustomData = (slot, particleId, state) => {
    if (!customData.source.enabled) return null;
    const channels = {};
    for (const channel of customData.channels) channels[channel.name] = Array.from(state.optional.customVectors[channel.index].subarray(slot * 4, slot * 4 + 4));
    return { particleId, flags: customData.integerFlags[slot], channels };
  };
  const renderer = new ParticleRenderer2D(particleSystem, systemAsset.renderer, {
    backend: options.rendererBackend,
    textureAnimation,
    trailHook: options.trailHook ?? (() => trails.buildGeometry())
  });
  mainEmission.attach();
  return {
    system: particleSystem,
    mainEmission,
    shape,
    motion,
    visual,
    noiseFields,
    textureAnimation,
    collision,
    eventQueue,
    subEmitters,
    trails,
    lights,
    customData,
    renderer,
    dispose({ disposeSystem = true } = {}) {
      mainEmission.dispose();
      motion.dispose();
      visual.dispose();
      noiseFields.dispose();
      textureAnimation.dispose();
      collision?.dispose();
      subEmitters.dispose();
      if (!options.eventQueue) eventQueue.dispose();
      trails.dispose();
      lights.dispose();
      customData.dispose();
      renderer.dispose();
      detachShape?.();
      shape?.dispose();
      if (disposeSystem) particleSystem.dispose();
    }
  };
}

// packages/melon-runtime/src/particle/particle-preview-profiler.js
var ParticlePreviewError = class extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "ParticlePreviewError";
    this.code = code;
    this.details = details;
  }
};
var nowDefault = () => globalThis.performance?.now?.() ?? Date.now();
var finite3 = (value, fallback) => Number.isFinite(value) ? value : fallback;
var ParticlePreviewController = class {
  constructor(compiledEffect, systemId, emitterId, options = {}) {
    if (!compiledEffect?.asset || compiledEffect.disposed) throw new ParticlePreviewError("APS_PREVIEW_INVALID_EFFECT", "A live compiled ParticleEffect2D is required.");
    this.compiledEffect = compiledEffect;
    this.systemId = systemId;
    this.emitterId = emitterId;
    this.options = { ...options };
    this.now = options.now ?? nowDefault;
    this.frameStepSeconds = Math.max(1 / 1e3, options.frameStepSeconds ?? 1 / 60);
    this.playbackSpeed = Math.max(0, finite3(options.playbackSpeed, 1));
    this.loopRange = null;
    this.seed = options.seedController ?? new ParticlePreviewSeedController({ seed: options.seed ?? compiledEffect.asset.effect?.randomSeed ?? 1, locked: options.seedLocked !== false });
    this.camera = { x: 0, y: 0, zoom: 1 };
    this.background = { type: "checker", color: "#20242a", imageId: null };
    this.target = { backend: options.backend ?? "canvas2d", platform: options.platform ?? "web", quality: options.quality ?? "high" };
    this.gizmos = { shape: true, bounds: true, velocity: false, collisionNormals: false, forceFields: false, heatmap: false };
    this.roadmap = Object.freeze({ capture: ["gif", "video", "spritesheet"], status: "non-blocking-roadmap" });
    this.profile = { active: 0, spawned: 0, died: 0, cpuUpdateMs: 0, renderMs: 0, drawCalls: 0, memoryBytes: 0, overdrawPeak: 0, frames: 0 };
    this.errors = [];
    this.runtime = null;
    this.detach = [];
    this.rebuild();
  }
  _runtimeOptions() {
    return { ...this.options.runtimeOptions ?? {}, rendererBackend: this.target.backend, quality: this.target.quality, seedOptions: { ...this.options.seedOptions ?? {}, previewSeedController: this.seed } };
  }
  rebuild() {
    this._disposeRuntime();
    this.errors.length = 0;
    Object.assign(this.profile, { active: 0, spawned: 0, died: 0, cpuUpdateMs: 0, renderMs: 0, drawCalls: 0, memoryBytes: 0, overdrawPeak: 0, frames: 0 });
    try {
      this.runtime = createParticleSystem2DFromEmitter(this.compiledEffect, this.systemId, this.emitterId, this._runtimeOptions());
      this.runtime.system.stop("clear");
      this.detach.push(this.runtime.system.on("emit", () => {
        this.profile.spawned += 1;
      }));
      this.detach.push(this.runtime.system.on("particle-death", () => {
        this.profile.died += 1;
      }));
    } catch (error) {
      this.errors.push({ code: error.code ?? "APS_PREVIEW_RUNTIME_ERROR", message: error.message, severity: "error" });
      throw error;
    }
    return this;
  }
  play() {
    const system = this.runtime.system;
    system.paused ? system.resume() : system.play({ restart: system.completed });
    return this;
  }
  pause() {
    this.runtime.system.pause();
    return this;
  }
  stop() {
    this.runtime.system.stop("clear");
    return this;
  }
  restart() {
    this.runtime.system.restart();
    return this;
  }
  frameStep() {
    const wasPlaying = this.runtime.system.playing;
    if (!wasPlaying) this.runtime.system.play();
    this.step(this.frameStepSeconds, { force: true });
    this.runtime.system.pause();
    return this.snapshot();
  }
  scrub(seconds) {
    this.runtime.system.simulate(Math.max(0, finite3(seconds, 0)), { restart: true });
    return this.snapshot();
  }
  setLoopRange(start, end) {
    if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start) throw new ParticlePreviewError("APS_PREVIEW_INVALID_LOOP", "Loop range requires finite start < end.");
    this.loopRange = { start, end };
    return this;
  }
  clearLoopRange() {
    this.loopRange = null;
    return this;
  }
  setPlaybackSpeed(speed) {
    if (!Number.isFinite(speed) || speed < 0) throw new ParticlePreviewError("APS_PREVIEW_INVALID_SPEED", "Playback speed must be finite and non-negative.");
    this.playbackSpeed = speed;
    return this;
  }
  setTimeMode(mode) {
    if (!["scaled", "unscaled"].includes(mode)) throw new ParticlePreviewError("APS_PREVIEW_INVALID_TIME_MODE", `Unknown time mode '${mode}'.`);
    this.runtime.system.timeMode = mode;
    return this;
  }
  lockSeed(seed = this.seed.seed) {
    this.seed.lock(seed);
    return this.rebuild();
  }
  unlockSeed() {
    this.seed.unlock();
    return this;
  }
  randomizeSeed(entropy) {
    if (typeof entropy === "undefined") throw new ParticlePreviewError("APS_PREVIEW_ENTROPY_REQUIRED", "Seed randomize requires explicit entropy.");
    this.seed.randomize(entropy);
    return this.rebuild();
  }
  setTarget(target = {}) {
    Object.assign(this.target, target);
    return this.rebuild();
  }
  setCamera(camera = {}) {
    this.camera.x = finite3(camera.x, this.camera.x);
    this.camera.y = finite3(camera.y, this.camera.y);
    this.camera.zoom = Math.max(0.01, finite3(camera.zoom, this.camera.zoom));
    return this;
  }
  panCamera(x, y) {
    this.camera.x += finite3(x, 0);
    this.camera.y += finite3(y, 0);
    return this;
  }
  zoomCamera(factor) {
    this.camera.zoom = Math.max(0.01, Math.min(64, this.camera.zoom * finite3(factor, 1)));
    return this;
  }
  setBackground(background = {}) {
    Object.assign(this.background, background);
    return this;
  }
  setGizmo(name, enabled) {
    if (!(name in this.gizmos)) throw new ParticlePreviewError("APS_PREVIEW_INVALID_GIZMO", `Unknown gizmo '${name}'.`);
    this.gizmos[name] = enabled === true;
    return this;
  }
  step(deltaSeconds, context = {}) {
    const system = this.runtime.system;
    if (!system.playing && context.force !== true) return this.snapshot();
    const start = this.now();
    const delta = Math.max(0, finite3(deltaSeconds, 0)) * this.playbackSpeed;
    const transform = context.transform ?? this.options.movingEmitter?.(system.time + delta) ?? void 0;
    system.step(delta, { timeScale: context.timeScale, visible: context.visible, transform });
    if (this.loopRange && system.time + Number.EPSILON >= this.loopRange.end) {
      const playing = system.playing;
      this.scrub(this.loopRange.start);
      if (playing) system.resume();
    }
    this.profile.cpuUpdateMs = this.now() - start;
    this.profile.frames += 1;
    this._refreshProfile();
    return this.snapshot();
  }
  render(renderBatch = this.options.renderBatch) {
    const start = this.now();
    const batch = this.runtime.renderer.buildBatch();
    const trailBatch = this.runtime.trails.source.enabled && batch?.primitive !== "trail-strip-batch" ? this.runtime.trails.buildGeometry() : null;
    if (trailBatch?.count && renderBatch) renderBatch(trailBatch, this.viewState());
    if (batch?.count && renderBatch) renderBatch(batch, this.viewState());
    this.profile.renderMs = this.now() - start;
    this.profile.drawCalls = (batch?.drawCallGroups ?? 0) + (trailBatch?.drawCallGroups ?? 0);
    this.profile.overdrawPeak = this.approximateOverdraw(batch).peak;
    this._refreshProfile();
    return batch;
  }
  _refreshProfile() {
    const state = this.runtime.system.state;
    this.profile.active = state.activeCount;
    this.profile.memoryBytes = state.memoryStats().totalBytes;
  }
  approximateOverdraw(batch = this.runtime.renderer.batch, options = {}) {
    const width = Math.max(1, Math.floor(options.width ?? 32));
    const height = Math.max(1, Math.floor(options.height ?? 32));
    const cells = new Uint16Array(width * height);
    if (!batch?.count) return { width, height, cells, peak: 0 };
    const bounds = batch.bounds;
    const spanX = Math.max(1e-6, bounds.maxX - bounds.minX);
    const spanY = Math.max(1e-6, bounds.maxY - bounds.minY);
    let peak = 0;
    const stride = batch.primitive === "trail-strip-batch" ? 3 : 6;
    const positions = batch.primitive === "trail-strip-batch" ? batch.vertices : batch.transforms;
    for (let index = 0; index < batch.count; index += 1) {
      const offset = index * stride;
      const x = Math.max(0, Math.min(width - 1, Math.floor((positions[offset] - bounds.minX) / spanX * width)));
      const y = Math.max(0, Math.min(height - 1, Math.floor((positions[offset + 1] - bounds.minY) / spanY * height)));
      const value = ++cells[y * width + x];
      if (value > peak) peak = value;
    }
    return { width, height, cells, peak };
  }
  autoCalculateBounds(options = {}) {
    const runtime = createParticleSystem2DFromEmitter(this.compiledEffect, this.systemId, this.emitterId, this._runtimeOptions());
    const duration = Math.max(0, options.duration ?? runtime.system.duration);
    const step = Math.max(1 / 240, options.step ?? 1 / 60);
    const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    runtime.system.restart();
    for (let time = 0; time <= duration + Number.EPSILON; time += step) {
      runtime.system.step(step, { transform: this.options.movingEmitter?.(time) });
      const current = runtime.renderer.visibilityBounds();
      bounds.minX = Math.min(bounds.minX, current.minX);
      bounds.minY = Math.min(bounds.minY, current.minY);
      bounds.maxX = Math.max(bounds.maxX, current.maxX);
      bounds.maxY = Math.max(bounds.maxY, current.maxY);
    }
    runtime.dispose();
    if (!Number.isFinite(bounds.minX)) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    return bounds;
  }
  simulationSpaceProbe(transform = { x: 10, y: 20, rotation: 30, scaleX: 1, scaleY: 1 }) {
    const system = this.runtime.system;
    const output = {};
    for (const space of ["local", "world", "custom"]) {
      if (space === "custom") system.updateCustomTransform(transform);
      else system.updateTransform(transform);
      output[space] = Array.from(system.transformPoint(1, 0, space));
    }
    return output;
  }
  gizmoSnapshot() {
    const batch = this.runtime.renderer.batch ?? this.runtime.renderer.buildBatch();
    const state = this.runtime.system.state;
    const velocity = [];
    if (this.gizmos.velocity) for (let slot = state.firstActiveSlot(); slot !== -1; slot = state.nextActiveSlot(slot)) velocity.push({ particleId: state.particleIdForSlot(slot), x: state.current.positionX[slot], y: state.current.positionY[slot], vx: state.current.velocityX[slot], vy: state.current.velocityY[slot] });
    return { enabled: { ...this.gizmos }, bounds: batch?.bounds ?? null, shape: this.runtime.shape ? particleShapeGizmoData(this.runtime.shape) : null, velocity, collisionNormals: this.runtime.collision?.lastBatch?.events ?? [], forceFields: this.runtime.noiseFields?.registry?.query?.(null, 4294967295, this.runtime.noiseFields.fields.maximum) ?? [] };
  }
  diagnostics(capabilities) {
    const warnings = [...this.runtime.renderer.warnings ?? [], ...this.runtime.lights.warnings ?? []];
    const unsupported = capabilities?.simulation === "unsupported" ? [{ code: "APS_CAP_UNSUPPORTED", feature: "particle2D.simulation", severity: "error" }] : [];
    return { errors: [...this.errors, ...unsupported], warnings, target: { ...this.target } };
  }
  viewState() {
    return { camera: { ...this.camera }, background: { ...this.background }, target: { ...this.target }, gizmos: this.gizmoSnapshot() };
  }
  snapshot() {
    this._refreshProfile();
    return { time: this.runtime.system.time, playbackState: this.runtime.system.playbackState, loopRange: this.loopRange && { ...this.loopRange }, seed: this.seed.saveState(), profile: { ...this.profile }, target: { ...this.target } };
  }
  requestCapture(kind) {
    return Promise.resolve({ accepted: false, kind, status: this.roadmap.status });
  }
  _disposeRuntime() {
    for (const detach of this.detach.splice(0)) detach?.();
    this.runtime?.dispose();
    this.runtime = null;
  }
  dispose() {
    this._disposeRuntime();
    this.errors.length = 0;
  }
};
function createParticlePreviewController(compiledEffect, systemId, emitterId, options) {
  return new ParticlePreviewController(compiledEffect, systemId, emitterId, options);
}

// packages/melon-runtime/src/particle/particle-migration.js
var LEGACY_PARTICLE_MIGRATION_VERSION = 1;
var LEGACY_PARTICLE_DEPRECATION_POLICY = Object.freeze({
  status: "supported",
  defaultPath: "legacy",
  migration: "explicit-opt-in",
  targets: Object.freeze(["17.4.0", "20.0.0"]),
  removal: "no-removal-in-release-1"
});
var ParticleMigrationError = class extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "ParticleMigrationError";
    this.code = code;
    this.details = details;
  }
};
var clone = (value) => JSON.parse(JSON.stringify(value));
var finite4 = (value, fallback) => Number.isFinite(value) ? value : fallback;
var idPart = (value) => String(value ?? "legacy").replace(/[^A-Za-z0-9._:-]+/g, "-").replace(/^[^A-Za-z]+/, "") || "legacy";
function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
function checksum(value) {
  const text = stableJson(value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}
function detectParticleAssetKind(asset2) {
  if (!asset2 || typeof asset2 !== "object" || Array.isArray(asset2)) return "unknown";
  if (asset2.assetType === "particle-effect-2d") return "advanced";
  if (String(asset2.extend ?? "").includes("ParticleEmitter") || ["image_selected", "emitMethod", "totalParticles", "lifeTime"].some((key) => key in asset2)) return "legacy-flat";
  return "unknown";
}
function legacyV0ToV1(source, options) {
  const name = idPart(source.name ?? "legacy-particle");
  const lifeMs = finite4(source.lifeTime, finite4(source.maxLife, finite4(source.minLife, 1e3)));
  const lifetime = Math.max(1e-3, lifeMs / 1e3);
  const startScale = finite4(source.startScale, finite4(source.maxStartScale, finite4(source.minStartScale, 1)));
  const endScale = finite4(source.endScale, finite4(source.maxEndScale, finite4(source.minEndScale, 0)));
  const speed = finite4(source.speed, 0);
  const variation = Math.max(0, finite4(source.speedVariation, 0));
  const angle = finite4(source.angle, 0);
  const radians = angle * Math.PI / 180;
  const total = Math.max(1, Math.floor(finite4(source.totalParticles, 50)));
  const maxParticles = Math.max(total, Math.floor(finite4(source.maxParticles, total)));
  const method = source.emitMethod ?? "";
  const isBurst = method === "burst";
  const isStream = method === "stream_duration" || method === "stream_infinity";
  const finiteStream = method === "stream_duration";
  const textureId = source.image_selected ? `texture.${name}` : null;
  const gradientId = `gradient.${name}.legacy-alpha`;
  const scaleCurveId = `curve.${name}.legacy-scale`;
  const speedValue = variation > 0 ? { type: "scalar", mode: "randomBetweenConstants", min: (speed - variation) * 60, max: (speed + variation) * 60 } : speed * 60;
  const startRenderedScale = startScale * startScale;
  const endRatio = startScale === 0 ? 0 : endScale / startScale;
  const migrated = {
    assetType: "particle-effect-2d",
    schemaVersion: 1,
    effect: { id: `effect.${name}`, name: source.name ?? "Migrated Legacy Particle", enabled: true, duration: finiteStream ? Math.max(1e-3, finite4(source.duration, 5e3) / 1e3) : lifetime, looping: method === "stream_infinity", autoRandomSeed: false, randomSeed: options.seed ?? 1, simulationSpace: source.floating ? "world" : "local" },
    systems: [{ id: `system.${name}`, enabled: true, renderer: { enabled: true, type: "sprite", textureId, atlasRegionId: null, blendMode: source.blendMode && source.blendMode !== "normal" ? source.blendMode : source.textureAdditive ? "additive" : "normal", z: finite4(source.z, 0), bounds: { mode: "auto", padding: 0 } }, emitters: [{ id: `emitter.${name}`, enabled: true, modules: {
      main: { enabled: true, maxParticles, duration: finiteStream ? Math.max(1e-3, finite4(source.duration, 5e3) / 1e3) : lifetime, looping: method === "stream_infinity", startLifetime: lifetime, startSpeed: speedValue, startSize: startRenderedScale, startRotation: { type: "angle", mode: "randomBetweenConstants", min: finite4(source.minRotation, 0), max: finite4(source.maxRotation, finite4(source.minRotation, 0)) }, simulationSpace: source.floating ? "world" : "local", cullingMode: "simulate", overflowPolicy: "reject" },
      emission: { enabled: isBurst || isStream, rateOverTime: isStream ? total / lifetime : 0, bursts: isBurst ? [{ id: `burst.${name}.legacy`, time: 0, count: total, cycles: 1, probability: 1 }] : [], maxSpawnPerFrame: Math.max(total, 1), catchUpPolicy: "carry" },
      shape: { enabled: true, type: "rectangle", width: Math.max(0, finite4(source.width, 32)), height: Math.max(0, finite4(source.height, 32)), emitFrom: "area", direction: "fixed", fixedDirection: { x: Math.cos(radians), y: Math.sin(radians) }, legacyAngleVariation: finite4(source.angleVariation, 0) },
      velocityOverLifetime: { enabled: false },
      forceOverLifetime: { enabled: finite4(source.wind, 0) !== 0 || finite4(source.gravity, 0) !== 0, x: finite4(source.wind, 0) * 3600, y: finite4(source.gravity, 0) * 3600, space: "world", mass: 1 },
      colorOverLifetime: { enabled: true, gradientId },
      sizeOverLifetime: { enabled: true, curveId: scaleCurveId },
      rotationOverLifetime: { enabled: source.followTrajectory === true, orientation: source.followTrajectory ? "velocity" : "free", value: 0 }
    } }] }],
    libraries: { curves: [{ id: scaleCurveId, interpolation: "linear", multiplier: 1, keys: [{ time: 0, value: 1 }, { time: 1, value: endRatio }] }], gradients: [{ id: gradientId, colorSpace: "srgb", colorKeys: [{ time: 0, color: [1, 1, 1] }, { time: 1, color: [1, 1, 1] }], alphaKeys: [{ time: 0, alpha: 1 }, { time: 1, alpha: 0 }] }] },
    dependencies: { textures: textureId ? [{ id: textureId, kind: "texture", assetId: source.image_selected, required: true }] : [], atlasRegions: [], objects: [], shaders: [], collisionLayers: [], subEffects: [] },
    overrides: { platforms: [], qualities: [] },
    metadata: { tags: ["migrated", "legacy-particle"], author: "", description: "Opt-in migration from legacy ParticleEmitter.", migration: { version: 1, mode: options.compatibilityMode ?? "legacy-approximate", sourceChecksum: checksum(source) }, legacySource: clone(source) }
  };
  const normalized = normalizeParticleEffect2D(migrated);
  const validation = validateParticleEffect2D(normalized);
  if (!validation.valid) throw new ParticleMigrationError("APS_MIGRATION_INVALID_OUTPUT", "Legacy migration produced an invalid ParticleEffect2D.", { errors: validation.errors });
  return normalized;
}
var LEGACY_PARTICLE_MIGRATIONS = Object.freeze([{ from: 0, to: 1, migrate: legacyV0ToV1 }]);
function migrateLegacyParticleEffect(asset2, options = {}) {
  const kind = detectParticleAssetKind(asset2);
  if (kind === "advanced") return clone(asset2);
  if (kind !== "legacy-flat") throw new ParticleMigrationError("APS_MIGRATION_UNKNOWN_SOURCE", "Asset is neither legacy ParticleEmitter data nor ParticleEffect2D.");
  return LEGACY_PARTICLE_MIGRATIONS[0].migrate(clone(asset2), options);
}
function previewLegacyParticleMigration(asset2, options = {}) {
  const migrated = migrateLegacyParticleEffect(asset2, options);
  const source = clone(asset2);
  const changes = [
    { from: "lifeTime/minLife/maxLife", to: "main.startLifetime", value: migrated.systems[0].emitters[0].modules.main.startLifetime },
    { from: "speed/speedVariation/angle", to: "main.startSpeed + shape.fixedDirection", value: migrated.systems[0].emitters[0].modules.main.startSpeed },
    { from: "startScale/endScale aliases", to: "main.startSize + size curve", value: migrated.systems[0].emitters[0].modules.main.startSize },
    { from: "legacy alpha fade", to: "color gradient", value: migrated.libraries.gradients[0].id },
    { from: "emitMethod/totalParticles/lifeTime", to: "emission rate/burst", value: migrated.systems[0].emitters[0].modules.emission },
    { from: "image_selected/textureAdditive/blendMode", to: "dependency + renderer", value: migrated.systems[0].renderer }
  ];
  const warnings = [{ code: "APS_MIGRATION_APPROXIMATE_SCHEDULING", severity: "warning", message: "Legacy frequency/maxParticles scheduling and unseeded randomness are preserved in backup but only approximated by the advanced deterministic scheduler." }];
  if (finite4(source.angleVariation, 0) !== 0) warnings.push({ code: "APS_MIGRATION_APPROXIMATE_ANGLE", severity: "warning", message: "Legacy symmetric launch-angle variation is retained as migration metadata and may differ visually." });
  return Object.freeze({ source, migrated, changes: Object.freeze(changes), warnings: Object.freeze(warnings), exact: false, requiresExplicitSave: true });
}
function createLegacyParticleMigrationBackup(asset2, migrated = migrateLegacyParticleEffect(asset2)) {
  const original = clone(asset2);
  const output = clone(migrated);
  return Object.freeze({ format: "particle-effect-2d-migration-backup", version: 1, original, migrated: output, originalChecksum: checksum(original), migratedChecksum: checksum(output) });
}
function recoverLegacyParticleMigrationBackup(backup) {
  if (backup?.format !== "particle-effect-2d-migration-backup" || backup.version !== 1 || checksum(backup.original) !== backup.originalChecksum || checksum(backup.migrated) !== backup.migratedChecksum) throw new ParticleMigrationError("APS_MIGRATION_BACKUP_INVALID", "Migration backup is invalid or modified.");
  return clone(backup.original);
}

// packages/melon-runtime/src/particle/particle-presets.js
var thumbnail = (id) => `/static/particle-preset-thumbnails.svg#${id}`;
var cloneJson2 = (value) => JSON.parse(JSON.stringify(value));
var deepFreeze3 = (value) => {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze3(child);
  }
  return value;
};
var gradient = (id, colors, alpha = [[0, 1], [1, 0]]) => ({ id, colorSpace: "srgb", colorKeys: colors.map(([time, color]) => ({ time, color })), alphaKeys: alpha.map(([time, value]) => ({ time, alpha: value })) });
var curve = (id, values) => ({ id, interpolation: "linear", multiplier: 1, keys: values.map(([time, value]) => ({ time, value })) });
function asset(id, modules, libraries = {}, renderer = {}) {
  return normalizeParticleEffect2D({ assetType: "particle-effect-2d", schemaVersion: 1, effect: { id: `effect.preset-${id}`, name: `Particle preset: ${id}`, randomSeed: 1 }, systems: [{ id: `system.preset-${id}`, renderer: { type: "billboard", blendMode: "normal", ...renderer }, emitters: [{ id: `emitter.preset-${id}`, modules }] }], libraries: { curves: libraries.curves ?? [], gradients: libraries.gradients ?? [] }, metadata: { tags: ["preset", id], author: "Melon Editor", description: `Built-in ${id} ParticleEffect2D preset.` } });
}
var definitions = [
  ["basic", "Basic", { main: { startLifetime: 1, startSpeed: 20, maxParticles: 128 }, emission: { rateOverTime: 16 }, shape: { type: "circle", radius: 4 } }],
  ["fire", "Fire", { main: { startLifetime: 1.2, startSpeed: 34, startSize: 12, maxParticles: 400 }, emission: { rateOverTime: 80 }, shape: { type: "circle", radius: 12 }, noise: { enabled: true, strength: 8, frequency: 0.8, octaves: 2 }, colorOverLifetime: { enabled: true, gradientId: "gradient.preset-fire" }, sizeOverLifetime: { enabled: true, curveId: "curve.preset-fire-size" } }, { gradients: [gradient("gradient.preset-fire", [[0, [1, 1, 0.8]], [0.45, [1, 0.25, 0.02]], [1, [0.12, 0.01, 0]]])], curves: [curve("curve.preset-fire-size", [[0, 0.45], [0.35, 1], [1, 0]])] }, { blendMode: "additive" }],
  ["smoke", "Smoke", { main: { startLifetime: 3, startSpeed: 12, startSize: 18, maxParticles: 300 }, emission: { rateOverTime: 28 }, shape: { type: "circle", radius: 10 }, noise: { enabled: true, strength: 4, frequency: 0.35, octaves: 3 }, colorOverLifetime: { enabled: true, gradientId: "gradient.preset-smoke" }, sizeOverLifetime: { enabled: true, curveId: "curve.preset-smoke-size" } }, { gradients: [gradient("gradient.preset-smoke", [[0, [0.48, 0.48, 0.5]], [1, [0.15, 0.15, 0.17]]], [[0, 0], [0.15, 0.65], [1, 0]])], curves: [curve("curve.preset-smoke-size", [[0, 0.35], [1, 1.8]])] }],
  ["rain", "Rain", { main: { startLifetime: 1.8, startSpeed: 420, startSizeX: 2, startSizeY: 14, maxParticles: 1e3, simulationSpace: "world" }, emission: { rateOverTime: 180 }, shape: { type: "rectangle", width: 640, height: 1, direction: "fixed", fixedDirection: { x: 0, y: 1 } }, colorOverLifetime: { enabled: true, gradientId: "gradient.preset-rain" } }, { gradients: [gradient("gradient.preset-rain", [[0, [0.55, 0.75, 1]], [1, [0.75, 0.9, 1]]], [[0, 0.8], [1, 0.15]])] }],
  ["snow", "Snow", { main: { startLifetime: 5, startSpeed: 42, startSize: 5, maxParticles: 800, simulationSpace: "world" }, emission: { rateOverTime: 65 }, shape: { type: "rectangle", width: 640, height: 1, direction: "fixed", fixedDirection: { x: 0, y: 1 } }, noise: { enabled: true, strengthX: 18, strengthY: 3, frequency: 0.25, octaves: 2 }, colorOverLifetime: { enabled: true, gradientId: "gradient.preset-snow" } }, { gradients: [gradient("gradient.preset-snow", [[0, [1, 1, 1]], [1, [0.75, 0.88, 1]]], [[0, 0], [0.1, 1], [1, 0]])] }],
  ["sparks", "Sparks", { main: { startLifetime: 0.8, startSpeed: { type: "scalar", mode: "randomBetweenConstants", min: 120, max: 260 }, startSize: 3, maxParticles: 256, looping: false }, emission: { rateOverTime: 0, bursts: [{ id: "burst.preset-sparks", time: 0, count: 64 }] }, shape: { type: "circle", radius: 4, direction: "radial-out" }, forceOverLifetime: { enabled: true, y: 300, space: "world" }, colorOverLifetime: { enabled: true, gradientId: "gradient.preset-sparks" } }, { gradients: [gradient("gradient.preset-sparks", [[0, [1, 1, 0.7]], [1, [1, 0.15, 0]]])] }, { blendMode: "additive" }],
  ["explosion", "Explosion", { main: { startLifetime: 0.65, startSpeed: { type: "scalar", mode: "randomBetweenConstants", min: 140, max: 320 }, startSize: 14, maxParticles: 384, duration: 1, looping: false }, emission: { rateOverTime: 0, bursts: [{ id: "burst.preset-explosion", time: 0, count: 128 }] }, shape: { type: "circle", radius: 10, direction: "radial-out" }, colorOverLifetime: { enabled: true, gradientId: "gradient.preset-explosion" }, sizeOverLifetime: { enabled: true, curveId: "curve.preset-explosion-size" } }, { gradients: [gradient("gradient.preset-explosion", [[0, [1, 1, 1]], [0.25, [1, 0.45, 0.02]], [1, [0.1, 0.01, 0]]])], curves: [curve("curve.preset-explosion-size", [[0, 0.2], [0.15, 1.3], [1, 0]])] }, { blendMode: "additive" }],
  ["magic", "Magic", { main: { startLifetime: 2, startSpeed: 28, startSize: 7, maxParticles: 500 }, emission: { rateOverTime: 72 }, shape: { type: "ring", radius: 28, innerRadius: 24, direction: "tangent" }, noise: { enabled: true, mode: "curl", strength: 12, frequency: 0.5, octaves: 3 }, colorOverLifetime: { enabled: true, gradientId: "gradient.preset-magic" }, rotationOverLifetime: { enabled: true, angularVelocity: 120 } }, { gradients: [gradient("gradient.preset-magic", [[0, [0.2, 0.8, 1]], [0.5, [0.75, 0.2, 1]], [1, [1, 0.5, 0.9]]])] }, { blendMode: "additive" }],
  ["trail", "Trail", { main: { startLifetime: 1.2, startSpeed: 80, startSize: 4, maxParticles: 180 }, emission: { rateOverTime: 22 }, shape: { type: "point", direction: "fixed", fixedDirection: { x: 1, y: 0 } }, trails: { enabled: true, lifetime: 0.6, maxPoints: 24, minimumVertexDistance: 2, width: 5, ribbonGroup: "preset-trail" }, colorOverLifetime: { enabled: true, gradientId: "gradient.preset-trail" } }, { gradients: [gradient("gradient.preset-trail", [[0, [0.1, 1, 0.8]], [1, [0.1, 0.3, 1]]])] }],
  ["collision", "Collision", { main: { startLifetime: 2, startSpeed: 180, startSize: 6, maxParticles: 128, looping: false }, emission: { rateOverTime: 0, bursts: [{ id: "burst.preset-collision", time: 0, count: 32 }] }, shape: { type: "circle", radius: 8, direction: "radial-out" }, collision: { enabled: true, mode: "world-bounds", simulation: "swept", authority: "visual", bounce: 0.7, friction: 0.1, frameBudget: 1024 }, colorOverLifetime: { enabled: true, gradientId: "gradient.preset-collision" } }, { gradients: [gradient("gradient.preset-collision", [[0, [1, 0.85, 0.2]], [1, [1, 0.1, 0.05]]])] }]
];
var PARTICLE_EFFECT_2D_PRESET_CATALOG = Object.freeze({
  format: "particle-effect-2d-presets",
  version: 1,
  license: Object.freeze({ spdx: "CC0-1.0", attribution: "Melon Editor built-in presets", redistribution: true }),
  presets: Object.freeze(definitions.map(([id, name, modules, libraries, renderer]) => deepFreeze3({ id, name, thumbnail: thumbnail(id), dependencies: [], asset: asset(id, modules, libraries, renderer) })))
});
function getParticleEffect2DPreset(id) {
  const preset = PARTICLE_EFFECT_2D_PRESET_CATALOG.presets.find((item) => item.id === id);
  if (!preset) throw Object.assign(new Error(`Unknown ParticleEffect2D preset '${id}'.`), { code: "APS_PRESET_UNKNOWN" });
  return cloneJson2(preset.asset);
}

// packages/melon-runtime/src/particle/particle-release.js
var PARTICLE_RELEASE_MANIFEST = Object.freeze({
  release: "advanced-particle-system-2d-cpu-v1",
  status: "accepted",
  targets: Object.freeze(["melonjs-17.4.0", "melonjs-20.0.0"]),
  backends: Object.freeze(["canvas2d", "webgl"]),
  highSeverityBlockers: Object.freeze([]),
  knownLimitations: Object.freeze(["gpu-simulation-roadmap", "2d-only", "visual-only-collision", "no-arbitrary-particle-shader-attributes", "no-pixel-identical-cross-device-contract"]),
  approval: Object.freeze({ knownLimitations: "accepted-for-cpu-release-1", basis: "explicit repository completion request", date: "2026-08-28" })
});
function resolveParticleReleasePath(asset2, options = {}) {
  const kind = detectParticleAssetKind(asset2);
  const advancedEnabled = options.advancedEnabled !== false;
  if (kind === "legacy-flat") return Object.freeze({ path: "legacy", enabled: true, migrated: false, diagnostic: null });
  if (kind === "advanced" && advancedEnabled) return Object.freeze({ path: "advanced", enabled: true, migrated: false, diagnostic: null });
  if (kind === "advanced") return Object.freeze({ path: "blocked", enabled: false, migrated: false, diagnostic: Object.freeze({ code: "APS_RELEASE_DISABLED", severity: "error", message: "Advanced ParticleSystem2D is disabled by the release rollback switch; source asset remains unchanged." }) });
  return Object.freeze({ path: "unsupported", enabled: false, migrated: false, diagnostic: Object.freeze({ code: "APS_SCHEMA_INVALID_TYPE", severity: "error", message: "Unknown particle asset format." }) });
}
function createParticleRollbackPlan() {
  return Object.freeze({
    strategy: "artifact-and-feature-switch",
    destructive: false,
    preserve: Object.freeze(["ParticleEffect2D sources embedded in object .me files", "legacy particle objects", "migration backup envelopes"]),
    restoreArtifacts: Object.freeze(["lib/17.4.0/melon-runtime.module.js", "lib/19/melon-runtime.module.js", "lib/20/melon-runtime.module.js"]),
    steps: Object.freeze(["disable advanced particle object entry", "restore previous signed runtime artifacts and source maps", "leave object-embedded sources untouched", "run runtime suite and legacy golden baseline", "re-enable only after blocker resolution"]),
    verification: Object.freeze(["legacy-particle-baseline.test.js", "particle-release-readiness.test.js", "generator-integration.test.js"])
  });
}

// packages/melon-runtime/src/particle/particle-gradient-texture.js
var clamp013 = (value) => Math.max(0, Math.min(1, value));
var srgb = (value) => value <= 31308e-7 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055;
function rasterizeParticleGradient(compiledGradient, settings = {}, size = 128) {
  const width = Math.max(2, Math.min(512, Math.floor(size) || 128));
  const data = new Uint8ClampedArray(width * width * 4);
  const angle = (settings.angle ?? 0) * Math.PI / 180;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const span = Math.abs(dx) + Math.abs(dy);
  const color = new Float64Array(4);
  for (let y = 0; y < width; y++) for (let x = 0; x < width; x++) {
    const u = x / (width - 1);
    const v = y / (width - 1);
    const time = settings.mode === "radial" ? Math.hypot(u - 0.5, v - 0.5) * 2 : 0.5 + ((u - 0.5) * dx + (v - 0.5) * dy) / span;
    evaluateCompiledGradient(compiledGradient, clamp013(time), color);
    const offset = (y * width + x) * 4;
    for (let channel = 0; channel < 3; channel++) data[offset + channel] = Math.round(clamp013(srgb(color[channel])) * 255);
    data[offset + 3] = Math.round(clamp013(color[3]) * 255);
  }
  return { width, height: width, data };
}
function createParticleGradientTexture(compiledGradient, settings, createCanvas) {
  const pixels = rasterizeParticleGradient(compiledGradient, settings);
  const canvas = createCanvas?.(pixels.width, pixels.height) ?? globalThis.document?.createElement?.("canvas") ?? (typeof OffscreenCanvas === "function" ? new OffscreenCanvas(pixels.width, pixels.height) : null);
  if (!canvas) throw new Error("Particle gradient textures require a Canvas 2D surface.");
  canvas.width = pixels.width;
  canvas.height = pixels.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Particle gradient textures require a Canvas 2D context.");
  const image = context.createImageData(pixels.width, pixels.height);
  image.data.set(pixels.data);
  context.putImageData(image, 0, 0);
  return canvas;
}

// packages/melon-runtime/src/adapters/particle-trail-texture.js
var INDEXED_CORNERS = [0, 1, 2, 3];
var TRIANGLE_CORNERS = [0, 1, 2, 2, 1, 3];
var CANVAS_TRIANGLES = [[0, 1, 2], [2, 1, 3]];
var ParticleTrailTextureRenderer = class {
  constructor() {
    this.edges = new Float64Array(0);
    this.distances = new Float64Array(0);
    this.quad = new Float64Array(8);
    this.point = { x: 0, y: 0, z: 0 };
  }
  prepare(batch, range) {
    const count = range.count;
    if (this.distances.length < count) {
      this.distances = new Float64Array(count);
      this.edges = new Float64Array(count * 4);
    }
    const { vertices } = batch;
    this.distances[0] = 0;
    for (let i = 0; i < count; i++) {
      const offset = (range.start + i) * 3;
      const x = vertices[offset];
      const y = vertices[offset + 1];
      if (i) this.distances[i] = this.distances[i - 1] + Math.hypot(x - vertices[offset - 3], y - vertices[offset - 2]);
      let previous = i - 1;
      let next = i + 1;
      while (previous >= 0 && Math.hypot(x - vertices[(range.start + previous) * 3], y - vertices[(range.start + previous) * 3 + 1]) < 1e-6) previous--;
      while (next < count && Math.hypot(x - vertices[(range.start + next) * 3], y - vertices[(range.start + next) * 3 + 1]) < 1e-6) next++;
      let ax = previous >= 0 ? x - vertices[(range.start + previous) * 3] : next < count ? vertices[(range.start + next) * 3] - x : 1;
      let ay = previous >= 0 ? y - vertices[(range.start + previous) * 3 + 1] : next < count ? vertices[(range.start + next) * 3 + 1] - y : 0;
      let bx = next < count ? vertices[(range.start + next) * 3] - x : ax;
      let by = next < count ? vertices[(range.start + next) * 3 + 1] - y : ay;
      const al = Math.hypot(ax, ay) || 1;
      const bl = Math.hypot(bx, by) || 1;
      ax /= al;
      ay /= al;
      bx /= bl;
      by /= bl;
      let nx = -(ay + by);
      let ny = ax + bx;
      const length = Math.hypot(nx, ny);
      if (length < 1e-5) {
        nx = -by;
        ny = bx;
      } else {
        nx /= length;
        ny /= length;
      }
      const scale = Math.max(0, vertices[offset + 2]) * 0.5 / Math.max(0.5, Math.abs(nx * -by + ny * bx));
      this.edges[i * 4] = x + nx * scale;
      this.edges[i * 4 + 1] = y + ny * scale;
      this.edges[i * 4 + 2] = x - nx * scale;
      this.edges[i * 4 + 3] = y - ny * scale;
    }
    return this.distances[count - 1];
  }
  corners(index, from, to) {
    const a = index * 4;
    const b = a + 4;
    for (let c = 0; c < 4; c++) {
      this.quad[c] = this.edges[a + c] + (this.edges[b + c] - this.edges[a + c]) * to;
      this.quad[4 + c] = this.edges[a + c] + (this.edges[b + c] - this.edges[a + c]) * from;
    }
    return this.quad;
  }
  canDraw(renderer) {
    if (renderer.gl || renderer.type === "WebGPU") {
      const batcher = renderer.batchers?.get?.("quad") ?? renderer.compositors?.get?.("quad");
      return Boolean(batcher?.addQuad && batcher.vertexData?.bufferF32 && renderer.cache?.get);
    }
    const context = renderer.getContext?.() ?? renderer.context;
    return Boolean(context?.clip && context?.transform && renderer.drawImage);
  }
  drawQuad(renderer, resource, quad, v0, v1, headTint, tailTint) {
    if (renderer.gl || renderer.type === "WebGPU") {
      if (renderer.setBatcher) renderer.setBatcher("quad");
      else renderer.setCompositor("quad");
      const batcher = renderer.currentBatcher ?? renderer.currentCompositor;
      const texture = renderer.cache.get(resource.image);
      const sy = resource.sy + resource.sh * v0;
      const sh = resource.sh * (v1 - v0);
      const modern = Boolean(renderer.setBatcher);
      const width = resource.image.width;
      const height = resource.image.height;
      batcher.addQuad(texture, 0, 0, 1, 1, resource.sx / width, sy / height, (resource.sx + resource.sw) / width, (sy + sh) / height, headTint);
      const data = batcher.vertexData;
      const count = modern ? 4 : 6;
      const order = modern ? INDEXED_CORNERS : TRIANGLE_CORNERS;
      for (let i = 0; i < count; i++) {
        const corner = order[i];
        const offset = (data.vertexCount - count + i) * data.vertexSize;
        this.point.x = quad[corner * 2];
        this.point.y = quad[corner * 2 + 1];
        this.point.z = renderer.currentDepth ?? 0;
        (renderer.currentTransform ?? batcher.viewMatrix)?.apply(this.point);
        data.bufferF32[offset] = this.point.x;
        data.bufferF32[offset + 1] = this.point.y;
        if (modern) data.bufferF32[offset + 2] = this.point.z;
        data.bufferU32[offset + (modern ? 5 : 4)] = corner < 2 ? headTint : tailTint;
      }
      return;
    }
    const context = renderer.getContext?.() ?? renderer.context;
    for (const indices of CANVAS_TRIANGLES) {
      const [a, b, c] = indices;
      const ax = a % 2;
      const ay = a < 2 ? 0 : 1;
      const bx = b % 2;
      const by = b < 2 ? 0 : 1;
      const cx = c % 2;
      const cy = c < 2 ? 0 : 1;
      const determinant = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
      const x0 = quad[a * 2];
      const y0 = quad[a * 2 + 1];
      const x1 = quad[b * 2] - x0;
      const y1 = quad[b * 2 + 1] - y0;
      const x2 = quad[c * 2] - x0;
      const y2 = quad[c * 2 + 1] - y0;
      const ma = (x1 * (cy - ay) - x2 * (by - ay)) / determinant;
      const mb = (y1 * (cy - ay) - y2 * (by - ay)) / determinant;
      const mc = (x2 * (bx - ax) - x1 * (cx - ax)) / determinant;
      const md = (y2 * (bx - ax) - y1 * (cx - ax)) / determinant;
      if (Math.abs(ma * md - mb * mc) < 1e-8) continue;
      context.save();
      try {
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(quad[b * 2], quad[b * 2 + 1]);
        context.lineTo(quad[c * 2], quad[c * 2 + 1]);
        context.closePath();
        context.clip();
        context.transform(ma, mb, mc, md, x0 - ma * ax - mc * ay, y0 - mb * ax - md * ay);
        renderer.drawImage(resource.image, resource.sx, resource.sy + resource.sh * v0, resource.sw, resource.sh * (v1 - v0), 0, 0, 1, 1);
      } finally {
        context.restore();
      }
    }
  }
  dispose() {
    this.edges = new Float64Array(0);
    this.distances = new Float64Array(0);
  }
};

// packages/melon-runtime/src/adapters/particle-sub-effect-children.js
var ParticleSubEffectChildren = class {
  constructor(owner, createLocal) {
    this.owner = owner;
    this.createLocal = createLocal;
    this.children = [];
  }
  spawn(request) {
    const owner = this.owner;
    const options = owner.instanceOptions;
    const limit = options.subEffectDepthLimit ?? owner.runtime.subEmitters.source.maximumDepth;
    if (request.depth >= limit) return this.fail("APS_SUBEMITTER_DEPTH_LIMIT", "Sub emitter nesting exceeds Maximum depth.");
    const inherited = request.inherited;
    const position = inherited.position ? { ...inherited.position } : { x: owner.pos.x, y: owner.pos.y };
    if (inherited.position && owner.runtime.system.simulationSpace === "local") {
      position.x += owner.pos.x;
      position.y += owner.pos.y;
    }
    const childOptions = {
      application: owner.application,
      x: position.x,
      y: position.y,
      floating: owner.floating,
      prewarm: 0,
      culling: false,
      subEffectDepthLimit: limit,
      onSubEffectError: options.onSubEffectError,
      runtimeOptions: { ancestry: request.ancestry, seedOptions: inherited.seed === void 0 ? {} : { autoSeed: inherited.seed }, systemOptions: { startDelay: 0, ...inherited.seed === void 0 ? {} : { randomSeed: inherited.seed }, ...request.followParent ? { simulationSpace: "local" } : {} } }
    };
    let child;
    try {
      if (request.target.subEffectId) {
        const reference = owner.compiledEffect.asset.dependencies.subEffects.find((item) => item.id === request.target.subEffectId);
        if (!reference || !options.createSubEffect) return this.fail("APS_SUBEMITTER_TARGET_MISSING", "Select an available Particle System 2D child object.");
        childOptions.effectKey = String(reference.assetId);
        child = options.createSubEffect(reference, { application: owner.application, particleSystemId: request.target.systemId, particleEmitterId: request.target.emitterId, particleOptions: childOptions });
      } else {
        const asset2 = owner.compiledEffect.asset;
        const system = request.target.systemId ? owner.compiledEffect.systemById.get(request.target.systemId) : asset2.systems.find((item) => item.emitters.some((emitter2) => emitter2.id === request.target.emitterId));
        const emitter = request.target.emitterId ? system?.emitters.find((item) => item.id === request.target.emitterId) : system?.emitters[0];
        if (!system || !emitter) return this.fail("APS_SUBEMITTER_TARGET_MISSING", "The linked particle emitter no longer exists.");
        child = this.createLocal(owner.compiledEffect, system.id, emitter.id, { ...options, ...childOptions });
      }
      if (!child?.runtime) throw Object.assign(new Error("The selected object is not a Particle System 2D effect."), { code: "APS_SUBEMITTER_TARGET_INVALID" });
      if (!child.sourceEnabled) {
        child.destroy();
        return { spawned: 0 };
      }
      child.runtime.system.wantsEmission = false;
      const scratch = new Float64Array(4);
      const detach = child.runtime.mainEmission.addSpawnInitializer((slot, _id, state2) => {
        const start = state2.start;
        if (inherited.velocity) {
          start.velocityX[slot] += inherited.velocity.x;
          start.velocityY[slot] += inherited.velocity.y;
        }
        if (inherited.rotation !== void 0) start.rotation[slot] += inherited.rotation;
        if (inherited.size) {
          start.sizeX[slot] *= inherited.size.x;
          start.sizeY[slot] *= inherited.size.y;
        }
        if (inherited.color) {
          unpackParticleColor(start.color[slot], scratch);
          for (let i = 0; i < 4; i++) scratch[i] *= inherited.color[i];
          start.color[slot] = packParticleColor(...scratch);
        }
        if (inherited.lifetimeRatio !== void 0) start.lifetime[slot] *= Math.max(0, 1 - inherited.lifetimeRatio);
      });
      let spawned;
      try {
        spawned = child.runtime.mainEmission.emit(request.count, { customData: inherited.customData?.channels ?? inherited.customData }, false);
      } finally {
        detach();
      }
      if (!spawned) {
        child.destroy();
        return { spawned: 0 };
      }
      this.children.push(child);
      const state = child.runtime.system.state;
      const particleIds = [];
      for (let slot = state.firstActiveSlot(); slot !== -1; slot = state.nextActiveSlot(slot)) particleIds.push(state.particleIdForSlot(slot));
      return {
        spawned,
        particleIds,
        setTransform: (point2) => {
          if (child.disposed) return false;
          child.pos.x = point2.x + (owner.runtime.system.simulationSpace === "local" ? owner.pos.x : 0);
          child.pos.y = point2.y + (owner.runtime.system.simulationSpace === "local" ? owner.pos.y : 0);
          return true;
        },
        // A dying parent releases the follow link; existing child
        // particles finish their own lifetime at the last position.
        dispose() {
        }
      };
    } catch (error) {
      child?.destroy?.();
      return this.fail(error.code ?? "APS_SUBEMITTER_SPAWN_FAILED", error.message);
    }
  }
  fail(code, message) {
    if (this.owner.lastSubEffectError?.code === code && this.owner.lastSubEffectError?.message === message) return { spawned: 0 };
    const error = Object.assign(new Error(message), { code });
    this.owner.lastSubEffectError = error;
    if (this.owner.instanceOptions.onSubEffectError) this.owner.instanceOptions.onSubEffectError(error);
    else console.warn(`${code}: ${message}`);
    return { spawned: 0 };
  }
  update(delta) {
    for (let i = this.children.length - 1; i >= 0; i--) {
      const child = this.children[i];
      child.update(delta);
      if (child.disposed || !child.runtime.system.alive && !child.runtime.subEmitters.delayed.length && !child.runtime.trails.detached.length && !child.childEffects.children.length) {
        child.destroy();
        this.children.splice(i, 1);
      }
    }
  }
  draw(renderer) {
    for (const child of this.children) child.draw(renderer);
  }
  clear() {
    for (const child of this.children) child.destroy();
    this.children.length = 0;
  }
};

// packages/melon-runtime/src/adapters/particle-system-2d-engine.js
var ParticleEngineAdapterError = class extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "ParticleEngineAdapterError";
    this.code = code;
    this.details = details;
  }
};
function applicationOf(application, instanceOptions, engine2) {
  return instanceOptions.application ?? application ?? engine2.game;
}
function backendOf(application) {
  return application?.renderer?.type === "WebGPU" ? "webgpu" : application?.renderer?.gl ? "webgl" : "canvas2d";
}
function degrees(value) {
  return Number(value) * 180 / Math.PI || 0;
}
function finiteCoordinate(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}
function visibleInViewport(bounds, viewport) {
  if (!viewport || !bounds) return true;
  const x = Number(viewport.pos?.x) || 0;
  const y = Number(viewport.pos?.y) || 0;
  const width = Number(viewport.width) || Infinity;
  const height = Number(viewport.height) || Infinity;
  return bounds.maxX >= x && bounds.minX <= x + width && bounds.maxY >= y && bounds.minY <= y + height;
}
function worldChildren(object) {
  const children = object?.getChildren?.() ?? object?.children;
  return Array.isArray(children) ? children : [];
}
function absolutePosition(object) {
  const nativePosition = object?.getAbsolutePosition?.();
  if (nativePosition) return { x: finiteCoordinate(nativePosition.x), y: finiteCoordinate(nativePosition.y) };
  let x = 0;
  let y = 0;
  let current = object;
  const visited = /* @__PURE__ */ new Set();
  while (current && !visited.has(current)) {
    visited.add(current);
    x += finiteCoordinate(current.pos?.x);
    y += finiteCoordinate(current.pos?.y);
    if (current.floating === true) break;
    current = current.ancestor;
  }
  return { x, y };
}
function shapePoints(shape) {
  if (Array.isArray(shape?.points) && shape.points.length >= 2) return shape.points;
  const bounds = shape?.getBounds?.() ?? shape;
  const x = finiteCoordinate(bounds?.x ?? bounds?.left);
  const y = finiteCoordinate(bounds?.y ?? bounds?.top);
  const width = Number(bounds?.width);
  const height = Number(bounds?.height);
  if (!(Number.isFinite(width) && Number.isFinite(height))) return [];
  return [{ x, y }, { x: x + width, y }, { x: x + width, y: y + height }, { x, y: y + height }];
}
function colliderBounds(ax, ay, bx, by) {
  return { minX: Math.min(ax, bx), minY: Math.min(ay, by), maxX: Math.max(ax, bx), maxY: Math.max(ay, by) };
}
function upsertCollider(registry, collider) {
  const current = registry.colliders.get(collider.id);
  if (current && current.type === collider.type && current.ax === collider.ax && current.ay === collider.ay && current.bx === collider.bx && current.by === collider.by && current.layer === collider.layer && current.mask === collider.mask && current.trigger === collider.trigger && current.oneSided === collider.oneSided) return;
  registry.add(collider);
}
function syncMelonJs20BodyColliders(renderable, state) {
  const registry = renderable.colliderRegistry;
  const world = renderable.application?.world;
  const layerMask = renderable.runtime?.collision?.source?.layerMask ?? 4294967295;
  const nextIds = /* @__PURE__ */ new Set();
  if (!registry) return;
  if (!world || layerMask >>> 0 === 0) {
    for (const id of state.colliderIds) registry.remove(id);
    state.colliderIds = nextIds;
    return;
  }
  const local = renderable.runtime?.system?.simulationSpace === "local";
  const origin = absolutePosition(local ? renderable : world);
  const stack = [world];
  const visited = /* @__PURE__ */ new Set();
  while (stack.length) {
    const object = stack.pop();
    if (!object || visited.has(object)) continue;
    visited.add(object);
    for (const child of worldChildren(object)) stack.push(child);
    const body = object.body;
    if (!body) continue;
    let bodyId = state.bodyIds.get(body);
    if (!bodyId) {
      bodyId = state.nextBodyId++;
      state.bodyIds.set(body, bodyId);
    }
    const bodyObject = body.ancestor ?? object;
    const objectPosition = absolutePosition(bodyObject);
    const shapes = Array.isArray(body.shapes) ? body.shapes : [];
    for (let shapeIndex = 0; shapeIndex < shapes.length; shapeIndex += 1) {
      const shape = shapes[shapeIndex];
      if (!shape || shape.isActive === false) continue;
      const points = shapePoints(shape);
      if (points.length < 2) continue;
      const shapeX = finiteCoordinate(shape.pos?.x);
      const shapeY = finiteCoordinate(shape.pos?.y);
      const close = points.length > 2 && String(shape.type ?? "").toLowerCase() !== "line";
      const edgeCount = close ? points.length : points.length - 1;
      const layer = shape.collisionType ?? body.collisionType;
      if ((layer >>> 0 & layerMask >>> 0) === 0) continue;
      const mask = shape.collisionMask ?? body.collisionMask ?? 4294967295;
      for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex += 1) {
        const from = points[edgeIndex];
        const to = points[(edgeIndex + 1) % points.length];
        const ax = objectPosition.x + shapeX + finiteCoordinate(from?.x) - origin.x;
        const ay = objectPosition.y + shapeY + finiteCoordinate(from?.y) - origin.y;
        const bx = objectPosition.x + shapeX + finiteCoordinate(to?.x) - origin.x;
        const by = objectPosition.y + shapeY + finiteCoordinate(to?.y) - origin.y;
        const id = `melon-world-shape:${state.renderableId}:${bodyId}:${shapeIndex}:${edgeIndex}`;
        nextIds.add(id);
        upsertCollider(registry, {
          id,
          type: "segment",
          ax,
          ay,
          bx,
          by,
          bounds: colliderBounds(ax, ay, bx, by),
          layer,
          mask,
          trigger: shape.isTrigger === true || body.isSensor === true,
          oneSided: shape.oneSided === true
        });
      }
    }
  }
  for (const id of state.colliderIds) if (!nextIds.has(id)) registry.remove(id);
  state.colliderIds = nextIds;
}
function defaultTextureResolver(engine2, id) {
  return id ? engine2.loader?.getImage?.(id) ?? engine2.loader?.getBinary?.(id) ?? null : null;
}
function normalizeTexture(resource) {
  if (!resource) return null;
  if (resource.image) return { image: resource.image, sx: resource.sx ?? resource.offset?.x ?? 0, sy: resource.sy ?? resource.offset?.y ?? 0, sw: resource.sw ?? resource.width ?? resource.image.width, sh: resource.sh ?? resource.height ?? resource.image.height };
  return { image: resource, sx: 0, sy: 0, sw: resource.width, sh: resource.height };
}
function rendererAlpha(renderer) {
  const value = typeof renderer.globalAlpha === "function" ? renderer.globalAlpha() : renderer.getGlobalAlpha?.();
  return Number.isFinite(value) ? value : 1;
}
function tintChannels(renderer, output) {
  const tint = renderer.currentTint;
  if (tint?.glArray?.length >= 4) {
    output.set(tint.glArray.subarray?.(0, 4) ?? tint.glArray);
  } else {
    output[0] = Number.isFinite(tint?.r) ? tint.r / 255 : 1;
    output[1] = Number.isFinite(tint?.g) ? tint.g / 255 : 1;
    output[2] = Number.isFinite(tint?.b) ? tint.b / 255 : 1;
    output[3] = Number.isFinite(tint?.alpha) ? tint.alpha : 1;
  }
  return output;
}
function particleCssColor(red, green, blue) {
  return `rgb(${Math.round(red * 255)},${Math.round(green * 255)},${Math.round(blue * 255)})`;
}
var autoSeedCounter = 0;
function boundaryAutoSeed() {
  const values = new Uint32Array(1);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(values);
    return values[0];
  }
  autoSeedCounter = autoSeedCounter + 2654435769 >>> 0;
  const clock = Math.floor((globalThis.performance?.now?.() ?? 0) * 1e3) >>> 0;
  return (Date.now() >>> 0 ^ clock ^ autoSeedCounter) >>> 0;
}
function createMelonJsParticleSystem2DBridge(engine2, application, options = {}) {
  const engineVersion = options.engineVersion ?? String(engine2.version ?? "unknown");
  const BaseRenderable = engine2.Renderable ?? class {
    constructor(x = 0, y = 0, width = 1, height = 1) {
      this.pos = { x, y, z: 0 };
      this.width = width;
      this.height = height;
    }
  };
  const colorScratch = new Float64Array(4);
  const baseTintScratch = new Float64Array(4);
  let nextRenderableColliderId = 1;
  class AdvancedParticleRenderable extends BaseRenderable {
    constructor(compiledEffect, systemId, emitterId, instanceOptions = {}) {
      super(instanceOptions.x ?? 0, instanceOptions.y ?? 0, instanceOptions.width ?? 1, instanceOptions.height ?? 1);
      this.applyAnchorTransform = false;
      this.name = instanceOptions.name ?? `ParticleSystem2D:${systemId}:${emitterId}`;
      this.alwaysUpdate = instanceOptions.alwaysUpdate !== false;
      this.floating = instanceOptions.floating === true;
      this.compiledEffect = compiledEffect;
      this.systemId = systemId;
      this.emitterId = emitterId;
      this.instanceOptions = { ...instanceOptions };
      this.application = applicationOf(application, instanceOptions, engine2);
      if (!this.application) throw new ParticleEngineAdapterError("APS_ADAPTER_APPLICATION_REQUIRED", `melonJS ${engineVersion} Application is required.`);
      this.particleTint = typeof engine2.Color === "function" ? new engine2.Color(255, 255, 255, 1) : null;
      this.baseTint = typeof engine2.Color === "function" ? new engine2.Color(255, 255, 255, 1) : null;
      this.colliderRegistry = instanceOptions.colliderRegistry ?? new ParticleColliderRegistry({ spatialQuery: instanceOptions.collisionSpatialQuery });
      this.ownsColliderRegistry = !instanceOptions.colliderRegistry;
      this.worldShapeColliderState = { renderableId: nextRenderableColliderId++, nextBodyId: 1, bodyIds: /* @__PURE__ */ new WeakMap(), colliderIds: /* @__PURE__ */ new Set() };
      this.disposed = false;
      this.pausedByWorld = false;
      this.lastBatch = null;
      this.lastTrailBatch = null;
      this.resource = null;
      this.resourceCache = /* @__PURE__ */ new Map();
      this.worldBounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
      this.renderBounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
      this._createRuntime();
    }
    _createRuntime() {
      this.lastSubEffectError = null;
      this.childEffects?.clear();
      this.childEffects ?? (this.childEffects = new ParticleSubEffectChildren(this, (effect, system2, emitter2, options2) => new AdvancedParticleRenderable(effect, system2, emitter2, options2)));
      this._releaseGradientTexture();
      this.lastBatch = null;
      this.lastTrailBatch = null;
      this.trailTextureRenderer ?? (this.trailTextureRenderer = new ParticleTrailTextureRenderer());
      const backend = this.instanceOptions.backend ?? backendOf(this.application);
      const capabilities = detectParticle2DTarget(engineVersion, this.application, engine2);
      if (capabilities.simulation === "unsupported") throw new ParticleEngineAdapterError("APS_CAP_UNSUPPORTED", `Advanced ParticleSystem2D is unavailable for melonJS ${engineVersion}/${backend}.`, { capabilities });
      const runtimeOptions = { ...this.instanceOptions.runtimeOptions ?? {} };
      const seedOptions = { ...runtimeOptions.seedOptions ?? {} };
      if (this.compiledEffect.asset.effect?.autoRandomSeed === true && typeof seedOptions.autoSeed === "undefined" && !seedOptions.previewSeedController) {
        seedOptions.autoSeed = this.instanceOptions.autoSeed ?? boundaryAutoSeed();
      }
      this.runtime = createParticleSystem2DFromEmitter(this.compiledEffect, this.systemId, this.emitterId, {
        ...runtimeOptions,
        seedOptions,
        rendererBackend: backend,
        colliderRegistry: this.colliderRegistry,
        collisionSpatialQuery: this.instanceOptions.collisionSpatialQuery,
        resolveObjectPoints: this.instanceOptions.resolveObjectPoints,
        mask: this.instanceOptions.mask,
        fieldRegistry: this.instanceOptions.fieldRegistry,
        spawnSubEffect: this.instanceOptions.spawnSubEffect ?? ((request) => this.childEffects.spawn(request)),
        onCollisionEvents: this.instanceOptions.onCollisionEvents,
        quality: this.instanceOptions.quality,
        effectId: runtimeOptions.effectId ?? `${this.instanceOptions.effectKey ?? this.compiledEffect.asset.effect.id}/${this.systemId}/${this.emitterId}`,
        systemOptions: { ...runtimeOptions.systemOptions ?? {}, transform: this._transform() }
      });
      const system = this.compiledEffect.systemById.get(this.systemId);
      const emitter = this.compiledEffect.emitterById.get(this.emitterId);
      this.sourceEnabled = this.compiledEffect.asset.effect?.enabled !== false && system?.enabled !== false && emitter?.enabled !== false && emitter?.modules?.main?.enabled !== false;
      this.playOnAwake = emitter?.modules?.main?.playOnAwake === true;
      if (this.sourceEnabled) {
        if (this.playOnAwake) this.runtime.system.play({ prewarm: this.instanceOptions.prewarm });
        else this.runtime.system.stop("clear");
      } else {
        this.runtime.system.stop("clear");
        this.runtime.system.enabled = false;
      }
      this.capabilities = capabilities;
      this.resourceCache.clear();
      const source = this.runtime.renderer.source;
      const gradient2 = this.compiledEffect.gradientById.get(source.gradientTexture.gradientId);
      this.resource = source.textureMode === "gradient" ? gradient2 ? normalizeTexture(createParticleGradientTexture(gradient2, source.gradientTexture, this.instanceOptions.createCanvas)) : null : source.textureMode === "color" ? null : this._resolveTexture();
      this.gradientImage = source.textureMode === "gradient" ? this.resource?.image : null;
    }
    _releaseGradientTexture() {
      const image = this.gradientImage;
      if (!image) return;
      const renderer = this.application?.renderer;
      const cache = renderer?.cache;
      if (renderer?.type === "WebGPU" && cache?.has?.(image)) {
        renderer.currentBatcher?.flush?.();
        renderer.textureStore?.destroyTexture?.(cache.get(image));
      }
      if (renderer?.gl && (cache?.has?.(image) || cache?.cache?.has?.(image))) {
        const atlas = cache.get(image);
        if (renderer.batchers?.get) {
          const batcher = renderer.batchers.get("quad");
          batcher?.flush?.();
          batcher?.deleteTexture2D?.(atlas);
        } else {
          const compositor = renderer.compositors?.get?.("quad");
          const texture = compositor?.getTexture2D?.(cache.getUnit?.(atlas));
          if (texture) {
            compositor.flush?.();
            compositor.deleteTexture2D?.(texture);
          }
        }
      }
      cache?.delete?.(image);
      cache?.tinted?.delete?.(image);
      this.gradientImage = null;
    }
    _transform() {
      const scale = this.scale ?? this.currentTransform?.scale ?? {};
      return { x: Number(this.pos?.x) || 0, y: Number(this.pos?.y) || 0, rotation: Number.isFinite(this.angle) ? degrees(this.angle) : Number(this.rotation) || 0, scaleX: Number(scale.x) || 1, scaleY: Number(scale.y) || 1 };
    }
    _worldBounds(bounds) {
      const offsetX = this.runtime?.system?.simulationSpace === "local" ? Number(this.pos?.x) || 0 : 0;
      const offsetY = this.runtime?.system?.simulationSpace === "local" ? Number(this.pos?.y) || 0 : 0;
      this.worldBounds.minX = bounds.minX + offsetX;
      this.worldBounds.minY = bounds.minY + offsetY;
      this.worldBounds.maxX = bounds.maxX + offsetX;
      this.worldBounds.maxY = bounds.maxY + offsetY;
      for (const child of this.childEffects?.children ?? []) {
        if (child.disposed) continue;
        const childBounds = child._worldBounds(child._combinedBounds(child.lastBatch ?? { bounds: child.runtime.renderer.visibilityBounds() }, child.lastTrailBatch));
        this.worldBounds.minX = Math.min(this.worldBounds.minX, childBounds.minX);
        this.worldBounds.minY = Math.min(this.worldBounds.minY, childBounds.minY);
        this.worldBounds.maxX = Math.max(this.worldBounds.maxX, childBounds.maxX);
        this.worldBounds.maxY = Math.max(this.worldBounds.maxY, childBounds.maxY);
      }
      return this.worldBounds;
    }
    _combinedBounds(batch, trailBatch) {
      const particle = batch?.bounds;
      const trail = trailBatch?.bounds;
      if (!particle) return trail ?? { minX: 0, minY: 0, maxX: 0, maxY: 0 };
      if (!trail || !(trailBatch?.count > 0)) return particle;
      this.renderBounds.minX = Math.min(particle.minX, trail.minX);
      this.renderBounds.minY = Math.min(particle.minY, trail.minY);
      this.renderBounds.maxX = Math.max(particle.maxX, trail.maxX);
      this.renderBounds.maxY = Math.max(particle.maxY, trail.maxY);
      return this.renderBounds;
    }
    _resolveTexture(textureId = this.runtime.renderer.source.textureId, atlasRegionId = this.runtime.renderer.source.atlasRegionId) {
      const key = `${textureId ?? ""}\0${atlasRegionId ?? ""}`;
      if (this.resourceCache.has(key)) return this.resourceCache.get(key);
      const resolveTexture = this.instanceOptions.resolveTexture ?? ((id) => defaultTextureResolver(engine2, id));
      const resolveAtlas = this.instanceOptions.resolveAtlasRegion;
      const atlas = atlasRegionId && resolveAtlas ? resolveAtlas(atlasRegionId, textureId) : null;
      const resource = normalizeTexture(atlas ?? resolveTexture(textureId));
      this.resourceCache.set(key, resource);
      return resource;
    }
    _frameTexture(frame) {
      if (this.runtime.renderer.source.textureMode !== "image") return this.resource;
      if (!frame) return this.resource ?? this._resolveTexture();
      const source = this.runtime.renderer.source;
      const textureId = frame.textureId ?? source.textureId;
      const atlasRegionId = Object.prototype.hasOwnProperty.call(frame, "atlasRegionId") ? frame.atlasRegionId : source.atlasRegionId;
      return this._resolveTexture(textureId, atlasRegionId);
    }
    _syncColliders() {
      if (!this.runtime?.collision) return;
      if (typeof this.instanceOptions.syncColliders === "function") this.instanceOptions.syncColliders(this.colliderRegistry, this.application, this);
      else if (engineVersion === "20.0.0") syncMelonJs20BodyColliders(this, this.worldShapeColliderState);
    }
    onActivateEvent() {
      if (engineVersion === "20.0.0") this._syncColliders();
      if (!this.sourceEnabled) return;
      if (this.runtime.system.paused) this.runtime.system.resume();
      else if (this.playOnAwake && (this.runtime.system.stopped || this.runtime.system.completed)) this.runtime.system.play({ restart: this.runtime.system.completed });
      this.pausedByWorld = false;
    }
    onDeactivateEvent() {
      this.runtime.system.pause();
      this.pausedByWorld = true;
    }
    play(options2) {
      this.runtime.system.play(options2);
      return this;
    }
    pause() {
      this.runtime.system.pause();
      return this;
    }
    stop(action = "clear") {
      this.childEffects.clear();
      this.runtime.system.stop(action);
      return this;
    }
    restart(options2) {
      this.childEffects.clear();
      this.runtime.system.restart(options2);
      return this;
    }
    update(deltaMilliseconds) {
      if (this.disposed || this.pausedByWorld) return false;
      const seconds = this.instanceOptions.deltaUnit === "seconds" ? deltaMilliseconds : deltaMilliseconds / 1e3;
      const previous = this._worldBounds(this._combinedBounds(this.lastBatch, this.lastTrailBatch));
      const visible = this.instanceOptions.culling === false || visibleInViewport(previous, this.application.viewport);
      this._syncColliders();
      const advanceChildren = !this.runtime.system.paused && !this.runtime.system.stopped;
      if (advanceChildren) this.childEffects.update(deltaMilliseconds);
      if (this.runtime.system.completed && this.runtime.subEmitters.delayed.length) {
        this.runtime.system.time += Math.max(0, seconds);
        this.runtime.subEmitters.update();
      } else this.runtime.system.step(Math.max(0, seconds), { visible, transform: this._transform(), timeScale: this.instanceOptions.timeScale?.() ?? 1 });
      this.lastBatch = this.runtime.renderer.buildBatch();
      this.lastTrailBatch = this.runtime.trails.source.enabled && this.lastBatch?.primitive !== "trail-strip-batch" ? this.runtime.trails.buildGeometry() : null;
      const bounds = this._combinedBounds(this.lastBatch, this.lastTrailBatch);
      if (bounds) {
        this.width = Math.max(1, bounds.maxX - bounds.minX);
        this.height = Math.max(1, bounds.maxY - bounds.minY);
        this.updateBounds?.();
      }
      return this.runtime.system.alive || this.runtime.system.emitting || this.childEffects.children.length > 0 || this.runtime.subEmitters.delayed.length > 0;
    }
    draw(renderer) {
      if (this.disposed) return;
      this.childEffects.draw(renderer);
      const batch = this.lastBatch ?? this.runtime.renderer.buildBatch();
      const trailBatch = this.lastTrailBatch ?? (this.runtime.trails.source.enabled && batch?.primitive !== "trail-strip-batch" ? this.runtime.trails.buildGeometry() : null);
      if (!batch?.count && !trailBatch?.count) return;
      const local = this.runtime.system.simulationSpace === "local";
      if (local) {
        renderer.save?.();
        renderer.translate?.(Number(this.pos?.x) || 0, Number(this.pos?.y) || 0);
      }
      try {
        if (trailBatch?.count) this._drawTrailBatch(renderer, trailBatch);
        if (batch?.count) this._drawBatch(renderer, batch);
      } finally {
        if (local) renderer.restore?.();
      }
    }
    _drawBatch(renderer, batch) {
      if (batch?.primitive === "trail-strip-batch") {
        this._drawTrailBatch(renderer, batch);
        return;
      }
      if (typeof this.instanceOptions.renderBatch === "function") {
        this.instanceOptions.renderBatch(renderer, batch, this);
        return;
      }
      if (typeof renderer.drawParticleBatch === "function") {
        renderer.drawParticleBatch(batch, this.resource, this);
        return;
      }
      const canDrawShape = typeof renderer.fillRect === "function";
      if (typeof renderer.drawImage !== "function" && !canDrawShape) return;
      const baseAlpha = rendererAlpha(renderer);
      tintChannels(renderer, baseTintScratch);
      this.baseTint?.setFloat(...baseTintScratch);
      const canTint = this.particleTint && this.baseTint && typeof renderer.setTint === "function";
      for (let index = 0; index < batch.count; index += 1) {
        const offset = index * 6;
        const x = batch.transforms[offset];
        const y = batch.transforms[offset + 1];
        const width = batch.transforms[offset + 2];
        const height = batch.transforms[offset + 3];
        const rotation = batch.transforms[offset + 4] * Math.PI / 180;
        unpackParticleColor(batch.colors[index], colorScratch);
        renderer.save?.();
        try {
          const red = colorScratch[0] * baseTintScratch[0];
          const green = colorScratch[1] * baseTintScratch[1];
          const blue = colorScratch[2] * baseTintScratch[2];
          renderer.translate?.(x, y);
          renderer.rotate?.(rotation);
          renderer.setGlobalAlpha?.(baseAlpha * colorScratch[3]);
          const frame = batch.frames?.[index] ?? null;
          const texture = this._frameTexture(frame);
          const canDrawTexture = texture?.image && typeof renderer.drawImage === "function";
          if (canDrawTexture) {
            if (canTint) {
              this.particleTint.setFloat(red, green, blue, baseTintScratch[3]);
              renderer.setTint(this.particleTint, 1);
            }
            try {
              const uvOffset = index * 4;
              const u0 = batch.uvs?.[uvOffset] ?? 0;
              const v0 = batch.uvs?.[uvOffset + 1] ?? 0;
              const u1 = batch.uvs?.[uvOffset + 2] ?? 1;
              const v1 = batch.uvs?.[uvOffset + 3] ?? 1;
              renderer.drawImage(texture.image, texture.sx + texture.sw * u0, texture.sy + texture.sh * v0, texture.sw * (u1 - u0), texture.sh * (v1 - v0), -width * batch.anchor.x, -height * batch.anchor.y, width, height);
            } catch (error) {
              if (!canDrawShape) throw error;
              renderer.setColor?.(canTint ? this.particleTint : particleCssColor(red, green, blue));
              renderer.fillRect(-width * batch.anchor.x, -height * batch.anchor.y, width, height);
            }
          } else {
            if (canTint) this.particleTint.setFloat(red, green, blue, baseTintScratch[3]);
            renderer.setColor?.(canTint ? this.particleTint : particleCssColor(red, green, blue));
            renderer.fillRect(-width * batch.anchor.x, -height * batch.anchor.y, width, height);
          }
        } finally {
          renderer.setGlobalAlpha?.(baseAlpha);
          if (canTint) renderer.setTint(this.baseTint, 1);
          renderer.restore?.();
        }
      }
    }
    _drawTrailBatch(renderer, batch) {
      if (typeof this.instanceOptions.renderTrailBatch === "function") {
        this.instanceOptions.renderTrailBatch(renderer, batch, this);
        return;
      }
      if (typeof renderer.drawParticleTrailBatch === "function") {
        renderer.drawParticleTrailBatch(batch, this);
        return;
      }
      const canStrokePath = typeof renderer.beginPath === "function" && typeof renderer.moveTo === "function" && typeof renderer.lineTo === "function" && typeof renderer.stroke === "function";
      const canStrokeSegment = typeof renderer.strokeLine === "function";
      const canTexture = this.trailTextureRenderer.canDraw(renderer);
      if (!canStrokePath && !canStrokeSegment && !canTexture) return;
      const baseAlpha = rendererAlpha(renderer);
      tintChannels(renderer, baseTintScratch);
      this.baseTint?.setFloat(...baseTintScratch);
      const canTint = this.particleTint && this.baseTint && typeof renderer.setTint === "function";
      const widthAt = (index) => Math.max(0, batch.vertices[index * 3 + 2]);
      const sameStyle = (left, right) => batch.colors[left] === batch.colors[right] && widthAt(left) === widthAt(right);
      const applyStyle = (index) => {
        unpackParticleColor(batch.colors[index], colorScratch);
        const red = colorScratch[0] * baseTintScratch[0];
        const green = colorScratch[1] * baseTintScratch[1];
        const blue = colorScratch[2] * baseTintScratch[2];
        if (canTint) {
          this.particleTint.setFloat(red, green, blue, baseTintScratch[3]);
          renderer.setTint(this.particleTint, 1);
        }
        renderer.setColor?.(canTint ? this.particleTint : particleCssColor(red, green, blue));
        renderer.setGlobalAlpha?.(baseAlpha * colorScratch[3]);
        if (typeof renderer.setLineWidth === "function") renderer.setLineWidth(widthAt(index));
        else renderer.lineWidth = widthAt(index);
      };
      renderer.save?.();
      try {
        for (const range of batch.ranges ?? [{ start: 0, count: batch.count }]) {
          if (canTexture && this._drawTexturedTrailRange(renderer, batch, range, baseAlpha, canTint)) continue;
          const end = range.start + range.count;
          let runStart = range.start + 1;
          while (runStart < end) {
            let runEnd = runStart + 1;
            while (runEnd < end && sameStyle(runStart, runEnd)) runEnd += 1;
            applyStyle(runStart);
            const pathKeepsWidth = engineVersion !== "17.4.0" || !renderer.gl || widthAt(runStart) <= 1;
            if (canStrokePath && pathKeepsWidth) {
              const previousOffset = (runStart - 1) * 3;
              renderer.beginPath();
              renderer.moveTo(batch.vertices[previousOffset], batch.vertices[previousOffset + 1]);
              for (let index = runStart; index < runEnd; index += 1) {
                const offset = index * 3;
                renderer.lineTo(batch.vertices[offset], batch.vertices[offset + 1]);
              }
              renderer.stroke();
            } else if (canStrokeSegment) {
              for (let index = runStart; index < runEnd; index += 1) {
                const previousOffset = (index - 1) * 3;
                const offset = index * 3;
                renderer.strokeLine(batch.vertices[previousOffset], batch.vertices[previousOffset + 1], batch.vertices[offset], batch.vertices[offset + 1]);
              }
            }
            runStart = runEnd;
          }
        }
      } finally {
        renderer.setGlobalAlpha?.(baseAlpha);
        if (canTint) renderer.setTint(this.baseTint, 1);
        renderer.restore?.();
      }
    }
    _drawTexturedTrailRange(renderer, batch, range, baseAlpha, canTint) {
      if (batch.appearanceMode === "color") return false;
      const frame = this.runtime.renderer.source.textureMode === "image" ? range.frame : null;
      const texture = this._frameTexture(frame);
      if (!texture?.image || !(texture.sw > 0 && texture.sh > 0)) return false;
      const helper = this.trailTextureRenderer;
      const length = helper.prepare(batch, range);
      if (!(length > 1e-6)) return true;
      const resource = {
        image: texture.image,
        sx: texture.sx + texture.sw * (frame?.u0 ?? 0),
        sy: texture.sy + texture.sh * (frame?.v0 ?? 0),
        sw: texture.sw * ((frame?.u1 ?? 1) - (frame?.u0 ?? 0)),
        sh: texture.sh * ((frame?.v1 ?? 1) - (frame?.v0 ?? 0))
      };
      const tiled = batch.textureMode === "tile";
      const unit = tiled ? Math.max(batch.textureTileLength ?? 64, length / 256) : length;
      const setColor = (left, right, amount) => {
        for (let c = 0; c < 4; c++) {
          const a = left >>> c * 8 & 255;
          const b = right >>> c * 8 & 255;
          colorScratch[c] = (a + (b - a) * amount) / 255 * (c < 3 ? baseTintScratch[c] : 1);
        }
        if (canTint) {
          this.particleTint.setFloat(colorScratch[0], colorScratch[1], colorScratch[2], baseTintScratch[3]);
          renderer.setTint(this.particleTint, 1);
        }
        renderer.setGlobalAlpha?.(baseAlpha * colorScratch[3]);
        const byte = (value) => Math.round(Math.max(0, Math.min(1, value)) * 255);
        return (byte(colorScratch[3] * baseTintScratch[3] * baseAlpha) << 24 | byte(colorScratch[0]) << 16 | byte(colorScratch[1]) << 8 | byte(colorScratch[2])) >>> 0;
      };
      for (let i = 0; i < range.count - 1; i++) {
        const d0 = length - helper.distances[i];
        const d1 = length - helper.distances[i + 1];
        const span = d0 - d1;
        if (span < 1e-6) continue;
        let from = 0;
        const left = batch.colors[range.start + i];
        const right = batch.colors[range.start + i + 1];
        while (from < 1 - 1e-8) {
          const at = d0 - span * from;
          const tile = tiled ? Math.max(0, Math.ceil((at - 1e-7) / unit) - 1) : 0;
          let to = tiled ? Math.min(1, (d0 - tile * unit) / span) : 1;
          if (!renderer.gl && renderer.type !== "WebGPU" && left !== right) to = Math.min(to, from + 1 / 8);
          if (to <= from + 1e-8) break;
          const quad = helper.corners(i, from, to);
          let v0 = Math.max(0, Math.min(1, (d0 - span * to) / unit - tile));
          let v1 = Math.max(0, Math.min(1, at / unit - tile));
          if (this.runtime.renderer.source.flipX) for (const offset of [0, 4]) {
            [quad[offset], quad[offset + 2]] = [quad[offset + 2], quad[offset]];
            [quad[offset + 1], quad[offset + 3]] = [quad[offset + 3], quad[offset + 1]];
          }
          if (this.runtime.renderer.source.flipY) {
            for (let c = 0; c < 4; c++) [quad[c], quad[c + 4]] = [quad[c + 4], quad[c]];
            [v0, v1] = [1 - v1, 1 - v0];
          }
          const headTint = setColor(left, right, to);
          const tailTint = setColor(left, right, from);
          if (!renderer.gl && renderer.type !== "WebGPU") setColor(left, right, (from + to) / 2);
          helper.drawQuad(renderer, resource, quad, v0, v1, this.runtime.renderer.source.flipY ? tailTint : headTint, this.runtime.renderer.source.flipY ? headTint : tailTint);
          from = to;
        }
      }
      return true;
    }
    getBounds() {
      if (!this.runtime) return BaseRenderable.prototype.getBounds.call(this);
      const bounds = this._worldBounds(this._combinedBounds(this.lastBatch ?? { bounds: this.runtime.renderer.visibilityBounds() }, this.lastTrailBatch));
      if (engine2.Bounds) {
        const result = new engine2.Bounds();
        result.setMinMax?.(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY);
        return result;
      }
      return bounds;
    }
    hotReload(compiledEffect) {
      const playing = this.runtime.system.playing;
      const sourceEnabled = this.sourceEnabled;
      this.runtime.dispose();
      this.compiledEffect = compiledEffect;
      this._createRuntime();
      if (this.sourceEnabled && sourceEnabled && !playing) this.runtime.system.pause();
      return this;
    }
    destroy() {
      if (this.disposed) return;
      for (const id of this.worldShapeColliderState.colliderIds) this.colliderRegistry.remove(id);
      this.worldShapeColliderState.colliderIds.clear();
      this.childEffects?.clear();
      this._releaseGradientTexture();
      this.trailTextureRenderer?.dispose();
      this.runtime?.dispose();
      this.runtime = null;
      this.lastBatch = null;
      this.lastTrailBatch = null;
      this.resource = null;
      this.resourceCache.clear();
      this.particleTint = null;
      this.baseTint = null;
      this.disposed = true;
    }
    onDestroyEvent() {
      this.destroy();
    }
  }
  Object.defineProperty(AdvancedParticleRenderable, "name", { value: engineVersion === "17.4.0" ? "ParticleSystem2DRenderableV174" : "ParticleSystem2DRenderableV20" });
  return Object.freeze({
    engineVersion,
    RenderableClass: AdvancedParticleRenderable,
    capabilities: () => detectParticle2DTarget(engineVersion, application ?? engine2.game, engine2),
    create(compiledEffect, systemId, emitterId, instanceOptions) {
      return new AdvancedParticleRenderable(compiledEffect, systemId, emitterId, instanceOptions);
    },
    mount(renderable, z) {
      const app = renderable.application ?? application ?? engine2.game;
      app?.world?.addChild?.(renderable, z);
      return renderable;
    },
    unmount(renderable) {
      const world = renderable.ancestor ?? renderable.application?.world ?? application?.world;
      world?.removeChild?.(renderable);
      renderable.destroy();
      return true;
    }
  });
}

// packages/melon-runtime/src/index.js
var MELON_RUNTIME_VERSION = "0.4.0";
function createMelonRuntime(adapter, initialOptions = {}) {
  if (!adapter || typeof adapter !== "object") {
    throw new TypeError("Melon Runtime membutuhkan adapter engine.");
  }
  const context = {
    adapter,
    gameData: initialOptions.gameData ?? null,
    options: { ...initialOptions },
    state: {
      actions: /* @__PURE__ */ new Map(),
      behavior: /* @__PURE__ */ new WeakMap(),
      groups: /* @__PURE__ */ new Map(),
      objectData: /* @__PURE__ */ new WeakMap(),
      values: /* @__PURE__ */ new Map(),
      valueWatchers: /* @__PURE__ */ new Map()
    }
  };
  const melon2 = {
    name: "Melon Runtime",
    version: MELON_RUNTIME_VERSION,
    engineAdapter: adapter.name ?? "unknown",
    configure(options = {}) {
      context.options = { ...context.options, ...options };
      if (Object.prototype.hasOwnProperty.call(options, "gameData")) {
        context.gameData = options.gameData;
      }
      adapter.configure?.(options);
      if (context.gameData && typeof context.gameData === "object") {
        context.gameData.melon = melon2;
      }
      return melon2;
    },
    get gameData() {
      return context.gameData;
    }
  };
  melon2.math = createMathModule(context);
  melon2.events = createEventsModule(context);
  melon2.object = createObjectModule(context);
  melon2.particles = createParticlesModule(context);
  melon2.group = createGroupModule(context);
  melon2.movement = createMovementModule(context);
  melon2.behavior = createBehaviorModule(context);
  melon2.input = createInputModule(context);
  melon2.animation = createAnimationModule(context);
  melon2.audio = createAudioModule(context);
  melon2.scene = createSceneModule(context);
  melon2.sprite = createSpriteModule(context);
  melon2.renderable = createRenderableModule(context);
  melon2.video = createVideoModule(context);
  melon2.text = createTextModule(context);
  melon2.bitmapText = createBitmapTextModule(context);
  melon2.trigger = createTriggerModule(context);
  melon2.draggable = createDraggableModule(context);
  melon2.ui = createUiModule(context);
  melon2.slider = createSliderModule(context);
  melon2.trail = createTrailModule(context);
  melon2.light = createLightModule(context);
  melon2.particleEmitter = createParticleEmitterModule(context);
  melon2.audioSource = createAudioSourceModule(context);
  melon2.sprite25 = createSprite25Module(context);
  melon2.camera = createCameraModule(context);
  melon2.capabilities = createCapabilitiesModule(context);
  melon2.time = createTimeModule(context);
  melon2.textures = createTexturesModule(context);
  melon2.storage = createStorageModule(context);
  melon2.state = createStateModule(context);
  melon2.collision = createCollisionModule(context);
  melon2.game = createGameModule(context);
  return melon2.configure(initialOptions);
}

// packages/melon-runtime/src/adapters/melonjs-17.4.0.js
var KEY_ALIASES = {
  arrowleft: "LEFT",
  arrowright: "RIGHT",
  arrowup: "UP",
  arrowdown: "DOWN",
  escape: "ESC",
  esc: "ESC",
  spacebar: "SPACE",
  space: "SPACE",
  control: "CTRL",
  ctrl: "CTRL",
  return: "ENTER",
  enter: "ENTER"
};
var AXIS_NAMES = {
  none: "NONE",
  horizontal: "HORIZONTAL",
  x: "HORIZONTAL",
  vertical: "VERTICAL",
  y: "VERTICAL",
  both: "BOTH"
};
var physicsAdaptersWithPendingFlush = /* @__PURE__ */ new WeakSet();
var legacyBodyFilterState = /* @__PURE__ */ new WeakMap();
var LEGACY_ADD_SHAPE_PATCH = /* @__PURE__ */ Symbol.for("melon.runtime.legacyAddShapePatch");
var LEGACY_DETECTOR_PATCH = /* @__PURE__ */ Symbol.for("melon.runtime.legacyDetectorPatch");
var LEGACY_SHOULD_COLLIDE_PATCH = /* @__PURE__ */ Symbol.for("melon.runtime.legacyShouldCollidePatch");
var LEGACY_ANIMATION_PATCH = /* @__PURE__ */ Symbol.for("melon.runtime.legacyAnimationPatch");
var SAFE_FRAME_ANIMATION_UPDATE_PATCH = /* @__PURE__ */ Symbol.for("melon.runtime.safeFrameAnimationUpdatePatch");
var PORTABLE_MATTER_FILTER_PATCH = /* @__PURE__ */ Symbol.for("melon.runtime.portableMatterFilterPatch");
var PORTABLE_PHYSICS_VISUAL_PATCH = /* @__PURE__ */ Symbol.for("melon.runtime.portablePhysicsVisualPatch");
function hasNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}
function collisionMetadata(shape, options = {}) {
  const metadata = {};
  const copy = (target, ...sources) => {
    const source = sources.find((value) => value !== void 0);
    if (source !== void 0) metadata[target] = source;
  };
  copy("collisionType", options.collisionType, shape?.collisionType);
  copy("collisionMask", options.collisionMask, shape?.collisionMask);
  copy("isTrigger", options.isTrigger, shape?.isTrigger);
  copy("isActive", options.isActive, shape?.isActive);
  copy("name", options.name, shape?.name);
  copy("debugColor", options.debugColor, options.color, shape?.debugColor);
  return metadata;
}
function applyCollisionMetadata(shape, metadata) {
  if (!shape || typeof shape !== "object") return shape;
  for (const [key, value] of Object.entries(metadata)) {
    shape[key] = value;
  }
  if (shape.isActive === void 0) shape.isActive = true;
  if (shape.isTrigger === void 0) shape.isTrigger = false;
  return shape;
}
function syncLegacyBodyFilter(body) {
  if (!body || !Array.isArray(body.shapes)) return body;
  let state = legacyBodyFilterState.get(body);
  if (!state) {
    state = {
      baseType: body.collisionType,
      baseMask: body.collisionMask,
      sensorManaged: false
    };
    legacyBodyFilterState.set(body, state);
  }
  const active = body.shapes.filter((shape) => shape?.isActive !== false);
  const hasShapeFilters = active.some(
    (shape) => hasNumber(shape?.collisionType) || hasNumber(shape?.collisionMask)
  );
  if (hasShapeFilters && active.length > 0) {
    let combinedType = 0;
    let combinedMask = 0;
    let hasType = false;
    let hasMask = false;
    for (const shape of active) {
      const type = hasNumber(shape?.collisionType) ? shape.collisionType : state.baseType;
      const mask = hasNumber(shape?.collisionMask) ? shape.collisionMask : state.baseMask;
      if (hasNumber(type)) {
        combinedType |= type;
        hasType = true;
      }
      if (hasNumber(mask)) {
        combinedMask |= mask;
        hasMask = true;
      }
    }
    if (hasType) body.collisionType = combinedType;
    if (hasMask) body.collisionMask = combinedMask;
  }
  const hasTrigger = active.some((shape) => shape?.isTrigger === true);
  if (hasTrigger || state.sensorManaged) {
    if (typeof body.setSensor === "function") body.setSensor(hasTrigger);
    else body.isSensor = hasTrigger;
    state.sensorManaged = hasTrigger;
  }
  return body;
}
function installLegacyAddShapeCompatibility(engine2) {
  const prototype = engine2?.Body?.prototype;
  const addShape = prototype?.addShape;
  if (typeof addShape !== "function" || addShape[LEGACY_ADD_SHAPE_PATCH]) return false;
  function runtimeCompatibleAddShape(shape, options) {
    const previousLength = Array.isArray(this.shapes) ? this.shapes.length : 0;
    const metadata = collisionMetadata(shape, options);
    const result = addShape.call(this, shape, options);
    const added = Array.isArray(this.shapes) ? this.shapes.slice(previousLength) : [];
    for (const storedShape of added) applyCollisionMetadata(storedShape, metadata);
    syncLegacyBodyFilter(this);
    return result;
  }
  Object.defineProperty(runtimeCompatibleAddShape, LEGACY_ADD_SHAPE_PATCH, {
    value: addShape
  });
  prototype.addShape = runtimeCompatibleAddShape;
  return true;
}
function applyLegacyAnimationCompletion(target, frameAnimation, resetAnim) {
  if (typeof resetAnim === "string") {
    frameAnimation._animSpeed = 1;
    frameAnimation.resetAnim = () => target.setCurrentAnimation(resetAnim, null, true);
  } else if (typeof resetAnim === "function") {
    frameAnimation._animSpeed = 1;
    frameAnimation.resetAnim = resetAnim;
  } else if (resetAnim !== null && typeof resetAnim === "object") {
    const onComplete = resetAnim.onComplete;
    frameAnimation._animSpeed = typeof resetAnim.speed === "number" ? resetAnim.speed : 1;
    if (typeof resetAnim.next === "string") {
      const next = resetAnim.next;
      frameAnimation.resetAnim = () => {
        if (typeof onComplete === "function") onComplete();
        target.setCurrentAnimation(next, null, true);
      };
    } else if (resetAnim.loop === false) {
      frameAnimation.resetAnim = () => {
        if (typeof onComplete === "function") onComplete();
        frameAnimation._animDone = true;
        return false;
      };
    } else if (typeof onComplete === "function") {
      frameAnimation.resetAnim = () => onComplete();
    } else {
      frameAnimation.resetAnim = void 0;
    }
  } else {
    frameAnimation.resetAnim = void 0;
  }
}
function resolveLegacyGeneratedDefault(target, name, resetAnim) {
  const frameAnimation = target?._frameAnim;
  const animations = frameAnimation?.anim ?? target?.anim;
  const current = frameAnimation?.current ?? target?.current;
  const isConstructorDefault = typeof current?.name === "undefined" || current.name === "default";
  if (typeof resetAnim !== "undefined" || !animations || Object.prototype.hasOwnProperty.call(animations, name) || !isConstructorDefault) {
    return name;
  }
  const candidates = Object.keys(animations).filter(
    (animationName) => animationName !== "default" && animationName !== "undefined"
  );
  return candidates.includes("idle") ? "idle" : candidates.find((animationName) => (animations[animationName]?.length ?? 0) > 0) ?? candidates[0] ?? name;
}
function installSafeFrameAnimationUpdate(frameAnimation) {
  const update = frameAnimation?.update;
  if (typeof update !== "function" || update[SAFE_FRAME_ANIMATION_UPDATE_PATCH]) return false;
  function runtimeCompatibleFrameAnimationUpdate(dt) {
    let changed = false;
    let frame = this.anim?.[this.current?.name]?.frames?.[this.current?.idx];
    if (!this.animationpause && !this._animDone && (this.current?.length ?? 0) > 1 && frame) {
      let duration = frame.delay;
      this.dt += dt * this._animSpeed;
      while (duration > 0 && this.dt >= duration) {
        changed = true;
        this.dt -= duration;
        this.setAnimationFrame(this.current.length > 1 ? this.current.idx + 1 : this.current.idx);
        if (this.current.idx === 0) {
          if (typeof this.host?.onended === "function") this.host.onended();
          if (!this.anim?.[this.current?.name]) {
            this.dt = 0;
            break;
          }
          if (typeof this.resetAnim === "function") {
            const shouldContinue = this.resetAnim();
            if (!this.anim?.[this.current?.name]) {
              this.dt = 0;
              break;
            }
            if (shouldContinue === false) {
              this.setAnimationFrame(this.current.length - 1);
              this.dt %= duration;
              break;
            }
          }
        }
        frame = this.anim?.[this.current?.name]?.frames?.[this.current?.idx];
        if (!frame) {
          this.dt = 0;
          break;
        }
        duration = frame.delay;
        if (duration <= 0) {
          this.dt = 0;
          break;
        }
      }
    }
    return changed;
  }
  Object.defineProperty(runtimeCompatibleFrameAnimationUpdate, SAFE_FRAME_ANIMATION_UPDATE_PATCH, {
    value: update
  });
  frameAnimation.update = runtimeCompatibleFrameAnimationUpdate;
  return true;
}
function installLegacyAnimationCompatibility(engine2) {
  let installed = false;
  for (const AnimationHost of [engine2?.Sprite, engine2?.Sprite3d]) {
    let runtimeCompatibleSetCurrentAnimation = function(name, resetAnim, preserveDt = false) {
      const compatibleName = resolveLegacyGeneratedDefault(this, name, resetAnim);
      const frameAnimation = this?._frameAnim;
      installSafeFrameAnimationUpdate(frameAnimation);
      const sameAnimationWasActive = frameAnimation && frameAnimation._animDone !== true && typeof this.isCurrentAnimation === "function" && this.isCurrentAnimation(compatibleName);
      const result = setCurrentAnimation.call(this, compatibleName, resetAnim, preserveDt);
      if (sameAnimationWasActive && this._frameAnim === frameAnimation) {
        applyLegacyAnimationCompletion(this, frameAnimation, resetAnim);
        this.isDirty = true;
      }
      return result;
    };
    const prototype = AnimationHost?.prototype;
    const setCurrentAnimation = prototype?.setCurrentAnimation;
    if (typeof setCurrentAnimation !== "function" || setCurrentAnimation[LEGACY_ANIMATION_PATCH]) {
      continue;
    }
    Object.defineProperty(runtimeCompatibleSetCurrentAnimation, LEGACY_ANIMATION_PATCH, {
      value: setCurrentAnimation
    });
    prototype.setCurrentAnimation = runtimeCompatibleSetCurrentAnimation;
    installed = true;
  }
  return installed;
}
function shapeFilter(shape, body) {
  return {
    type: hasNumber(shape?.collisionType) ? shape.collisionType : body.collisionType,
    mask: hasNumber(shape?.collisionMask) ? shape.collisionMask : body.collisionMask
  };
}
function shapePairCanCollide(shapeA, bodyA, shapeB, bodyB) {
  if (shapeA?.isActive === false || shapeB?.isActive === false) return false;
  const a = shapeFilter(shapeA, bodyA);
  const b = shapeFilter(shapeB, bodyB);
  if (!hasNumber(a.type) || !hasNumber(a.mask) || !hasNumber(b.type) || !hasNumber(b.mask)) {
    return true;
  }
  return (a.mask & b.type) !== 0 && (a.type & b.mask) !== 0;
}
function detectorUsesBodyFiltering(detector) {
  if (typeof detector?.shouldCollide !== "function") return false;
  const object = (type, mask) => ({
    isKinematic: false,
    body: { collisionType: type, collisionMask: mask, isStatic: false, shapes: [{}] }
  });
  try {
    return detector.shouldCollide(object(1, 0), object(2, 0)) === false;
  } catch {
    return false;
  }
}
function installLegacyDetectorCompatibility(detector) {
  const collides = detector?.collides;
  const shouldCollide = detector?.shouldCollide;
  if (typeof collides !== "function" || !detectorUsesBodyFiltering(detector)) return false;
  let installed = false;
  if (typeof shouldCollide === "function" && !shouldCollide[LEGACY_SHOULD_COLLIDE_PATCH]) {
    let runtimeCompatibleShouldCollide = function(objectA, objectB) {
      syncLegacyBodyFilter(objectA?.body);
      syncLegacyBodyFilter(objectB?.body);
      return shouldCollide.call(this, objectA, objectB);
    };
    Object.defineProperty(runtimeCompatibleShouldCollide, LEGACY_SHOULD_COLLIDE_PATCH, {
      value: shouldCollide
    });
    detector.shouldCollide = runtimeCompatibleShouldCollide;
    installed = true;
  }
  if (collides[LEGACY_DETECTOR_PATCH]) return installed;
  function runtimeCompatibleCollides(bodyA, bodyB, response = this.response) {
    if (!Array.isArray(bodyA?.shapes) || !Array.isArray(bodyB?.shapes)) {
      return collides.call(this, bodyA, bodyB, response);
    }
    const shapesA = bodyA.shapes;
    const shapesB = bodyB.shapes;
    try {
      for (let indexA = shapesA.length - 1; indexA >= 0; indexA--) {
        for (let indexB = shapesB.length - 1; indexB >= 0; indexB--) {
          const shapeA = shapesA[indexA];
          const shapeB = shapesB[indexB];
          if (!shapePairCanCollide(shapeA, bodyA, shapeB, bodyB)) continue;
          bodyA.shapes = [shapeA];
          bodyB.shapes = [shapeB];
          if (collides.call(this, bodyA, bodyB, response)) {
            response.indexShapeA = indexA;
            response.indexShapeB = indexB;
            return true;
          }
        }
      }
      return false;
    } finally {
      bodyA.shapes = shapesA;
      bodyB.shapes = shapesB;
    }
  }
  Object.defineProperty(runtimeCompatibleCollides, LEGACY_DETECTOR_PATCH, {
    value: collides
  });
  detector.collides = runtimeCompatibleCollides;
  return true;
}
function positionOf(object) {
  return object.pos ?? object;
}
function bodyOf(object) {
  if (!object.body) {
    throw new Error(`Melon Runtime: object "${object.name ?? "tanpa nama"}" tidak memiliki body.`);
  }
  return object.body;
}
function animationTarget(object) {
  return object.renderable?.setCurrentAnimation ? object.renderable : object;
}
function renderableTarget(object) {
  return object.renderable ?? object;
}
function spriteTarget(object) {
  const target = animationTarget(object);
  if (!target || typeof target !== "object") {
    throw new Error("Melon Runtime: object ini tidak memiliki Sprite.");
  }
  return target;
}
function requireMethod(target, method, message) {
  if (typeof target?.[method] !== "function") {
    throw new Error(message);
  }
  return target[method].bind(target);
}
function createMelonJsAdapter(engine2, options = {}) {
  const engineVersion = options.engineVersion ?? "17.4.0";
  const adapterName = options.adapterName ?? `melonjs-${engineVersion}`;
  const application = options.application ?? engine2?.game;
  const audio2 = options.audio ?? engine2?.audio;
  const collisionLifecycle = options.collisionLifecycle ?? "editor-events";
  const persistentTimers = options.persistentTimers !== false;
  const nativeShapeCollision = options.nativeShapeCollision === true;
  const collisionSnapshots = /* @__PURE__ */ new WeakMap();
  const pendingPhysics = /* @__PURE__ */ new WeakMap();
  const collisionFlipStates = /* @__PURE__ */ new WeakMap();
  const portableShapeIndexes = /* @__PURE__ */ new WeakMap();
  const portableCollisionCallbacks = /* @__PURE__ */ new WeakSet();
  const activeCollisionContacts = /* @__PURE__ */ new WeakMap();
  const rejectedMatterPairs = /* @__PURE__ */ new WeakMap();
  const physicsVisualStates = /* @__PURE__ */ new Map();
  const constructorBodies = /* @__PURE__ */ new WeakMap();
  if (!application || !engine2?.input || !engine2?.state) {
    throw new Error(`Melon Runtime: modul engine ${engineVersion} tidak lengkap.`);
  }
  const matchesEngineVersion = options.minimumEngineMajor === void 0 ? String(engine2.version) === engineVersion : Number(String(engine2.version).trim().match(/^(\d+)(?:\.|$)/)?.[1]) >= options.minimumEngineMajor;
  if (engine2.version && !matchesEngineVersion) {
    throw new Error(`Melon Runtime: adapter ${engineVersion} tidak cocok dengan engine ${engine2.version}.`);
  }
  const particle2D = createMelonJsParticleSystem2DBridge(engine2, application, { engineVersion });
  let gameData = null;
  if (!nativeShapeCollision) installLegacyAddShapeCompatibility(engine2);
  installLegacyAnimationCompatibility(engine2);
  function physicsAdapter() {
    return application.world?.adapter;
  }
  function prepareCollisionBody(object) {
    const previousConstructorBody = constructorBodies.get(object);
    if (object.body && object.body !== previousConstructorBody) return object.body;
    const definition = object.bodyDef;
    if (!definition || !Array.isArray(definition.shapes)) {
      throw new Error("Melon Runtime: bodyDef belum tersedia untuk constructor body.");
    }
    if (typeof engine2.Body !== "function") {
      throw new Error(`Melon Runtime: engine ${engineVersion} tidak menyediakan Body.`);
    }
    const body = new engine2.Body(object, definition.shapes, (updatedBody) => {
      definition.shapes = updatedBody.shapes;
    });
    body.setStatic?.(definition.type === "static");
    if (hasNumber(definition.collisionType)) body.collisionType = definition.collisionType;
    if (hasNumber(definition.collisionMask)) body.collisionMask = definition.collisionMask;
    if (definition.frictionAir !== void 0) {
      const friction = typeof definition.frictionAir === "number" ? { x: definition.frictionAir, y: definition.frictionAir } : definition.frictionAir;
      body.setFriction?.(friction?.x ?? 0, friction?.y ?? 0);
    }
    if (hasNumber(definition.restitution)) body.bounce = definition.restitution;
    if (hasNumber(definition.density)) body.mass = definition.density;
    if (hasNumber(definition.gravityScale)) body.gravityScale = definition.gravityScale;
    if (definition.maxVelocity !== void 0) {
      body.setMaxVelocity?.(
        definition.maxVelocity?.x ?? 490,
        definition.maxVelocity?.y ?? 490
      );
    }
    if (definition.isSensor === true) {
      if (typeof body.setSensor === "function") body.setSensor(true);
      else body.isSensor = true;
    }
    object.body = body;
    constructorBodies.set(object, body);
    return body;
  }
  function syncConstructorBodyDefinition(renderable, definition) {
    const body = constructorBodies.get(renderable);
    if (!body || renderable.body !== body || !definition) return null;
    definition.shapes = Array.isArray(body.shapes) ? body.shapes.slice() : definition.shapes;
    definition.type = body.isStatic === true ? "static" : "dynamic";
    if (hasNumber(body.collisionType)) definition.collisionType = body.collisionType;
    if (hasNumber(body.collisionMask)) definition.collisionMask = body.collisionMask;
    if (hasNumber(body.gravityScale)) definition.gravityScale = body.gravityScale;
    if (hasNumber(body.bounce)) definition.restitution = body.bounce;
    if (hasNumber(body.mass)) definition.density = body.mass;
    if (body.friction) {
      definition.frictionAir = { x: body.friction.x ?? 0, y: body.friction.y ?? 0 };
    }
    if (body.maxVel) {
      definition.maxVelocity = { x: body.maxVel.x ?? 490, y: body.maxVel.y ?? 490 };
    }
    definition.isSensor = body.isSensor === true;
    const velocity = body.vel ?? (typeof body.getVelocity === "function" ? body.getVelocity() : null);
    return {
      body,
      velocity: velocity ? { x: velocity.x ?? 0, y: velocity.y ?? 0 } : null,
      force: body.force ? { x: body.force.x ?? 0, y: body.force.y ?? 0 } : null
    };
  }
  function usesPortablePhysicsAdapter() {
    const label = physicsAdapter()?.physicLabel;
    return label === "matter" || label === "planck";
  }
  function matterPartCanCollide(pair) {
    const partA = pair?.collision?.bodyA ?? pair?.bodyA;
    const partB = pair?.collision?.bodyB ?? pair?.bodyB;
    const filterA = partA?.collisionFilter;
    const filterB = partB?.collisionFilter;
    if (!filterA || !filterB) return true;
    return (filterA.mask & filterB.category) !== 0 && (filterA.category & filterB.mask) !== 0;
  }
  function installPortableMatterShapeFiltering() {
    const adapter = physicsAdapter();
    const dispatch = adapter?._dispatchCollisions;
    if (!adapter?.matter || !adapter?.engine || typeof dispatch !== "function" || dispatch[PORTABLE_MATTER_FILTER_PATCH]) return false;
    function runtimeCompatibleMatterDispatch(pairs, phase) {
      const accepted = [];
      for (const pair of pairs) {
        if (!matterPartCanCollide(pair)) {
          if (!rejectedMatterPairs.has(pair)) {
            rejectedMatterPairs.set(pair, pair.isSensor === true);
          }
          pair.isSensor = true;
          if (phase === "end") rejectedMatterPairs.delete(pair);
          continue;
        }
        if (rejectedMatterPairs.has(pair)) {
          pair.isSensor = rejectedMatterPairs.get(pair);
          rejectedMatterPairs.delete(pair);
        }
        accepted.push(pair);
      }
      return dispatch.call(this, accepted, phase);
    }
    Object.defineProperty(runtimeCompatibleMatterDispatch, PORTABLE_MATTER_FILTER_PATCH, {
      value: dispatch
    });
    adapter._dispatchCollisions = runtimeCompatibleMatterDispatch;
    return true;
  }
  function affineValues(values) {
    if (values.length === 16) {
      return [values[0], values[1], values[4], values[5], values[12], values[13]];
    }
    if (values.length === 9) {
      return [values[0], values[1], values[3], values[4], values[6], values[7]];
    }
    return values;
  }
  function withAffineValues(template, affine) {
    const result = Array.from(template);
    if (result.length === 16) {
      result[0] = affine[0];
      result[1] = affine[1];
      result[4] = affine[2];
      result[5] = affine[3];
      result[12] = affine[4];
      result[13] = affine[5];
    } else {
      result[0] = affine[0];
      result[1] = affine[1];
      result[3] = affine[2];
      result[4] = affine[3];
      result[6] = affine[4];
      result[7] = affine[5];
    }
    return result;
  }
  function affineMultiply(left, right) {
    const a = affineValues(left);
    const b = affineValues(right);
    return withAffineValues(right, [
      a[0] * b[0] + a[2] * b[1],
      a[1] * b[0] + a[3] * b[1],
      a[0] * b[2] + a[2] * b[3],
      a[1] * b[2] + a[3] * b[3],
      a[0] * b[4] + a[2] * b[5] + a[4],
      a[1] * b[4] + a[3] * b[5] + a[5]
    ]);
  }
  function rotationAround(angle, x, y) {
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    return [
      cosine,
      sine,
      -sine,
      cosine,
      x - cosine * x + sine * y,
      y - sine * x - cosine * y
    ];
  }
  function matrixChanged(matrix, expected) {
    const values = matrix?.val;
    if (!values || !expected || values.length < 9) return false;
    for (let index = 0; index < 9; index++) {
      if (Math.abs(values[index] - expected[index]) > 1e-6) return true;
    }
    return false;
  }
  function capturePhysicsVisualState(renderable, body) {
    const adapter = physicsAdapter();
    if (!renderable?.currentTransform?.val || !renderable.pos) return;
    const isPlanck = !!adapter?.planck && typeof body?.getPosition === "function";
    if (!isPlanck && (!adapter?.matter || !body?.position)) return;
    const position = isPlanck ? body.getPosition() : body.position;
    const units = isPlanck ? adapter.pixelsPerMeter : 1;
    const pivotX = position.x * units - renderable.pos.x;
    const pivotY = position.y * units - renderable.pos.y;
    const existing = physicsVisualStates.get(renderable);
    if (existing) {
      existing.body = body;
      existing.pivotX = pivotX;
      existing.pivotY = pivotY;
      return;
    }
    const base = Array.from(renderable.currentTransform.val);
    physicsVisualStates.set(renderable, {
      body,
      base,
      lastApplied: base.slice(),
      pivotX,
      pivotY,
      lastAngle: 0
    });
  }
  function installPortablePhysicsVisualSync() {
    const adapter = physicsAdapter();
    const syncFromPhysics = adapter?.syncFromPhysics;
    if (!(adapter?.matter || adapter?.planck) || typeof syncFromPhysics !== "function" || syncFromPhysics[PORTABLE_PHYSICS_VISUAL_PATCH]) return false;
    function runtimeCompatiblePhysicsVisualSync(...args) {
      for (const [renderable, state] of physicsVisualStates) {
        if (renderable?.body !== state.body || !renderable.currentTransform) {
          physicsVisualStates.delete(renderable);
          continue;
        }
        if (matrixChanged(renderable.currentTransform, state.lastApplied)) {
          state.base = affineMultiply(
            rotationAround(-state.lastAngle, state.pivotX, state.pivotY),
            Array.from(renderable.currentTransform.val)
          );
        }
      }
      const result = syncFromPhysics.apply(this, args);
      for (const [renderable, state] of physicsVisualStates) {
        if (renderable?.body !== state.body || !renderable.currentTransform) continue;
        const angle = adapter.planck ? state.body.getAngle() : state.body.angle;
        const desired = affineMultiply(
          rotationAround(angle, state.pivotX, state.pivotY),
          state.base
        );
        renderable.currentTransform.setTransform(...desired);
        state.lastApplied = desired;
        state.lastAngle = angle;
        renderable.updateBounds?.();
        renderable.isDirty = true;
      }
      return result;
    }
    Object.defineProperty(runtimeCompatiblePhysicsVisualSync, PORTABLE_PHYSICS_VISUAL_PATCH, {
      value: syncFromPhysics
    });
    adapter.syncFromPhysics = runtimeCompatiblePhysicsVisualSync;
    return true;
  }
  function collisionTarget(target) {
    if (Array.isArray(target?.shapes) && typeof target?.addShape === "function") {
      return { body: target, object: target.ancestor };
    }
    if (target?.body) return { body: target.body, object: target };
    if (Array.isArray(target?.bodyDef?.shapes)) {
      return { body: null, object: target };
    }
    throw new Error("Melon Runtime: target collision tidak memiliki body.");
  }
  function collisionShape(target, body, object) {
    const descriptors = collisionShapeDescriptors(object);
    const numeric = typeof target === "number" || /^\d+$/.test(String(target));
    if (descriptors) {
      const descriptor = descriptors.find((entry, index) => numeric ? (entry.index ?? index) === Number(target) : entry.name === String(target) || entry.shape === target);
      if (descriptor?.shape) return descriptor.shape;
    }
    if (numeric) return body?.shapes?.[Number(target)] ?? object?.bodyDef?.shapes?.[Number(target)];
    if (body?.shapes?.includes(target) || object?.bodyDef?.shapes?.includes(target)) return target;
    return body?.shapes?.find((shape) => shape?.name === String(target));
  }
  function syncCollisionTarget(body, object) {
    const portablePhysics = usesPortablePhysicsAdapter();
    if (!nativeShapeCollision || portablePhysics) syncLegacyBodyFilter(body);
    if (object?.bodyDef && Array.isArray(object.bodyDef.shapes)) {
      if (!body) installPendingPhysicsFlush();
      if (!nativeShapeCollision || portablePhysics) {
        const active = object.bodyDef.shapes.filter((shape) => shape?.isActive !== false);
        const types = active.map((shape) => shape?.collisionType).filter(hasNumber);
        const masks = active.map((shape) => shape?.collisionMask).filter(hasNumber);
        if (types.length > 0) object.bodyDef.collisionType = types.reduce((value, type) => value | type, 0);
        if (masks.length > 0) object.bodyDef.collisionMask = masks.reduce((value, mask) => value | mask, 0);
        if (active.some((shape) => shape?.isTrigger === true)) object.bodyDef.isSensor = true;
        applyPortableShapeFilters(object.bodyDef, body);
      }
    }
    installPortableCollisionCallbacks(object);
    return body ?? object?.bodyDef;
  }
  function applyPortableShapeFilters(definition, body) {
    if (!Array.isArray(definition?.shapes) || !body) return;
    const shapes = definition.shapes;
    const typeOf = (shape) => typeof shape?.collisionType === "number" ? shape.collisionType : definition.collisionType;
    const maskOf = (shape) => typeof shape?.collisionMask === "number" ? shape.collisionMask : definition.collisionMask;
    if (typeof body.getFixtureList === "function") {
      const fixtures = [];
      for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
        fixtures.push(fixture);
      }
      fixtures.reverse().forEach((fixture, index) => {
        const shape = shapes[index];
        portableShapeIndexes.set(fixture, index);
        const type = typeOf(shape);
        const mask = maskOf(shape);
        if (typeof type === "number") fixture.setFilterCategoryBits?.(type);
        if (typeof mask === "number") fixture.setFilterMaskBits?.(mask);
      });
      return;
    }
    if (body.collisionFilter) {
      const parts = Array.isArray(body.parts) && body.parts.length > 1 ? body.parts.slice(1) : [body];
      let combinedType = 0;
      let combinedMask = 0;
      parts.forEach((part, index) => {
        const shape = shapes[index];
        portableShapeIndexes.set(part, index);
        const type = typeOf(shape);
        const mask = maskOf(shape);
        if (typeof type === "number") {
          part.collisionFilter.category = type;
          combinedType |= type;
        }
        if (typeof mask === "number") {
          part.collisionFilter.mask = mask;
          combinedMask |= mask;
        }
      });
      if (parts.length > 1) {
        if (combinedType !== 0) body.collisionFilter.category = combinedType;
        if (combinedMask !== 0) body.collisionFilter.mask = combinedMask;
      }
    }
  }
  function portableContactShape(object, response) {
    if (!object || !response?.pair) return null;
    const body = object.body;
    const pair = response.pair;
    let physicalIndex = -1;
    if (typeof pair.getFixtureA === "function") {
      const fixtures = [pair.getFixtureA(), pair.getFixtureB()];
      const fixture = fixtures.find((item) => item?.getBody?.() === body);
      if (fixture) {
        physicalIndex = portableShapeIndexes.get(fixture) ?? -1;
        if (physicalIndex < 0 && typeof body?.getFixtureList === "function") {
          const ordered = [];
          for (let item = body.getFixtureList(); item; item = item.getNext()) {
            ordered.push(item);
          }
          physicalIndex = ordered.reverse().indexOf(fixture);
        }
      }
    } else {
      const candidates = [
        pair.bodyA,
        pair.bodyB,
        pair.collision?.bodyA,
        pair.collision?.bodyB
      ];
      const part = candidates.find((item) => item === body || item?.parent === body);
      if (part) {
        physicalIndex = portableShapeIndexes.get(part) ?? -1;
        if (physicalIndex < 0) {
          const parts = Array.isArray(body?.parts) && body.parts.length > 1 ? body.parts.slice(1) : [body];
          physicalIndex = parts.indexOf(part);
        }
      }
    }
    if (physicalIndex < 0) return null;
    const shapes = collisionShapes(object);
    const shape = shapes[physicalIndex];
    if (!shape) return null;
    return {
      physicalIndex,
      logicalIndex: logicalShapeIndex(object, physicalIndex),
      shape
    };
  }
  function collisionTypeForContact(object, contact) {
    return contact?.shape?.collisionType ?? object?.bodyDef?.collisionType ?? object?.body?.collisionType;
  }
  function enrichPortableCollisionResponse(response, object, other) {
    if (!response || typeof response !== "object") {
      return response;
    }
    const selfContact = portableContactShape(object, response);
    const otherContact = portableContactShape(other, response);
    const selfSide = response.a === object ? "A" : response.b === object ? "B" : "A";
    const otherSide = selfSide === "A" ? "B" : "A";
    if (selfContact) {
      response[`indexShape${selfSide}`] = selfContact.logicalIndex;
      response[`shape${selfSide}`] = selfContact.shape;
      response[`collisionType${selfSide}`] = collisionTypeForContact(object, selfContact);
    }
    if (otherContact) {
      response[`indexShape${otherSide}`] = otherContact.logicalIndex;
      response[`shape${otherSide}`] = otherContact.shape;
      response[`collisionType${otherSide}`] = collisionTypeForContact(other, otherContact);
    }
    if (typeof response.overlap !== "number" && typeof response.depth === "number") {
      response.overlap = response.depth;
    }
    if (!response.overlapN && response.normal) {
      response.overlapN = { x: response.normal.x, y: response.normal.y };
    }
    if (!response.overlapV && response.overlapN) {
      response.overlapV = {
        x: response.overlapN.x * (Number(response.overlap) || 0),
        y: response.overlapN.y * (Number(response.overlap) || 0)
      };
    }
    response.aInB ?? (response.aInB = false);
    response.bInA ?? (response.bInA = false);
    response.__melonNormalized = true;
    return response;
  }
  function withPortableCollisionContext(object, other, response, callback) {
    const previousSelf = activeCollisionContacts.get(object);
    const previousOther = activeCollisionContacts.get(other);
    const selfContact = portableContactShape(object, response);
    const otherContact = portableContactShape(other, response);
    if (selfContact) activeCollisionContacts.set(object, selfContact);
    if (otherContact) activeCollisionContacts.set(other, otherContact);
    try {
      return callback();
    } finally {
      if (previousSelf) activeCollisionContacts.set(object, previousSelf);
      else activeCollisionContacts.delete(object);
      if (previousOther) activeCollisionContacts.set(other, previousOther);
      else activeCollisionContacts.delete(other);
    }
  }
  function installPortableCollisionCallbacks(renderable) {
    if (!renderable || !usesPortablePhysicsAdapter()) return;
    ["onCollisionStart", "onCollisionActive", "onCollision", "onCollisionEnd"].forEach((method) => {
      const callback = renderable[method];
      if (typeof callback !== "function" || portableCollisionCallbacks.has(callback)) return;
      const wrapped = function portableCollisionCallback(response, other, ...args) {
        const enriched = enrichPortableCollisionResponse(response, this, other);
        return withPortableCollisionContext(
          this,
          other,
          enriched,
          () => callback.call(this, enriched, other, ...args)
        );
      };
      portableCollisionCallbacks.add(wrapped);
      renderable[method] = wrapped;
    });
  }
  function installPendingPhysicsFlush() {
    const adapter = physicsAdapter();
    if (!adapter || typeof adapter.addBody !== "function") return false;
    if (physicsAdaptersWithPendingFlush.has(adapter)) return true;
    const addBody = adapter.addBody;
    adapter.addBody = function runtimeCompatibleAddBody(renderable, definition) {
      const constructorState = syncConstructorBodyDefinition(renderable, definition);
      const body = addBody.call(this, renderable, definition);
      if (constructorState && body !== constructorState.body) {
        const velocity = constructorState.velocity;
        if (velocity && (velocity.x !== 0 || velocity.y !== 0)) {
          if (typeof this.setVelocity === "function") {
            this.setVelocity(renderable, velocity);
          } else {
            body.setVelocity?.(velocity.x, velocity.y);
          }
        }
        const force = constructorState.force;
        if (force && (force.x !== 0 || force.y !== 0)) {
          if (typeof this.applyForce === "function") {
            this.applyForce(renderable, force);
          } else {
            body.applyForce?.(force.x, force.y);
          }
        }
      }
      constructorBodies.delete(renderable);
      applyPortableShapeFilters(definition, body);
      capturePhysicsVisualState(renderable, body);
      installPortableCollisionCallbacks(renderable);
      renderable?.__melonFlushPendingPhysics?.();
      return body;
    };
    physicsAdaptersWithPendingFlush.add(adapter);
    return true;
  }
  function canDeferBodyAccess(object) {
    return Boolean(
      object && !object.body && object.bodyDef && installPendingPhysicsFlush()
    );
  }
  function pendingPhysicsState(object) {
    let state = pendingPhysics.get(object);
    if (!state) {
      state = { operations: [], velocity: { x: 0, y: 0 } };
      pendingPhysics.set(object, state);
    }
    return state;
  }
  function deferBodyOperation(object, operation) {
    const state = pendingPhysicsState(object);
    state.operations.push(operation);
    if (typeof object.__melonFlushPendingPhysics !== "function") {
      Object.defineProperty(object, "__melonFlushPendingPhysics", {
        configurable: true,
        enumerable: false,
        value() {
          if (!object.body) return false;
          const pending = pendingPhysics.get(object);
          if (!pending) return true;
          while (pending.operations.length > 0) {
            pending.operations.shift()();
          }
          pendingPhysics.delete(object);
          delete object.__melonFlushPendingPhysics;
          return true;
        }
      });
    }
    return object;
  }
  function withBodyOrDefer(object, operation) {
    if (object.body) {
      operation(object.body);
      return object;
    }
    if (canDeferBodyAccess(object)) {
      return deferBodyOperation(object, () => operation(bodyOf(object)));
    }
    bodyOf(object);
  }
  function readVelocity(object) {
    if (!object.body && canDeferBodyAccess(object)) {
      return pendingPhysicsState(object).velocity;
    }
    const body = bodyOf(object);
    if (typeof body.getVelocity === "function") {
      return body.getVelocity();
    }
    if (typeof physicsAdapter()?.getVelocity === "function") {
      return physicsAdapter().getVelocity(object);
    }
    if (body.vel && typeof body.vel === "object") {
      return body.vel;
    }
    throw new Error("Melon Runtime: velocity body tidak dapat dibaca.");
  }
  function writeVelocity(object, x, y) {
    if (!object.body && canDeferBodyAccess(object)) {
      pendingPhysicsState(object).velocity = { x, y };
      return deferBodyOperation(object, () => writeVelocity(object, x, y));
    }
    const body = bodyOf(object);
    if (typeof body.setVelocity === "function") {
      body.setVelocity(x, y);
    } else if (typeof body.vel?.set === "function") {
      body.vel.set(x, y);
    } else if (body.vel && typeof body.vel === "object") {
      body.vel.x = x;
      body.vel.y = y;
    } else {
      throw new Error("Melon Runtime: velocity body tidak dapat diubah.");
    }
    return object;
  }
  function groundedState(object) {
    if (!object.body && canDeferBodyAccess(object)) return false;
    const body = bodyOf(object);
    if (typeof physicsAdapter()?.isGrounded === "function") {
      return physicsAdapter().isGrounded(object) === true;
    }
    if (typeof body.isGrounded === "function") {
      return body.isGrounded() === true;
    }
    return body.falling !== true && body.jumping !== true;
  }
  function collisionSide(response, object) {
    if (response.a === object) return "a";
    if (response.b === object) return "b";
    throw new Error("Melon Runtime: current object tidak cocok dengan collision response.");
  }
  function collisionShapeDescriptors(object) {
    return Array.isArray(object?.__melonCollisionShapes) ? object.__melonCollisionShapes : null;
  }
  function activeCollisionShapes(object) {
    const descriptors = collisionShapeDescriptors(object);
    if (!descriptors) return null;
    return descriptors.filter((descriptor) => descriptor.isActive !== false).map((descriptor) => descriptor.shape);
  }
  function collisionShapes(object) {
    if (Array.isArray(object?.bodyDef?.shapes)) return object.bodyDef.shapes;
    if (Array.isArray(object?.body?.shapes)) return object.body.shapes;
    const shapes = physicsAdapter()?.getBodyShapes?.(object);
    return Array.isArray(shapes) ? shapes : [];
  }
  function normalizeCoordinate(value) {
    return Object.is(value, -0) ? 0 : value;
  }
  function captureCollisionFlipState(object, target, shapes) {
    let state = collisionFlipStates.get(object);
    if (state && state.shapes.length === shapes.length && state.shapes.every((entry, index) => entry.shape === shapes[index])) {
      return state;
    }
    state = {
      horizontal: false,
      vertical: false,
      shapes: shapes.map((shape) => ({
        shape,
        posX: Number(shape.pos?.x) || 0,
        posY: Number(shape.pos?.y) || 0,
        points: Array.isArray(shape.points) ? shape.points.map((point2) => ({ x: Number(point2.x) || 0, y: Number(point2.y) || 0 })) : null
      })),
      width: Number(target.width ?? object.width) || 0,
      height: Number(target.height ?? object.height) || 0,
      anchorX: Number(target.anchorPoint?.x ?? object.anchorPoint?.x) || 0,
      anchorY: Number(target.anchorPoint?.y ?? object.anchorPoint?.y) || 0
    };
    collisionFlipStates.set(object, state);
    return state;
  }
  function flipCollisionShapes(object, target, horizontal, vertical) {
    const shapes = collisionShapes(object);
    if (shapes.length === 0) return object;
    const state = captureCollisionFlipState(object, target, shapes);
    if (typeof horizontal !== "undefined") state.horizontal = horizontal === true;
    if (typeof vertical !== "undefined") state.vertical = vertical === true;
    const pivotX = state.width * (1 - 2 * state.anchorX);
    const pivotY = state.height * (1 - 2 * state.anchorY);
    const body = object.body;
    body?.bounds?.clear?.();
    state.shapes.forEach((original) => {
      const shape = original.shape;
      if (shape.pos) {
        shape.pos.x = normalizeCoordinate(
          state.horizontal ? pivotX - original.posX : original.posX
        );
        shape.pos.y = normalizeCoordinate(
          state.vertical ? pivotY - original.posY : original.posY
        );
      }
      if (original.points && Array.isArray(shape.points)) {
        shape.points.forEach((point2, index) => {
          point2.x = normalizeCoordinate(
            original.points[index].x * (state.horizontal ? -1 : 1)
          );
          point2.y = normalizeCoordinate(
            original.points[index].y * (state.vertical ? -1 : 1)
          );
        });
        shape.recalc?.();
      }
      shape.updateBounds?.();
      if (typeof body?.bounds?.addBounds === "function" && typeof shape.getBounds === "function") {
        body.bounds.addBounds(shape.getBounds());
      } else if (typeof body?.bounds?.addPoint === "function" && shape.type === "Point") {
        body.bounds.addPoint(shape);
      }
    });
    if (object.bodyDef) object.bodyDef.shapes = shapes;
    const adapter = physicsAdapter();
    if (object.body && typeof adapter?.updateShape === "function") {
      adapter.updateShape(object, shapes.slice());
    } else {
      body?.onBodyUpdate?.(body);
    }
    return object;
  }
  function scaleCollisionShapes(object, target, x, y) {
    const shapes = collisionShapes(object);
    if (shapes.length === 0) return object;
    const flipState = collisionFlipStates.get(object);
    if (flipState && flipState.shapes.length === shapes.length && flipState.shapes.every((entry, index) => entry.shape === shapes[index])) {
      flipState.width *= x;
      flipState.height *= y;
      flipState.shapes.forEach((entry) => {
        entry.posX *= x;
        entry.posY *= y;
        entry.points?.forEach((point2) => {
          point2.x *= x;
          point2.y *= y;
        });
      });
    }
    const body = object.body;
    body?.bounds?.clear?.();
    shapes.forEach((shape) => {
      if (shape.pos) {
        shape.pos.x = normalizeCoordinate((Number(shape.pos.x) || 0) * x);
        shape.pos.y = normalizeCoordinate((Number(shape.pos.y) || 0) * y);
      }
      if (typeof shape.scale === "function") {
        shape.scale(x, y);
      } else if (typeof shape.x === "number" && typeof shape.y === "number") {
        shape.x = normalizeCoordinate(shape.x * x);
        shape.y = normalizeCoordinate(shape.y * y);
      }
      shape.updateBounds?.();
      if (typeof body?.bounds?.addBounds === "function" && typeof shape.getBounds === "function") {
        body.bounds.addBounds(shape.getBounds());
      } else if (typeof body?.bounds?.addPoint === "function" && shape.type === "Point") {
        body.bounds.addPoint(shape);
      }
    });
    if (object.bodyDef) object.bodyDef.shapes = shapes;
    const adapter = physicsAdapter();
    if (object.body && typeof adapter?.updateShape === "function") {
      adapter.updateShape(object, shapes.slice());
    } else {
      body?.onBodyUpdate?.(body);
    }
    target.updateBounds?.();
    target.isDirty = true;
    return object;
  }
  function shapeCollisionTypes(object) {
    const types = [];
    const add = (value) => {
      if (typeof value === "number") types.push(value);
    };
    const descriptors = collisionShapeDescriptors(object);
    if (descriptors) {
      descriptors.forEach((descriptor) => {
        add(descriptor.collisionType);
        add(descriptor.shape?.collisionType);
      });
    }
    collisionShapes(object).forEach((shape) => add(shape?.collisionType));
    return types;
  }
  function logicalShapeIndex(object, physicalIndex) {
    const descriptors = collisionShapeDescriptors(object);
    if (!descriptors || physicalIndex < 0) return physicalIndex;
    const descriptor = descriptors.filter((entry) => entry.isActive !== false)[physicalIndex];
    return descriptor?.index ?? descriptors.indexOf(descriptor);
  }
  function rawCollisionResponse(response) {
    if (response && "indexShapeA" in response && "aInB" in response) return response;
    const current = physicsAdapter()?.detector?.response;
    if (!current || !response) return response;
    const samePair = current.a === response.a && current.b === response.b || current.a === response.b && current.b === response.a;
    return samePair ? current : response;
  }
  function snapshotCollisionResponse(response, object) {
    if (response?.__melonNormalized === true) return response;
    const source = rawCollisionResponse(response) || response || {};
    const side = source.a === object ? "a" : source.b === object ? "b" : "a";
    const other = side === "a" ? source.b : source.a;
    const direction = side === "a" ? 1 : -1;
    const overlapN = source.overlapN || response?.overlapN || { x: 0, y: 0 };
    const overlapV = source.overlapV || response?.overlapV || { x: 0, y: 0 };
    const selfIndex = side === "a" ? source.indexShapeA : source.indexShapeB;
    const otherIndex = side === "a" ? source.indexShapeB : source.indexShapeA;
    const selfInside = side === "a" ? source.aInB : source.bInA;
    const otherInside = side === "a" ? source.bInA : source.aInB;
    return {
      __melonNormalized: true,
      a: object,
      b: other,
      overlap: Number(source.overlap ?? response?.overlap) || 0,
      overlapN: {
        x: (Number(overlapN.x) || 0) * direction,
        y: (Number(overlapN.y) || 0) * direction
      },
      overlapV: {
        x: (Number(overlapV.x) || 0) * direction,
        y: (Number(overlapV.y) || 0) * direction
      },
      aInB: selfInside === true,
      bInA: otherInside === true,
      indexShapeA: logicalShapeIndex(object, Number(selfIndex)),
      indexShapeB: logicalShapeIndex(other, Number(otherIndex))
    };
  }
  function setPortableShapeActive(object, target, enabled) {
    const descriptors = collisionShapeDescriptors(object);
    if (!descriptors || typeof physicsAdapter()?.updateShape !== "function") return false;
    const numericTarget = typeof target === "number" || /^\d+$/.test(String(target));
    const targetIndex = numericTarget ? Number(target) : -1;
    const matches = descriptors.filter((descriptor, index) => numericTarget ? (descriptor.index ?? index) === targetIndex : descriptor.name === String(target));
    if (matches.length === 0) {
      throw new Error(`Melon Runtime: collision shape "${target}" tidak ditemukan.`);
    }
    matches.forEach((descriptor) => {
      descriptor.isActive = enabled;
    });
    const shapes = activeCollisionShapes(object);
    const isSensor = descriptors.some(
      (descriptor) => descriptor.isActive !== false && descriptor.isTrigger === true
    );
    if (object.bodyDef) {
      object.bodyDef.shapes = shapes;
      object.bodyDef.isSensor = isSensor;
    }
    if (object.body) {
      physicsAdapter().updateShape(object, shapes);
      if (typeof physicsAdapter().setSensor === "function") {
        physicsAdapter().setSensor(object, isSensor);
      } else if (typeof object.body.setSensor === "function") {
        object.body.setSensor(isSensor);
      }
    }
    return true;
  }
  function rememberCollisionSnapshot(object, other, response, phase) {
    let contacts = collisionSnapshots.get(object);
    if (!contacts) {
      contacts = /* @__PURE__ */ new WeakMap();
      collisionSnapshots.set(object, contacts);
    }
    let contact;
    if (response) {
      contact = snapshotCollisionResponse(response, object);
      if (other && typeof other === "object") contacts.set(other, contact);
    } else {
      contact = other && typeof other === "object" ? contacts.get(other) : void 0;
      contact ?? (contact = snapshotCollisionResponse({ a: object, b: other }, object));
    }
    if (phase === "exit" && other && typeof other === "object") contacts.delete(other);
    return contact;
  }
  function collisionAxis(axis) {
    const key = String(axis).toLowerCase();
    if (key !== "x" && key !== "y") {
      throw new Error(`Melon Runtime: collision axis "${axis}" tidak dikenal.`);
    }
    return key;
  }
  function collisionParticipant(side) {
    const key = String(side).toLowerCase();
    if (key !== "self" && key !== "other") {
      throw new Error(`Melon Runtime: sisi collision "${side}" tidak dikenal.`);
    }
    return key;
  }
  function collisionType(type) {
    if (typeof type === "number") return type;
    let name = String(type).trim();
    const member = name.match(
      /^(?:game\.)?collisionTypes?\s*(?:\.\s*([A-Za-z_$][\w$]*)|\[\s*["']([^"']+)["']\s*\])$/i
    );
    if (member) name = member[1] ?? member[2];
    if (name.startsWith("@")) name = name.slice(1);
    const key = name.toUpperCase().replace(/\s+/g, "_");
    return gameData?.collisionTypes?.[name] ?? gameData?.collisionTypes?.[key] ?? engine2.collision.types[key] ?? engine2.collision.types[`${key}_OBJECT`];
  }
  function axisValue(axis) {
    const viewport = application.viewport;
    const key = AXIS_NAMES[String(axis).toLowerCase()] ?? "BOTH";
    return viewport.AXIS[key];
  }
  function keyCode(keyName) {
    if (typeof keyName === "number") return keyName;
    const raw = String(keyName).trim();
    const normalized = KEY_ALIASES[raw.toLowerCase()] ?? raw.toUpperCase().replace(/ /g, "_");
    const code = engine2.input.KEY[normalized];
    if (typeof code !== "number") {
      throw new Error(`Melon Runtime: tombol "${keyName}" tidak dikenal.`);
    }
    return code;
  }
  function subscribe(object, eventName, callback) {
    if (!object.events?.on) {
      throw new Error(`Melon Runtime: object "${object.name ?? "tanpa nama"}" tidak mendukung event.`);
    }
    object.events.on(eventName, callback);
    return () => object.events.off(eventName, callback);
  }
  return {
    name: adapterName,
    engineVersion,
    particle2D,
    capabilities: Object.freeze({
      applicationInstance: options.applicationInstance === true,
      applicationBinding: options.application !== void 0 ? "instance" : "singleton",
      collisionLifecycle,
      collisionShapeActivation: collisionLifecycle === "editor-events" || options.portableShapeActivation === true,
      persistentTimers
    }),
    getCapabilities() {
      return Object.freeze({
        adapter: this.capabilities,
        particle2D: detectParticle2DTarget(engineVersion, application, engine2)
      });
    },
    configure(options2 = {}) {
      gameData = options2.gameData ?? gameData;
      if (!nativeShapeCollision) installLegacyAddShapeCompatibility(engine2);
      installLegacyAnimationCompatibility(engine2);
      if (!nativeShapeCollision) {
        installLegacyDetectorCompatibility(physicsAdapter()?.detector);
      }
      installPortableMatterShapeFiltering();
      installPortablePhysicsVisualSync();
      installPendingPhysicsFlush();
    },
    prepareCollisionBody(object) {
      return prepareCollisionBody(object);
    },
    findObjects(name) {
      return application.world?.getChildByName(name) ?? [];
    },
    hasObject(object) {
      return object === application.world || Boolean(object.ancestor);
    },
    spawn(prefabName, options2 = {}) {
      const x = Number(options2.x) || 0;
      const y = Number(options2.y) || 0;
      const settings = options2.settings ?? options2;
      const object = engine2.pool.pull(prefabName, x, y, settings);
      application.world.addChild(object, options2.z);
      return object;
    },
    addObject(object, z) {
      application.world.addChild(object, z);
      return object;
    },
    removeObject(object) {
      const parent = object.ancestor ?? application.world;
      if (!parent?.hasChild?.(object)) return false;
      parent.removeChild(object);
      return true;
    },
    getPosition(object) {
      const position = positionOf(object);
      return {
        x: Number(position.x) || 0,
        y: Number(position.y) || 0,
        z: Number(position.z) || 0
      };
    },
    setPosition(object, x, y, z) {
      const position = positionOf(object);
      if (typeof position.set === "function") position.set(x, y, z ?? position.z);
      else {
        position.x = x;
        position.y = y;
        if (typeof z !== "undefined") position.z = z;
      }
      return object;
    },
    setOpacity(object, opacity) {
      const target = object.renderable?.setOpacity ? object.renderable : object;
      if (typeof target.setOpacity !== "function") {
        throw new Error("Melon Runtime: object ini tidak mendukung opacity.");
      }
      target.setOpacity(clamp(Number(opacity) || 0, 0, 1));
      return object;
    },
    rotate(object, degrees2) {
      const target = object.renderable?.rotate ? object.renderable : object;
      if (typeof target.rotate !== "function") {
        throw new Error("Melon Runtime: object ini tidak dapat diputar.");
      }
      target.rotate(Number(degrees2) * Math.PI / 180);
      return object;
    },
    scale(object, x, y, options2 = {}) {
      const target = object.renderable?.scale ? object.renderable : object;
      if (typeof target.scale !== "function") {
        throw new Error("Melon Runtime: object ini tidak dapat diubah ukurannya.");
      }
      if (engineVersion === "17.4.0") target.scale(x, y);
      else target.scale(x, y, options2.z ?? 1);
      if (options2.withCollision === true) {
        scaleCollisionShapes(object, target, x, y);
      }
      return object;
    },
    flip(object, horizontal, vertical, withCollision = false) {
      const target = object.renderable?.flipX ? object.renderable : object;
      const hasNativeCollisionFlip = engineVersion === "17.4.0";
      if (typeof horizontal !== "undefined" && typeof target.flipX === "function") {
        target.flipX(horizontal === true, hasNativeCollisionFlip && withCollision === true);
      }
      if (typeof vertical !== "undefined" && typeof target.flipY === "function") {
        target.flipY(vertical === true, hasNativeCollisionFlip && withCollision === true);
      }
      if (withCollision === true && !hasNativeCollisionFlip) {
        flipCollisionShapes(object, target, horizontal, vertical);
      }
      return object;
    },
    flickerSprite(object, duration, onComplete) {
      const target = spriteTarget(object);
      requireMethod(
        target,
        "flicker",
        "Melon Runtime: object ini tidak mendukung efek flicker."
      )(duration, onComplete);
      return object;
    },
    isSpriteFlickering(object) {
      const target = spriteTarget(object);
      return requireMethod(
        target,
        "isFlickering",
        "Melon Runtime: object ini tidak mendukung status flicker."
      )() === true;
    },
    setSpriteTint(object, color) {
      const target = renderableTarget(object);
      if (typeof target.tint?.parseCSS !== "function") {
        throw new Error("Melon Runtime: object ini tidak mendukung tint warna.");
      }
      target.tint.parseCSS(color);
      return object;
    },
    setSpriteBlendMode(object, mode) {
      const target = renderableTarget(object);
      if (!("blendMode" in target)) {
        throw new Error("Melon Runtime: object ini tidak mendukung blend mode.");
      }
      target.blendMode = mode;
      return object;
    },
    setSpriteAnchor(object, x, y) {
      const target = renderableTarget(object);
      if (typeof target.anchorPoint?.set !== "function") {
        throw new Error("Melon Runtime: object ini tidak memiliki anchor point.");
      }
      target.anchorPoint.set(x, y);
      return object;
    },
    setSpriteOffset(object, x, y) {
      const target = spriteTarget(object);
      if (typeof target.offset?.set !== "function") {
        throw new Error("Melon Runtime: object ini tidak mendukung source offset.");
      }
      target.offset.set(x, y);
      return object;
    },
    setSpriteAnimationSpeed(object, milliseconds) {
      const target = spriteTarget(object);
      if (!("animationspeed" in target)) {
        throw new Error("Melon Runtime: object ini tidak memiliki animation speed.");
      }
      target.animationspeed = milliseconds;
      return object;
    },
    setSpriteFrame(object, frame) {
      const target = spriteTarget(object);
      requireMethod(
        target,
        "setAnimationFrame",
        "Melon Runtime: object ini tidak memiliki animation frame."
      )(frame);
      return object;
    },
    getSpriteFrame(object) {
      const target = spriteTarget(object);
      return Number(requireMethod(
        target,
        "getCurrentAnimationFrame",
        "Melon Runtime: object ini tidak memiliki animation frame."
      )()) || 0;
    },
    reverseSpriteAnimation(object, name) {
      const target = spriteTarget(object);
      const animationName = name ?? target.current?.name;
      if (!animationName) {
        throw new Error("Melon Runtime: tidak ada animasi aktif untuk dibalik.");
      }
      requireMethod(
        target,
        "reverseAnimation",
        "Melon Runtime: object ini tidak mendukung reverse animation."
      )(animationName);
      return object;
    },
    setSpriteRegion(object, regionName) {
      const target = spriteTarget(object);
      const region = target.source?.getRegion?.(regionName) ?? target.textureAtlas?.getRegion?.(regionName);
      if (!region) {
        throw new Error(`Melon Runtime: region Sprite "${regionName}" tidak ditemukan.`);
      }
      requireMethod(
        target,
        "setRegion",
        "Melon Runtime: object ini tidak mendukung texture region."
      )(region);
      return object;
    },
    setVelocity(object, x, y) {
      return writeVelocity(object, x, y);
    },
    getVelocity(object) {
      const velocity = readVelocity(object);
      return { x: Number(velocity.x) || 0, y: Number(velocity.y) || 0 };
    },
    stopMovement(object, axis) {
      const velocity = readVelocity(object);
      if (axis === "x" || axis === "horizontal") {
        return writeVelocity(object, 0, Number(velocity.y) || 0);
      }
      if (axis === "y" || axis === "vertical") {
        return writeVelocity(object, Number(velocity.x) || 0, 0);
      }
      return writeVelocity(object, 0, 0);
    },
    jump(object, power) {
      if (!object.body && canDeferBodyAccess(object)) {
        const velocity2 = readVelocity(object);
        writeVelocity(object, Number(velocity2.x) || 0, -power);
        return true;
      }
      const body = bodyOf(object);
      if (!groundedState(object)) return false;
      if (body.maxVel) {
        body.maxVel.y = Math.max(Math.abs(body.maxVel.y), power);
      }
      const velocity = readVelocity(object);
      writeVelocity(object, Number(velocity.x) || 0, -power);
      if ("jumping" in body) body.jumping = true;
      return true;
    },
    isFalling(object) {
      if (!object.body && canDeferBodyAccess(object)) {
        return (Number(readVelocity(object).y) || 0) > 0;
      }
      const body = bodyOf(object);
      if (typeof body.falling === "boolean") return body.falling;
      return !groundedState(object) && (Number(readVelocity(object).y) || 0) > 0;
    },
    isJumping(object) {
      if (!object.body && canDeferBodyAccess(object)) {
        return (Number(readVelocity(object).y) || 0) < 0;
      }
      const body = bodyOf(object);
      if (typeof body.jumping === "boolean") return body.jumping;
      return !groundedState(object) && (Number(readVelocity(object).y) || 0) < 0;
    },
    isGrounded(object) {
      return groundedState(object);
    },
    applyForce(object, x, y) {
      return withBodyOrDefer(object, (body) => {
        if (typeof body.applyForce === "function") {
          body.applyForce(x, y);
        } else if (typeof body.force?.set === "function") {
          body.force.set(x, y);
        } else if (body.force && typeof body.force === "object") {
          body.force.x = x;
          body.force.y = y;
        } else {
          throw new Error("Melon Runtime: body object ini tidak mendukung force.");
        }
      });
    },
    setMaxVelocity(object, x, y) {
      return withBodyOrDefer(object, (body) => {
        if (typeof physicsAdapter()?.setMaxVelocity === "function") {
          physicsAdapter().setMaxVelocity(object, { x, y });
        } else if (typeof body.setMaxVelocity === "function") {
          body.setMaxVelocity(x, y);
        } else if (body.maxVel && typeof body.maxVel === "object") {
          body.maxVel.x = x;
          body.maxVel.y = y;
        } else {
          throw new Error("Melon Runtime: maximum velocity body tidak dapat diubah.");
        }
      });
    },
    setFriction(object, x, y) {
      return withBodyOrDefer(object, (body) => {
        if (typeof physicsAdapter()?.setFrictionAir === "function") {
          physicsAdapter().setFrictionAir(object, { x, y });
        } else if (typeof body.setFriction === "function") {
          body.setFriction(x, y);
        } else if (body.friction && typeof body.friction === "object") {
          body.friction.x = x;
          body.friction.y = y;
        } else {
          throw new Error("Melon Runtime: friction body tidak dapat diubah.");
        }
      });
    },
    setBounce(object, amount) {
      return withBodyOrDefer(object, (body) => {
        if (typeof body.setBounce === "function") body.setBounce(amount);
        else body.bounce = amount;
      });
    },
    setMass(object, mass) {
      return withBodyOrDefer(object, (body) => {
        if (typeof body.setMass === "function") body.setMass(mass);
        else body.mass = mass;
      });
    },
    setStatic(object, enabled) {
      return withBodyOrDefer(object, (body) => {
        requireMethod(
          body,
          "setStatic",
          "Melon Runtime: body object ini tidak mendukung mode static."
        )(enabled);
      });
    },
    setGravity(object, strength) {
      return withBodyOrDefer(object, (body) => {
        if (typeof body.setGravityScale === "function") {
          body.setGravityScale(strength);
        } else if (typeof physicsAdapter()?.setGravityScale === "function") {
          physicsAdapter().setGravityScale(object, strength);
        } else {
          body.gravityScale = strength;
        }
      });
    },
    setGravityEnabled(object, enabled) {
      return withBodyOrDefer(object, (body) => {
        if ("ignoreGravity" in body) {
          body.ignoreGravity = !enabled;
        } else if (typeof body.setGravityScale === "function") {
          body.setGravityScale(enabled ? 1 : 0);
        } else if (typeof physicsAdapter()?.setGravityScale === "function") {
          physicsAdapter().setGravityScale(object, enabled ? 1 : 0);
        } else {
          body.gravityScale = enabled ? 1 : 0;
        }
      });
    },
    bindAction(actionName, keyNames, options2) {
      const keyCodes = keyNames.map(keyCode);
      keyCodes.forEach((code) => {
        engine2.input.bindKey(code, actionName, options2.once, options2.preventDefault);
      });
      return { actionName, keyCodes };
    },
    unbindAction(binding) {
      binding.keyCodes.forEach((code) => engine2.input.unbindKey(code));
    },
    isActionPressed(actionName) {
      return engine2.input.isKeyPressed(actionName);
    },
    isActionDown(actionName) {
      return engine2.input.keyStatus(actionName);
    },
    playAnimation(object, name, options2) {
      const target = animationTarget(object);
      if (typeof target.setCurrentAnimation !== "function") {
        throw new Error("Melon Runtime: object ini tidak memiliki animasi.");
      }
      const afterAnimation = options2.then ?? (typeof options2.onComplete === "function" ? () => {
        options2.onComplete(object);
        return false;
      } : void 0);
      target.setCurrentAnimation(name, afterAnimation);
      target.play?.();
      return object;
    },
    pauseAnimation(object) {
      animationTarget(object).pause?.();
      return object;
    },
    resumeAnimation(object) {
      const target = animationTarget(object);
      if (typeof target.resume === "function") {
        target.resume();
      } else {
        target.play?.();
      }
      return object;
    },
    stopAnimation(object) {
      animationTarget(object).stop?.();
      return object;
    },
    isAnimationPlaying(object, name) {
      const target = animationTarget(object);
      return target.isCurrentAnimation?.(name) === true && target.animationpause !== true;
    },
    setAnimationFrame(object, frame) {
      animationTarget(object).setAnimationFrame?.(frame);
      return object;
    },
    onAnimationComplete(object, callback) {
      const target = animationTarget(object);
      const completionTarget = target._frameAnim ?? target;
      completionTarget.resetAnim = () => {
        callback(object);
        return false;
      };
      return object;
    },
    playSound(name, options2) {
      return audio2.play(name, options2.loop, options2.onEnd, options2.volume);
    },
    stopSound: (name, id) => audio2.stop(name, id),
    stopAllSounds: () => typeof audio2.stopAll === "function" ? audio2.stopAll() : audio2.stop(),
    pauseSound: (name, id) => audio2.pause(name, id),
    resumeSound: (name, id) => audio2.resume(name, id),
    playMusic: (name, volume) => audio2.playTrack(name, volume),
    stopMusic: () => audio2.stopTrack(),
    pauseMusic: () => audio2.pauseTrack(),
    resumeMusic: () => audio2.resumeTrack(),
    setVolume: (volume) => audio2.setVolume(volume),
    getVolume: () => audio2.getVolume(),
    setSoundVolume(name, volume, id) {
      if (typeof audio2.setAudioVolume === "function") {
        return audio2.setAudioVolume(name, volume, id);
      }
      audio2.fade(name, volume, volume, 0, id);
      return volume;
    },
    getSoundVolume(name, id) {
      if (typeof audio2.getAudioVolume === "function") {
        return audio2.getAudioVolume(name, id);
      }
      return audio2.getVolume();
    },
    getAudioTracks: () => typeof audio2.getTrack === "function" ? audio2.getTrack() : /* @__PURE__ */ Object.create(null),
    getAudioMixer: () => application?.audioMixer ?? engine2?.game?.audioMixer,
    setMuted: (muted) => muted ? audio2.muteAll() : audio2.unmuteAll(),
    fadeSound: (name, from, to, duration, id) => audio2.fade(name, from, to, duration, id),
    loadScene(name, options2) {
      if (engine2.state.get(name)) {
        if (options2.force === true) engine2.state.change(name, true);
        else engine2.state.change(name);
        return true;
      }
      return engine2.level.load(name, options2);
    },
    reloadScene(options2) {
      const currentName = engine2.level.getCurrentLevelId();
      if (currentName && engine2.state.get(currentName)) {
        if (typeof engine2.state.restartLevel === "function") {
          engine2.state.restartLevel();
        } else if (typeof engine2.state.restart === "function") {
          engine2.state.restart();
        } else {
          engine2.state.change(currentName, true);
        }
        return true;
      }
      return engine2.level.reload(options2);
    },
    currentScene: () => engine2.level.getCurrentLevelId(),
    followCamera(object, options2) {
      application.viewport.follow(object, axisValue(options2.axis), clamp(options2.smoothing, 0, 1));
      return object;
    },
    unfollowCamera: () => application.viewport.unfollow(),
    moveCamera: (x, y) => application.viewport.move(x, y),
    moveCameraTo: (x, y) => application.viewport.moveTo(x, y),
    getCameraPosition() {
      const position = application.viewport?.pos;
      return {
        x: Number(position?.x) || 0,
        y: Number(position?.y) || 0
      };
    },
    shakeCamera(options2) {
      return application.viewport.shake(
        options2.intensity,
        options2.duration,
        axisValue(options2.axis),
        options2.onComplete,
        options2.force
      );
    },
    flashCamera: (color, duration, onComplete) => application.viewport.fadeOut(color, duration, onComplete),
    fadeCamera: (color, duration, onComplete) => application.viewport.fadeIn(color, duration, onComplete),
    setTimeout(callback, duration, options2) {
      const timerOptions = [callback, duration, options2.pauseWithGame !== false];
      if (persistentTimers) timerOptions.push(options2.persistent === true);
      return {
        kind: "timeout",
        id: engine2.timer.setTimeout(...timerOptions)
      };
    },
    setInterval(callback, duration, options2) {
      const timerOptions = [callback, duration, options2.pauseWithGame !== false];
      if (persistentTimers) timerOptions.push(options2.persistent === true);
      return {
        kind: "interval",
        id: engine2.timer.setInterval(...timerOptions)
      };
    },
    clearTimer(timer) {
      if (!timer) return false;
      if (timer.kind === "interval") engine2.timer.clearInterval(timer.id);
      else engine2.timer.clearTimeout(timer.id);
      return true;
    },
    saveValue(key, value) {
      const storageKey = `melonRuntime.${key}`;
      if (!Object.prototype.hasOwnProperty.call(engine2.save, storageKey)) {
        engine2.save.add({ [storageKey]: value });
      }
      engine2.save[storageKey] = value;
      return value;
    },
    loadValue(key, defaultValue) {
      const storageKey = `melonRuntime.${key}`;
      if (!Object.prototype.hasOwnProperty.call(engine2.save, storageKey)) {
        engine2.save.add({ [storageKey]: defaultValue });
      }
      return engine2.save[storageKey];
    },
    hasValue: (key) => Object.prototype.hasOwnProperty.call(engine2.save, `melonRuntime.${key}`),
    removeValue(key) {
      const storageKey = `melonRuntime.${key}`;
      const existed = Object.prototype.hasOwnProperty.call(engine2.save, storageKey);
      engine2.save.remove(storageKey);
      return existed;
    },
    setCollisionType(object, type) {
      const resolved = collisionType(type);
      if (typeof resolved !== "number") {
        throw new Error(`Melon Runtime: tipe collision "${type}" tidak dikenal.`);
      }
      if (!object.body && canDeferBodyAccess(object)) {
        object.bodyDef.collisionType = resolved;
      }
      return withBodyOrDefer(object, (body) => body.setCollisionType(resolved));
    },
    setCollisionMask(object, types) {
      const mask = types.flat().reduce((result, type) => {
        const resolved = collisionType(type);
        if (typeof resolved !== "number") {
          throw new Error(`Melon Runtime: tipe collision "${type}" tidak dikenal.`);
        }
        return result | resolved;
      }, 0);
      if (!object.body && canDeferBodyAccess(object)) {
        object.bodyDef.collisionMask = mask;
      }
      return withBodyOrDefer(object, (body) => body.setCollisionMask(mask));
    },
    isCollisionType(object, type) {
      const resolved = collisionType(type);
      const activeShape = activeCollisionContacts.get(object);
      if (activeShape) {
        return collisionTypeForContact(object, activeShape) === resolved;
      }
      if (shapeCollisionTypes(object).includes(resolved)) return true;
      if (!object.body && canDeferBodyAccess(object)) {
        return object.bodyDef.collisionType === resolved;
      }
      return bodyOf(object).collisionType === resolved;
    },
    addCollisionShape(target, shape, shapeOptions = {}) {
      var _a;
      const { body, object } = collisionTarget(target);
      const metadata = collisionMetadata(shape, shapeOptions);
      const previousLength = Array.isArray(body.shapes) ? body.shapes.length : 0;
      requireMethod(
        body,
        "addShape",
        "Melon Runtime: body ini tidak mendukung penambahan collision shape."
      )(shape, shapeOptions);
      const storedShape = body.shapes?.[previousLength] ?? shape;
      applyCollisionMetadata(storedShape, metadata);
      if (object?.bodyDef && !object.bodyDef.shapes?.includes(storedShape)) {
        (_a = object.bodyDef).shapes ?? (_a.shapes = []);
        object.bodyDef.shapes.push(storedShape);
      }
      syncCollisionTarget(body, object);
      return storedShape;
    },
    setCollisionShapeFilter(target, shapeTarget, filter = {}) {
      const { body, object } = collisionTarget(target);
      const shape = collisionShape(shapeTarget, body, object);
      if (!shape) {
        throw new Error(`Melon Runtime: collision shape "${shapeTarget}" tidak ditemukan.`);
      }
      const metadata = collisionMetadata(shape, filter);
      applyCollisionMetadata(shape, metadata);
      const bodyIndex = body?.shapes?.indexOf(shape) ?? -1;
      const index = bodyIndex >= 0 ? bodyIndex : object?.bodyDef?.shapes?.indexOf(shape) ?? -1;
      const definitionShape = index >= 0 ? object?.bodyDef?.shapes?.[index] : void 0;
      if (definitionShape && definitionShape !== shape) applyCollisionMetadata(definitionShape, metadata);
      syncCollisionTarget(body, object);
      return shape;
    },
    syncCollisionShapeFilters(target) {
      const { body, object } = collisionTarget(target);
      return syncCollisionTarget(body, object);
    },
    getCollisionOverlap(response) {
      return Math.abs(Number(response.overlap) || 0);
    },
    snapshotCollisionResponse(response, object) {
      return snapshotCollisionResponse(response, object);
    },
    getCollisionVector(response, object, kind, axis) {
      const side = collisionSide(response, object);
      const key = collisionAxis(axis);
      const vector = kind === "normal" ? response.overlapN : response.overlapV;
      if (!vector || typeof vector !== "object") {
        throw new Error(`Melon Runtime: collision ${kind} vector tidak tersedia.`);
      }
      const direction = side === "a" ? 1 : -1;
      return (Number(vector[key]) || 0) * direction;
    },
    isCollisionInside(response, object, participant) {
      response = rawCollisionResponse(response);
      const side = collisionSide(response, object);
      const target = collisionParticipant(participant);
      const property = target === "self" ? side === "a" ? "aInB" : "bInA" : side === "a" ? "bInA" : "aInB";
      return response[property] === true;
    },
    getCollisionShapeIndex(response, collisionInfo, object, participant) {
      response = rawCollisionResponse(response);
      const side = collisionSide(response, object);
      const target = collisionParticipant(participant);
      const participantSide = target === "self" ? side : side === "a" ? "b" : "a";
      const suffix = participantSide.toUpperCase();
      const value = collisionInfo?.[`indexShape${suffix}`] ?? response[`indexShape${suffix}`];
      if (collisionInfo?.__melonNormalized === true) {
        return Number.isFinite(Number(value)) ? Number(value) : -1;
      }
      const participantObject = participantSide === side ? object : side === "a" ? response.b : response.a;
      return Number.isFinite(Number(value)) ? logicalShapeIndex(participantObject, Number(value)) : -1;
    },
    setShapeActive(object, target, enabled) {
      if (nativeShapeCollision && !usesPortablePhysicsAdapter()) {
        const { body: body2 } = collisionTarget(object);
        const shape = collisionShape(target, body2, object);
        if (!shape) {
          throw new Error(`Melon Runtime: collision shape "${target}" tidak ditemukan.`);
        }
        shape.isActive = enabled;
        const index = body2?.shapes?.indexOf(shape) ?? -1;
        const definitionShape = index >= 0 ? object.bodyDef?.shapes?.[index] : void 0;
        if (definitionShape && definitionShape !== shape) definitionShape.isActive = enabled;
        return object;
      }
      if (setPortableShapeActive(object, target, enabled)) return object;
      const body = bodyOf(object);
      const method = enabled ? "enableShape" : "disableShape";
      const result = requireMethod(
        body,
        method,
        "Melon Runtime: body object ini tidak mendukung perubahan collision shape saat game berjalan."
      )(target);
      if (result === null) {
        throw new Error(`Melon Runtime: collision shape "${target}" tidak ditemukan.`);
      }
      return object;
    },
    toggleShape(object, target) {
      if (nativeShapeCollision && !usesPortablePhysicsAdapter()) {
        const { body: body2 } = collisionTarget(object);
        const shape = collisionShape(target, body2, object);
        if (!shape) {
          throw new Error(`Melon Runtime: collision shape "${target}" tidak ditemukan.`);
        }
        return this.setShapeActive(object, target, shape.isActive === false);
      }
      const descriptors = collisionShapeDescriptors(object);
      if (descriptors) {
        const numericTarget = typeof target === "number" || /^\d+$/.test(String(target));
        const descriptor = descriptors.find((entry, index) => numericTarget ? (entry.index ?? index) === Number(target) : entry.name === String(target));
        if (!descriptor) {
          throw new Error(`Melon Runtime: collision shape "${target}" tidak ditemukan.`);
        }
        setPortableShapeActive(object, target, descriptor.isActive === false);
        return object;
      }
      const body = bodyOf(object);
      const result = requireMethod(
        body,
        "toggleShapeActive",
        "Melon Runtime: body object ini tidak mendukung toggle collision shape."
      )(target);
      if (result === null) {
        throw new Error(`Melon Runtime: collision shape "${target}" tidak ditemukan.`);
      }
      return object;
    },
    bodyContainsPoint(object, x, y) {
      const body = bodyOf(object);
      const position = typeof object.getAbsolutePosition === "function" ? object.getAbsolutePosition() : positionOf(object);
      return requireMethod(
        body,
        "contains",
        "Melon Runtime: body object ini tidak mendukung pemeriksaan titik."
      )(x - (Number(position?.x) || 0), y - (Number(position?.y) || 0)) === true;
    },
    getShapeCount(object) {
      const descriptors = collisionShapeDescriptors(object);
      if (descriptors) return descriptors.length;
      if (!object.body && Array.isArray(object.bodyDef?.shapes)) {
        return object.bodyDef.shapes.length;
      }
      const body = bodyOf(object);
      if (Array.isArray(body.shapes)) return body.shapes.length;
      const shapes = physicsAdapter()?.getBodyShapes?.(object);
      if (Array.isArray(shapes)) return shapes.length;
      throw new Error("Melon Runtime: collision shape body tidak dapat dibaca.");
    },
    rotateBody(object, degrees2) {
      const radians = degrees2 * Math.PI / 180;
      return withBodyOrDefer(object, (body) => {
        if (typeof body.rotate === "function") {
          body.rotate(radians);
        } else if (typeof body.setAngle === "function") {
          const current = typeof body.getAngle === "function" ? body.getAngle() : 0;
          body.setAngle(current + radians);
        } else {
          throw new Error("Melon Runtime: collision body ini tidak dapat diputar.");
        }
      });
    },
    getBodyBounds(object) {
      return requireMethod(
        bodyOf(object),
        "getBounds",
        "Melon Runtime: bounds collision body tidak dapat dibaca."
      )();
    },
    onCollision(object, phase, callback) {
      if (collisionLifecycle === "modern-callbacks") {
        const method = phase === "enter" ? "onCollisionStart" : phase === "exit" ? "onCollisionEnd" : "onCollisionActive";
        const previous2 = object[method];
        const wrapped = function runtimeCollisionCallback(response, other) {
          const enriched = enrichPortableCollisionResponse(response, this, other);
          return withPortableCollisionContext(this, other, enriched, () => {
            const previousResult = typeof previous2 === "function" ? previous2.call(this, enriched, other) : true;
            const contact = rememberCollisionSnapshot(this, other, enriched, phase);
            const result = callback(other, contact, this);
            return result ?? previousResult;
          });
        };
        object[method] = wrapped;
        return () => {
          if (object[method] === wrapped) object[method] = previous2;
        };
      }
      if (phase === "enter") {
        return subscribe(
          object,
          engine2.event.ONCOLLISION_ENTER,
          (self, other, collisionInfo) => callback(other, collisionInfo, self)
        );
      }
      if (phase === "exit") {
        return subscribe(
          object,
          engine2.event.ONCOLLISION_EXIT,
          (self, other, collisionInfo) => callback(other, collisionInfo, self)
        );
      }
      const previous = object.onCollision;
      object.onCollision = function onCollision(response, other) {
        const previousResult = typeof previous === "function" ? previous.call(this, response, other) : true;
        const result = callback(other, response);
        return result ?? previousResult;
      };
      return () => {
        object.onCollision = previous;
      };
    },
    pauseGame: (music) => engine2.state.pause(music),
    resumeGame: (music) => engine2.state.resume(music),
    isGamePaused: () => engine2.state.isPaused(),
    gameSize() {
      return {
        width: application.viewport?.width ?? application.renderer?.width ?? 0,
        height: application.viewport?.height ?? application.renderer?.height ?? 0
      };
    },
    setGameData(value) {
      gameData = value;
    }
  };
}

// packages/melon-runtime/src/compat/melon-editor-builtin-collision.js
var BUILTIN_COLLISIONS_PATCH = /* @__PURE__ */ Symbol.for(
  "melon-editor.runtime.builtin-collisions"
);
function installBuiltinCollisionCompatibility(engine2, detector) {
  const collisions = detector?.collisions;
  if (typeof collisions !== "function" || collisions[BUILTIN_COLLISIONS_PATCH] || typeof engine2?.Bounds !== "function") {
    return false;
  }
  const boundsA = new engine2.Bounds();
  const boundsB = new engine2.Bounds();
  function runtimeCompatibleCollisions(objA) {
    let collisionCounter = 0;
    const candidates = this.world.broadphase.retrieve(objA);
    boundsA.addBounds(objA.getBounds(), true);
    boundsA.addBounds(objA.body.getBounds());
    for (const objB of candidates) {
      if (!this.shouldCollide(objA, objB)) continue;
      boundsB.addBounds(objB.getBounds(), true);
      boundsB.addBounds(objB.body.getBounds());
      if (!boundsA.overlaps(boundsB) || !this.collides(objA.body, objB.body)) {
        continue;
      }
      collisionCounter++;
      const pairKey = this.pairKey(objA, objB);
      const firstVisitThisFrame = pairKey !== void 0 && !this._frameSeen.has(pairKey);
      if (firstVisitThisFrame) {
        this._frameSeen.set(pairKey, [objA, objB]);
        const isEntry = !this._activePairs.has(pairKey);
        const viewA = this._fillSymView(0, this.response, false);
        const viewB = this._fillSymView(1, this.response, true);
        if (isEntry) {
          objA.onCollisionStart?.(viewA, objB);
          objB.onCollisionStart?.(viewB, objA);
        }
        objA.onCollisionActive?.(viewA, objB);
        objB.onCollisionActive?.(viewB, objA);
      }
      const eitherSensor = objA.body.isSensor === true || objB.body.isSensor === true;
      const aHasModern = typeof objA.onCollisionActive === "function";
      const bHasModern = typeof objB.onCollisionActive === "function";
      const aOptsOut = !aHasModern && typeof objA.onCollision === "function" && objA.onCollision(this.response, objB) === false;
      if (!aOptsOut && objA.body.isStatic === false && !eitherSensor) {
        objA.body.respondToCollision.call(objA.body, this.response);
      }
      const bOptsOut = !bHasModern && typeof objB.onCollision === "function" && objB.onCollision(this.response, objA) === false;
      if (!bOptsOut && objB.body.isStatic === false && !eitherSensor) {
        objB.body.respondToCollision.call(objB.body, this.response);
      }
      const hasMultipleShapes = objA.body.shapes.length > 1 || objB.body.shapes.length > 1;
      if (eitherSensor || aOptsOut && bOptsOut || !hasMultipleShapes) {
        continue;
      }
      let extraPasses = 3;
      while (extraPasses-- > 0 && this.collides(objA.body, objB.body)) {
        const overlap = this.response.overlapV;
        const overlapN = this.response.overlapN;
        const aResponds = !aOptsOut && !objA.body.isStatic;
        const bResponds = !bOptsOut && !objB.body.isStatic;
        const bothDynamic = aResponds && bResponds;
        const totalMass = bothDynamic ? objA.body.mass + objB.body.mass : 0;
        const ratioA = bothDynamic ? totalMass > 0 ? objB.body.mass / totalMass : 0.5 : 1;
        const ratioB = bothDynamic ? totalMass > 0 ? objA.body.mass / totalMass : 0.5 : 1;
        if (aResponds) {
          objA.body.ancestor.pos.set(
            objA.body.ancestor.pos.x - overlap.x * ratioA,
            objA.body.ancestor.pos.y - overlap.y * ratioA,
            objA.body.ancestor.pos.z
          );
          const projectedVelocity = objA.body.vel.x * overlapN.x + objA.body.vel.y * overlapN.y;
          if (projectedVelocity > 0) {
            objA.body.vel.x -= projectedVelocity * ratioA * overlapN.x;
            objA.body.vel.y -= projectedVelocity * ratioA * overlapN.y;
          }
        }
        if (bResponds) {
          objB.body.ancestor.pos.set(
            objB.body.ancestor.pos.x + overlap.x * ratioB,
            objB.body.ancestor.pos.y + overlap.y * ratioB,
            objB.body.ancestor.pos.z
          );
          const projectedVelocity = objB.body.vel.x * overlapN.x + objB.body.vel.y * overlapN.y;
          if (projectedVelocity > 0) {
            objB.body.vel.x -= projectedVelocity * ratioB * overlapN.x;
            objB.body.vel.y -= projectedVelocity * ratioB * overlapN.y;
          }
        }
        boundsA.addBounds(objA.getBounds(), true);
        boundsA.addBounds(objA.body.getBounds());
      }
    }
    return collisionCounter > 0;
  }
  Object.defineProperty(runtimeCompatibleCollisions, BUILTIN_COLLISIONS_PATCH, {
    value: collisions
  });
  detector.collisions = runtimeCompatibleCollisions;
  return true;
}

// packages/melon-runtime/src/compat/melon-editor-children.js
var installedContainerPrototypes = /* @__PURE__ */ new WeakSet();
function cloneInspector(inspectors) {
  if (!inspectors || typeof inspectors !== "object") return {};
  if (typeof structuredClone === "function") return structuredClone(inspectors);
  return JSON.parse(JSON.stringify(inspectors));
}
function normalizeTextLineHeight(lineHeight, size) {
  const numericLineHeight = Number(lineHeight);
  if (!Number.isFinite(numericLineHeight) || numericLineHeight <= 0) return lineHeight;
  const numericSize = Number(size);
  if (numericLineHeight > 4 && Number.isFinite(numericSize) && numericSize > 0) {
    return numericLineHeight / numericSize;
  }
  return numericLineHeight;
}
function editorTextSettings(layer) {
  const isBitmapText = layer.fntData !== void 0 || layer.fontData !== void 0;
  const isText = !isBitmapText && (layer.font !== void 0 || layer.family !== void 0);
  if (isBitmapText) {
    const fontFamily = layer.fontFamily || layer.font || "Roboto";
    const font = layer.customFont === true && layer.imgData ? layer.imgData : fontFamily;
    const fontData = layer.customFont === true && layer.fntData ? layer.fntData : layer.fontData || layer.fntData || fontFamily;
    const textAlign = layer.textAlign || "left";
    const textBaseline = layer.textBaseline || "top";
    return {
      text: layer.text,
      fontFamily,
      font,
      fontData,
      customFont: layer.customFont,
      size: layer.size,
      fillStyle: layer.fillStyle || layer.color,
      color: layer.color || layer.fillStyle,
      lineHeight: layer.lineHeight || 1,
      spacing: layer.spacing,
      wordWrapWidth: layer.wordWrapWidth ?? layer.boxWidth,
      boxWidth: layer.boxWidth ?? layer.wordWrapWidth,
      boxHeight: layer.boxHeight,
      textAlign,
      textBaseline,
      anchorPoint: {
        x: textAlign === "right" ? 1 : textAlign === "center" ? 0.5 : 0,
        y: textBaseline === "bottom" ? 1 : textBaseline === "middle" ? 0.5 : 0
      }
    };
  }
  if (isText) {
    const textAlign = layer.textAlign || "left";
    const textBaseline = layer.textBaseline || "top";
    return {
      text: layer.text,
      font: layer.font || layer.family,
      family: layer.family,
      size: layer.size,
      fillStyle: layer.fillStyle || layer.color || "#000000",
      color: layer.color || layer.fillStyle,
      strokeStyle: layer.strokeStyle,
      lineWidth: layer.lineWidth,
      lineHeight: normalizeTextLineHeight(layer.lineHeight, layer.size),
      wordWrapWidth: layer.wordWrapWidth ?? layer.boxWidth,
      boxWidth: layer.boxWidth ?? layer.wordWrapWidth,
      boxHeight: layer.boxHeight,
      textAlign,
      textBaseline,
      bold: layer.bold === true,
      italic: layer.italic === true,
      anchorPoint: {
        x: textAlign === "right" ? 1 : textAlign === "center" ? 0.5 : 0,
        y: textBaseline === "bottom" ? 1 : textBaseline === "middle" ? 0.5 : 0
      }
    };
  }
  return void 0;
}
function applyInspector(child, inspector = {}) {
  if (typeof inspector.alpha !== "undefined") child.alpha = inspector.alpha;
  child.flipX?.(inspector.flip?.x === true);
  child.flipY?.(inspector.flip?.y === true);
  child.rotate?.((Number(inspector.rotate) || 0) * Math.PI / 180);
  const scaleX = Number(inspector.scale?.x ?? 1);
  const scaleY = Number(inspector.scale?.y ?? 1);
  child.scale?.(scaleX, scaleY);
  child._scaleX = scaleX;
  child._scaleY = scaleY;
}
function refreshChildBounds(child) {
  if (!child) return;
  child.updateBounds?.();
  child.getChildren?.().forEach((nestedChild) => {
    nestedChild.floating = false;
    refreshChildBounds(nestedChild);
  });
}
function normalizeEditorTextureName(texture) {
  return typeof texture === "string" ? texture.replace(/ /g, "_") : texture;
}
function installMelonEditorChildCompatibility(engine2) {
  const prototype = engine2?.Container?.prototype;
  if (!prototype || installedContainerPrototypes.has(prototype)) return false;
  if (typeof prototype._addEditorChild === "function") {
    installedContainerPrototypes.add(prototype);
    return false;
  }
  Object.defineProperty(prototype, "_addEditorChild", {
    configurable: true,
    writable: true,
    value(layers, me = engine2, game2 = {}) {
      if (!Array.isArray(layers)) return;
      layers.forEach((layer) => {
        if (!layer || typeof layer !== "object") return;
        const x = Number(layer.x) || 0;
        const y = Number(layer.y) || 0;
        let child;
        if (layer.type === "objectgroup") {
          const settings = editorTextSettings(layer);
          const objectName = layer.objectName ?? layer.className ?? layer.name;
          if (!objectName) return;
          child = settings ? me.pool.pull(objectName, x, y, settings) : me.pool.pull(objectName, x, y);
          if (layer.inspectors) applyInspector(child, layer.inspectors);
        } else if (layer.type === "videolayer") {
          const inspectors = cloneInspector(layer.inspectors);
          inspectors.scale = { x: 1, y: 1 };
          child = me.pool.pull("videoSpriteTP", x, y, {
            inspectors,
            videoName: layer.videoName || layer.name
          });
          child.rotate?.((Number(inspectors.rotate) || 0) * Math.PI / 180);
          child.scale?.(
            Number(layer.inspectors?.scale?.x ?? 1),
            Number(layer.inspectors?.scale?.y ?? 1)
          );
        } else if (layer.type === "imagelayer") {
          const inspectors = cloneInspector(layer.inspectors);
          const imageName = layer.imageName || layer.name;
          const texture = normalizeEditorTextureName(game2.imageLocation?.[imageName]);
          inspectors.scale = { x: 1, y: 1 };
          child = me.pool.pull("spriteTP", x, y, {
            inspectors,
            texture,
            region: imageName
          });
          child.rotate?.((Number(inspectors.rotate) || 0) * Math.PI / 180);
          child.scale?.(
            Number(layer.inspectors?.scale?.x ?? 1),
            Number(layer.inspectors?.scale?.y ?? 1)
          );
        } else if (layer.type === "text") {
          child = new me.Text(x, y, {
            font: layer.family || layer.font,
            size: layer.size,
            fillStyle: layer.fillStyle || layer.color || "#000000",
            strokeStyle: layer.strokeStyle,
            lineWidth: layer.lineWidth,
            text: layer.text,
            anchorPoint: { x: 0, y: 0 },
            lineHeight: normalizeTextLineHeight(layer.lineHeight, layer.size),
            wordWrapWidth: layer.wordWrapWidth ?? layer.boxWidth,
            wordWrapHeight: layer.boxHeight,
            textAlign: layer.textAlign || "left",
            textBaseline: layer.textBaseline || "top",
            bold: layer.bold === true,
            italic: layer.italic === true
          });
          child.rotate?.(Number(layer.rotation ?? layer.inspectors?.rotate) || 0);
        } else if (layer.type === "bitmap-text") {
          const textAlign = layer.textAlign || "left";
          const textBaseline = layer.textBaseline || "top";
          child = new me.BitmapText(x, y, {
            text: layer.text,
            fillStyle: layer.color,
            anchorPoint: {
              x: textAlign === "right" ? 1 : textAlign === "center" ? 0.5 : 0,
              y: textBaseline === "bottom" ? 1 : textBaseline === "middle" ? 0.5 : 0
            },
            font: layer.customFont === true ? layer.imgData : layer.fontFamily,
            fontData: layer.customFont === true ? layer.fntData : layer.fontFamily,
            size: layer.size,
            textAlign,
            textBaseline,
            lineHeight: layer.lineHeight || 1,
            wordWrapWidth: layer.wordWrapWidth ?? layer.boxWidth
          });
          child.rotate?.(Number(layer.rotation ?? layer.inspectors?.rotate) || 0);
        } else if (layer.type === "nineslicesprite") {
          child = game2.texture.createSpriteFromName(layer.name, {
            width: layer.width,
            height: layer.height,
            anchorPoint: { x: 0, y: 0 }
          }, true, x, y);
          child.pos?.set(x, y);
        } else if (layer.type === "backgroundlayer") {
          child = new me.Renderable(0, 0, layer.width, layer.height);
          child.anchorPoint?.set(0, 0);
          child.alpha = layer.alpha;
          child.draw = function drawEditorBackground(renderer) {
            renderer.setColor(layer.color);
            renderer.fillRect(0, 0, this.width, this.height);
          };
        } else if (layer.type === "spritebutton") {
          child = new me.UISpriteElement(x, y, {
            image: game2.texture,
            region: layer.imageName,
            anchorPoint: { x: 0, y: 0 }
          });
          child.alpha = layer.alpha;
          child.clicked_region = game2.texture.getRegion(layer.imageClickName);
          child.unclicked_region = game2.texture.getRegion(layer.imageName);
          child.onClick = function onClick() {
            this.alpha = layer.clickAlpha;
            const pressedHeight = this.clicked_region?.height ?? this.height ?? 0;
            this.translate?.(0, (this.height ?? 0) - pressedHeight);
            this.setRegion?.(this.clicked_region);
            game2.scriptHandlers?.[layer.scriptClickName]?.[layer.scriptFunc]?.();
          };
          child.onRelease = function onRelease() {
            this.alpha = layer.releaseAlpha;
            this.setRegion?.(this.unclicked_region);
            const pressedHeight = this.clicked_region?.height ?? this.height ?? 0;
            this.translate?.(0, -((this.height ?? 0) - pressedHeight));
          };
          child.onOver = function onOver() {
            this.alpha = layer.overAlpha;
          };
          child.onOut = function onOut() {
            this.alpha = layer.outAlpha;
          };
        }
        if (child) {
          child.name = layer.name;
          child.floating = false;
          this.addChild(child);
          refreshChildBounds(child);
        }
      });
    }
  });
  installedContainerPrototypes.add(prototype);
  return true;
}

// packages/melon-runtime/src/compat/melon-editor-renderable-events.js
var RENDERABLE_EVENTS_PATCH = /* @__PURE__ */ Symbol.for(
  "melon-editor.runtime.renderable-events"
);
var EventEmitter = class {
  constructor() {
    this._listeners = /* @__PURE__ */ new Map();
  }
  eventNames() {
    return [...this._listeners.keys()];
  }
  listeners(eventName) {
    return (this._listeners.get(eventName) ?? []).map((entry) => entry.handler);
  }
  listenerCount(eventName) {
    return this._listeners.get(eventName)?.length ?? 0;
  }
  emit(eventName, ...args) {
    const listeners = this._listeners.get(eventName);
    if (!listeners?.length) return false;
    for (const entry of [...listeners]) {
      if (entry.once) this.removeListener(eventName, entry.handler, entry.context, true);
      entry.handler.apply(entry.context ?? this, args);
    }
    return true;
  }
  on(eventName, handler, context) {
    return this._add(eventName, handler, context, false);
  }
  once(eventName, handler, context) {
    return this._add(eventName, handler, context, true);
  }
  off(eventName, handler, context, once) {
    return this.removeListener(eventName, handler, context, once);
  }
  addListener(eventName, handler, context) {
    return this.on(eventName, handler, context);
  }
  removeListener(eventName, handler, context, once) {
    const listeners = this._listeners.get(eventName);
    if (!listeners) return this;
    if (typeof handler !== "function") {
      this._listeners.delete(eventName);
      return this;
    }
    const remaining = listeners.filter(
      (entry) => entry.handler !== handler || context !== void 0 && entry.context !== context || once !== void 0 && entry.once !== once
    );
    if (remaining.length > 0) this._listeners.set(eventName, remaining);
    else this._listeners.delete(eventName);
    return this;
  }
  removeAllListeners(eventName) {
    if (eventName === void 0) this._listeners.clear();
    else this._listeners.delete(eventName);
    return this;
  }
  _add(eventName, handler, context, once) {
    if (typeof handler !== "function") {
      throw new TypeError("Melon Runtime: event handler harus berupa function.");
    }
    const listeners = this._listeners.get(eventName) ?? [];
    listeners.push({ handler, context, once });
    this._listeners.set(eventName, listeners);
    return this;
  }
};
function materializeEvents(instance, events = new EventEmitter()) {
  Object.defineProperty(instance, "events", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: events
  });
  return events;
}
function installRenderableEventsCompatibility(engine2) {
  const prototype = engine2?.Renderable?.prototype;
  if (!prototype) return false;
  if (prototype[RENDERABLE_EVENTS_PATCH] === true) return false;
  if (!Object.getOwnPropertyDescriptor(prototype, "events")) {
    Object.defineProperty(prototype, "events", {
      configurable: true,
      get() {
        return materializeEvents(this);
      },
      set(events) {
        materializeEvents(this, events);
      }
    });
  }
  const methods = {
    emit(eventName, ...args) {
      return this.events.emit(eventName, ...args);
    },
    on(eventName, handler, context) {
      return this.events.on(eventName, handler, context);
    },
    once(eventName, handler, context) {
      return this.events.once(eventName, handler, context);
    },
    off(eventName, handler, context) {
      return this.events.off(eventName, handler, context);
    }
  };
  for (const [name, method] of Object.entries(methods)) {
    if (typeof prototype[name] !== "function") {
      Object.defineProperty(prototype, name, {
        configurable: true,
        writable: true,
        value: method
      });
    }
  }
  Object.defineProperty(prototype, RENDERABLE_EVENTS_PATCH, {
    configurable: true,
    value: true
  });
  return true;
}

// packages/melon-runtime/src/compat/melon-editor-tmx.js
var NATIVE_TMX_OBJECT_KEYS = /* @__PURE__ */ new Set([
  "capsule",
  "class",
  "ellipse",
  "gid",
  "height",
  "id",
  "name",
  "opacity",
  "point",
  "polygon",
  "polyline",
  "properties",
  "propertytypes",
  "rotation",
  "template",
  "text",
  "tintcolor",
  "type",
  "visible",
  "width",
  "x",
  "y"
]);
var installedLevelManagers = /* @__PURE__ */ new WeakSet();
var installedTileMapPrototypes = /* @__PURE__ */ new WeakSet();
var EDITOR_LAYER_NAME = "__melonEditorLayerName";
function propertyType(value) {
  if (typeof value === "boolean") return "bool";
  if (typeof value === "number") return Number.isInteger(value) ? "int" : "float";
  return "string";
}
function normalizeEditorValue(name, value) {
  if (name !== "inspectors" || !value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }
  const inspectors = { ...value };
  if (Object.prototype.hasOwnProperty.call(inspectors, "rotate")) {
    const degrees2 = Number(inspectors.rotate);
    inspectors.rotate = Number.isFinite(degrees2) ? degrees2 * Math.PI / 180 : 0;
  }
  return inspectors;
}
function setTMXProperty(object, name, value) {
  if (Array.isArray(object.properties)) {
    const existing = object.properties.find((property) => property?.name === name);
    if (existing) {
      existing.type = propertyType(value);
      existing.value = value;
    } else {
      object.properties.push({ name, type: propertyType(value), value });
    }
    return;
  }
  if (!object.properties || typeof object.properties !== "object") {
    object.properties = {};
  }
  if (!object.propertytypes || typeof object.propertytypes !== "object") {
    object.propertytypes = {};
  }
  object.properties[name] = value;
  object.propertytypes[name] = propertyType(value);
}
function normalizeMelonEditorTMXObject(object) {
  if (!object || typeof object !== "object" || Array.isArray(object)) return object;
  for (const [name, rawValue] of Object.entries(object)) {
    if (NATIVE_TMX_OBJECT_KEYS.has(name) || rawValue === void 0) continue;
    setTMXProperty(object, name, normalizeEditorValue(name, rawValue));
  }
  return object;
}
function forwardObjectLayerName(layer, object) {
  const generatedFactoryName = typeof object?.name === "string" && object.name.length > 0 ? object.name : void 0;
  const usesStructuralFactory = typeof object?.text === "object" || typeof object?.tile === "object";
  const editorLayerName = typeof object?.[EDITOR_LAYER_NAME] === "string" ? object[EDITOR_LAYER_NAME] : layer?.name;
  if (typeof editorLayerName !== "string" || editorLayerName.length === 0 || !generatedFactoryName && !usesStructuralFactory || typeof object.class === "string" && object.class.length > 0) {
    return;
  }
  if (usesStructuralFactory) {
    object.class = typeof object.text === "object" ? "text" : "tile";
    object.name = editorLayerName;
  } else if (generatedFactoryName) {
    object.class = generatedFactoryName;
  }
  setTMXProperty(object, "name", editorLayerName);
  setTMXProperty(object, EDITOR_LAYER_NAME, editorLayerName);
}
function installObjectLayerNameCompatibility(engine2) {
  const prototype = engine2?.TMXTileMap?.prototype;
  if (!prototype || installedTileMapPrototypes.has(prototype) || typeof prototype.getObjects !== "function") {
    return false;
  }
  function applyLayerName(settings, object) {
    const layerName = settings?.[EDITOR_LAYER_NAME] ?? settings?.text?.[EDITOR_LAYER_NAME];
    if (object && typeof layerName === "string" && layerName.length > 0) {
      object.name = layerName;
    }
  }
  const getObjects = prototype.getObjects;
  prototype.getObjects = function melonEditorCompatibleGetObjects(flatten) {
    this.readMapObjects(this.data);
    const objects = getObjects.call(this, flatten);
    if (flatten !== false) {
      let objectIndex = 0;
      for (const group of this.objectGroups) {
        for (const settings of group.objects) {
          applyLayerName(settings, objects[objectIndex++]);
        }
      }
    } else {
      let containerIndex = 0;
      for (const group of this.objectGroups) {
        if (!Array.isArray(group.objects) || group.objects.length === 0) continue;
        const container = objects[containerIndex++];
        const children = container?.getChildren?.() ?? container?.children ?? [];
        group.objects.forEach((settings, index) => {
          applyLayerName(settings, children[index]);
        });
      }
    }
    return objects;
  };
  installedTileMapPrototypes.add(prototype);
  return true;
}
function normalizeLayer(layer, options) {
  if (!layer || typeof layer !== "object") return;
  if (Array.isArray(layer.objects)) {
    layer.objects.forEach((object) => {
      normalizeMelonEditorTMXObject(object);
      if (options.forwardObjectLayerName === true) {
        forwardObjectLayerName(layer, object);
      }
    });
  }
  if (Array.isArray(layer.layers)) {
    layer.layers.forEach((child) => normalizeLayer(child, options));
  }
}
function normalizeMelonEditorTMXMap(map, options = {}) {
  if (!map || typeof map !== "object") return map;
  if (Array.isArray(map.layers)) {
    map.layers.forEach((layer) => normalizeLayer(layer, options));
  }
  return map;
}
function installMelonEditorTMXCompatibility(engine2, options = {}) {
  if (options.forwardObjectLayerName === true) {
    installObjectLayerNameCompatibility(engine2);
  }
  const level = engine2?.level;
  if (!level || installedLevelManagers.has(level) || typeof level.add !== "function" || typeof engine2?.loader?.getTMX !== "function") {
    return false;
  }
  const addLevel = level.add;
  level.add = function melonEditorCompatibleLevelAdd(format, levelId, callback) {
    if (String(format).toLowerCase() === "tmx") {
      normalizeMelonEditorTMXMap(engine2.loader.getTMX(levelId), options);
    }
    return addLevel.call(this, format, levelId, callback);
  };
  installedLevelManagers.add(level);
  return true;
}

// packages/melon-runtime/src/adapters/melonjs-20.0.0.js
function restartMelonJs20Level(engine2, application, stage) {
  const activeStage = stage ?? engine2?.state?.current?.();
  if (!activeStage || typeof activeStage.destroy !== "function" || typeof activeStage.reset !== "function") {
    return false;
  }
  const defer = engine2?.utils?.function?.defer ?? ((callback) => globalThis.setTimeout(callback, 0));
  defer(() => {
    if (typeof engine2?.state?.current === "function" && engine2.state.current() !== activeStage) {
      return;
    }
    activeStage.destroy(application);
    activeStage.reset(application);
    engine2?.event?.emit?.(engine2.event.STATE_CHANGE);
  });
  return true;
}
function createMelonJs20Adapter(engine2, options = {}) {
  const application = options.application ?? engine2.game;
  const adapter = createMelonJsAdapter(engine2, {
    ...options,
    engineVersion: "20.0.0",
    minimumEngineMajor: 20,
    adapterName: "melonjs-20.0.0",
    applicationInstance: true,
    collisionLifecycle: "modern-callbacks",
    persistentTimers: false,
    portableShapeActivation: true
  });
  const configure = adapter.configure;
  const reloadScene = adapter.reloadScene;
  adapter.configure = (runtimeOptions) => {
    const result = configure.call(adapter, runtimeOptions);
    installBuiltinCollisionCompatibility(
      engine2,
      application?.world?.adapter?.detector
    );
    return result;
  };
  adapter.reloadScene = (reloadOptions) => {
    const currentName = engine2.level.getCurrentLevelId();
    const currentStage = currentName ? engine2.state.get(currentName) : void 0;
    if (currentStage) {
      return restartMelonJs20Level(engine2, application, currentStage);
    }
    return reloadScene.call(adapter, reloadOptions);
  };
  installBuiltinCollisionCompatibility(
    engine2,
    application?.world?.adapter?.detector
  );
  installMelonEditorChildCompatibility(engine2);
  installRenderableEventsCompatibility(engine2);
  installMelonEditorTMXCompatibility(engine2, {
    forwardObjectLayerName: true
  });
  return adapter;
}

// packages/melon-runtime/src/compat/melon-editor-classes.js
function createMelonEditorClasses(engine2, options = {}) {
  const audio2 = options.audio ?? engine2.audio;
  class AudioGroup2 {
    constructor(name, parent = null) {
      this.name = name;
      this.parent = parent;
      this.children = [];
      this.volume = 1;
      this.actualVolume = 1;
      this.audioClips = [];
      if (parent) parent.addChild(this);
    }
    addChild(childGroup) {
      if (!this.children.includes(childGroup)) this.children.push(childGroup);
      childGroup.parent = this;
      childGroup.updateEffectiveVolume();
      return childGroup;
    }
    addAudioClip(clipName) {
      if (!this.audioClips.includes(clipName)) this.audioClips.push(clipName);
      return this;
    }
    setVolume(volume) {
      const nextVolume = Number(volume);
      this.volume = Number.isFinite(nextVolume) ? Math.max(0, nextVolume) : 1;
      this.updateEffectiveVolume();
      return this;
    }
    updateEffectiveVolume() {
      this.actualVolume = this.volume * (this.parent?.actualVolume ?? 1);
      for (const clipName of this.audioClips) {
        if (typeof audio2.setAudioVolume === "function") {
          audio2.setAudioVolume(clipName, this.actualVolume);
        } else {
          audio2.setVolume?.(this.actualVolume, clipName);
        }
      }
      for (const child of this.children) child.updateEffectiveVolume();
    }
    play(clipName, loop = false, volumeScale = 1) {
      if (!this.audioClips.includes(clipName)) {
        console.warn(`Clip ${clipName} not found in group ${this.name}`);
        return null;
      }
      return audio2.play(
        clipName,
        loop,
        null,
        this.actualVolume * volumeScale
      );
    }
    stop(clipName, id) {
      return audio2.stop(clipName, id);
    }
    playAll() {
      for (const clipName of this.audioClips) this.play(clipName);
      for (const child of this.children) child.playAll();
    }
    stopAll() {
      for (const clipName of this.audioClips) this.stop(clipName);
      for (const child of this.children) child.stopAll();
    }
  }
  class AudioMixer2 {
    constructor() {
      this.masterGroup = new AudioGroup2("Master");
    }
    createGroup(name, parentName = "Master") {
      const parent = this.findGroup(parentName);
      if (parent) return new AudioGroup2(name, parent);
      console.warn(`Parent group ${parentName} not found`);
      return null;
    }
    findGroup(name, group = this.masterGroup) {
      if (group.name === name) return group;
      for (const child of group.children) {
        const result = this.findGroup(name, child);
        if (result) return result;
      }
      return null;
    }
    setGroupVolume(name, volume) {
      const group = this.findGroup(name);
      if (group) return group.setVolume(volume);
      console.warn(`Group ${name} not found`);
    }
    playInGroup(groupName, clipName, loop = false, volumeScale = 1) {
      const group = this.findGroup(groupName);
      if (group) return group.play(clipName, loop, volumeScale);
      console.warn(`Group ${groupName} not found`);
      return null;
    }
    stopInGroup(groupName, clipName, id) {
      const group = this.findGroup(groupName);
      if (group) return group.stop(clipName, id);
      console.warn(`Group ${groupName} not found`);
    }
  }
  class GUI_Object2 extends engine2.UISpriteElement {
  }
  class Slider2 extends engine2.Container {
    constructor(x, y, settings = {}) {
      const defaults = {
        width: 200,
        height: 20,
        minValue: 0,
        maxValue: 100,
        value: 50,
        direction: "LeftToRight",
        wholeNumbers: true,
        backgroundColor: "#333333",
        fillColor: "#13ba13ff",
        backgroundAlpha: 1,
        fillAlpha: 1,
        backgroundImage: null,
        fillImage: null,
        shape: "RoundRect",
        radius: 10
      };
      const config = { ...defaults, ...settings };
      super(x, y, config.width, config.height);
      this.anchorPoint.set(0, 0);
      this.floating = true;
      this._width = config.width;
      this._height = config.height;
      this._direction = config.direction;
      this._minValue = config.minValue;
      this._maxValue = config.maxValue;
      this._wholeNumbers = config.wholeNumbers;
      this._value = config.value;
      this.bgColor = config.backgroundColor;
      this.fillColor = config.fillColor;
      this.bgAlpha = normalizeAlpha(config.backgroundAlpha ?? config.backgroundOpacity);
      this.fillAlpha = normalizeAlpha(config.fillAlpha ?? config.fillOpacity);
      this.bgImage = this._resolveImageAsset(config.backgroundImage, this._width, this._height);
      this.fillImage = this._resolveImageAsset(config.fillImage, this._width, this._height);
      this.shape = config.shape;
      this.radius = config.radius;
      this.sliderButton = null;
      if (settings.knob) {
        this.sliderButton = new SliderButton2(0, 0, settings.knob, this);
        this.addChild(this.sliderButton);
        this.updateKnobPosition();
      }
    }
    update(dt) {
      super.update(dt);
      return true;
    }
    updateKnobPosition() {
      if (!this.sliderButton) return;
      const pct = this._percentage();
      const horizontal = this._direction === "LeftToRight" || this._direction === "RightToLeft";
      const reverse = this._direction === "RightToLeft" || this._direction === "BottomToTop";
      const position = reverse ? 1 - pct : pct;
      this.sliderButton.pos.set(
        horizontal ? this._width * position : this._width / 2,
        horizontal ? this._height / 2 : this._height * position,
        this.sliderButton.pos.z
      );
    }
    draw(renderer) {
      const pct = this._percentage();
      const alpha = renderer.globalAlpha();
      let x = this.pos.x;
      let y = this.pos.y;
      let width = this._width;
      let height = this._height;
      renderer.save();
      let masked = false;
      try {
        renderer.beginPath();
        if (this.shape === "RoundRect" && typeof renderer.roundRect === "function") {
          const radius = Math.min(
            Math.max(Number(this.radius) || 0, 0),
            Math.min(this._width, this._height) / 2
          );
          renderer.roundRect(x, y, this._width, this._height, radius);
        } else {
          renderer.rect(x, y, this._width, this._height);
        }
        renderer.setMask();
        masked = true;
        renderer.setGlobalAlpha(alpha * this.bgAlpha);
        if (this.bgImage) {
          renderer.drawImage(
            this.bgImage.image,
            this.bgImage.sx,
            this.bgImage.sy,
            this.bgImage.sw,
            this.bgImage.sh,
            x,
            y,
            width,
            height
          );
        } else {
          renderer.setColor(this.bgColor);
          renderer.fillRect(x, y, width, height);
        }
        if (this._direction === "LeftToRight") width *= pct;
        else if (this._direction === "RightToLeft") {
          width *= pct;
          x += this._width - width;
        } else if (this._direction === "TopToBottom") height *= pct;
        else {
          height *= pct;
          y += this._height - height;
        }
        renderer.setGlobalAlpha(alpha * this.fillAlpha);
        if (this.fillImage && width > 0 && height > 0) {
          let sx = this.fillImage.sx;
          let sy = this.fillImage.sy;
          let sw = this.fillImage.sw;
          let sh = this.fillImage.sh;
          if (this._direction === "LeftToRight" || this._direction === "RightToLeft") {
            sw *= pct;
            if (this._direction === "RightToLeft") {
              sx += this.fillImage.sw - sw;
            }
          } else {
            sh *= pct;
            if (this._direction === "BottomToTop") {
              sy += this.fillImage.sh - sh;
            }
          }
          renderer.drawImage(this.fillImage.image, sx, sy, sw, sh, x, y, width, height);
        } else if (width > 0 && height > 0) {
          renderer.setColor(this.fillColor);
          renderer.fillRect(x, y, width, height);
        }
      } finally {
        if (masked) renderer.clearMask();
        renderer.restore();
      }
      super.draw(renderer);
    }
    _resolveImageAsset(imageSettings, defaultWidth, defaultHeight) {
      if (!imageSettings) return null;
      const isTextureAtlas = typeof engine2.TextureAtlas === "function" && imageSettings instanceof engine2.TextureAtlas;
      const isImageSettings = typeof imageSettings === "object" && imageSettings !== null && ("image" in imageSettings || "texture" in imageSettings || "region" in imageSettings);
      const settings = isImageSettings && !isTextureAtlas ? imageSettings : { image: imageSettings };
      const source = settings.image ?? settings.texture;
      if (!source) return null;
      let image;
      let region;
      if (typeof source.getRegion === "function" && typeof source.getTexture === "function") {
        if (typeof settings.region !== "undefined") {
          region = source.getRegion(settings.region);
          if (!region) {
            throw new Error(`Slider image region for ${settings.region} not found`);
          }
        }
        image = source.getTexture(region);
      } else {
        image = typeof source === "object" ? source : engine2.loader?.getImage?.(source);
        if (!image) throw new Error(`Slider image '${source}' not found`);
        if (typeof settings.region !== "undefined") {
          region = image.textureAtlas?.getRegion?.(settings.region);
        }
      }
      if (!image) return null;
      return {
        image,
        sx: region?.offset?.x ?? 0,
        sy: region?.offset?.y ?? 0,
        sw: region?.width ?? image.width ?? defaultWidth,
        sh: region?.height ?? image.height ?? defaultHeight
      };
    }
    _percentage() {
      const range = this._maxValue - this._minValue;
      return range === 0 ? 0 : Math.max(0, Math.min((this._value - this._minValue) / range, 1));
    }
    get value() {
      return this._value;
    }
    set value(value) {
      this.setValueInternal(value, true);
    }
    setValueInternal(value, updateKnob = true) {
      let nextValue = Math.max(this._minValue, Math.min(Number(value), this._maxValue));
      if (this._wholeNumbers) nextValue = Math.round(nextValue);
      if (!Number.isFinite(nextValue) || nextValue === this._value) return;
      const previousValue = this._value;
      this._value = nextValue;
      if (updateKnob) this.updateKnobPosition();
      this.events?.emit?.("change", nextValue, previousValue);
      this.onValueChange?.(nextValue, previousValue);
    }
  }
  class SliderButton2 extends engine2.Sprite {
    constructor(x, y, settings, slider) {
      const shapeMode = !settings.image;
      const spriteSettings = shapeMode ? { ...settings, image: (engine2.game?.renderer ?? engine2.video?.renderer).getCanvas() } : settings;
      super(x, y, spriteSettings);
      this.isKinematic = false;
      this.slider = slider;
      this.isShapeMode = shapeMode;
      this.color = settings.color || "#ffffff";
      this.strokeColor = settings.strokeColor || "#000000";
      this.alpha = normalizeAlpha(settings.alpha ?? settings.opacity);
      this.width = settings.width || 20;
      this.height = settings.height || 20;
      this.shapeType = settings.shapeType || "circle";
      this.dragging = false;
      this.grabOffset = new engine2.Vector2d(0, 0);
      this.scale(settings.scaleX ?? 1, settings.scaleY ?? 1);
      this._onPointerDown = (event2) => this.dragStart(event2);
      this._onPointerMove = (event2) => this.dragMove(event2);
      this._onPointerUp = () => this.dragEnd();
      this._onViewportPointerDown = () => true;
      engine2.input.registerPointerEvent("pointerdown", engine2.game.viewport, this._onViewportPointerDown);
      engine2.input.registerPointerEvent("pointerdown", this, this._onPointerDown);
      engine2.event.on(engine2.event.POINTERMOVE, this._onPointerMove);
      engine2.input.registerPointerEvent("pointerup", engine2.game.viewport, this._onPointerUp);
      engine2.input.registerPointerEvent("pointercancel", engine2.game.viewport, this._onPointerUp);
    }
    onActivateEvent() {
      super.onActivateEvent();
      this.pos.z = this.slider.pos.z + 1;
    }
    dragStart(event2) {
      this.dragging = true;
      this.grabOffset.set(event2.gameX, event2.gameY).sub(this.pos);
      return false;
    }
    dragMove(event2) {
      if (!this.dragging) return;
      const slider = this.slider;
      const horizontal = slider._direction === "LeftToRight" || slider._direction === "RightToLeft";
      const coordinate = horizontal ? Math.max(0, Math.min(event2.gameX - this.grabOffset.x, slider._width)) : Math.max(0, Math.min(event2.gameY - this.grabOffset.y, slider._height));
      let pct = coordinate / (horizontal ? slider._width : slider._height);
      if (slider._direction === "RightToLeft" || slider._direction === "BottomToTop") pct = 1 - pct;
      this.pos.set(horizontal ? coordinate : slider._width / 2, horizontal ? slider._height / 2 : coordinate, this.pos.z);
      slider.setValueInternal(slider._minValue + (slider._maxValue - slider._minValue) * pct, false);
    }
    dragEnd() {
      if (!this.dragging) return true;
      this.dragging = false;
      return false;
    }
    update() {
      return true;
    }
    draw(renderer) {
      if (!this.isShapeMode) return super.draw(renderer);
      const x = this.pos.x;
      const y = this.pos.y;
      renderer.save();
      renderer.setGlobalAlpha(renderer.globalAlpha() * this.alpha);
      renderer.setColor(this.color);
      if (this.shapeType === "circle") renderer.fillEllipse(x, y, this.width / 2, this.height / 2);
      else renderer.fillRect(x, y, this.width, this.height);
      renderer.restore();
    }
    destroy() {
      engine2.input.releasePointerEvent?.("pointerdown", engine2.game.viewport, this._onViewportPointerDown);
      engine2.input.releasePointerEvent?.("pointerdown", this, this._onPointerDown);
      engine2.event.off(engine2.event.POINTERMOVE, this._onPointerMove);
      engine2.input.releasePointerEvent?.("pointerup", engine2.game.viewport, this._onPointerUp);
      engine2.input.releasePointerEvent?.("pointercancel", engine2.game.viewport, this._onPointerUp);
      super.destroy();
    }
  }
  return { AudioGroup: AudioGroup2, AudioMixer: AudioMixer2, GUI_Object: GUI_Object2, Slider: Slider2, SliderButton: SliderButton2 };
}
function createCompatibleShaderEffect(engine2, renderer, source, precision) {
  if (typeof source === "string") {
    return new engine2.ShaderEffect(renderer, source, precision);
  }
  const vertex = source?.vertex;
  const fragment = source?.fragment;
  if (typeof vertex !== "string" || typeof fragment !== "string") {
    throw new TypeError(
      "Melon Runtime: custom shader membutuhkan source vertex dan fragment."
    );
  }
  if (typeof engine2.ShaderEffect !== "function") {
    return new engine2.GLShader(renderer.gl, vertex, fragment, precision);
  }
  const effect = new engine2.ShaderEffect(
    renderer,
    "vec4 apply(vec4 color, vec2 uv) { return color; }",
    precision
  );
  const placeholder = effect._shader;
  const loadedProgram = source?.program;
  effect._shader = loadedProgram instanceof engine2.GLShader && !loadedProgram.destroyed ? loadedProgram : new engine2.GLShader(
    renderer.gl,
    vertex,
    fragment,
    precision || renderer.shaderPrecision
  );
  placeholder?.destroy?.();
  effect._fragmentBody = { vertex, fragment };
  effect.shared = loadedProgram?.shared === true;
  effect.setTime = (seconds) => {
    const uniforms = effect._shader?.uniforms;
    if (typeof uniforms?.uTime !== "undefined") {
      effect._shader.setUniform("uTime", seconds);
    }
    if (typeof uniforms?.TIME !== "undefined") {
      effect._shader.setUniform("TIME", seconds);
    }
    return effect;
  };
  effect.clone = () => {
    const copy = createCompatibleShaderEffect(
      engine2,
      renderer,
      { vertex, fragment },
      precision
    );
    const cache = effect._shader?._uniformCache;
    if (cache && copy._shader) {
      for (const [name, value] of Object.entries(cache)) {
        if (typeof copy._shader.uniforms?.[name] !== "undefined") {
          copy._shader.setUniform(name, value);
        }
      }
    }
    for (const [name, entry] of effect._extraTextures || []) {
      copy.setTexture(name, entry.image, entry.repeat);
    }
    return copy;
  };
  return effect;
}
function createCompatibleShaderLoader(engine2, resolveRenderer) {
  const wrappers = /* @__PURE__ */ new WeakMap();
  const loader2 = Object.create(engine2.loader);
  Object.defineProperty(loader2, "getShader", {
    enumerable: true,
    value(name) {
      const shader = engine2.loader.getShader(name);
      if (!shader || !(shader instanceof engine2.GLShader)) {
        return shader;
      }
      const cached = wrappers.get(shader);
      if (cached && cached.destroyed !== true) return cached;
      const renderer = typeof resolveRenderer === "function" ? resolveRenderer() : resolveRenderer;
      if (!renderer?.gl) return shader;
      const effect = createCompatibleShaderEffect(
        engine2,
        renderer,
        {
          vertex: shader._sourceVertex,
          fragment: shader._sourceFragment,
          program: shader
        },
        shader._precision
      );
      effect.shared = shader.shared === true;
      wrappers.set(shader, effect);
      return effect;
    }
  });
  return loader2;
}
function createCompatibleShaderManager(engine2, loader2, renderer, shaderDefs = []) {
  class ShaderResource {
    constructor(id, textures) {
      this.id = id;
      this.program = null;
      this.textures = {};
      this.setTextures(textures);
    }
    setTextures(textures) {
      textures?.forEach((texture) => {
        this.addTexture(texture.obj, texture.name, texture.settings);
      });
    }
    attachProgram(program) {
      this.program = program;
      if (!program) return;
      program.ancestor = this;
      program.getTexture = (objectName, textureName) => this.getTexture(objectName, textureName);
    }
    addTexture(objectName, textureName, options) {
      var _a;
      (_a = this.textures)[objectName] ?? (_a[objectName] = {});
      const current = this.textures[objectName][textureName];
      if (current?.texture && !current.deferred) return current;
      const entry = options ? { options, texture: null } : { deferred: true, texture: null };
      this.textures[objectName][textureName] = entry;
      return entry;
    }
    createTextureEntry(entry) {
      if (!entry || entry.texture) return;
      if (entry.deferred) {
        entry.texture = renderer.getSharedFrameTexture?.() ?? null;
        entry.deferred = false;
        return;
      }
      if (entry.options && typeof engine2.NoiseTexture2d === "function") {
        entry.source = new engine2.NoiseTexture2d(entry.options);
        entry.texture = typeof entry.source.getTexture === "function" ? entry.source.getTexture(renderer) : entry.source;
      }
    }
    getTexture(objectName, textureName) {
      const entry = this.textures[objectName]?.[textureName];
      if (!entry) return null;
      this.createTextureEntry(entry);
      if (entry.source && typeof entry.source.getTexture === "function") {
        entry.texture = entry.source.getTexture(renderer);
      }
      return entry.texture;
    }
    createTextures() {
      for (const textureMap of Object.values(this.textures)) {
        for (const entry of Object.values(textureMap)) {
          this.createTextureEntry(entry);
        }
      }
    }
  }
  const shaders = {};
  const manager = {
    shaders,
    renderer,
    addShader(id, textures) {
      if (shaders[id]) {
        shaders[id].setTextures(textures);
        return shaders[id];
      }
      const resource = new ShaderResource(id, textures);
      shaders[id] = resource;
      this.attachShader(id);
      return resource;
    },
    addTexture(shaderId, objectName, textureName, options) {
      const resource = this.addShader(shaderId);
      const entry = resource.addTexture(objectName, textureName, options);
      resource.createTextureEntry(entry);
      this.attachShader(shaderId);
      return entry;
    },
    attachShader(id) {
      const resource = shaders[id];
      if (!resource) return null;
      const program = loader2.getShader(id);
      if (program) resource.attachProgram(program);
      return program;
    },
    getShader(id) {
      return shaders[id] ?? null;
    },
    getProgram(id) {
      return shaders[id]?.program ?? this.attachShader(id);
    },
    removeShader(id) {
      delete shaders[id];
    },
    clear() {
      for (const id of Object.keys(shaders)) delete shaders[id];
    },
    initLoadedShaders() {
      for (const id of Object.keys(shaders)) {
        const resource = shaders[id];
        this.attachShader(id);
        resource.createTextures();
      }
    }
  };
  shaderDefs?.forEach((definition) => {
    manager.addShader(definition.name, definition.texture);
  });
  return manager;
}
function installLegacyPoolAliases(engine2, editorClasses = {}) {
  const pool = engine2.pool;
  if (!pool || typeof pool.register !== "function") return [];
  const recyclable = /* @__PURE__ */ new Set([
    "Tween",
    "Color",
    "Gradient",
    "GLShader",
    "Particle",
    "SpriteParticle",
    "Text",
    "BitmapTextData",
    "ColorLayer",
    "Vector2d",
    "Vector3d",
    "ObservableVector2d",
    "ObservableVector3d",
    "Matrix2d",
    "Matrix3d",
    "Rect",
    "RoundRect",
    "Polygon",
    "Line",
    "Point",
    "Ellipse",
    "Bounds",
    "CanvasRenderTarget"
  ]);
  const names = [
    "Entity",
    "Collectable",
    "Trigger",
    "Light2d",
    "Tween",
    "Color",
    "Gradient",
    "GLShader",
    "Particle",
    "SpriteParticle",
    "Sprite",
    "Trail",
    "Slider",
    "NineSliceSprite",
    "Renderable",
    "Text",
    "BitmapText",
    "BitmapTextData",
    "ImageLayer",
    "ColorLayer",
    "Vector2d",
    "Vector3d",
    "ObservableVector2d",
    "ObservableVector3d",
    "Matrix2d",
    "Matrix3d",
    "Rect",
    "RoundRect",
    "Polygon",
    "Line",
    "Point",
    "Ellipse",
    "Bounds",
    "CanvasRenderTarget"
  ];
  const installed = [];
  for (const name of names) {
    const constructor = editorClasses[name] || engine2[name];
    if (typeof constructor !== "function") continue;
    if (pool.objectClass?.[name] || pool.objectClass?.[`me.${name}`]) continue;
    pool.register(name, constructor, recyclable.has(name));
    installed.push(name);
  }
  return installed;
}
function normalizeAlpha(value) {
  const alpha = Number(value);
  return Number.isFinite(alpha) ? Math.max(0, Math.min(alpha, 1)) : 1;
}

// packages/melon-runtime/src/compat/melon-editor-particles.js
function resolveParticleFrame(engine2, emitter, gameData) {
  const configuredSource = emitter.settings.image;
  let source = configuredSource;
  let regionName = emitter.settings.region;
  let region;
  if (typeof configuredSource === "string") {
    const textureName = gameData?.imageLocation?.[configuredSource] ?? emitter.settings.texture;
    const atlas = gameData?.textureMap?.get?.(textureName);
    if (atlas instanceof engine2.TextureAtlas) {
      source = atlas;
      regionName = configuredSource;
    } else {
      source = engine2.loader?.getImage?.(configuredSource);
    }
  }
  if (!source) {
    throw new Error(
      `${emitter.settings.name ?? "ParticleEmitter"} | particle image/texture '${configuredSource}' not found`
    );
  }
  if (source instanceof engine2.TextureAtlas) {
    if (typeof regionName === "string") {
      region = source.getRegion(regionName);
    }
    const image = region ? source.getTexture(region) : source.getTexture();
    return {
      source,
      image,
      offsetX: region?.offset?.x ?? 0,
      offsetY: region?.offset?.y ?? 0,
      width: region?.width ?? image.width,
      height: region?.height ?? image.height
    };
  }
  return {
    source: null,
    image: source,
    offsetX: 0,
    offsetY: 0,
    width: source?.width ?? 1,
    height: source?.height ?? 1
  };
}
function createDefaultParticleTexture(engine2, width = 8, height = 8) {
  const target = new engine2.CanvasRenderTarget(width, height, {
    offscreenCanvas: true
  });
  target.context.fillStyle = "#fff";
  target.context.fillRect(0, 0, width, height);
  return target;
}
function createParticleEmitterDefaults(engine2) {
  return {
    ...engine2.ParticleEmitterSettings,
    width: 1,
    height: 1,
    textureSize: 8,
    tint: "#fff",
    totalParticles: 50,
    angle: Math.PI / 2,
    angleVariation: 0,
    minLife: 1e3,
    maxLife: 3e3,
    lifeTime: 1e3,
    speed: 2,
    speedVariation: 1,
    minRotation: 0,
    maxRotation: 0,
    minStartScale: 1,
    maxStartScale: 1,
    startScale: 1,
    minEndScale: 0,
    maxEndScale: 0,
    endScale: 0,
    gravity: 0,
    wind: 0,
    followTrajectory: false,
    textureAdditive: false,
    blendMode: "normal",
    onlyInViewport: true,
    floating: false,
    maxParticles: 10,
    frequency: 100,
    duration: Infinity,
    framesToSkip: 0
  };
}
function createMelonJs174ParticleClasses(engine2) {
  const availableParticles = [];
  const particleEmitterDefaults = createParticleEmitterDefaults(engine2);
  let gameData;
  class ParticleV1742 extends engine2.Renderable {
    constructor(emitter) {
      const frame = resolveParticleFrame(engine2, emitter, gameData);
      super(
        emitter.getRandomPointX(),
        emitter.getRandomPointY(),
        frame.width,
        frame.height
      );
      this.vel = new engine2.Vector2d();
      this.frameOffset = new engine2.Vector2d();
      this.onResetEvent(emitter, true, frame);
    }
    onResetEvent(emitter, newInstance = false, resolvedFrame) {
      const frame = resolvedFrame ?? resolveParticleFrame(engine2, emitter, gameData);
      if (!newInstance) {
        this.pos.set(emitter.getRandomPointX(), emitter.getRandomPointY());
        this.resize(frame.width, frame.height);
        this.currentTransform.identity();
      }
      this.source = frame.source;
      this.image = frame.image;
      this.frameOffset.set(frame.offsetX, frame.offsetY);
      this.resize(frame.width, frame.height);
      this.alwaysUpdate = true;
      this.alive = true;
      this.alpha = 1;
      if (typeof emitter.settings.tint === "string") {
        this.tint.parseCSS(emitter.settings.tint);
      }
      this.blendMode = emitter.settings.textureAdditive ? "additive" : "normal";
      if (emitter.settings.blendMode !== "normal") {
        this.blendMode = emitter.settings.blendMode;
      }
      const angle = emitter.settings.angle + (emitter.settings.angleVariation > 0 ? (Math.random() * 2 - 1) * emitter.settings.angleVariation : 0);
      const speed = emitter.settings.speed + (emitter.settings.speedVariation > 0 ? (Math.random() * 2 - 1) * emitter.settings.speedVariation : 0);
      this.vel.set(speed * Math.cos(angle), -speed * Math.sin(angle));
      this.life = emitter.settings.lifeTime;
      this.startLife = this.life;
      this.startScale = emitter.settings.startScale;
      this.endScale = emitter.settings.endScale;
      this.gravity = emitter.settings.gravity;
      this.wind = emitter.settings.wind;
      this.followTrajectory = emitter.settings.followTrajectory;
      this.onlyInViewport = emitter.settings.onlyInViewport;
      this._deltaInv = engine2.timer.maxfps / 1e3;
      if (!this.followTrajectory) {
        this.angle = Math.random() * (emitter.settings.maxRotation - emitter.settings.minRotation) + emitter.settings.minRotation;
      }
      const visualAngle = this.followTrajectory ? Math.atan2(this.vel.y, this.vel.x) : this.angle;
      this.anchorPoint.set(0.5, 0.5);
      this.currentTransform.identity().scale(this.startScale, this.startScale).rotate(visualAngle);
      this.updateBounds();
    }
    update(dt) {
      const skew = dt * this._deltaInv;
      this.life = this.life > dt ? this.life - dt : 0;
      if (this.alive && this.life <= 0) {
        const parent = this.ancestor;
        this.alive = false;
        parent?.removeChildNow(this, true);
        availableParticles.push(this);
        return false;
      }
      const ageRatio = this.life / this.startLife;
      let scale = this.startScale;
      const scaleMultiplier = this.startScale + (this.endScale - this.startScale) * (1 - ageRatio);
      scale *= scaleMultiplier;
      this.alpha = ageRatio;
      this.vel.x += this.wind * skew;
      this.vel.y += this.gravity * skew;
      const angle = this.followTrajectory ? Math.atan2(this.vel.y, this.vel.x) : this.angle;
      this.pos.x += this.vel.x * skew;
      this.pos.y += this.vel.y * skew;
      this.currentTransform.identity().scale(scale, scale).rotate(angle);
      this.updateBounds();
      this.isDirty = this.inViewport || !this.onlyInViewport;
      return this.isDirty;
    }
    draw(renderer) {
      renderer.drawImage(
        this.image,
        this.frameOffset.x,
        this.frameOffset.y,
        this.width,
        this.height,
        this.pos.x,
        this.pos.y,
        this.width,
        this.height
      );
    }
  }
  class ParticleEmitterV1742 extends engine2.Container {
    constructor(x, y, settings = {}) {
      super(x, y, settings.width ?? 1, settings.height ?? 1);
      this.settings = {};
      this.centerOn(x, y);
      this._stream = false;
      this._frequencyTimer = 0;
      this._durationTimer = 0;
      this._enabled = false;
      this._updateCount = 0;
      this._dt = 0;
      this._hasSpawned = false;
      this.spawnInterval = void 0;
      this.spawnTimer = 0;
      this._spawnIntervalTotalParticles = void 0;
      this._spawnIntervalLifeTime = void 0;
      this.alwaysUpdate = true;
      this.autoSort = false;
      this.reset(settings);
      this.settings.angle *= Math.PI / 180;
      this.settings.angleVariation *= Math.PI / 180;
    }
    reset(settings = {}) {
      if (this._destroying) {
        return super.reset();
      }
      if (this._defaultParticle) {
        this._defaultParticle.destroy();
        this._defaultParticle = void 0;
      }
      Object.assign(this.settings, particleEmitterDefaults, settings);
      this.spawnInterval = void 0;
      this.spawnTimer = 0;
      this._spawnIntervalTotalParticles = void 0;
      this._spawnIntervalLifeTime = void 0;
      this._hasSpawned = false;
      if (typeof this.settings.image === "undefined") {
        this._defaultParticle = createDefaultParticleTexture(
          engine2,
          this.settings.textureSize,
          this.settings.textureSize
        );
        this.settings.image = this._defaultParticle.canvas;
      }
      this.floating = this.settings.floating;
      this.isDirty = true;
      return this;
    }
    getRandomPointX() {
      return Math.random() * this.getBounds().width;
    }
    getRandomPointY() {
      return Math.random() * this.getBounds().height;
    }
    addParticles(count) {
      const z = this.depth;
      for (let i = 0; i < count; i++) {
        const particle = availableParticles.pop();
        if (particle) particle.onResetEvent(this);
        this.addChild(particle ?? new ParticleV1742(this), z);
      }
      if (count > 0) this._hasSpawned = true;
      this.isDirty = true;
    }
    isRunning() {
      return this._enabled && this._stream;
    }
    streamParticles(duration) {
      const wasRunning = this.isRunning();
      this._enabled = true;
      this._stream = true;
      this.settings.frequency = Math.max(1, this.settings.frequency);
      this._durationTimer = typeof duration === "number" ? duration : this.settings.duration;
      if (!wasRunning) {
        const totalParticles = Math.max(
          1,
          Number(this.settings.totalParticles) || 1
        );
        const lifeTime = Math.max(1, Number(this.settings.lifeTime) || 1);
        this.spawnInterval = lifeTime / totalParticles;
        this._spawnIntervalTotalParticles = totalParticles;
        this._spawnIntervalLifeTime = lifeTime;
        this.spawnTimer = 0;
      }
    }
    stopStream() {
      this._enabled = false;
      this.spawnInterval = void 0;
      this._spawnIntervalTotalParticles = void 0;
      this._spawnIntervalLifeTime = void 0;
    }
    burstParticles(total) {
      this._enabled = true;
      this._stream = false;
      this.addParticles(
        typeof total === "number" ? total : this.settings.totalParticles
      );
      this._enabled = false;
    }
    update(dt) {
      const children = this.getChildren();
      if (!this._stream && children.length === 0) {
        return false;
      }
      if (++this._updateCount > this.settings.framesToSkip) {
        this._updateCount = 0;
      }
      if (this._updateCount > 0) {
        this._dt += dt;
        return this.isDirty;
      }
      dt += this._dt;
      this._dt = 0;
      const childrenDirty = super.update(dt);
      this.isDirty = this.isDirty || childrenDirty;
      if (this._enabled && this._stream) {
        if (this._durationTimer !== Infinity) {
          this._durationTimer -= dt;
          if (this._durationTimer <= 0) {
            this.stopStream();
            return this.isDirty;
          }
        }
        const totalParticles = Math.max(
          1,
          Number(this.settings.totalParticles) || 1
        );
        const lifeTime = Math.max(1, Number(this.settings.lifeTime) || 1);
        if (!this.spawnInterval || this._spawnIntervalTotalParticles !== totalParticles || this._spawnIntervalLifeTime !== lifeTime) {
          this.spawnInterval = lifeTime / totalParticles;
          this._spawnIntervalTotalParticles = totalParticles;
          this._spawnIntervalLifeTime = lifeTime;
          if (!Number.isFinite(this.spawnTimer)) this.spawnTimer = 0;
        }
        this.spawnTimer += dt;
        while (this.spawnTimer >= this.spawnInterval) {
          this.spawnTimer -= this.spawnInterval;
          if (this.getChildren().length < totalParticles) {
            this.addParticles(1);
            this.isDirty = true;
          }
        }
      }
      return this.isDirty;
    }
    destroy() {
      const defaultParticle = this._defaultParticle;
      this._defaultParticle = void 0;
      this._destroying = true;
      super.destroy(...arguments);
      this._destroying = false;
      defaultParticle?.destroy();
      if (this.settings) {
        this.settings.image = void 0;
        this.settings = void 0;
      }
    }
  }
  return {
    ParticleV174: ParticleV1742,
    ParticleEmitterV174: ParticleEmitterV1742,
    ParticleEmitterSettingsV174: particleEmitterDefaults,
    configureParticleAssets(nextGameData) {
      gameData = nextGameData;
    }
  };
}

// packages/melon-runtime/src/compat/melon-editor-text.js
function createMelonJs174TextClasses(engine2) {
  const { Renderable, Bounds, Color } = engine2;
  const getImage = (name) => engine2.loader.getImage(name);
  const getBinary = (name) => engine2.loader.getBinary(name);
  const nextPowerOfTwo = (value) => 2 ** Math.ceil(Math.log2(Math.max(1, value)));
  const runits = ["ex", "em", "pt", "px"];
  const toPX = [12, 24, 0.75, 1];
  let textCanvasTarget = null;
  function setContextStyle(context, style) {
    context.font = style.font;
    context.fillStyle = style.fillStyle.toRGBA();
    context.strokeStyle = style.strokeStyle.toRGBA();
    context.lineWidth = style.lineWidth;
    context.textAlign = style.textAlign;
    context.textBaseline = style.textBaseline;
  }
  function transformTextBounds(text, bounds) {
    let current = text;
    while (current) {
      const x = current.pos.x;
      const y = current.pos.y;
      if (current === text) bounds.translate(-x, -y);
      const ax = current.applyAnchorTransform === false || !Number.isFinite(current.width) ? 0 : current.width * current.anchorPoint.x;
      const ay = current.applyAnchorTransform === false || !Number.isFinite(current.height) ? 0 : current.height * current.anchorPoint.y;
      bounds.translate(-ax, -ay);
      if (current.autoTransform && !current.currentTransform.isIdentity()) {
        const { min, max } = bounds;
        const left = min.x, top = min.y, right = max.x, bottom = max.y;
        bounds.clear();
        bounds.addFrame(left, top, right, bottom, current.currentTransform);
      }
      bounds.translate(x, y);
      if (current.floating) break;
      current = current.ancestor;
    }
    return bounds;
  }
  class TextV1742 extends Renderable {
    constructor(x, y, settings) {
      super(x, y, settings.width || 0, settings.height || 0);
      this.fillStyle = new Color(0, 0, 0);
      this.strokeStyle = new Color(0, 0, 0);
      this.lineWidth = 0;
      this.textAlign = "left";
      this.textBaseline = "top";
      this.lineHeight = 1;
      this.wordWrapWidth = -1;
      this.fontSize = 10;
      this._text = [];
      this.onResetEvent(x, y, settings);
    }
    onResetEvent(x, y, settings) {
      this.metrics = void 0;
      this.currentTransform.identity();
      this.pos.setMuted(Number(x) || 0, Number(y) || 0, 0);
      this.name = settings.name || "";
      this.floating = !!settings.floating;
      this.fillStyle?.setColor(0, 0, 0, 1);
      this.strokeStyle?.setColor(0, 0, 0, 1);
      if (typeof this.fillStyle === "undefined") {
        this.fillStyle = new Color(0, 0, 0);
      }
      if (typeof this.strokeStyle === "undefined") {
        this.strokeStyle = new Color(0, 0, 0);
      }
      if (typeof settings.fillStyle !== "undefined") {
        if (settings.fillStyle instanceof Color) {
          this.fillStyle.copy(settings.fillStyle);
        } else {
          this.fillStyle.parseCSS(settings.fillStyle);
        }
      }
      if (typeof settings.strokeStyle !== "undefined") {
        if (settings.strokeStyle instanceof Color) {
          this.strokeStyle.copy(settings.strokeStyle);
        } else {
          this.strokeStyle.parseCSS(settings.strokeStyle);
        }
      }
      this.lineWidth = settings.lineWidth || 0;
      this.textAlign = settings.textAlign || "left";
      this.textBaseline = settings.textBaseline || "top";
      this.lineHeight = settings.lineHeight || 1;
      this.wordWrapWidth = settings.wordWrapWidth || -1;
      this.fontSize = 10;
      this.rotate(settings.rotation ?? 0);
      if (typeof settings.anchorPoint !== "undefined") {
        this.anchorPoint.set(settings.anchorPoint.x, settings.anchorPoint.y);
      } else {
        this.anchorPoint.set(0, 0);
      }
      if (typeof settings.floating !== "undefined") {
        this.floating = !!settings.floating;
      }
      this.setFont(settings.font, settings.size);
      if (settings.bold === true) {
        this.bold();
      }
      if (settings.italic === true) {
        this.italic();
      }
      textCanvasTarget ?? (textCanvasTarget = new engine2.CanvasRenderTarget(2, 2, { offscreenCanvas: false }));
      this.canvasTexture = textCanvasTarget;
      this.metrics = new TextMetricsV1742(this);
      this.setText(settings.text);
      this._lastMetricsX = this.pos.x;
      this._lastMetricsY = this.pos.y;
      this._scaleX = settings.scaleX ?? 1;
      this._scaleY = settings.scaleY ?? 1;
      this.scale(this._scaleX, this._scaleY);
      this.alpha = settings.alpha ?? 1;
    }
    bold() {
      this.font = "bold " + this.font;
      this.isDirty = true;
      return this;
    }
    italic() {
      this.font = "italic " + this.font;
      this.isDirty = true;
      return this;
    }
    setFont(font, size = 10) {
      let font_names = font.split(",").map((value) => {
        value = value.trim();
        return !/(^".*"$)|(^'.*'$)/.test(value) ? '"' + value + '"' : value;
      });
      if (typeof size === "number") {
        this.fontSize = size;
        size += "px";
      } else {
        let CSSval = size.match(/([-+]?[\d.]*)(.*)/);
        this.fontSize = parseFloat(CSSval[1]);
        if (CSSval[2]) {
          this.fontSize *= toPX[runits.indexOf(CSSval[2])];
        } else {
          size += "px";
        }
      }
      this.height = this.fontSize;
      this.font = size + " " + font_names.join(",");
      this.isDirty = true;
      return this;
    }
    setText(value = "") {
      let bounds = this.getBounds();
      if (this._text.toString() !== value.toString()) {
        if (!Array.isArray(value)) {
          this._text = ("" + value).split("\n");
        } else {
          this._text = value.slice();
        }
      }
      if (this._text.length > 0 && this.wordWrapWidth > 0) {
        this._text = this.metrics.wordWrap(this._text, this.wordWrapWidth, this.canvasTexture.context);
      }
      this.updateBounds();
      this._lastMetricsX = this.pos.x;
      this._lastMetricsY = this.pos.y;
      this.isDirty = true;
      return this;
    }
    // Accept both the 17.4 (renderer, text) and v20 (text) signatures.
    measureText(rendererOrText, text) {
      const value = text ?? (typeof rendererOrText === "string" || Array.isArray(rendererOrText) ? rendererOrText : this._text);
      return this.metrics.measureText(value, this.canvasTexture.context);
    }
    updateBounds(absolute = true) {
      if (!this.metrics) return super.updateBounds(absolute);
      const bounds = this.getBounds();
      bounds.clear();
      bounds.addBounds(this.measureText());
      if (absolute) transformTextBounds(this, bounds);
      return bounds;
    }
    draw(renderer, text, x = this.pos.x, y = this.pos.y) {
      if (typeof this.ancestor === "undefined") {
        if (this.pos.x !== x || this.pos.y !== y) {
          this.pos.x = x;
          this.pos.y = y;
          this.isDirty = true;
        }
        if (typeof text !== "undefined") this.setText(text);
        renderer.save();
        renderer.setGlobalAlpha(renderer.globalAlpha() * this.getOpacity());
      } else if (this._lastMetricsX !== this.pos.x || this._lastMetricsY !== this.pos.y) {
        this.metrics.measureText(this._text, this.canvasTexture.context);
        this._lastMetricsX = this.pos.x;
        this._lastMetricsY = this.pos.y;
      }
      const padding = Math.max(2, Math.ceil(this.fontSize * 0.25), this.lineWidth);
      let width = Math.ceil(this.metrics.width + padding * 2);
      let height = Math.ceil(this.metrics.height + padding * 2);
      if (renderer.WebGLVersion === 1) {
        width = nextPowerOfTwo(width);
        height = nextPowerOfTwo(height);
      }
      if (this.canvasTexture.width < width || this.canvasTexture.height < height) {
        this.canvasTexture.resize(width, height);
      }
      this.canvasTexture.clear();
      this._drawFont(
        this.canvasTexture.context,
        this._text,
        this.pos.x - this.metrics.x + padding,
        padding
      );
      this.canvasTexture.invalidate(renderer);
      let dx = this.metrics.x;
      let dy = this.metrics.y;
      if (renderer.settings.subPixel === false) {
        dx = ~~dx;
        dy = ~~dy;
      }
      renderer.drawImage(this.canvasTexture.canvas, dx - padding, dy - padding);
      if (typeof this.ancestor === "undefined") {
        renderer.restore();
      }
    }
    drawStroke(renderer, text, x, y) {
      this.draw(renderer, text, x, y);
    }
    _drawFont(context, text, x, y) {
      setContextStyle(context, this);
      context.textBaseline = "top";
      for (let i = 0; i < text.length; i++) {
        const string = text[i].trimEnd();
        if (this.fillStyle.alpha > 0) {
          context.fillText(string, x, y);
        }
        if (this.lineWidth > 0 && this.strokeStyle.alpha > 0) {
          context.strokeText(string, x, y);
        }
        y += this.metrics.lineHeight();
      }
      return this.metrics;
    }
    destroy() {
      this.canvasTexture = void 0;
      this.fillStyle = this.strokeStyle = void 0;
      this.metrics = void 0;
      this._text.length = 0;
      super.destroy();
    }
  }
  class TextMetricsV1742 extends Bounds {
    constructor(ancestor) {
      super();
      this.ancestor = ancestor;
      this.setMinMax(0, 0, 0, 0);
    }
    lineHeight() {
      if (this.ancestor instanceof TextV1742) {
        return this.ancestor.fontSize * this.ancestor.lineHeight;
      } else {
        return (this.ancestor.fontData.lineHeight || this.ancestor.fontData.capHeight) * this.ancestor.lineHeight * this.ancestor.fontScale.y;
      }
    }
    lineWidth(text, context) {
      if (this.ancestor instanceof TextV1742) {
        return context.measureText(text).width;
      } else {
        let characters = text.split("");
        const charactersLength = characters.length;
        let width = 0;
        let lastGlyph = null;
        for (let i = 0; i < charactersLength; i++) {
          let ch = characters[i].charCodeAt(0);
          let glyph = this.ancestor.fontData.glyphs[ch];
          if (typeof glyph !== "undefined") {
            let kerning = lastGlyph && lastGlyph.kerning ? lastGlyph.getKerning(ch) : 0;
            width += (glyph.xadvance + kerning) * this.ancestor.fontScale.x;
            lastGlyph = glyph;
          }
        }
        return width;
      }
    }
    measureText(text, context) {
      let strings;
      if (!Array.isArray(text)) {
        strings = ("" + text).split("\n");
      } else {
        strings = text;
      }
      if (typeof context !== "undefined") {
        context.save();
        setContextStyle(context, this.ancestor);
      }
      this.width = this.height = 0;
      for (let i = 0; i < strings.length; i++) {
        this.width = Math.max(this.lineWidth(strings[i].trimEnd(), context), this.width);
        this.height += this.lineHeight();
      }
      this.width = Math.ceil(this.width);
      this.height = Math.ceil(this.height);
      this.x = Math.floor(this.ancestor.textAlign === "right" ? this.ancestor.pos.x - this.width : this.ancestor.textAlign === "center" ? this.ancestor.pos.x - this.width / 2 : this.ancestor.pos.x);
      this.y = Math.floor(
        this.ancestor.textBaseline.search(/^(top|hanging)$/) === 0 ? this.ancestor.pos.y : this.ancestor.textBaseline === "middle" ? this.ancestor.pos.y - this.height / 2 : this.ancestor.pos.y - this.height
        // Gunakan total height untuk bottom/alphabetic
      );
      if (typeof context !== "undefined") {
        context.restore();
      }
      return this;
    }
    wordWrap(text, width, context) {
      if (Array.isArray(text)) {
        text = text.join("\n");
      }
      if (typeof context !== "undefined") {
        context.save();
        setContextStyle(context, this.ancestor);
      }
      let output = [];
      let paragraphs = text.split("\n");
      for (let p = 0; p < paragraphs.length; p++) {
        let words = paragraphs[p].split(" ");
        let currentLine = words[0];
        for (let i = 1; i < words.length; i++) {
          let word = words[i];
          let testLine = currentLine + " " + word;
          let testWidth = this.lineWidth(testLine, context);
          if (testWidth <= width) {
            currentLine = testLine;
          } else {
            output.push(currentLine);
            currentLine = word;
          }
        }
        output.push(currentLine);
      }
      if (typeof context !== "undefined") {
        context.restore();
      }
      return output;
    }
  }
  let bitmapTextTextureVersion = 0;
  engine2.event.on(engine2.event.STATE_RESUME, () => {
    bitmapTextTextureVersion++;
  });
  engine2.event.on(engine2.event.WINDOW_ONRESIZE, () => {
    bitmapTextTextureVersion++;
  });
  engine2.event.on(engine2.event.CANVAS_ONRESIZE, () => {
    bitmapTextTextureVersion++;
  });
  engine2.event.on(engine2.event.ONCONTEXT_RESTORED, () => {
    bitmapTextTextureVersion++;
  });
  class BitmapTextV1742 extends Renderable {
    constructor(x, y, settings) {
      super(x, y, settings.width || 0, settings.height || 0);
      this.name = settings.name || "";
      this.textAlign = settings.textAlign || "left";
      this.textBaseline = settings.textBaseline || "top";
      this.lineHeight = settings.lineHeight || 1;
      this.wordWrapWidth = settings.wordWrapWidth || -1;
      this._text = [];
      this.fontScale = new engine2.Vector2d(1, 1);
      this.fontImage = typeof settings.font === "object" ? settings.font : getImage(settings.font);
      this.rotate(settings.rotation ?? 0);
      if (typeof settings.fontData !== "string") {
        this.fontData = new engine2.BitmapTextData(getBinary(settings.font));
      } else {
        this.fontData = new engine2.BitmapTextData(
          settings.fontData.includes("info face") ? settings.fontData : getBinary(settings.fontData)
        );
      }
      if (typeof settings.floating !== "undefined") {
        this.floating = !!settings.floating;
      }
      if (typeof settings.fillStyle !== "undefined") {
        this.fillStyle = settings.fillStyle;
      }
      if (typeof settings.anchorPoint !== "undefined") {
        this.anchorPoint.set(settings.anchorPoint.x, settings.anchorPoint.y);
      } else {
        this.anchorPoint.set(0, 0);
      }
      this.metrics = new TextMetricsV1742(this);
      if (typeof settings.size === "number" && settings.size !== 1) {
        this.resize(settings.size);
      }
      this.setText(settings.text);
      this._fontTextureVersion = bitmapTextTextureVersion;
    }
    set(textAlign, scale) {
      this.textAlign = textAlign;
      if (scale) {
        this.resize(scale);
      }
      this.isDirty = true;
      return this;
    }
    setWordWrapWidth(width = -1) {
      this.wordWrapWidth = Number(width) || -1;
      this.setText(this._text.join("\n"));
      this.isDirty = true;
      return this;
    }
    setText(value = "") {
      if (this._text.toString() !== value.toString()) {
        if (!Array.isArray(value)) {
          this._text = ("" + value).split("\n");
        } else {
          this._text = value.slice();
        }
        this.isDirty = true;
      }
      if (this._text.length > 0 && this.wordWrapWidth > 0) {
        this._text = this.metrics.wordWrap(this._text, this.wordWrapWidth);
      }
      this.updateBounds();
      return this;
    }
    updateBounds(absolute = true) {
      if (!this.metrics) return super.updateBounds(absolute);
      const bounds = this.getBounds();
      bounds.clear();
      bounds.addBounds(this.measureText());
      if (absolute) transformTextBounds(this, bounds);
      return bounds;
    }
    get fillStyle() {
      return this.tint;
    }
    set fillStyle(value) {
      if (value instanceof Color) {
        this.tint.copy(value);
      } else {
        this.tint.parseCSS(value);
      }
    }
    resize(scale) {
      this.fontScale.set(scale, scale);
      this.updateBounds();
      this.isDirty = true;
      return this;
    }
    measureText(text = this._text) {
      return this.metrics.measureText(text);
    }
    invalidateFontTextureIfNeeded(renderer) {
      if (this._fontTextureVersion === bitmapTextTextureVersion) return;
      if (renderer.type?.startsWith("WebGL") && renderer.cache.has(this.fontImage)) {
        renderer.flush();
        renderer.setBatcher("quad");
        const unit = renderer.cache.getUnit(renderer.cache.get(this.fontImage));
        renderer.currentBatcher.markTextureDirty(unit);
      }
      this._fontTextureVersion = bitmapTextTextureVersion;
    }
    draw(renderer, text, x = this.pos.x, y = this.pos.y) {
      this.invalidateFontTextureIfNeeded(renderer);
      let _alpha = renderer.globalAlpha();
      if (typeof this.ancestor === "undefined") {
        if (typeof text !== "undefined") this.setText(text);
        renderer.setGlobalAlpha(_alpha * this.getOpacity());
      } else {
        x = this.pos.x;
        y = this.pos.y;
      }
      let lX = x;
      let stringHeight = this.metrics.lineHeight();
      let blockHeight = this._text.length * stringHeight;
      let maxWidth = 0;
      switch (this.textBaseline) {
        case "middle":
          y -= blockHeight * 0.5;
          break;
        case "ideographic":
        case "alphabetic":
        case "bottom":
          y -= blockHeight;
          break;
        default:
          break;
      }
      for (let i = 0; i < this._text.length; i++) {
        x = lX;
        const string = this._text[i].trimEnd();
        let stringWidth = this.metrics.lineWidth(string);
        switch (this.textAlign) {
          case "right":
            x -= stringWidth;
            break;
          case "center":
            x -= stringWidth * 0.5;
            break;
          default:
            break;
        }
        if (this.isDirty === true && typeof this.ancestor === "undefined") {
          if (i === 0) {
            this.pos.y = y;
          }
          if (maxWidth < stringWidth) {
            maxWidth = stringWidth;
            this.pos.x = x;
          }
        }
        let lastGlyph = null;
        for (let c = 0, len = string.length; c < len; c++) {
          let ch = string.charCodeAt(c);
          let glyph = this.fontData.glyphs[ch];
          if (typeof glyph !== "undefined") {
            let glyphWidth = glyph.width;
            let glyphHeight = glyph.height;
            let kerning = lastGlyph && lastGlyph.kerning ? lastGlyph.getKerning(ch) : 0;
            let scaleX = this.fontScale.x;
            let scaleY = this.fontScale.y;
            if (glyphWidth !== 0 && glyphHeight !== 0) {
              renderer.drawImage(
                this.fontImage,
                glyph.x,
                glyph.y,
                glyphWidth,
                glyphHeight,
                x + glyph.xoffset * scaleX,
                y + glyph.yoffset * scaleY,
                glyphWidth * scaleX,
                glyphHeight * scaleY
              );
            }
            x += (glyph.xadvance + kerning) * scaleX;
            lastGlyph = glyph;
          }
        }
        y += stringHeight;
      }
      if (typeof this.ancestor === "undefined") {
        renderer.setGlobalAlpha(_alpha);
      }
      this.isDirty = false;
    }
    destroy() {
      this.fontScale = void 0;
      this.fontData = void 0;
      this._text.length = 0;
      this.metrics = void 0;
      super.destroy();
    }
  }
  return { TextV174: TextV1742, BitmapTextV174: BitmapTextV1742, TextMetricsV174: TextMetricsV1742 };
}
var installedTextFactories = /* @__PURE__ */ new WeakMap();
function installMelonEditorTextFactories(engine2, { Text: Text3, BitmapText: BitmapText3 }) {
  for (const [name, Constructor] of [["Text", Text3], ["BitmapText", BitmapText3]]) {
    if (engine2.pool.objectClass?.[name]?.class !== Constructor) {
      engine2.pool.register(name, Constructor, name === "Text");
    }
  }
  const installed = installedTextFactories.get(engine2);
  if (installed?.Text === Text3 && installed?.BitmapText === BitmapText3) return;
  engine2.registerTiledObjectFactory("text", (settings) => {
    const options = {
      ...settings.text,
      anchorPoint: settings.text.anchorPoint ?? settings.anchorPoint
    };
    const Constructor = options.bitmap === true ? BitmapText3 : Text3;
    const text = new Constructor(settings.x, settings.y, options);
    text.pos.z = settings.z;
    return text;
  });
  installedTextFactories.set(engine2, { Text: Text3, BitmapText: BitmapText3 });
}

// packages/melon-runtime/src/compat/melon-editor-audio.js
function clampVolume(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(Math.max(number, 0), 1) : 1;
}
function sourceMatchesName(source, name) {
  if (typeof source !== "string" || source.startsWith("data:")) return false;
  const cleanSource = source.split(/[?#]/, 1)[0];
  const fileName = cleanSource.slice(cleanSource.lastIndexOf("/") + 1);
  const extensionIndex = fileName.lastIndexOf(".");
  const baseName = extensionIndex === -1 ? fileName : fileName.slice(0, extensionIndex);
  try {
    return decodeURIComponent(baseName) === name;
  } catch {
    return baseName === name;
  }
}
function getNameFromSource(source) {
  if (typeof source !== "string" || source.startsWith("data:")) return void 0;
  const cleanSource = source.split(/[?#]/, 1)[0];
  const fileName = cleanSource.slice(cleanSource.lastIndexOf("/") + 1);
  const extensionIndex = fileName.lastIndexOf(".");
  const baseName = extensionIndex === -1 ? fileName : fileName.slice(0, extensionIndex);
  try {
    return decodeURIComponent(baseName);
  } catch {
    return baseName;
  }
}
function createMelonEditorAudioCompatibility(engine2, options = {}) {
  const nativeAudio = options.audio ?? engine2?.audio;
  if (!nativeAudio || typeof nativeAudio !== "object") {
    throw new TypeError("Melon Runtime: the engine audio module is unavailable.");
  }
  const clipVolumes = /* @__PURE__ */ new Map();
  const knownTracks = /* @__PURE__ */ new Map();
  const getHowler = options.getHowler ?? (() => globalThis.Howler);
  const audio2 = Object.assign(/* @__PURE__ */ Object.create(null), nativeAudio);
  function rememberHowlerTracks() {
    const howls = getHowler()?._howls;
    if (!Array.isArray(howls)) return;
    for (const howl of howls) {
      const sources = Array.isArray(howl?._src) ? howl._src : [howl?._src];
      for (const source of sources) {
        const inferredName = getNameFromSource(source);
        if (inferredName) knownTracks.set(inferredName, howl);
      }
      for (const [name] of clipVolumes) {
        if (sources.some((source) => sourceMatchesName(source, name))) {
          knownTracks.set(name, howl);
        }
      }
    }
  }
  function findTrack(name) {
    if (knownTracks.has(name)) return knownTracks.get(name);
    const howls = getHowler()?._howls;
    if (!Array.isArray(howls)) return void 0;
    const track = [...howls].reverse().find((howl) => {
      const sources = Array.isArray(howl?._src) ? howl._src : [howl?._src];
      return sources.some((source) => sourceMatchesName(source, name));
    });
    if (track) knownTracks.set(name, track);
    return track;
  }
  function createTrackFacade(name) {
    return {
      play(id) {
        return typeof id === "undefined" ? audio2.play(name) : nativeAudio.resume(name, id);
      },
      stop(id) {
        return nativeAudio.stop(name, id);
      },
      pause(id) {
        return nativeAudio.pause(name, id);
      },
      volume(value, id) {
        return typeof value === "undefined" ? audio2.getAudioVolume(name, id) : audio2.setAudioVolume(name, value, id);
      },
      fade(from, to, duration, id) {
        return audio2.fade(name, from, to, duration, id);
      },
      mute(value = true, id) {
        return nativeAudio.mute(name, id, value);
      }
    };
  }
  audio2.play = (name, loop = false, onEnd, volume) => {
    const clipName = String(name);
    const selectedVolume = typeof volume === "number" ? clampVolume(volume) : clipVolumes.get(clipName);
    const id = nativeAudio.play(clipName, loop, onEnd, selectedVolume);
    if (typeof selectedVolume === "number") clipVolumes.set(clipName, selectedVolume);
    rememberHowlerTracks();
    return id;
  };
  audio2.load = (...args) => {
    const result = nativeAudio.load(...args);
    const name = args[0]?.name;
    if (typeof name === "string" && !clipVolumes.has(name)) {
      clipVolumes.set(name, clampVolume(nativeAudio.getVolume?.() ?? 1));
    }
    rememberHowlerTracks();
    return result;
  };
  audio2.fade = (name, from, to, duration, id) => {
    const result = nativeAudio.fade(name, from, to, duration, id);
    clipVolumes.set(String(name), clampVolume(to));
    return result;
  };
  audio2.setAudioVolume = (name, volume, id) => {
    const clipName = String(name);
    const nextVolume = clampVolume(volume);
    const track = findTrack(clipName);
    if (track && typeof track.volume === "function") {
      track.volume(nextVolume, id);
    } else {
      nativeAudio.fade(clipName, nextVolume, nextVolume, 0, id);
    }
    clipVolumes.set(clipName, nextVolume);
    return nextVolume;
  };
  audio2.getAudioVolume = (name, id) => {
    const clipName = String(name);
    const track = findTrack(clipName);
    if (track && typeof track.volume === "function") {
      return typeof id === "undefined" ? track.volume() : track.volume(id);
    }
    return clipVolumes.get(clipName) ?? clampVolume(nativeAudio.getVolume?.() ?? 1);
  };
  audio2.getTrack = () => {
    rememberHowlerTracks();
    const tracks = /* @__PURE__ */ Object.create(null);
    const names = /* @__PURE__ */ new Set([...clipVolumes.keys(), ...knownTracks.keys()]);
    for (const name of names) {
      tracks[name] = knownTracks.get(name) ?? createTrackFacade(name);
    }
    return tracks;
  };
  audio2.stopAll = () => {
    if (typeof nativeAudio.stopAll === "function") {
      return nativeAudio.stopAll();
    }
    const result = nativeAudio.stop();
    const howls = getHowler()?._howls;
    if (Array.isArray(howls)) {
      for (const howl of howls) howl?.off?.("end");
    }
    return result;
  };
  audio2.unload = (name) => {
    const result = nativeAudio.unload(name);
    if (result !== false) {
      clipVolumes.delete(String(name));
      knownTracks.delete(String(name));
    }
    return result;
  };
  audio2.unloadAll = () => {
    const result = nativeAudio.unloadAll();
    clipVolumes.clear();
    knownTracks.clear();
    return result;
  };
  return audio2;
}

// packages/melon-runtime/src/entries/melonjs-20.0.0.js
export * from "./melonjs.module.js";
var TilemapScene = createTilemapSceneClass(engine);
var audio = createMelonEditorAudioCompatibility(engine);
var { AudioGroup, AudioMixer, GUI_Object, Slider, SliderButton } = createMelonEditorClasses(engine, { audio });
var {
  ParticleV174,
  ParticleEmitterV174,
  ParticleEmitterSettingsV174,
  configureParticleAssets
} = createMelonJs174ParticleClasses(engine);
var { TextV174, BitmapTextV174, TextMetricsV174 } = createMelonJs174TextClasses(engine);
var Text2 = TextV174;
var BitmapText2 = BitmapTextV174;
var TextMetrics = TextMetricsV174;
var TextV20 = engine.Text;
var BitmapTextV20 = engine.BitmapText;
installLegacyPoolAliases(engine, { Slider, Text: Text2, BitmapText: BitmapText2 });
installMelonEditorTextFactories(engine, { Text: Text2, BitmapText: BitmapText2 });
engine.event.on(engine.event.BOOT, () => {
  installMelonEditorTextFactories(engine, { Text: Text2, BitmapText: BitmapText2 });
});
var Particle2 = ParticleV174;
var ParticleEmitter2 = ParticleEmitterV174;
var ParticleEmitterSettings2 = ParticleEmitterSettingsV174;
var ParticleOld = ParticleV174;
var ParticleEmitterOld = ParticleEmitterV174;
var ParticleV20 = engine.Particle;
var ParticleEmitterV20 = engine.ParticleEmitter;
var ParticleEmitterSettingsV20 = engine.ParticleEmitterSettings;
var activeRenderer = engine.game?.renderer;
var activeParticleBridge = null;
var loader = createCompatibleShaderLoader(
  engine,
  () => activeRenderer ?? engine.game?.renderer
);
function createDeferredAdapter(name) {
  let current = null;
  let queuedOptions = [];
  const target = {
    name,
    bind(adapter) {
      current = adapter;
      for (const options of queuedOptions) current.configure?.(options);
      queuedOptions = [];
      return adapter;
    },
    configure(options = {}) {
      if (current) return current.configure?.(options);
      queuedOptions.push(options);
    }
  };
  return new Proxy(target, {
    get(object, property, receiver) {
      if (Reflect.has(object, property)) {
        return Reflect.get(object, property, receiver);
      }
      if (!current) {
        return (...args) => {
          void args;
          throw new Error(
            "Melon Runtime: Application melonJS 20 belum selesai diinisialisasi. Panggil dan await app.init() sebelum memakai API melon.*."
          );
        };
      }
      const value = current[property];
      return typeof value === "function" ? value.bind(current) : value;
    }
  });
}
var deferredAdapter = createDeferredAdapter("melonjs-20.0.0");
function createShaderEffect(renderer, source, precision) {
  return createCompatibleShaderEffect(engine, renderer, source, precision);
}
var melon = createMelonRuntime(deferredAdapter);
function configureMelonJs20Runtime(options = {}) {
  const application = options.application ?? engine.game;
  if (!application?.isInitialized || !application.renderer) {
    throw new Error(
      "Melon Runtime: await app.init() sebelum configureMelonJs20Runtime()."
    );
  }
  activeRenderer = application.renderer;
  installMelonEditorTextFactories(engine, { Text: Text2, BitmapText: BitmapText2 });
  const engineAdapter = createMelonJs20Adapter(engine, { application, audio });
  activeParticleBridge = engineAdapter.particle2D;
  deferredAdapter.bind(engineAdapter);
  if (options.gameData) {
    configureParticleAssets(options.gameData);
    if (!options.gameData.ShaderManager && activeRenderer.gl) {
      options.gameData.ShaderManager = createCompatibleShaderManager(
        engine,
        loader,
        activeRenderer,
        options.gameData.shader
      );
    }
    melon.configure({ gameData: options.gameData });
  } else {
    melon.configure();
  }
  return melon;
}
var ParticleSystem2DRenderableV20 = createMelonJsParticleSystem2DBridge(engine, null, { engineVersion: "20.0.0" }).RenderableClass;
function createAdvancedParticleSystem2DV20(compiledEffect, systemId, emitterId, options = {}) {
  if (!activeParticleBridge) throw new Error("Melon Runtime: configureMelonJs20Runtime() sebelum membuat ParticleSystem2DRenderableV20.");
  return activeParticleBridge.create(compiledEffect, systemId, emitterId, options);
}
export {
  AudioGroup,
  AudioMixer,
  BitmapText2 as BitmapText,
  BitmapTextV174,
  BitmapTextV20,
  CURVE_INTERPOLATIONS,
  CURVE_TIME_POLICIES,
  GRADIENT_COLOR_SPACE,
  GUI_Object,
  LEGACY_PARTICLE_DEPRECATION_POLICY,
  LEGACY_PARTICLE_MIGRATIONS,
  LEGACY_PARTICLE_MIGRATION_VERSION,
  MELON_RUNTIME_VERSION,
  PARTICLE_BLEND_MODES,
  PARTICLE_COLLISION_AUTHORITY,
  PARTICLE_COLLISION_MODES,
  PARTICLE_COLLISION_STATE,
  PARTICLE_COMPOSITION_MODES,
  PARTICLE_CULLING_MODE,
  PARTICLE_CURVE_PRESETS,
  PARTICLE_DEFAULT_COLOR_GRADIENT,
  PARTICLE_EFFECT_2D_ASSET_TYPE,
  PARTICLE_EFFECT_2D_COMPILED_VERSION,
  PARTICLE_EFFECT_2D_LIMITS,
  PARTICLE_EFFECT_2D_MODULE_DEFAULTS,
  PARTICLE_EFFECT_2D_PRESET_CATALOG,
  PARTICLE_EFFECT_2D_SCHEMA_VERSION,
  PARTICLE_EMISSION_CATCH_UP,
  PARTICLE_EVENT_ORDER,
  PARTICLE_FLAGS,
  PARTICLE_GRADIENT_PRESETS,
  PARTICLE_INTEGRATORS,
  PARTICLE_LIFECYCLE_EVENT,
  PARTICLE_MODULE_EVALUATION_ORDER,
  PARTICLE_PERFORMANCE_BUDGETS,
  PARTICLE_PLAYBACK_STATE,
  PARTICLE_QUALITY_TIERS,
  PARTICLE_RANDOM_ALGORITHM,
  PARTICLE_RANDOM_SAMPLING,
  PARTICLE_RELEASE_MANIFEST,
  PARTICLE_RENDER_MODES,
  PARTICLE_SCALING_MODES,
  PARTICLE_SHAPE_DIRECTIONS,
  PARTICLE_SHAPE_DISTRIBUTIONS,
  PARTICLE_SHAPE_TYPES,
  PARTICLE_SIMULATION_SPACE,
  PARTICLE_SORT_MODES,
  PARTICLE_STATE_CHANNELS,
  PARTICLE_STATE_HANDLE_STRIDE,
  PARTICLE_STATE_INVALID_HANDLE,
  PARTICLE_STATE_MAX_CAPACITY,
  PARTICLE_STATE_OVERFLOW_POLICIES,
  PARTICLE_STATE_RESIZE_POLICIES,
  PARTICLE_STOP_ACTION,
  PARTICLE_SUSPENSION_BEHAVIOR,
  PARTICLE_TIMESTEP_MODE,
  PARTICLE_TIME_MODE,
  PARTICLE_TRIGGER_PHASES,
  PARTICLE_VALUE_MODES,
  PARTICLE_VALUE_TYPES,
  PARTICLE_VISUAL_COMPOSITION_ORDER,
  Particle2 as Particle,
  ParticleColliderRegistry,
  ParticleCollisionError,
  ParticleCollisionModule,
  ParticleCustomDataModule,
  ParticleEffect2DError,
  ParticleEmissionError,
  ParticleEmitter2 as ParticleEmitter,
  ParticleEmitterOld,
  ParticleEmitterSettings2 as ParticleEmitterSettings,
  ParticleEmitterSettingsV174,
  ParticleEmitterSettingsV20,
  ParticleEmitterV174,
  ParticleEmitterV20,
  ParticleEventQueue,
  ParticleEventsError,
  ParticleForceFieldRegistry,
  ParticleLightsModule,
  ParticleMainEmissionModule,
  ParticleMigrationError,
  ParticleMotionError,
  ParticleMotionModule,
  ParticleNoiseFieldError,
  ParticleNoiseForceFieldModule,
  ParticleOld,
  ParticleOptionalFeatureError,
  ParticlePerformanceError,
  ParticlePreviewController,
  ParticlePreviewError,
  ParticlePreviewSeedController,
  ParticleRandom,
  ParticleRandomSampler,
  ParticleRenderer2D,
  ParticleRendererError,
  ParticleRuntimeModulesError,
  ParticleSeedHierarchy,
  ParticleShapeError,
  ParticleStateBuffer,
  ParticleStateError,
  ParticleSubEmitterModule,
  ParticleSystem2D,
  ParticleSystem2DError,
  ParticleSystem2DRenderableV20,
  ParticleTextureAnimationModule,
  ParticleTrailsModule,
  ParticleV174,
  ParticleV20,
  ParticleValueError,
  ParticleVisualPropertiesError,
  ParticleVisualPropertiesModule,
  Slider,
  SliderButton,
  Text2 as Text,
  TextMetrics,
  TextMetricsV174,
  TextV174,
  TextV20,
  TilemapScene,
  attachParticleShape,
  audio,
  canonicalSerializeParticleEffect2D,
  compileCurve,
  compileGradient,
  compileParticleEffect2D,
  compileParticleShape,
  compileParticleTextureAnimation,
  compileParticleValue,
  configureMelonJs20Runtime,
  createAdvancedParticleSystem2DV20,
  createLegacyParticleMigrationBackup,
  createMelonJs20Adapter,
  createMelonRuntime,
  createParticleBenchmarkReport,
  createParticleCurvePreset,
  createParticleGradientPreset,
  createParticleMainEmissionModule,
  createParticleMotionModule,
  createParticlePreviewController,
  createParticlePreviewSeedController,
  createParticleRandom,
  createParticleRollbackPlan,
  createParticleSeedHierarchy,
  createParticleStateBuffer,
  createParticleSystem2D,
  createParticleSystem2DFromEmitter,
  createShaderEffect,
  melon as default,
  deriveParticleSeed,
  detectParticleAssetKind,
  detectParticleEffectCycles,
  deterministicCurlNoise2D,
  deterministicNoise2D,
  evaluateCompiledCurve,
  evaluateCompiledGradient,
  evaluateParticleValue,
  getParticleEffect2DPreset,
  hashParticleSeedComponent,
  loader,
  melon,
  migrateLegacyParticleEffect,
  normalizeParticleEffect2D,
  normalizeParticleSeed,
  packParticleColor,
  parseParticleEffect2D,
  particleShapeGizmoData,
  percentile,
  previewLegacyParticleMigration,
  recoverLegacyParticleMigrationBackup,
  resolveParticleEffectSeed,
  resolveParticleQualityOptions,
  resolveParticleReleasePath,
  sampleParticleShape,
  scaleParticleBudget,
  srgbChannelToLinear,
  unpackParticleColor,
  validateCurveDefinition,
  validateGradientDefinition,
  validateParticleEffect2D,
  validateParticlePerformanceReport
};
//# sourceMappingURL=melon-runtime-20.0.0.module.js.map
