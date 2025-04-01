uniform float time;
varying vec2 vUv; // Declare varying to pass UVs to fragment shader

// Simple function to create pseudo-randomness
float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
    // Assign UV coordinate to varying
    vUv = uv;

    // Get the original position
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);

    // --- Vertex Jitter ---
    float jitterIntensity = 0.01;
    // Use vertex position and time to create a varied offset
    float jitterOffsetX = (rand(position.xy + time * 0.1) - 0.5) * 2.0 * jitterIntensity;
    float jitterOffsetY = (rand(position.yx + time * 0.1) - 0.5) * 2.0 * jitterIntensity;
    float jitterOffsetZ = (rand(position.xz + time * 0.1) - 0.5) * 2.0 * jitterIntensity;

    modelViewPosition.xyz += vec3(jitterOffsetX, jitterOffsetY, jitterOffsetZ);
    // ---

    gl_Position = projectionMatrix * modelViewPosition;
} 