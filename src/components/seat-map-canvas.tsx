"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function SeatMapCanvas() {
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
      console.error("WebGL initialisation failed", error);
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
    controls.enablePan = false;
    controls.minDistance = 4;
    controls.maxDistance = 12;
    controls.maxPolarAngle = Math.PI / 2.1;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.1);
    directionalLight.position.set(4, 6, 4);
    scene.add(directionalLight);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(6, 64),
      new THREE.MeshBasicMaterial({ color: 0xf1f5f9, transparent: true, opacity: 0.8 }),
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const stage = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.2, 0.3, 32),
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: 0x111827,
        metalness: 0.6,
        roughness: 0.3,
      }),
    );
    stage.position.y = 0.2;
    scene.add(stage);

    const seatMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.2,
      roughness: 0.4,
    });
    const vipMaterial = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      metalness: 0.3,
      roughness: 0.35,
    });

    const seats: THREE.Mesh[] = [];
    const rows = 6;
    const cols = 20;
    for (let row = 0; row < rows; row += 1) {
      const radius = 2.2 + row * 0.45;
      const seatsInRow = cols + row * 2;
      for (let i = 0; i < seatsInRow; i += 1) {
        const angle = (i / seatsInRow) * Math.PI * 1.6 - Math.PI * 0.8;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const geometry = new THREE.BoxGeometry(0.18, 0.3, 0.22);
        const material = row < 2 ? vipMaterial : seatMaterial;
        const seat = new THREE.Mesh(geometry, material);
        seat.position.set(x, 0.25 + row * 0.02, z);
        seat.rotation.y = -angle + Math.PI / 2;
        scene.add(seat);
        seats.push(seat);
      }
    }

    let animationFrame = 0;
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      stage.rotation.y += 0.002;
      controls.update();
      seats.forEach((seat, idx) => {
        seat.position.y = 0.25 + Math.sin(Date.now() * 0.001 + idx * 0.03) * 0.02;
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
      seats.forEach((seat) => {
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
      renderer?.dispose();
      scene.clear();
      if (renderer && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (!isSupported) {
    return (
      <div className="flex h-80 w-full items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white text-sm text-slate-500">
        WebGL preview not supported on this device
      </div>
    );
  }

  return <div ref={containerRef} className="h-80 w-full rounded-3xl bg-slate-900/5" />;
}

