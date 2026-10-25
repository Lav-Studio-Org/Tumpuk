precision highp float;
/* Built-in shader inputs */
uniform float TIME;
uniform vec2 ME_offset;
uniform vec2 ME_size_img;
uniform vec2 ME_size_obj;
uniform vec2 ME_size_screen;
uniform vec2 ME_scale_screen;
uniform vec2 ME_size_world;
uniform vec2 ME_pos_obj;
uniform vec2 ME_pos_world;
varying vec2 noise_uv;
varying vec2 screen_uv;
/* Your shader code */
attribute vec2 aVertex;
attribute vec2 aRegion;
attribute vec4 aColor;
uniform mat4 uProjectionMatrix;
varying vec2 UV;
varying vec4 vColor;

void main(void) {
    gl_Position = uProjectionMatrix * vec4(aVertex, 0.0, 1.0);
    vColor = vec4(aColor.bgr * aColor.a, aColor.a);
    UV = aRegion;
    screen_uv = gl_Position.xy / gl_Position.w * 0.5 + 0.5;
}
