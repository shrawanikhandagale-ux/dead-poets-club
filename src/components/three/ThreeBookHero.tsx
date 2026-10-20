import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeBookHeroProps {
  title?: string;
  author?: string;
  className?: string;
}

export const ThreeBookHero: React.FC<ThreeBookHeroProps> = ({
  title = 'The Secret History',
  author = 'Donna Tartt',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Group for the entire book
    const bookGroup = new THREE.Group();
    scene.add(bookGroup);

    // Book Dimensions
    const bookWidth = 2.1;
    const bookHeight = 3.0;
    const bookDepth = 0.45;

    // Materials
    // 1. Leather Cover Material (Wine Burgundy with slight roughness)
    const leatherMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a1f1d, // Deep Wine
      roughness: 0.55,
      metalness: 0.15,
    });

    // 2. Gold Foil Material
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Burnished Gold
      roughness: 0.25,
      metalness: 0.85,
    });

    // 3. Aged Paper Pages Material
    const paperMaterial = new THREE.MeshStandardMaterial({
      color: 0xe8dfcb, // Aged Parchment
      roughness: 0.9,
      metalness: 0.05,
    });

    // --- Book Back Cover ---
    const backCoverGeometry = new THREE.BoxGeometry(bookWidth, bookHeight, 0.05);
    const backCover = new THREE.Mesh(backCoverGeometry, leatherMaterial);
    backCover.position.set(0, 0, -bookDepth / 2);
    bookGroup.add(backCover);

    // --- Book Spine ---
    const spineGeometry = new THREE.BoxGeometry(0.06, bookHeight, bookDepth);
    const spine = new THREE.Mesh(spineGeometry, leatherMaterial);
    spine.position.set(-bookWidth / 2, 0, 0);
    bookGroup.add(spine);

    // Spine Gold Ribs (Classic Antique Binding)
    for (let i = -1.1; i <= 1.1; i += 0.55) {
      const ribGeo = new THREE.BoxGeometry(0.08, 0.04, bookDepth + 0.02);
      const rib = new THREE.Mesh(ribGeo, goldMaterial);
      rib.position.set(-bookWidth / 2, i, 0);
      bookGroup.add(rib);
    }

    // --- Book Pages Block ---
    const pagesGeometry = new THREE.BoxGeometry(bookWidth - 0.15, bookHeight - 0.15, bookDepth - 0.06);
    const pagesBlock = new THREE.Mesh(pagesGeometry, paperMaterial);
    pagesBlock.position.set(0.05, 0, 0);
    bookGroup.add(pagesBlock);

    // --- Front Cover Pivot & Front Cover (For Opening/Closing) ---
    const coverPivot = new THREE.Group();
    coverPivot.position.set(-bookWidth / 2, 0, bookDepth / 2);
    bookGroup.add(coverPivot);

    const frontCoverGeometry = new THREE.BoxGeometry(bookWidth, bookHeight, 0.05);
    const frontCover = new THREE.Mesh(frontCoverGeometry, leatherMaterial);
    frontCover.position.set(bookWidth / 2, 0, 0);
    coverPivot.add(frontCover);

    // Gold Filigree Border on Front Cover
    const borderGeometry = new THREE.BoxGeometry(bookWidth - 0.25, bookHeight - 0.25, 0.055);
    const borderMesh = new THREE.Mesh(borderGeometry, goldMaterial);
    borderMesh.position.set(bookWidth / 2, 0, 0.005);
    coverPivot.add(borderMesh);

    // Front Cover Center Inset
    const centerInsetGeo = new THREE.BoxGeometry(bookWidth - 0.35, bookHeight - 0.35, 0.058);
    const centerInset = new THREE.Mesh(centerInsetGeo, leatherMaterial);
    centerInset.position.set(bookWidth / 2, 0, 0.008);
    coverPivot.add(centerInset);

    // Gold Emblem in Center
    const emblemGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.07, 32);
    const emblem = new THREE.Mesh(emblemGeo, goldMaterial);
    emblem.rotation.x = Math.PI / 2;
    emblem.position.set(bookWidth / 2, 0.2, 0.01);
    coverPivot.add(emblem);

    // --- Ambient Floating Dust Particles / Motes ---
    const particlesCount = 75;
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 8;
      posArray[i + 1] = (Math.random() - 0.5) * 6;
      posArray[i + 2] = (Math.random() - 0.5) * 4;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.045,
      color: 0xd3a66d, // Amber gold sparks
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    // --- Lighting ---
    // Warm Candlelight Point Light
    const candleLight = new THREE.PointLight(0xd3a66d, 2.8, 12);
    candleLight.position.set(2.5, 2.5, 3.5);
    scene.add(candleLight);

    // Subtle Wine Rim Light
    const rimLight = new THREE.PointLight(0x784743, 1.8, 10);
    rimLight.position.set(-3, -2, 2.5);
    scene.add(rimLight);

    // Soft Ambient Light
    const ambientLight = new THREE.AmbientLight(0x2d2621, 1.5);
    scene.add(ambientLight);

    // Initial Angle
    bookGroup.rotation.y = -0.45;
    bookGroup.rotation.x = 0.25;

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationY = -0.45;
    let targetRotationX = 0.25;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x;
      mouseY = y;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Idle floating motion
      bookGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.08;

      // Mouse Parallax Lerp
      targetRotationY = -0.45 + mouseX * 0.45;
      targetRotationX = 0.25 - mouseY * 0.35;

      bookGroup.rotation.y += (targetRotationY - bookGroup.rotation.y) * 0.05;
      bookGroup.rotation.x += (targetRotationX - bookGroup.rotation.x) * 0.05;

      // Cover opening interpolation based on state
      const targetCoverAngle = isOpen ? -Math.PI * 0.75 : 0;
      coverPivot.rotation.y += (targetCoverAngle - coverPivot.rotation.y) * 0.08;

      // Slow drift particles
      particlesMesh.rotation.y = elapsedTime * 0.04;
      particlesMesh.rotation.x = elapsedTime * 0.02;

      // Candle flicker
      candleLight.intensity = 2.8 + Math.sin(elapsedTime * 6.0) * 0.15;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      backCoverGeometry.dispose();
      spineGeometry.dispose();
      pagesGeometry.dispose();
      frontCoverGeometry.dispose();
      borderGeometry.dispose();
      centerInsetGeo.dispose();
      emblemGeo.dispose();
      particlesGeo.dispose();
      leatherMaterial.dispose();
      goldMaterial.dispose();
      paperMaterial.dispose();
      particlesMat.dispose();
    };
  }, [isOpen]);

  return (
    <div
      className={`relative w-full h-[380px] md:h-[460px] flex items-center justify-center cursor-pointer select-none ${className}`}
      onClick={() => setIsOpen(!isOpen)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="Click to open/close the antique volume"
    >
      <div ref={containerRef} className="w-full h-full" />

      {/* Floating Interactive Badge */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#1c1815]/85 border border-[#d3a66d]/40 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-2 pointer-events-none transition-all duration-300 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-[#d3a66d] animate-ping" />
        <span className="text-xs font-serif text-[#e8c18e] tracking-wide">
          {isOpen ? 'Click book to close volume' : 'Click 3D book to examine & open'}
        </span>
      </div>
    </div>
  );
};
