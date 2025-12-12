"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Seat = {
  id: string;
  x: number;
  y: number;
  row: string;
  number: number;
  section: string;
  price: number;
  status: "available" | "sold" | "reserved";
  color?: string;
};

type Section = {
  id: string;
  name: string;
  color: string;
  price: number;
};

type SeatMap3DViewProps = {
  seats: Seat[];
  sections: Section[];
};

export function SeatMap3DView({ seats, sections }: SeatMap3DViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(6, 6, 8);

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
    } catch (error) {
      console.error("WebGL initialization failed", error);
      setIsSupported(false);
      return;
    }

    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const resize = () => {
      if (!renderer) return;
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight || 1;
      camera.updateProjectionMatrix();
    };
    resize();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.minDistance = 3;
    controls.maxDistance = 15;
    controls.maxPolarAngle = Math.PI / 1.8;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(4, 8, 4);
    scene.add(directionalLight);

    // Floor
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(8, 64),
      new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        transparent: true,
        opacity: 0.9,
        roughness: 0.8,
      })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Stage
    const stage = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.5, 0.4, 32),
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: 0x111827,
        metalness: 0.7,
        roughness: 0.3,
      })
    );
    stage.position.set(0, 0.2, 0);
    scene.add(stage);

    // Create seat materials for each section
    const sectionMaterials = new Map<string, THREE.MeshStandardMaterial>();
    sections.forEach((section) => {
      const color = new THREE.Color(section.color || "#3b82f6");
      sectionMaterials.set(
        section.name,
        new THREE.MeshStandardMaterial({
          color: color,
          metalness: 0.3,
          roughness: 0.5,
          emissive: color.clone().multiplyScalar(0.1),
        })
      );
    });

    // Create seats from props
    const seatMeshes: THREE.Mesh[] = [];
    
    if (seats.length > 0) {
      // Convert 2D coordinates to 3D positions
      seats.forEach((seat) => {
        const section = sections.find((s) => s.name === seat.section);
        const material =
          sectionMaterials.get(seat.section) ||
          new THREE.MeshStandardMaterial({
            color: seat.status === "available" ? 0x3b82f6 : seat.status === "sold" ? 0xef4444 : 0xf59e0b,
            metalness: 0.3,
            roughness: 0.5,
          });

        // Convert percentage-based coordinates to 3D positions
        // Assuming canvas is 600px wide, map to 3D space
        const x = ((seat.x / 100) * 8) - 4; // -4 to 4 range
        const z = ((seat.y / 100) * 8) - 4;
        const y = 0.25;

        const geometry = new THREE.BoxGeometry(0.15, 0.25, 0.18);
        const seatMesh = new THREE.Mesh(geometry, material);
        seatMesh.position.set(x, y, z);
        seatMesh.rotation.y = Math.atan2(-z, -x);
        
        scene.add(seatMesh);
        seatMeshes.push(seatMesh);
      });
    } else {
      // Default demo seats if none exist
      const rows = 6;
      const cols = 20;
      for (let row = 0; row < rows; row += 1) {
        const radius = 2.2 + row * 0.45;
        const seatsInRow = cols + row * 2;
        const section = sections[row < 2 ? 0 : row < 4 ? 1 : 2] || sections[0];
        const material = sectionMaterials.get(section.name) || sectionMaterials.values().next().value;

        for (let i = 0; i < seatsInRow; i += 1) {
          const angle = (i / seatsInRow) * Math.PI * 1.6 - Math.PI * 0.8;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const geometry = new THREE.BoxGeometry(0.18, 0.3, 0.22);
          const seatMesh = new THREE.Mesh(geometry, material);
          seatMesh.position.set(x, 0.25 + row * 0.02, z);
          seatMesh.rotation.y = -angle + Math.PI / 2;
          scene.add(seatMesh);
          seatMeshes.push(seatMesh);
        }
      }
    }

    let animationFrame = 0;
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      controls.update();
      seatMeshes.forEach((seat, idx) => {
        // Subtle animation
        seat.position.y = seat.position.y + Math.sin(Date.now() * 0.001 + idx * 0.05) * 0.005;
      });
      renderer?.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      resize();
      renderer?.render(scene, camera);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      seatMeshes.forEach((seat) => {
        seat.geometry.dispose();
        if (Array.isArray(seat.material)) {
          seat.material.forEach((mat) => mat.dispose());
        } else {
          seat.material.dispose();
        }
      });
      stage.geometry.dispose();
      (stage.material as THREE.Material).dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      sectionMaterials.forEach((mat) => mat.dispose());
      renderer?.dispose();
      scene.clear();
      if (renderer && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [seats, sections]);

  if (!isSupported) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
        WebGL preview not supported on this device
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-900/5">
      <div className="absolute right-2 top-2 z-10 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
        Drag to rotate • Scroll to zoom
      </div>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}

