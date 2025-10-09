"use client"

import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

const WHATSAPP_IMAGE_EXTENSION = "avif" as const;

const whatsappImageBaseNames = [
  "WhatsApp Image 2025-09-26 at 22.41.45",
  "WhatsApp Image 2025-09-26 at 22.41.45 (1)",
  "WhatsApp Image 2025-09-26 at 22.41.45 (2)",
  "WhatsApp Image 2025-09-26 at 22.41.45 (3)",
  "WhatsApp Image 2025-09-26 at 22.41.46",
  "WhatsApp Image 2025-09-26 at 22.41.46 (1)",
  "WhatsApp Image 2025-09-26 at 22.41.46 (2)",
  "WhatsApp Image 2025-09-26 at 22.41.47",
  "WhatsApp Image 2025-09-26 at 22.41.48",
  "WhatsApp Image 2025-09-26 at 22.41.50",
  "WhatsApp Image 2025-09-26 at 22.41.50 (1)",
] as const;

const galleryItems = whatsappImageBaseNames.map(fileName => ({
  image: `/${encodeURI(`${fileName}.${WHATSAPP_IMAGE_EXTENSION}`)}`,
  text: "",
}));

function lerp(p1: number, p2: number, t: number): number {
  return p1 + (p2 - p1) * t;
}

interface CircularGalleryProps {
  items?: { image: string; text: string }[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  scrollSpeed?: number;
  scrollEase?: number;
  wheelEnabled?: boolean;
  autoScrollSpeed?: number;
}

interface MediaItem {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  index: number;
  width: number;
  widthTotal: number;
  x: number;
  extra: number;
  imageSrc: string;
  isBefore: boolean;
  isAfter: boolean;
}

class ThreeGallery {
  container: HTMLElement;
  scrollSpeed: number;
  wheelEnabled: boolean;
  autoScrollSpeed: number;
  scroll: {
    ease: number;
    current: number;
    target: number;
    last: number;
    position?: number;
  };

  renderer!: THREE.WebGLRenderer;
  camera!: THREE.PerspectiveCamera;
  scene!: THREE.Scene;
  geometry!: THREE.PlaneGeometry;
  medias: MediaItem[] = [];
  mediasImages: { image: string; text: string }[] = [];
  textureLoader: THREE.TextureLoader;
  textureCache: Map<string, THREE.Texture> = new Map();

  screen: { width: number; height: number };
  viewport: { width: number; height: number };
  raf: number = 0;
  isDestroyed: boolean = false;
  hasStartedLoop: boolean = false;
  lastFrameTime: number = 0;
  frameInterval: number = 1000 / 60;

  bend: number;
  textColor: string;
  borderRadius: number;

  isDown: boolean = false;
  start: number = 0;
  startY: number = 0;
  isHover: boolean = false;
  dragMultiplierPointer: number = 0;
  dragMultiplierTouch: number = 0;
  activeDragMultiplier: number = 0;
  isCoarsePointer: boolean = false;
  lastPointerWasTouch: boolean = false;
  supportsPointerEvents: boolean = false;
  activePointerId: number | null = null;

  boundOnResize!: () => void;
  boundOnPointerEnter!: () => void;
  boundOnPointerLeave!: () => void;
  boundOnPointerDown?: (e: PointerEvent) => void;
  boundOnPointerMove?: (e: PointerEvent) => void;
  boundOnPointerUp?: (e: PointerEvent) => void;
  boundOnPointerCancel?: (e: PointerEvent) => void;
  boundOnTouchDown?: (e: TouchEvent) => void;
  boundOnTouchMove?: (e: TouchEvent) => void;
  boundOnTouchUp?: () => void;

  constructor(
    container: HTMLElement,
    {
      items,
      bend = 1,
      textColor = '#ffffff',
      borderRadius = 0,
      scrollSpeed = 2,
      scrollEase = 0.05,
      wheelEnabled = false,
      autoScrollSpeed = 0.01
    }: CircularGalleryProps
  ) {
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.wheelEnabled = wheelEnabled;
    this.autoScrollSpeed = autoScrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;

    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight
    };
    this.viewport = { width: 0, height: 0 };

