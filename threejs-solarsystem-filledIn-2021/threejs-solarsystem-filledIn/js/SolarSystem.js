"use strict";

import {
    AmbientLight, Color,
    Mesh,
    MeshBasicMaterial,
    MeshPhongMaterial,
    Object3D, PointLight, Sphere,
    SphereGeometry,
    TextureLoader
} from "./build/three.module.js";
import SimpleColorMaterial from "./SimpleColorMaterial.js";

export default class SolarSystem{
    //Bruker solsystemets constructor for å sette opp planetene. Tar inn Three.js sin scene som parameter, siden vi må legge objekter til i denne
    constructor(scene) {
        //En mesh trenger Geometry (bufferdata, transformasjoner - hvor ligger verticene våre) og Material (hvordan skal objektet fargelegges)

        //Variabler for å opprette geometrien til en kule
        //Se https://threejs.org/docs/index.html#api/en/geometries/SphereGeometry for effekten av width- og heightSegments (åpne Controls oppe til høyre i sphere-vinduet)
        let radius = 5;
        let widthSegments = 64;
        let heightSegments = 64;

        //Opprett geometri for solen vår
        let sunGeometry = new SphereGeometry(radius, widthSegments, heightSegments);

        //Opprett materiale som bestemmer hvordan solen skal fargelegges
        let sunTextureUrl = 'assets/texture_sun.jpg'; //Hvor ligger teksturen?
        let sunTexture = new TextureLoader().load(sunTextureUrl); //Bruker Three.js sin TextureLoader for å laste inn teksturen
        //Opprett en instans av Three.js sin MeshBasicMaterial - et enkelt materiale som ikke tar hensyn til lys
        //(Kommentert ut siden vi heller vil bruke vår egen-lagde shader)
        //let sunMaterial = new MeshBasicMaterial({map: sunTexture});

        //Opprett en instans av vårt egen-lagde Material
        //Parametere: tekstur, og en Three.js Color som skal brukes for å farge teksturen mer - her for å farge den rødt
        let sunMaterial = new SimpleColorMaterial({
            mapInParameters: sunTexture,
            colorInParameters: new Color(0xFF0000)
        })

        //Oppretter selve sol-Meshen, som nå består av et Geometry-objekt og et Material-objekt
        this.sun = new Mesh(sunGeometry, sunMaterial);
        this.sun.position.z = -50;

        //Legge solen til scenen
        scene.add(this.sun);

        //Oppretter et usynlig Object3D som jorden vår skal rotere rundt.
        this.earthOrbitNode = new Object3D();

        this.marsOrbitNode = new Object3D();

        this.jupiterOrbitNode = new Object3D();

        this.moonOrbitNode = new Object3D();

        //Legger det usynlige objektet som barn av solen
        this.sun.add(this.earthOrbitNode);
        this.sun.add(this.marsOrbitNode);
        this.sun.add(this.jupiterOrbitNode);
        this.sun.add(this.moonOrbitNode);

        //Samme prosedyre for jorden vår
        //Last inn tekstur og gi denne til et Material
        let earthTextureUrl = 'assets/texture_earth.jpg';
        let earthTexture = new TextureLoader().load(earthTextureUrl);

        let marsTextureUrl = 'assets/2k_mars.jpg';
        let marsTexture = new TextureLoader().load(marsTextureUrl);

        let jupiterTextureUrl = 'assets/2k_jupiter.jpg';
        let jupiterTexture = new TextureLoader().load(jupiterTextureUrl);

        let moonTextureUrl = 'assets/2k_moon.jpg';
        let moonTexture = new TextureLoader().load(moonTextureUrl);

        //Fikk ikke gjort på forelesning:
        //Bruk av Specular Map - definerer hvor "shiny" forskjellige områder på objektet skal være
        //Bruk av Normal Map - Lager illusjon av høyde og dybde ved at en tekstur brukes for å definere endringer i normalene over objektet
        let earthSpecularMap = new TextureLoader().load("assets/earthspec1k.jpg");
        let earthNormalMap = new TextureLoader().load("assets/2k_earth_normal_map.png");
        //Bruker her MeshPhongMaterial - litt mer avansert Material som forholder seg til lys
        let earthMaterial = new MeshPhongMaterial({map:earthTexture,
                                                            shininess:1.0,
                                                            specular: earthSpecularMap,
                                                            normalMap: earthNormalMap
                                                            });
        let marsMaterial = new MeshPhongMaterial({map: marsTexture,
                                                            shininess: 1.0,
                                                            specular: null,
                                                            normalMap: null
                                                            });
        let jupiterMaterial = new MeshPhongMaterial({map: jupiterTexture,
                                                                shininess: 1.0,
                                                                specular: null,
                                                                normalMap: null
                                                                });
        let moonMaterial = new MeshPhongMaterial({map: moonTexture,
            shininess: 2.0,
            specular: null,
            normalMap: null
        });


        //Forandrer radius - gjør jorden halvparten så stor som solen
        radius = 2.5;
        let earthGeometry = new SphereGeometry(radius, widthSegments, heightSegments);

        let marsRadius = radius -1.0;
        let marsGeometry = new SphereGeometry(marsRadius, widthSegments, heightSegments);

        let jupiterRadius = radius + 1.0;
        let jupiterGeometry = new SphereGeometry(jupiterRadius, widthSegments, heightSegments);

        let moonRadius = 0.5;
        let moonGeometry = new SphereGeometry(moonRadius, widthSegments, heightSegments);
        //Oppretter Mesh for jorden ved å gi Geometry og Material
        this.earth = new Mesh(earthGeometry, earthMaterial);

        this.mars = new Mesh(marsGeometry, marsMaterial);

        this.jupiter = new Mesh(jupiterGeometry, jupiterMaterial);

        this.moon = new Mesh(moonGeometry, moonMaterial);
        //Flytter jorden litt til høyre for solen
        this.earth.position.x = 15;

        this.mars.position.x = 25;

        this.jupiter.position.x = 35;

        this.moon.position.x = 5;

        //Legger jorden som barn av earthOrbitNode - this.earth arver nå rotasjoner som gjøres på this.earthOrbitNode
        this.earthOrbitNode.add(this.earth);

        this.marsOrbitNode.add(this.mars);

        this.jupiterOrbitNode.add(this.jupiter);

        this.earthOrbitNode.add(this.moon);


        //Det nye Materialet forholder seg til lys, og vil være helt svart.
        //Legger derfor til lys i scenen - PointLight lyser i alle retninger rundt seg
        this.sunLight = new PointLight(0xffffff, 5);
        //Legger lyset som barn av solen
        this.sun.add(this.sunLight);

        //Legger til et mykere AmbientLight for å representere bakgrunnsbelysning - gjør at vi såvidt kan se baksiden av jorden vår
        this.ambientLight = new AmbientLight(0xffffff, 0.05);
        scene.add(this.ambientLight); //Legg bakgrunnslyset til i scenen.

    }

    animate(){
        //Når App-klassen ber solsystemet om å animere seg: roter planetene
        this.rotateObject(this.sun, [0.0, 0.005, 0.0]);
        this.rotateObject(this.earthOrbitNode, [0.0, 0.01, 0.0]);
        this.rotateObject(this.earth, [0.0, 0.02, 0.0]);

        this.rotateObject(this.marsOrbitNode, [0.0, 0.008, 0.0]);
        this.rotateObject(this.mars, [0.0, 0.02, 0.0]);

        this.rotateObject(this.jupiterOrbitNode, [0.0, 0.005, 0.0]);
        this.rotateObject(this.jupiter, [0.0, 0.2, 0.0]);

        this.rotateObject(this.moonOrbitNode, [0.0, 0.05, 0.0]);
        this.rotateObject(this.moon, [0.0, 0.1, 0.0]);
    }

    rotateObject(object, rotation){
        //Hjelpe-metode for å rotere et objekt
        object.rotation.x += rotation[0];
        object.rotation.y += rotation[1];
        object.rotation.z += rotation[2];
    }

}