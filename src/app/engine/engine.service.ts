import * as THREE from 'three';
import {ElementRef, Injectable, NgZone, OnDestroy} from '@angular/core';

@Injectable({providedIn: 'root'})
export class EngineService implements OnDestroy {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.OrthographicCamera;
  private scene: THREE.Scene;
  private light: THREE.AmbientLight;
  private isDragging: boolean = false;
  private plane: THREE.Mesh;
  private zoom: number = 1;
  private previousMousePosition = {
    x: 0,
    y: 0
  };
  private mouseDown = false;
  private lastMouseX: number = null;
  private lastMouseY: number = null;
  private frameId: number = null;

  public constructor(private ngZone: NgZone) {
  }

  public ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
    if (this.renderer != null) {
      this.renderer.dispose();
      this.renderer = null;
      this.canvas = null;
    }
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    // The first step is to get the reference of the canvas element from our HTML document
    this.canvas = canvas.nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // create the scene
    this.scene = new THREE.Scene();

    // this.camera = new THREE.PerspectiveCamera(
    //   75, window.innerWidth / window.innerHeight, 0.1, 1000
    // );
    this.camera = new THREE.OrthographicCamera(
      window.innerWidth / -2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight / -2,
      1,
      1000
    );
    this.camera.position.z = 5;

    //#region new
//     // Define the camera's position
//     var center = new THREE.Vector3(0, 0, 0);
//     var distance = 10;
//     var posX = center.x + distance * Math.cos(Math.PI / 4);
//     var posY = center.y + distance;
//     var posZ = center.z + distance * Math.sin(Math.PI / 4);

//         // Define the camera's rotation
//         var rotationX = -Math.PI / 4; // Rotate 45 degrees around the X-axis
//         var rotationY = 0;           // No rotation around the Y-axis
//         var rotationZ = Math.PI / 4;  // Rotate 45 degrees around the Z-axis

//         // Create the OrthographicCamera with the defined position and rotation
//         this.camera = new THREE.OrthographicCamera(
//           -window.innerWidth / 2, window.innerWidth / 2,
//           window.innerHeight / 2, -window.innerHeight / 2,
//           0.1, 1000
//         );
//         this.camera.position.set(posX, posY, posZ);
//         this.camera.rotation.set(rotationX, rotationY, rotationZ);

// //#endregion new

      // Set the camera to look at the origin (0,0,0) from the new angle
      this.camera.lookAt(0, 0, 0);

      this.scene.add(this.camera);

    // soft white light
    this.light = new THREE.AmbientLight(0x404040);
    this.light.position.z = 10;
    this.scene.add(this.light);

    // Define the grid of images
      const numRows = 20;
      const numCols = 20;
      const imageSize = 100;
      const imageSpacing = 2;

      const loader = new THREE.TextureLoader();
      const images = new Array<THREE.Texture>();
      for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
          const image = loader.load("assets/soil.png");
          images.push(image);
        }
      }

      // Create the image planes and add them to the scene
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        this.plane = new THREE.Mesh(
          new THREE.PlaneGeometry(imageSize, imageSize),
          new THREE.MeshBasicMaterial({ map: image })
        );

        let x = (i % numCols) * (imageSize + imageSpacing) - (numCols - 1) * (imageSize + imageSpacing) / 2;
        let y = Math.floor(i / numCols) * (imageSize + imageSpacing) - (numRows - 1) * (imageSize + imageSpacing) / 2;

        this.plane.position.set(x, y, 0);
        this.scene.add(this.plane);
      }
  }

  public animate(): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.render();
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.render();
        });
      }

        window.addEventListener('resize', () => {
          this.resize();
        });

        window.addEventListener('resize', () => {
          this.resize();
        });

        window.addEventListener('mousedown', (event) => {
          this.mouseDown = true;
          this.lastMouseX = event.clientX;
          this.lastMouseY = event.clientY;
        });

        window.addEventListener('mouseup', (event) => {
          this.mouseDown = false;
        });

        window.addEventListener('mousemove', (event) => {
          if (!this.mouseDown) {
            return;
          }
          var deltaX = event.clientX - this.lastMouseX;
          var deltaY = event.clientY - this.lastMouseY;
          this.lastMouseX = event.clientX;
          this.lastMouseY = event.clientY;

          // move the camera
          this.camera.position.x -= deltaX * 0.1;
          this.camera.position.y += deltaY * 0.1;
        });
      });
  }

  public render(): void {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });

    this.renderer.render(this.scene, this.camera);
  }

  public resize(): void {
    const width = window.innerWidth ;
    const height = window.innerHeight;

    // this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }
}