    this.isCoarsePointer =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(pointer: coarse)').matches
        : false;
    this.supportsPointerEvents = typeof window !== 'undefined' && 'PointerEvent' in window;
    this.dragMultiplierPointer = this.scrollSpeed * 0.025;
    this.dragMultiplierTouch = this.scrollSpeed * (this.isCoarsePointer ? 0.06 : 0.045);
    this.activeDragMultiplier = this.dragMultiplierPointer;

    if (this.isCoarsePointer) {
      this.autoScrollSpeed = autoScrollSpeed * 0.6;
      this.scroll.ease = Math.min(scrollEase * 1.2, 0.12);
    }

    this.textureLoader = new THREE.TextureLoader();

    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.addEventListeners();
    this.update = this.update.bind(this);

    requestAnimationFrame(() => this.renderer.render(this.scene, this.camera));
    void this.createMedias(items || []);
  }

  createRenderer() {
    const maxDpr = 1.5;
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.renderer.setClearColor(0x000000, 0);
    // Don't set outputColorSpace - let ShaderMaterial handle colors directly
    // this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    const canvas = this.renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    this.container.appendChild(canvas);
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.screen.width / this.screen.height,
      0.1,
      1000
    );
    this.camera.position.z = 20;
  }

  createScene() {
    this.scene = new THREE.Scene();
  }

  createGeometry() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 48, 24);
  }

  private createPlaceholderTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 2;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = '#191919';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }

  private loadTexture(imageSrc: string): Promise<THREE.Texture> {
    const cached = this.textureCache.get(imageSrc);
    if (cached) return Promise.resolve(cached);

    return new Promise((resolve) => {
      this.textureLoader.load(
        imageSrc,
        (texture) => {
          // Don't set colorSpace for ShaderMaterial - it doesn't automatically decode
          // texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.needsUpdate = true;
          this.textureCache.set(imageSrc, texture);
          resolve(texture);
        },
        undefined,
        () => {
          // On error, return placeholder
          const placeholder = this.createPlaceholderTexture();
          this.textureCache.set(imageSrc, placeholder);
          resolve(placeholder);
        }
      );
    });
  }

  async createMedias(items: { image: string; text: string }[]) {
    const galleryItems = items && items.length ? items : [];
    this.mediasImages = galleryItems;

    if (this.mediasImages.length === 0) return;

    const placeholderTexture = this.createPlaceholderTexture();

    // Create all meshes with placeholder texture
    this.medias = this.mediasImages.map((data, index) => {
      const material = new THREE.ShaderMaterial({
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uTexture: { value: placeholderTexture },
          uImageSize: { value: new THREE.Vector2(1, 1) },
          uPlaneSize: { value: new THREE.Vector2(1, 1) },
          uBorderRadius: { value: this.borderRadius }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D uTexture;
          uniform vec2 uImageSize;
          uniform vec2 uPlaneSize;
          uniform float uBorderRadius;
          varying vec2 vUv;

          float roundedBoxSDF(vec2 p, vec2 b, float r) {
            vec2 d = abs(p) - b;
            return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
          }

          void main() {
            vec2 ratio = vec2(
              min((uPlaneSize.x / uPlaneSize.y) / (uImageSize.x / uImageSize.y), 1.0),
              min((uPlaneSize.y / uPlaneSize.x) / (uImageSize.y / uImageSize.x), 1.0)
            );
            vec2 uv = vec2(
              vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
              vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
            );
            vec4 color = texture2D(uTexture, uv);

            float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
            float edgeSmooth = 0.002;
            float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);

            gl_FragColor = vec4(color.rgb, alpha);
          }
        `
      });

      const mesh = new THREE.Mesh(this.geometry, material);
      this.scene.add(mesh);

      return {
        mesh,
        material,
        index,
        width: 0,
        widthTotal: 0,
        x: 0,
        extra: 0,
        imageSrc: data.image,
        isBefore: false,
        isAfter: false
      };
    });

    this.onResize();
    this.medias.forEach(media => this.updateMedia(media, 'right'));
    this.medias.forEach(media => this.updateMedia(media, 'left'));
    this.scroll.last = this.scroll.current;
    this.renderer.render(this.scene, this.camera);

    if (!this.hasStartedLoop) {
      this.hasStartedLoop = true;
      this.update();
    }

    // Progressive loading: load first and last images immediately
    const uniqueImages = Array.from(new Set(this.mediasImages.map(item => item.image)));
    const eagerImages = [uniqueImages[0], uniqueImages[uniqueImages.length - 1]].filter(Boolean);

    if (eagerImages.length > 0) {
      await Promise.all(
        eagerImages.map(async imageSrc => {
          const texture = await this.loadTexture(imageSrc);
          if (this.isDestroyed) return;

          this.medias
            .filter(media => media.imageSrc === imageSrc)
            .forEach(media => {
              media.material.uniforms.uTexture.value = texture;
              media.material.needsUpdate = true;
            });
        })
      );

      if (!this.isDestroyed) {
        this.renderer.render(this.scene, this.camera);
      }
    }

    // Load remaining images progressively
    const remainingImages = uniqueImages.filter(img => !eagerImages.includes(img));

    if (remainingImages.length > 0) {
      let nextIndex = 0;
      let active = 0;
      const maxConcurrent = Math.min(2, remainingImages.length);

      const pump = () => {
        if (this.isDestroyed) return;
        while (active < maxConcurrent && nextIndex < remainingImages.length) {
          const imageSrc = remainingImages[nextIndex++];
          active += 1;

          const loadAndApply = async () => {
            try {
              const texture = await this.loadTexture(imageSrc);
              if (this.isDestroyed) return;

              this.medias
                .filter(media => media.imageSrc === imageSrc)
                .forEach(media => {
                  media.material.uniforms.uTexture.value = texture;
                  media.material.needsUpdate = true;
                });

              this.renderer.render(this.scene, this.camera);
            } finally {
              active -= 1;
              requestAnimationFrame(pump);
            }
          };

          void loadAndApply();
        }
      };

      requestAnimationFrame(pump);
    }
  }

  private clampTarget(target: number, reference: number = this.scroll.current): number {
    if (!this.medias || this.medias.length === 0) return target;
    const itemWidth = this.medias[0].width || 1;
    const maxDeltaBase = itemWidth * 6;
    const maxDelta = this.lastPointerWasTouch ? itemWidth * 8 : maxDeltaBase;
    const delta = target - reference;
    if (delta > maxDelta) return reference + maxDelta;
    if (delta < -maxDelta) return reference - maxDelta;
    return target;
  }

  onTouchDown(e: MouseEvent | TouchEvent | PointerEvent) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    const point = 'touches' in e ? e.touches[0] : (e as MouseEvent);
    this.start = point.clientX;
    this.startY = point.clientY;
    const isTouch =
      'touches' in e
        ? true
        : 'pointerType' in e
          ? (e as PointerEvent).pointerType === 'touch'
          : false;
    this.lastPointerWasTouch = isTouch;
    this.activeDragMultiplier = isTouch ? this.dragMultiplierTouch : this.dragMultiplierPointer;
  }

  onTouchMove(e: MouseEvent | TouchEvent | PointerEvent) {
    if (!this.isDown) return;
    const point = 'touches' in e ? e.touches[0] : (e as MouseEvent);
    if ('touches' in e) {
      e.preventDefault();
    }
    const distance = (this.start - point.clientX) * this.activeDragMultiplier;
    const base = this.scroll.position ?? 0;
    this.scroll.target = this.clampTarget(base + distance, base);
  }

  onTouchUp() {
    this.isDown = false;
    this.activeDragMultiplier = this.dragMultiplierPointer;
    this.onCheck();
  }

  onPointerEnter() {
    this.isHover = true;
    this.scroll.target = this.scroll.current;
    this.scroll.last = this.scroll.current;
  }

  onPointerLeave() {
    this.isHover = false;
    this.scroll.last = this.scroll.current;
  }

  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }

  onResize() {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.aspect = this.screen.width / this.screen.height;
    this.camera.updateProjectionMatrix();

    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };

    if (this.medias && this.medias.length > 0) {
      this.medias.forEach(media => this.onResizeMedia(media));
    }
  }

  onResizeMedia(media: MediaItem) {
    const scale = this.screen.height / 1500;
    const scaleY = (this.viewport.height * (900 * scale)) / this.screen.height;
    const scaleX = (this.viewport.width * (700 * scale)) / this.screen.width;

    media.mesh.scale.set(scaleX, scaleY, 1);
    media.material.uniforms.uPlaneSize.value.set(scaleX, scaleY);

    const padding = 2;
    media.width = scaleX + padding;
    media.widthTotal = media.width * this.medias.length;
    media.x = media.width * media.index;
  }

  updateMedia(media: MediaItem, direction: 'right' | 'left') {
    media.mesh.position.x = media.x - this.scroll.current - media.extra;

    const x = media.mesh.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      media.mesh.position.y = 0;
      media.mesh.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);

      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) {
        media.mesh.position.y = -arc;
        media.mesh.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        media.mesh.position.y = arc;
        media.mesh.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    const planeOffset = media.mesh.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    media.isBefore = media.mesh.position.x + planeOffset < -viewportOffset;
    media.isAfter = media.mesh.position.x - planeOffset > viewportOffset;

    if (direction === 'right' && media.isBefore) {
      media.extra -= media.widthTotal;
      media.isBefore = media.isAfter = false;
    }
    if (direction === 'left' && media.isAfter) {
      media.extra += media.widthTotal;
      media.isBefore = media.isAfter = false;
    }
  }

  update(currentTime: number = 0) {
    this.raf = window.requestAnimationFrame(this.update);

    const deltaTime = currentTime - this.lastFrameTime;

    if (deltaTime < this.frameInterval) {
      return;
    }

    this.lastFrameTime = currentTime - (deltaTime % this.frameInterval);

    if (!this.isDown && !this.isHover && this.autoScrollSpeed !== 0) {
      this.scroll.target = this.clampTarget(this.scroll.target + this.autoScrollSpeed);
    }

    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';

    if (this.medias) {
      this.medias.forEach(media => this.updateMedia(media, direction));
    }

    this.renderer.render(this.scene, this.camera);
    this.scroll.last = this.scroll.current;
  }

  private handlePointerDown(e: PointerEvent) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    this.activePointerId = e.pointerId;
    try {
      this.container.setPointerCapture(e.pointerId);
    } catch {
      // Ignore capture errors
    }
    this.onTouchDown(e);
    if (e.pointerType !== 'touch') {
      e.preventDefault();
    }
  }

  private handlePointerMove(e: PointerEvent) {
    if (this.activePointerId !== e.pointerId) return;
    this.onTouchMove(e);
    if (e.pointerType !== 'touch') {
      e.preventDefault();
    }
  }

  private handlePointerUp(e: PointerEvent) {
    if (this.activePointerId !== e.pointerId) return;
    this.onTouchUp();
    this.releasePointerCaptureSafe(e.pointerId);
  }

  private handlePointerCancel(e: PointerEvent) {
    if (this.activePointerId !== e.pointerId) return;
    this.onTouchUp();
    this.releasePointerCaptureSafe(e.pointerId);
  }

  private releasePointerCaptureSafe(pointerId: number) {
    if (this.activePointerId !== pointerId) return;
    try {
      this.container.releasePointerCapture(pointerId);
    } catch {
      // Ignore
    }
    this.activePointerId = null;
  }

  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnPointerEnter = this.onPointerEnter.bind(this);
    this.boundOnPointerLeave = this.onPointerLeave.bind(this);

    window.addEventListener('resize', this.boundOnResize);
    this.container.addEventListener('mouseenter', this.boundOnPointerEnter);
    this.container.addEventListener('mouseleave', this.boundOnPointerLeave);

    if (this.supportsPointerEvents) {
      this.boundOnPointerDown = this.handlePointerDown.bind(this);
      this.boundOnPointerMove = this.handlePointerMove.bind(this);
      this.boundOnPointerUp = this.handlePointerUp.bind(this);
      this.boundOnPointerCancel = this.handlePointerCancel.bind(this);

      this.container.addEventListener('pointerdown', this.boundOnPointerDown);
      this.container.addEventListener('pointermove', this.boundOnPointerMove);
      this.container.addEventListener('pointerup', this.boundOnPointerUp);
      this.container.addEventListener('pointercancel', this.boundOnPointerCancel);
    } else {
      this.boundOnTouchDown = this.onTouchDown.bind(this);
      this.boundOnTouchMove = this.onTouchMove.bind(this);
      this.boundOnTouchUp = this.onTouchUp.bind(this);

      this.container.addEventListener('touchstart', this.boundOnTouchDown, { passive: false });
      this.container.addEventListener('touchmove', this.boundOnTouchMove, { passive: false });
      this.container.addEventListener('touchend', this.boundOnTouchUp);
      this.container.addEventListener('touchcancel', this.boundOnTouchUp);
    }
  }

  destroy() {
    this.isDestroyed = true;
    window.cancelAnimationFrame(this.raf);

    window.removeEventListener('resize', this.boundOnResize);
    this.container.removeEventListener('mouseenter', this.boundOnPointerEnter);
    this.container.removeEventListener('mouseleave', this.boundOnPointerLeave);

    if (this.supportsPointerEvents) {
      if (this.boundOnPointerDown) this.container.removeEventListener('pointerdown', this.boundOnPointerDown);
      if (this.boundOnPointerMove) this.container.removeEventListener('pointermove', this.boundOnPointerMove);
      if (this.boundOnPointerUp) this.container.removeEventListener('pointerup', this.boundOnPointerUp);
      if (this.boundOnPointerCancel) this.container.removeEventListener('pointercancel', this.boundOnPointerCancel);
      if (this.activePointerId !== null) {
        try {
          this.container.releasePointerCapture(this.activePointerId);
        } catch {
          // Ignore
        }
        this.activePointerId = null;
      }
    } else {
      if (this.boundOnTouchDown) this.container.removeEventListener('touchstart', this.boundOnTouchDown);
      if (this.boundOnTouchMove) this.container.removeEventListener('touchmove', this.boundOnTouchMove);
      if (this.boundOnTouchUp) {
        this.container.removeEventListener('touchend', this.boundOnTouchUp);
        this.container.removeEventListener('touchcancel', this.boundOnTouchUp);
      }
    }

    // Dispose Three.js resources
    this.medias.forEach(media => {
      media.material.dispose();
      this.scene.remove(media.mesh);
    });

    this.geometry.dispose();

    this.textureCache.forEach(texture => {
      texture.dispose();
    });
    this.textureCache.clear();

    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }

    this.renderer.dispose();
  }
}

export default function CircularGallery({
  items,
  bend = 3,
  textColor = '#ffffff',
  borderRadius = 0.05,
  font = 'bold 30px Figtree',
  scrollSpeed = 2,
  scrollEase = 0.05,
  wheelEnabled = false,
  autoScrollSpeed = 0.01
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<ThreeGallery | null>(null);
  const [shouldInit, setShouldInit] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    if (shouldInit) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setShouldInit(true);
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!shouldInit) {
            setShouldInit(true);
            observer.disconnect();
          }
        }
      });
    }, { threshold: 0.1, rootMargin: '200px 0px' });

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldInit]);

  useEffect(() => {
    if (!shouldInit || !containerRef.current) return;

    const app = new ThreeGallery(containerRef.current, {
      items: items || galleryItems,
      bend,
      textColor,
      borderRadius,
      font,
      scrollSpeed,
      scrollEase,
      wheelEnabled,
      autoScrollSpeed
    });
    appRef.current = app;

    return () => {
      app.destroy();
      appRef.current = null;
    };
  }, [shouldInit, items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase, wheelEnabled, autoScrollSpeed]);

  return (
    <div
      className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
      ref={containerRef}
      style={{ touchAction: 'pan-y pinch-zoom' }}
    />
  );
}
