/** GLSL for the hero tiles and device bodies. Lighting is faked (no light objects) to stay cheap. */

export const tileVertex = /* glsl */ `
attribute vec4 aUv;
attribute vec4 aStyle;
varying vec3 vObjN;
varying vec3 vLocal;
varying vec4 vUvRect;
varying vec4 vStyle;
varying vec3 vN;
varying vec3 vV;
void main() {
  vObjN = normal;
  vLocal = position;
  vUvRect = aUv;
  vStyle = aStyle;
  mat4 m = modelMatrix;
  #ifdef USE_INSTANCING
    m = m * instanceMatrix;
  #endif
  vec4 mv = viewMatrix * m * vec4(position, 1.0);
  vV = -mv.xyz;
  // Correct normals under non-uniform scale: R * S * (n / s^2) = R * (n / s).
  vec3 s = vec3(length(m[0].xyz), length(m[1].xyz), length(m[2].xyz));
  vN = normalize(mat3(viewMatrix) * (mat3(m) * (normal / (s * s))));
  gl_Position = projectionMatrix * mv;
}
`;

export const tileFragment = /* glsl */ `
uniform sampler2D uAtlas;
uniform vec3 uMint;
uniform vec3 uGold;
uniform vec3 uFace;
uniform vec3 uSide;
uniform vec3 uLight;
varying vec3 vObjN;
varying vec3 vLocal;
varying vec4 vUvRect;
varying vec4 vStyle;
varying vec3 vN;
varying vec3 vV;

float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(vV);
  float front = smoothstep(0.55, 0.8, vObjN.z);
  float back = smoothstep(0.55, 0.8, -vObjN.z);

  // Front: an empty slot, drawn as a mint outline.
  float d = roundedBox(vLocal.xy, vec2(0.5), 0.22);
  float aa = fwidth(d) * 1.2;
  float line = smoothstep(-0.13 - aa, -0.13, d) * (1.0 - smoothstep(-0.075, -0.075 + aa, d));
  vec3 outline = mix(uMint, uGold, vStyle.y);
  vec3 frontCol = mix(uFace, outline, line);

  // Back: this tile's piece of the finished design (mirrored, since the tile flipped).
  vec2 p = vLocal.xy + 0.5;
  vec2 bp = vec2(1.0 - p.x, p.y);
  vec3 img = texture2D(uAtlas, vUvRect.xy + clamp(bp, 0.02, 0.98) * vUvRect.zw).rgb;
  vec3 backCol = mix(frontCol, img, vStyle.x);

  vec3 base = mix(uSide, frontCol, front);
  base = mix(base, backCol, back);

  float diff = max(dot(n, uLight), 0.0);
  float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  vec3 h = normalize(uLight + v);
  float spec = pow(max(dot(n, h), 0.0), 48.0);
  vec3 col = base * (0.66 + 0.34 * diff) + rim * 0.05 * uMint + spec * 0.05;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

export const bodyVertex = /* glsl */ `
varying vec3 vObjN;
varying vec3 vLocal;
varying vec3 vN;
varying vec3 vV;
void main() {
  vObjN = normal;
  vLocal = position;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vV = -mv.xyz;
  vN = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * mv;
}
`;

export const bodyFragment = /* glsl */ `
uniform vec3 uTop;
uniform vec3 uBottom;
uniform vec3 uEdge;
uniform float uHalfH;
uniform float uOpacity;
uniform vec3 uLight;
varying vec3 vObjN;
varying vec3 vLocal;
varying vec3 vN;
varying vec3 vV;
void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(vV);
  float front = smoothstep(0.5, 0.85, vObjN.z);
  vec3 grad = mix(uBottom, uTop, clamp(vLocal.y / (2.0 * uHalfH) + 0.5, 0.0, 1.0));
  vec3 base = mix(uEdge, grad, front);
  float diff = max(dot(n, uLight), 0.0);
  float rim = pow(1.0 - max(dot(n, v), 0.0), 2.5);
  vec3 col = base * (0.8 + 0.3 * diff) + rim * 0.06;
  gl_FragColor = vec4(col, uOpacity);
  #include <colorspace_fragment>
}
`;
