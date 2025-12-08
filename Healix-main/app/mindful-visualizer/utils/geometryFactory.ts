import { ShapeType } from '../types';

/**
 * Generates a Float32Array of x,y,z coordinates based on the shape type.
 * @param type The shape to generate
 * @param count The number of particles (base particles, not including trails)
 */
export const generateGeometry = (type: ShapeType, count: number): Float32Array => {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    let x = 0, y = 0, z = 0;

    switch (type) {
      case ShapeType.SPHERE: {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = 2.5 + Math.random() * 0.2; // Radius variation
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        break;
      }

      case ShapeType.HEART: {
        const t = Math.random() * Math.PI * 2;
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        const scale = 0.15;
        x = hx * scale;
        y = hy * scale;
        z = (Math.random() - 0.5) * 2.0; 
        z *= (y + 2.5) * 0.3;
        break;
      }

      case ShapeType.FLOWER: {
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        const r = 0.15 * Math.sqrt(i) * (0.8 + Math.random() * 0.2);
        const theta = i * goldenAngle;
        x = r * Math.cos(theta);
        z = r * Math.sin(theta);
        y = Math.sqrt(r) - 2.0; 
        break;
      }

      case ShapeType.DNA: {
        // Double Helix
        const t = (i / count) * Math.PI * 8 - (Math.PI * 4); // Height range
        const radius = 1.2;
        const strand = Math.random() > 0.5 ? 0 : Math.PI; // Two strands
        
        x = radius * Math.cos(t + strand);
        z = radius * Math.sin(t + strand);
        y = t * 0.8;
        
        // Add some random scatter around the strand
        x += (Math.random() - 0.5) * 0.2;
        z += (Math.random() - 0.5) * 0.2;
        y += (Math.random() - 0.5) * 0.2;
        break;
      }

      case ShapeType.SPIRAL: {
        // Hypnotic Spiral
        const t = i / count * 20; 
        const r = t * 0.2;
        x = r * Math.cos(t);
        z = r * Math.sin(t);
        y = (Math.random() - 0.5) * 0.5;
        break;
      }

      case ShapeType.SATURN: {
        const rand = Math.random();
        if (rand < 0.4) {
          const u = Math.random();
          const v = Math.random();
          const theta = 2 * Math.PI * u;
          const phi = Math.acos(2 * v - 1);
          const r = 1.5;
          x = r * Math.sin(phi) * Math.cos(theta);
          y = r * Math.sin(phi) * Math.sin(theta);
          z = r * Math.cos(phi);
        } else {
          const angle = Math.random() * Math.PI * 2;
          const minR = 2.2;
          const maxR = 4.0;
          const radius = Math.sqrt(Math.random() * (maxR*maxR - minR*minR) + minR*minR);
          x = radius * Math.cos(angle);
          z = radius * Math.sin(angle);
          y = (Math.random() - 0.5) * 0.1;
          const tilt = 0.4;
          const tempY = y * Math.cos(tilt) - z * Math.sin(tilt);
          const tempZ = y * Math.sin(tilt) + z * Math.cos(tilt);
          y = tempY;
          z = tempZ;
        }
        break;
      }

      case ShapeType.BUDDHA: {
        const rand = Math.random();
        if (rand < 0.25) {
          const u = Math.random(); 
          const v = Math.random();
          const theta = 2 * Math.PI * u;
          const phi = Math.acos(2 * v - 1);
          const r = 0.7;
          x = r * Math.sin(phi) * Math.cos(theta);
          y = r * Math.sin(phi) * Math.sin(theta) + 1.8;
          z = r * Math.cos(phi);
        } else if (rand < 0.75) {
          const u = Math.random(); 
          const v = Math.random();
          const theta = 2 * Math.PI * u;
          const phi = Math.acos(2 * v - 1);
          x = 1.2 * Math.sin(phi) * Math.cos(theta);
          y = 1.4 * Math.sin(phi) * Math.sin(theta);
          z = 1.0 * Math.cos(phi);
        } else {
           const angle = Math.random() * Math.PI * 2;
           const rad = 1.0 + Math.random() * 1.2;
           x = rad * Math.cos(angle);
           z = rad * Math.sin(angle);
           y = -1.5 + (Math.random() * 0.5);
        }
        break;
      }

      case ShapeType.FIREWORKS: {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = Math.pow(Math.random(), 1/3) * 4.0;
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        break;
      }
    }

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
  }

  return positions;
};