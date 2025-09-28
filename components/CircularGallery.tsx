"use client"

import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useRef, useState } from 'react';

type GL = Renderer['gl'];

function debounce<T extends (...args: unknown[]) => void>(func: T, wait: number): T {
  let timeout: number;
  return function (...args: Parameters<T>) {
    if (timeout) window.clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  } as T;
}

function lerp(p1: number, p2: number, t: number): number {
  return p1 + (p2 - p1) * t;
}

type BindableInstance = Record<string, unknown>;

function autoBind<T extends BindableInstance>(instance: T): void {
  const proto = Object.getPrototypeOf(instance) as BindableInstance;
  Object.getOwnPropertyNames(proto).forEach(key => {
    const descriptor = Object.getOwnPropertyDescriptor(proto, key);
    const value = descriptor?.value;
    if (key === 'constructor' || typeof value !== 'function') {
      return;
    }

    Object.defineProperty(instance, key, {
      ...descriptor,
      value: (value as (...args: unknown[]) => unknown).bind(instance)
    });
  });
}

function getFontSize(font: string): number {
  const match = font.match(/(\d+)px/);
  return match ? parseInt(match[1], 10) : 30;
}

function createTextTexture(
  gl: GL,
  text: string,
  font: string = 'bold 30px monospace',
  color: string = 'black'
): { texture: Texture; width: number; height: number } {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get 2d context');

  context.font = font;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const fontSize = getFontSize(font);
  const textHeight = Math.ceil(fontSize * 1.2);

  canvas.width = textWidth + 20;
  canvas.height = textHeight + 20;

  context.font = font;
  context.fillStyle = color;
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

interface LoadedTexture {
  texture: Texture;
  size: [number, number];
}

interface TitleProps {
  gl: GL;
  plane: Mesh;
  renderer: Renderer;
  text: string;
  textColor?: string;
  font?: string;
}

class Title {
  gl: GL;
  plane: Mesh;
  renderer: Renderer;
  text: string;
  textColor: string;
  font: string;
  mesh!: Mesh;

  constructor({ gl, plane, renderer, text, textColor = '#545050', font = '30px sans-serif' }: TitleProps) {
    autoBind(this);
    this.gl = gl;
    this.plane = plane;
    this.renderer = renderer;
    this.text = text;
    this.textColor = textColor;
    this.font = font;
    this.createMesh();
  }

  createMesh() {
    const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor);
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    const aspect = width / height;
    const textHeightScaled = this.plane.scale.y * 0.15;
    const textWidthScaled = textHeightScaled * aspect;
    this.mesh.scale.set(textWidthScaled, textHeightScaled, 1);
    this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeightScaled * 0.5 - 0.05;
    this.mesh.setParent(this.plane);
  }
}

interface ScreenSize {
  width: number;
  height: number;
}

interface Viewport {
  width: number;
  height: number;
}

interface MediaProps {
  geometry: Plane;
  gl: GL;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: ScreenSize;
  imageSrc: string;
  text: string;
  viewport: Viewport;
  bend: number;
  textColor: string;
  borderRadius?: number;
  font?: string;
  textureInfo: LoadedTexture;
}

class Media {
  extra: number = 0;
  geometry: Plane;
  gl: GL;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: ScreenSize;
  imageSrc: string;
  text: string;
  viewport: Viewport;
  bend: number;
  textColor: string;
  borderRadius: number;
  font?: string;
  program!: Program;
  plane!: Mesh;
  title!: Title;
  scale!: number;
  padding!: number;
  width!: number;
  widthTotal!: number;
  x!: number;
  isBefore: boolean = false;
  isAfter: boolean = false;
  textureInfo: LoadedTexture;
  imageSrc: string;

