import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ShapeType, PARTICLE_COUNT, TRAIL_LENGTH } from '../types';
import { generateGeometry } from '../utils/geometryFactory';

interface ParticleSystemProps {
  shape: ShapeType;
  tension: number;
  color: number;
  explode: boolean;
  onExplosionHandled: () => void;
}

// ---------------------- GLSL SHADERS ----------------------

const vertexShader = `
uniform float uTime;
uniform float uTension; // 0.0 (Open/Expanded) to 1.0 (Fist/Contracted)
uniform float uExplosion;
uniform float uPixelRatio;
uniform vec2 uMouse; // Mouse position (-1 to 1)
uniform float uMouseActive; // 1 if mouse moving, 0 if not

attribute vec3 aTargetPos;
attribute float aRandomness;
attribute float aScale;
attribute float aTrailIdx; // 0.0 to 4.0

varying float vAlpha;
varying float vTrailIdx;

// Simplex Noise (simplified for GLSL)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}

void main() {
  vTrailIdx = aTrailIdx;
  
  float timeLag = aTrailIdx * 0.05; 
  float effectiveTime = uTime - timeLag;

  vec3 pos = aTargetPos;

  // Noise / Breathing
  float noiseVal = snoise(pos * 0.5 + effectiveTime * 0.3);
  vec3 noiseOffset = vec3(
    snoise(pos + effectiveTime * 0.2),
    snoise(pos + effectiveTime * 0.2 + 10.0),
    snoise(pos + effectiveTime * 0.2 + 20.0)
  );

  // Interaction Logic (Tension)
  // Low Tension (Open) -> Expanded. High Tension (Closed) -> Contracted.
  vec3 expandedPos = pos + (noiseOffset * 2.5) + (normalize(pos) * 1.5 * aRandomness);
  vec3 contractedPos = pos + (noiseOffset * 0.1); 
  vec3 finalPos = mix(expandedPos, contractedPos, uTension);

  // MOUSE INTERACTION (Force Field)
  // Project mouse to approximate world space at z=0
  vec3 mouseWorld = vec3(uMouse.x * 10.0, uMouse.y * 10.0, 0.0);
  float dist = distance(finalPos.xy, mouseWorld.xy);
  // Gentle repulsion if mouse is active and close
  float repulsion = smoothstep(4.0, 0.0, dist) * uMouseActive;
  vec3 repulseDir = normalize(finalPos - mouseWorld);
  finalPos += repulseDir * repulsion * 2.0;

  // Explosion
  if (uExplosion > 0.0) {
     vec3 dir = normalize(pos);
     finalPos += dir * uExplosion * 8.0 * aRandomness;
  }

  // Gravity (relaxed state)
  if (uTension < 0.5) {
     float gravityFactor = (1.0 - uTension * 2.0); 
     finalPos.y -= gravityFactor * 0.5 * sin(effectiveTime * 0.5 + aRandomness * 5.0);
  }

  vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Size
  float sizeMultiplier = mix(30.0, 10.0, uTension); 
  gl_PointSize = sizeMultiplier * aScale * (1.0 / -mvPosition.z) * uPixelRatio;
  
  // Fade
  vAlpha = 1.0 - (aTrailIdx / 5.0); 
  vAlpha *= clamp(1.0 - (mvPosition.z / 50.0), 0.0, 1.0); 
}
`;

const fragmentShader = `
uniform vec3 uColor;
varying float vAlpha;

void main() {
  vec2 uv = gl_PointCoord.xy - 0.5;
  float dist = length(uv);
  if (dist > 0.5) discard;

  float strength = 1.0 - (dist * 2.0);
  strength = pow(strength, 1.5); 

  vec3 finalColor = mix(uColor, vec3(1.0), strength * 0.5); 
  gl_FragColor = vec4(finalColor, strength * vAlpha);
}
`;

