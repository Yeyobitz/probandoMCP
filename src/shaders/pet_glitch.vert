// PS1-style vertex shader with additional glitch effects for pets
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform float time;

// Function to generate a pseudo-random value from a seed
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    // Pass UV coordinates to fragment shader
    vUv = uv;
    vNormal = normal;
    vPosition = position;
    
    // Get vertex position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    // PS1-style vertex snapping effect - reduces positional precision
    float snapStrength = 0.05;
    modelPosition.xyz = floor(modelPosition.xyz / snapStrength) * snapStrength;
    
    // Vertex jitter effect - classic PS1 look
    float jitterAmount = 0.01;
    float jitter = random(modelPosition.xy + time) * jitterAmount;
    modelPosition.xyz += vec3(jitter);
    
    // Glitch effect - makes parts of the model jump/teleport
    // Only applies occasionally for a better effect
    float glitchChance = 0.02; // 2% chance per frame
    float glitchSeed = random(vec2(floor(time * 10.0), 0.0));
    if(glitchSeed < glitchChance) {
        float glitchStrength = 0.2;
        float glitchOffset = random(vPosition.xz * time) * glitchStrength;
        
        // Apply the glitch in a random direction
        vec3 glitchDir = vec3(
            random(vec2(time, vPosition.y)) * 2.0 - 1.0,
            random(vec2(time, vPosition.z)) * 2.0 - 1.0,
            random(vec2(time, vPosition.x)) * 2.0 - 1.0
        );
        
        modelPosition.xyz += glitchDir * glitchOffset;
    }
    
    // Apply regular transformations
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
} 