  constructor({
    geometry,
    gl,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    viewport,
    bend,
    textColor,
    borderRadius = 0,
    font,
    imageSrc,
    textureInfo
  }: MediaProps) {
    this.geometry = geometry;
    this.gl = gl;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.imageSrc = imageSrc;
    this.text = text;
    this.viewport = viewport;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    this.textureInfo = textureInfo;
    this.createShader();
    this.createMesh();
    if (this.text) {
      this.createTitle();
    }
    this.onResize();
  }

  updateTexture(textureInfo: LoadedTexture) {
    this.textureInfo = textureInfo;
    const { texture, size } = textureInfo;
    if (this.program && this.program.uniforms) {
      texture.needsUpdate = true;
      this.program.uniforms.tMap.value = texture;
      if (this.program.uniforms.uImageSizes) {
        this.program.uniforms.uImageSizes.value = size;
      }
    }
  }

  createShader() {
    const { texture, size } = this.textureInfo;
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;
        
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        
        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);
          
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          
          // Smooth antialiasing for edges
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);
          
          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: size },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius }
      },
      transparent: true
    });
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    });
    this.plane.setParent(this.scene);
  }

  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
      textColor: this.textColor,
      font: this.font
    });
  }

  update(scroll: { current: number; last: number }, direction: 'right' | 'left') {
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);

      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }

  onResize({ screen, viewport }: { screen?: ScreenSize; viewport?: Viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
      }
    }
    this.scale = this.screen.height / 1500;
    this.plane.scale.y = (this.viewport.height * (900 * this.scale)) / this.screen.height;
    this.plane.scale.x = (this.viewport.width * (700 * this.scale)) / this.screen.width;
    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.padding = 2;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

interface AppConfig {
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

class App {
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
  onCheckDebounce!: () => void;
  renderer!: Renderer;
  gl!: GL;
  camera!: Camera;
  scene!: Transform;
  planeGeometry!: Plane;
  medias: Media[] = [];
  mediasImages: { image: string; text: string }[] = [];
  // Cache pending texture promises so each asset is decoded only once.
  textureCache: Map<string, Promise<LoadedTexture>> = new Map();
  screen!: { width: number; height: number };
  viewport!: { width: number; height: number };
  raf: number = 0;
  isDestroyed: boolean = false;
  hasStartedLoop: boolean = false;

  boundOnResize!: () => void;
  boundOnTouchDown!: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchMove!: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchUp!: () => void;
  boundOnPointerEnter!: () => void;
  boundOnPointerLeave!: () => void;

  isDown: boolean = false;
  start: number = 0;
  startY: number = 0;
  isHover: boolean = false;
  dragMultiplierPointer: number = 0;
  dragMultiplierTouch: number = 0;
  activeDragMultiplier: number = 0;
  isCoarsePointer: boolean = false;
  lastPointerWasTouch: boolean = false;

  constructor(
    container: HTMLElement,
    {
      items,
      bend = 1,
      textColor = '#ffffff',
      borderRadius = 0,
      font = 'bold 30px Figtree',
      scrollSpeed = 2,
      scrollEase = 0.05,
      wheelEnabled = false,
      autoScrollSpeed = 0.01
    }: AppConfig
  ) {
    document.documentElement.classList.remove('no-js');
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.wheelEnabled = wheelEnabled;
    this.autoScrollSpeed = autoScrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 200);

    this.isCoarsePointer =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(pointer: coarse)').matches
        : false;
    this.dragMultiplierPointer = this.scrollSpeed * 0.025;
    this.dragMultiplierTouch = this.scrollSpeed * (this.isCoarsePointer ? 0.06 : 0.045);
    this.activeDragMultiplier = this.dragMultiplierPointer;
    if (this.isCoarsePointer) {
      this.autoScrollSpeed = autoScrollSpeed * 0.6;
      this.scroll.ease = Math.min(scrollEase * 1.2, 0.12);
    }
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.addEventListeners();
    this.update = this.update.bind(this);
    requestAnimationFrame(() => this.renderer.render({ scene: this.scene, camera: this.camera }));
    void this.createMedias(items, bend, textColor, borderRadius, font);
  }