const ParticleSystem: React.FC<ParticleSystemProps> = ({ 
  shape, 
  tension, 
  color, 
  explode,
  onExplosionHandled 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const reqRef = useRef<number>(0);
  
  const timeRef = useRef<number>(0);
  const explosionValRef = useRef<number>(0);
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const mouseActiveRef = useRef<number>(0);
  const mouseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize Three.js
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.02);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 8;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      powerPreference: "high-performance",
      antialias: false,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const geometry = new THREE.BufferGeometry();
    geometryRef.current = geometry;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTension: { value: 0.5 },
        uColor: { value: new THREE.Color(color) },
        uExplosion: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uMouseActive: { value: 0 }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    materialRef.current = material;

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Mouse Handler
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.set(x, y);
      mouseActiveRef.current = 1;

      // Reset inactive timer
      if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
      mouseTimeoutRef.current = setTimeout(() => {
        mouseActiveRef.current = 0;
      }, 1000); // 1 second of inactivity disables mouse effect
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        if(materialRef.current) {
            materialRef.current.uniforms.uPixelRatio.value = rendererRef.current.getPixelRatio();
        }
      }
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      timeRef.current += 0.025; 

      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = timeRef.current;
        materialRef.current.uniforms.uMouse.value.copy(mouseRef.current);
        
        // Smoothly interpolate mouse activity
        const currentActive = materialRef.current.uniforms.uMouseActive.value;
        materialRef.current.uniforms.uMouseActive.value += (mouseActiveRef.current - currentActive) * 0.1;
        
        if (explosionValRef.current > 0) {
          explosionValRef.current *= 0.92; 
          if (explosionValRef.current < 0.01) {
            explosionValRef.current = 0;
            onExplosionHandled();
          }
          materialRef.current.uniforms.uExplosion.value = explosionValRef.current;
        }
      }
      
      if (cameraRef.current) {
        const radius = 8;
        const speed = 0.05;
        cameraRef.current.position.x = Math.sin(timeRef.current * speed) * radius * 0.2;
        cameraRef.current.position.y = Math.cos(timeRef.current * speed * 0.5) * radius * 0.1;
        cameraRef.current.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
      reqRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(reqRef.current);
      mountRef.current?.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Geometry
  useEffect(() => {
    if (!geometryRef.current) return;

    const basePositions = generateGeometry(shape, PARTICLE_COUNT);
    const totalVertices = PARTICLE_COUNT * TRAIL_LENGTH;
    
    const positions = new Float32Array(totalVertices * 3); 
    const targetPositions = new Float32Array(totalVertices * 3);
    const randomness = new Float32Array(totalVertices);
    const scales = new Float32Array(totalVertices);
    const trailIndices = new Float32Array(totalVertices);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const x = basePositions[i3];
      const y = basePositions[i3+1];
      const z = basePositions[i3+2];
      const rVal = Math.random();
      const sVal = 0.5 + Math.random();

      for (let t = 0; t < TRAIL_LENGTH; t++) {
        const idx = i * TRAIL_LENGTH + t;
        const idx3 = idx * 3;
        targetPositions[idx3] = x;
        targetPositions[idx3+1] = y;
        targetPositions[idx3+2] = z;
        positions[idx3] = x;
        positions[idx3+1] = y;
        positions[idx3+2] = z;
        randomness[idx] = rVal;
        scales[idx] = sVal;
        trailIndices[idx] = t; 
      }
    }

    const geo = geometryRef.current;
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aTargetPos', new THREE.BufferAttribute(targetPositions, 3));
    geo.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 1));
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geo.setAttribute('aTrailIdx', new THREE.BufferAttribute(trailIndices, 1));
    geo.attributes.position.needsUpdate = true;
  }, [shape]);

  useEffect(() => {
    if (materialRef.current) {
      const targetTension = tension;
      const current = materialRef.current.uniforms.uTension.value;
      materialRef.current.uniforms.uTension.value = current + (targetTension - current) * 0.1;
    }
  }, [tension]);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uColor.value.setHex(color);
    }
  }, [color]);

  useEffect(() => {
    if (explode) {
      explosionValRef.current = 1.0;
    }
  }, [explode]);

  return <div ref={mountRef} className="absolute inset-0 z-0" />;
};

export default ParticleSystem;