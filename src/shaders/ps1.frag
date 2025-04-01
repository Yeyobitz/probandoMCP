uniform sampler2D uTexture;
uniform float time;
varying vec2 vUv;

// Simple function for pseudo-randomness (can be different from vertex shader's)
float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
    // --- Texture Warping ---
    float warpIntensity = 0.005;
    // Offset UVs slightly based on position and time for a "swimming" effect
    vec2 warpedUv = vUv;
    warpedUv.x += (rand(vUv + time * 0.05) - 0.5) * 2.0 * warpIntensity;
    warpedUv.y += (rand(vUv.yx + time * 0.05) - 0.5) * 2.0 * warpIntensity;
    // ---

    // Sample the texture with warped UVs
    vec4 textureColor = texture2D(uTexture, warpedUv);

    // Output the texture color
    gl_FragColor = textureColor;
    // gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0); // REMOVED Simple grey color
} 