  createRenderer() {
    const maxDpr = 1.5; // Cap DPR to keep fragment shading under control on retina screens.
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, maxDpr)
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    const canvas = this.renderer.gl.canvas as HTMLCanvasElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    this.container.appendChild(canvas);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 24,
      widthSegments: 48
    });
  }

  private createPlaceholderTexture(): LoadedTexture {
    const texture = new Texture(this.gl, { generateMipmaps: false });
    texture.minFilter = this.gl.LINEAR;
    texture.magFilter = this.gl.LINEAR;
    texture.wrapS = this.gl.CLAMP_TO_EDGE;
    texture.wrapT = this.gl.CLAMP_TO_EDGE;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 2;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = '#191919';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    texture.image = canvas;
    texture.needsUpdate = true;
    return { texture, size: [canvas.width, canvas.height] };
  }

  // Preload and reuse textures to eliminate duplicate GPU uploads.
  private loadTexture(imageSrc: string): Promise<LoadedTexture> {
    const cached = this.textureCache.get(imageSrc);
    if (cached) return cached;

    const promise = new Promise<LoadedTexture>(resolve => {
      const texture = new Texture(this.gl, { generateMipmaps: false });
      texture.minFilter = this.gl.LINEAR;
      texture.magFilter = this.gl.LINEAR;
      texture.wrapS = this.gl.CLAMP_TO_EDGE;
      texture.wrapT = this.gl.CLAMP_TO_EDGE;

      const MAX_DIMENSION = 1280;

      const image = new Image();
      if (/^https?:/i.test(imageSrc)) {
        image.crossOrigin = 'anonymous';
      }

      const commit = (source: HTMLImageElement | HTMLCanvasElement, width: number, height: number) => {
        if (!this.isDestroyed) {
          texture.image = source;
          texture.needsUpdate = true;
        }
        resolve({ texture, size: [width || 1, height || 1] });
      };

      const prepareSource = (source: HTMLImageElement | HTMLCanvasElement) => {
        const naturalWidth = (source as HTMLImageElement).naturalWidth || source.width;
        const naturalHeight = (source as HTMLImageElement).naturalHeight || source.height;
        const maxSide = Math.max(naturalWidth, naturalHeight);
        if (maxSide <= MAX_DIMENSION) {
          return { drawable: source, width: naturalWidth || source.width, height: naturalHeight || source.height };
        }
        const scale = MAX_DIMENSION / maxSide;
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(naturalHeight * scale));
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(source, 0, 0, canvas.width, canvas.height);
        }
        return { drawable: canvas, width: canvas.width, height: canvas.height };
      };

      image.onload = () => {
        const finalize = () => {
          const { drawable, width, height } = prepareSource(image);
          commit(drawable, width, height);
        };
        const decoder = (image as HTMLImageElement & { decode?: () => Promise<void> }).decode;
        if (decoder) {
          decoder.call(image).then(finalize).catch(() => finalize());
        } else {
          finalize();
        }
      };

      image.onerror = () => {
        const fallback = document.createElement('canvas');
        fallback.width = fallback.height = 2;
        const context = fallback.getContext('2d');
        if (context) {
          context.fillStyle = '#000';
          context.fillRect(0, 0, fallback.width, fallback.height);
        }
        commit(fallback, fallback.width, fallback.height);
      };

      image.src = imageSrc;
    });

    this.textureCache.set(imageSrc, promise);
    return promise;
  }

  async createMedias(
    items: { image: string; text: string }[] | undefined,
    bend: number = 1,
    textColor: string,
    borderRadius: number,
    font: string
  ) {
    const defaultItems = [
      {
        image: `https://picsum.photos/seed/1/800/600?grayscale`,
        text: 'Bridge'
      },
      {
        image: `https://picsum.photos/seed/2/800/600?grayscale`,
        text: 'Desk Setup'
      },
      {
        image: `https://picsum.photos/seed/3/800/600?grayscale`,
        text: 'Waterfall'
      },
      {
        image: `https://picsum.photos/seed/4/800/600?grayscale`,
        text: 'Strawberries'
      },
      {
        image: `https://picsum.photos/seed/5/800/600?grayscale`,
        text: 'Deep Diving'
      },
      {
        image: `https://picsum.photos/seed/16/800/600?grayscale`,
        text: 'Train Track'
      },
      {
        image: `https://picsum.photos/seed/17/800/600?grayscale`,
        text: 'Santorini'
      },
      {
        image: `https://picsum.photos/seed/8/800/600?grayscale`,
        text: 'Blurry Lights'
      },
      {
        image: `https://picsum.photos/seed/9/800/600?grayscale`,
        text: 'New York'
      },
      {
        image: `https://picsum.photos/seed/10/800/600?grayscale`,
        text: 'Good Boy'
      },
      {
        image: `https://picsum.photos/seed/21/800/600?grayscale`,
        text: 'Coastline'
      },
      {
        image: `https://picsum.photos/seed/12/800/600?grayscale`,
        text: 'Palm Trees'
      }
    ];
    const galleryItems = items && items.length ? items : defaultItems;
    this.mediasImages = galleryItems.concat(galleryItems);

    const placeholderInfo = this.createPlaceholderTexture();

    this.medias = this.mediasImages.map((data, index) =>
      new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        imageSrc: data.image,
        text: data.text,
        viewport: this.viewport,
        bend,
        textColor,
        borderRadius,
        font,
        textureInfo: placeholderInfo
      })
    );

    this.onResize();
    this.medias.forEach(media => media.update(this.scroll, 'right'));
    this.medias.forEach(media => media.update(this.scroll, 'left'));
    this.scroll.last = this.scroll.current;
    this.renderer.render({ scene: this.scene, camera: this.camera });

    if (!this.hasStartedLoop) {
      this.hasStartedLoop = true;
      this.update();
    }

    const uniqueImages = Array.from(new Set(this.mediasImages.map(item => item.image)));

    const eagerCount = Math.min(uniqueImages.length, 5);
    const eagerImages = uniqueImages.slice(0, eagerCount);

    if (eagerImages.length > 0) {
      await Promise.all(
        eagerImages.map(async imageSrc => {
          const textureInfo = await this.loadTexture(imageSrc);
          if (this.isDestroyed) return;

          this.medias
            .filter(media => media.imageSrc === imageSrc)
            .forEach(media => media.updateTexture(textureInfo));
        })
      );

      if (!this.isDestroyed) {
        this.renderer.render({ scene: this.scene, camera: this.camera });
      }
    }

    const remainingImages = uniqueImages.slice(eagerCount);

    const schedule = (cb: () => void) => {
      if (typeof window === 'undefined') {
        cb();
        return;
      }
      window.requestAnimationFrame(() => cb());
    };

    if (remainingImages.length > 0) {
      let nextIndex = 0;
      let active = 0;
      const maxConcurrent = Math.min(3, remainingImages.length);

      const pump = () => {
        if (this.isDestroyed) return;
        while (active < maxConcurrent && nextIndex < remainingImages.length) {
          const imageSrc = remainingImages[nextIndex++];
          active += 1;

          const loadAndApply = async () => {
            try {
              const textureInfo = await this.loadTexture(imageSrc);
              if (this.isDestroyed) return;

              this.medias
                .filter(media => media.imageSrc === imageSrc)
                .forEach(media => media.updateTexture(textureInfo));

              this.renderer.render({ scene: this.scene, camera: this.camera });
            } finally {
              active -= 1;
              schedule(pump);
            }
          };

          void loadAndApply();
        }
      };

      schedule(pump);
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

  onTouchDown(e: MouseEvent | TouchEvent) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    const point = 'touches' in e ? e.touches[0] : (e as MouseEvent);
    this.start = point.clientX;
    this.startY = point.clientY;
    const isTouch = 'touches' in e;
    this.lastPointerWasTouch = isTouch;
    this.activeDragMultiplier = isTouch ? this.dragMultiplierTouch : this.dragMultiplierPointer;
  }

  onTouchMove(e: MouseEvent | TouchEvent) {
    if (!this.isDown) return;
    const point = 'touches' in e ? e.touches[0] : (e as MouseEvent);
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

  onWheel(e: Event) {
    if (!this.wheelEnabled) {
      return;
    }
    const wheelEvent = e as WheelEvent;
    const path = 'composedPath' in wheelEvent ? wheelEvent.composedPath() : undefined;
    const isInside = path
      ? path.includes(this.container)
      : wheelEvent.target instanceof Node && this.container.contains(wheelEvent.target);
    if (!isInside) {
      return;
    }
    type LegacyWheelEvent = WheelEvent & { wheelDelta?: number; detail?: number };
    const legacyEvent = wheelEvent as LegacyWheelEvent;
    const delta = wheelEvent.deltaY || legacyEvent.wheelDelta || legacyEvent.detail || 0;
    const base = this.scroll.target;
    const rawTarget = base + (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
    this.scroll.target = this.clampTarget(rawTarget, this.scroll.current);
    this.onCheckDebounce();
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
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height
    });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) {
      this.medias.forEach(media => media.onResize({ screen: this.screen, viewport: this.viewport }));
    }
  }

  update() {
    if (!this.isDown && !this.isHover && this.autoScrollSpeed !== 0) {
      this.scroll.target = this.clampTarget(this.scroll.target + this.autoScrollSpeed);
    }
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
    if (this.medias) {
      this.medias.forEach(media => media.update(this.scroll, direction));
    }
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update);
  }

  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);
    this.boundOnPointerEnter = this.onPointerEnter.bind(this);
    this.boundOnPointerLeave = this.onPointerLeave.bind(this);
    window.addEventListener('resize', this.boundOnResize);
    window.addEventListener('mousedown', this.boundOnTouchDown);
    window.addEventListener('mousemove', this.boundOnTouchMove);
    window.addEventListener('mouseup', this.boundOnTouchUp);
    window.addEventListener('touchstart', this.boundOnTouchDown);
    window.addEventListener('touchmove', this.boundOnTouchMove);
    window.addEventListener('touchend', this.boundOnTouchUp);
    this.container.addEventListener('mouseenter', this.boundOnPointerEnter);
    this.container.addEventListener('mouseleave', this.boundOnPointerLeave);
  }

  destroy() {
    this.isDestroyed = true;
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.boundOnResize);
    window.removeEventListener('mousedown', this.boundOnTouchDown);
    window.removeEventListener('mousemove', this.boundOnTouchMove);
    window.removeEventListener('mouseup', this.boundOnTouchUp);
    window.removeEventListener('touchstart', this.boundOnTouchDown);
    window.removeEventListener('touchmove', this.boundOnTouchMove);
    window.removeEventListener('touchend', this.boundOnTouchUp);
    this.container.removeEventListener('mouseenter', this.boundOnPointerEnter);
    this.container.removeEventListener('mouseleave', this.boundOnPointerLeave);
    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas as HTMLCanvasElement);
    }
    this.textureCache.clear();
  }
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
  const appRef = useRef<App | null>(null);
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
            const triggerInit = () => setShouldInit(true);
            type RequestIdleCallback = (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
            const idleWindow = window as typeof window & { requestIdleCallback?: RequestIdleCallback };
            if (idleWindow.requestIdleCallback) {
              idleWindow.requestIdleCallback(triggerInit, { timeout: 750 });
            } else {
              window.requestAnimationFrame(triggerInit);
            }
          }
          observer.disconnect();
        }
      });
    }, { threshold: 0, rootMargin: '300px 0px' });

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldInit]);

  useEffect(() => {
    if (!shouldInit || !containerRef.current) return;

    const app = new App(containerRef.current, {
      items,
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
