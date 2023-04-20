import React, { useEffect } from 'react'
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import nave from "../assets/nave.gltf"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import planetTexture from "../assets/planetTexture.png"
import planetglow from "../assets/glow.png"



const Scene = () => {

    useEffect(() => {


        const canvas = document.querySelector('.webGlScene')
    
        // scene setup
        const scene = new THREE.Scene();
        
        
        const size = {
            width :  window.innerWidth,
            height : window.innerHeight
        }
        
        window.addEventListener ('resize', () => {
            size.width = window.innerWidth
            size.height = window.innerHeight
        
            camera.aspect = size.width / size.height
            camera.updateProjectionMatrix()
    
            renderer.setSize(size.width, size.height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        })
    
    
    
        /*camera  */
    
        let camera;
    
        function setCamera(){
    
            camera = new THREE.PerspectiveCamera(75, size.width / size.height, 0.1, 1000)
    
            scene.add(camera)
        }
    
        setCamera()
    
    
    
    
        /* renderer */
    
    
        let renderer;
    
        function setRender(){
            renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: true,
                /* alpha:true */
            });
            
            renderer.setSize(size.width, size.height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
            renderer.physicallyCorrectLights = true;
            renderer.outputEncoding = THREE.sRGBEncoding
        }
    
        setRender()
    
    
    
    
        /* lights */
    
        function setLights(){
            const ambientLight = new THREE.AmbientLight(0xffffff ,.7)
            scene.add(ambientLight);
        }
    
        setLights()
    
    


/*         // Controls
        const controls = new OrbitControls(camera, canvas)
        controls.enableDamping = true */



            /* textures */
        const textureLoader = new THREE.TextureLoader()
        const planetMap = textureLoader.load(planetTexture)
        const planetGlow = textureLoader.load(planetglow)
        
        


        // earth 


        const planetGeometry = new THREE.SphereGeometry(10, 32, 32);
        const groupPlanet = new THREE.Group();
        scene.add(groupPlanet);
        
        const earthMaterial = new THREE.MeshPhongMaterial({
            map: planetMap,
            side: THREE.FrontSide,
        });
        
        const earthMesh = new THREE.Mesh(planetGeometry, earthMaterial);
        earthMesh.position.set(22, 4 , -45);
        earthMesh.rotation.y = 4;
        groupPlanet.add(earthMesh);
        
        // Crear la luz que creará el efecto de aureola
        const auraLight = new THREE.PointLight(0xffffff, 1, 100);
        auraLight.position.copy(earthMesh.position); // Establecer la posición de la luz en la misma posición que el planeta
        scene.add(auraLight);
        

        // Crear un material para la aureola que utilice la textura de glow
        const auraMaterial = new THREE.MeshBasicMaterial({
            map: planetGlow,
            color: 0xffffff,
            opacity: .9,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide // Renderizar en la parte posterior de la geometría
        });

        // Crear una geometría de anillo para la aureola
        const auraGeometry = new THREE.RingGeometry(16, 50, 50);

        // Crear un objeto de malla para la geometría de anillo y añadirlo a la escena
        const auraMesh = new THREE.Mesh(auraGeometry, auraMaterial);
        auraLight.add(auraMesh);

        // Rotar la geometría de anillo para que se ajuste a la posición del planeta
        auraMesh.rotation.x = -Math.PI / 2;
        auraMesh.rotation.y = earthMesh.rotation.y + 2;

        
        /* draco loader   NAVE*/

        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('/draco/')
        const gltfLoader = new GLTFLoader()
        gltfLoader.setDRACOLoader(dracoLoader)




        /* scene gltf */
        let sceneNave
        let objectRenderOrder

        gltfLoader.load(
            nave,
            (gltf) =>
            {
                sceneNave= gltf.scene
                scene.add(sceneNave)
                sceneNave.position.set(0,-10,30)
                sceneNave.rotation.x = .25
                sceneNave.scale.set(1,1,1)
        
                // Obtener el valor de renderOrder de tu objeto
                 objectRenderOrder = sceneNave.renderOrder
        
                // Establecer el valor de renderOrder de tus partículas
                particlesMaterial.renderOrder = objectRenderOrder - 1
            }
        )






        // Stars 
        const starsGeometry = new THREE.BufferGeometry()
        const count = 5000
                
        const colors = new Float32Array(count * 3)
        const positions = new Float32Array(count * 3) 
        let geometry = null
        let material = null
        let points = null
                
        for(let i = 0; i < count * 3; i++) {
            if(points !== null) {
                geometry.dispose()
                material.dispose()
                scene.remove(points)
            }
            positions[i] = (Math.random() - .5) * 125
            colors[i] = Math.random()
        }
                
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
                
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.015,
            transparent: true,
            opacity: .8,
            alphaTest: .5,
            vertexColors: true  // Habilitar colores por vértice para usar el atributo de color definido en la geometría
        })
                
        // Establecer el valor de renderOrder de tus partículas
        particlesMaterial.renderOrder = objectRenderOrder - 1
                
        const particle = new THREE.Points(starsGeometry, particlesMaterial)
        particle.position.z = -1
                
        scene.add(particle)





        let moveForward = false;
        let moveBackward = false;
        let moveLeft = false;
        let moveRight = false;
        let canMoveFast = false;
        
        function handleKeyDown(event) {
          switch (event.key) {
            case "ArrowUp":
            case "w":
              moveForward = true;
              break;
            case "ArrowLeft":
            case "a":
              moveLeft = true;
              break;
            case "ArrowDown":
            case "s":
              moveBackward = true;
              break;
            case "ArrowRight":
            case "d":
              moveRight = true;
              break;
            case "Shift":
              canMoveFast = true;
              break;
          }
        }
        
        function handleKeyUp(event) {
          switch (event.key) {
            case "ArrowUp":
            case "w":
              moveForward = false;
              break;
            case "ArrowLeft":
            case "a":
              moveLeft = false;
              break;
            case "ArrowDown":
            case "s":
              moveBackward = false;
              break;
            case "ArrowRight":
            case "d":
              moveRight = false;
              break;
            case "Shift":
              canMoveFast = false;
              break;
          }
        }
        
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        
        const clock = new THREE.Clock()
        
        const animate = () =>{
        
          const time = clock.getElapsedTime()
          const ghost1Angle = time 
        
          // Mueve la nave según las teclas presionadas
          if(sceneNave){
            camera.position.x = sceneNave.position.x;
            camera.position.y = sceneNave.position.y + 0;
            camera.position.z = sceneNave.position.z + 6;
            camera.lookAt(sceneNave.position);
          }
          if (moveForward) {
            sceneNave.position.z -= canMoveFast ? 0.2 : 0.1;
            sceneNave.position.y += canMoveFast ? 0.08 : 0.04;
          } else if (moveBackward) {
            sceneNave.position.z += canMoveFast ? 0.2 : 0.1;
            sceneNave.position.y -= canMoveFast ? 0.08 : 0.04;
          }
        
          if (moveLeft) {
            sceneNave.position.x -= canMoveFast ? 0.2 : 0.1;
          } else if (moveRight) {
            sceneNave.position.x += canMoveFast ? 0.2 : 0.1;
          }
        
          // Verificar si el objeto está definido
          if (sceneNave !== undefined) {
            sceneNave.rotation.y = ghost1Angle * .6
          }

     
            // anima las partículas
            particle.rotation.y += 0.0002;
            particle.rotation.x += 0.0002;
            particle.rotation.z += 0.0002;
            earthMesh.rotation.z -= 0.001
            earthMesh.rotation.x -= 0.001



            
            // Obtener el atributo de color de la geometría y actualizarlo en función del tiempo
            const colors = starsGeometry.attributes.color
            for(let i = 0; i < colors.count; i++) {
                if(Math.random() > 0.1) {
                    colors.setXYZ(i, 1, 1, 1) // Hacer que la partícula sea blanca si el valor aleatorio es mayor que 0.5
                } else {
                    colors.setXYZ(i, 0, 0, 0) // Hacer que la partícula sea negra si el valor aleatorio es menor o igual que 0.5
                }
            }
            colors.needsUpdate = true // Indicar a three.js que los colores de la geometría han cambiado
            


       
            renderer.render(scene,camera)
            window.requestAnimationFrame(animate)
            renderer.autoClear = true

        }
        
        animate()
        
        renderer.render(scene,camera)
            

    },[])

  return (
    <canvas className='webGlScene'></canvas>
  )
}

export default Scene