// PS1-style fragment shader with glitch effects for pets
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform float time;
uniform sampler2D uTexture;

// Random function for noise generation
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Function to create a noise pattern
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    // Four corners of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    // Smooth interpolation
    vec2 u = smoothstep(0.0, 1.0, f);
    
    // Mix the four corners
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

void main() {
    // Calculate a noise value based on position and time
    float noiseValue = noise(vUv * 10.0 + time * 0.5);
    
    // Create UV distortion (texture warping) - PS1 effect
    vec2 distortedUV = vUv;
    distortedUV.x += sin(distortedUV.y * 10.0 + time) * 0.01; 
    distortedUV.y += cos(distortedUV.x * 10.0 + time) * 0.01;
    
    // Sample texture with distorted UVs
    vec4 texColor = texture2D(uTexture, distortedUV);
    
    // Create color glitch effects
    // Chance for RGB shift
    float rgbShiftChance = 0.05; // 5% chance per frame
    float rgbSeed = random(vec2(floor(time * 5.0), 0.0));
    
    if (rgbSeed < rgbShiftChance) {
        // RGB shift effect
        float shiftAmount = 0.01;
        vec4 rChannel = texture2D(uTexture, distortedUV + vec2(shiftAmount, 0.0));
        vec4 gChannel = texture2D(uTexture, distortedUV);
        vec4 bChannel = texture2D(uTexture, distortedUV - vec2(shiftAmount, 0.0));
        
        texColor = vec4(rChannel.r, gChannel.g, bChannel.b, texColor.a);
    }
    
    // Add scanlines effect
    float scanLineIntensity = 0.1;
    float scanLineFreq = 100.0;
    float scanLine = sin(vUv.y * scanLineFreq + time * 5.0) * 0.5 + 0.5;
    scanLine = pow(scanLine, 8.0) * scanLineIntensity;
    texColor.rgb -= scanLine;
    
    // Occasionally add blocky corruption artifacts
    float corruptionChance = 0.01; // 1% chance
    float corruptionSeed = random(vec2(floor(time * 2.0), floor(vUv.y * 10.0)));
    
    if (corruptionSeed < corruptionChance) {
        float blockSize = 0.05;
        vec2 blockPos = floor(vUv / blockSize) * blockSize;
        float randomBlock = random(blockPos + time);
        
        if (randomBlock > 0.7) {
            // Corrupt block with random color or shifted texture
            vec2 randomUV = vec2(
                random(blockPos + time),
                random(blockPos + time + 1.0)
            );
            texColor = texture2D(uTexture, randomUV);
        }
    }
    
    // Dithering effect (limited color palette - PS1 style)
    float dither = random(vUv + time) * 0.05;
    texColor.rgb += dither;
    
    // Reduce color precision (PS1 had limited color depth)
    float colorLevels = 32.0;
    texColor.rgb = floor(texColor.rgb * colorLevels) / colorLevels;
    
    gl_FragColor = texColor;
} 