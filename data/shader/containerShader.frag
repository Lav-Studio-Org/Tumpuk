// Fragment shader
precision highp float;
/* Built-in shader inputs */
uniform float TIME;
uniform vec2 ME_size_screen;
varying vec2 noise_uv;
varying vec2 screen_uv;
/* Your shader code */

uniform sampler2D uSampler;
uniform sampler2D uScreenTexture;

uniform vec2 uResolution;

uniform float uBodyAlpha;
uniform float uRimAlpha;
uniform float uBackgroundMix;
uniform float uRefraction;
uniform float uBlurAmount;

varying vec4 vColor;
varying vec2 UV;

void main(void) {

    vec4 rawTex = texture2D(uSampler, UV);

    if (rawTex.a < 0.02) {
        discard;
    }

    vec4 tex = rawTex * vColor;

    float containerMask =
        smoothstep(0.02, 0.20, rawTex.a);


    vec2 distortion = vec2(
        tex.r - tex.b,
        tex.g - tex.b
    );

    distortion *=
        uRefraction *
        containerMask;

    vec2 uv =
        vec2(screen_uv.x, 1.0 - screen_uv.y) + distortion;

    uv = clamp(
        uv,
        vec2(0.001),
        vec2(0.999)
    );


    // -----------------------------
    // 9-TAP SOFT BLUR
    // -----------------------------

    vec2 px =
        1.0 / uResolution;

    vec2 blur =
        px * uBlurAmount;

    vec3 bg = vec3(0.0);

    bg += texture2D(
        uScreenTexture,
        uv
    ).rgb * 0.24;

    bg += texture2D(
        uScreenTexture,
        uv + vec2( blur.x, 0.0)
    ).rgb * 0.12;

    bg += texture2D(
        uScreenTexture,
        uv + vec2(-blur.x, 0.0)
    ).rgb * 0.12;

    bg += texture2D(
        uScreenTexture,
        uv + vec2(0.0,  blur.y)
    ).rgb * 0.12;

    bg += texture2D(
        uScreenTexture,
        uv + vec2(0.0, -blur.y)
    ).rgb * 0.12;

    bg += texture2D(
        uScreenTexture,
        uv + vec2( blur.x,  blur.y)
    ).rgb * 0.07;

    bg += texture2D(
        uScreenTexture,
        uv + vec2(-blur.x,  blur.y)
    ).rgb * 0.07;

    bg += texture2D(
        uScreenTexture,
        uv + vec2( blur.x, -blur.y)
    ).rgb * 0.07;

    bg += texture2D(
        uScreenTexture,
        uv + vec2(-blur.x, -blur.y)
    ).rgb * 0.07;


    // -----------------------------
    // RIM / HIGHLIGHT
    // -----------------------------

    float luminance = dot(
        rawTex.rgb,
        vec3(0.299, 0.587, 0.114)
    );

    float rim = smoothstep(
        0.72,
        0.96,
        luminance
    );

    rim *= containerMask;


    // -----------------------------
    // COLOR MIX
    // -----------------------------

    vec3 finalColor = mix(
        tex.rgb,
        bg,
        uBackgroundMix
    );

    finalColor = mix(
        finalColor,
        tex.rgb,
        rim * 0.85
    );


    // -----------------------------
    // ALPHA
    // -----------------------------

    float materialAlpha = mix(
        uBodyAlpha,
        uRimAlpha,
        rim
    );

    float finalAlpha =
        rawTex.a *
        vColor.a *
        materialAlpha;

    finalAlpha *= containerMask;


    gl_FragColor = vec4(
        finalColor,
        finalAlpha
    );
}

