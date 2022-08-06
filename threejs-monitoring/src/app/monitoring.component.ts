import { Component, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { gsap } from "gsap";
import * as dat from "dat.gui";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

import SpriteText from 'three-spritetext';

import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Guid } from 'guid-typescript';
import { ContextMenuComponent, MenuItemModel } from '@syncfusion/ej2-angular-navigations';
import { Object3D, ObjectLoader, Vector3 } from 'three';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { DropDownListComponent } from '@syncfusion/ej2-angular-dropdowns';

import { io } from "socket.io-client";

@Component({
    selector: 'app-monitoring',
    templateUrl: './monitoring.component.html',
    styleUrls: ['./monitoring.component.css']
})

export class MonitoringComponent implements OnInit {

    // Define default position at start
    initialPosition = new THREE.Vector3(24,30,75);

    // Context Menu to allow Interactions with an object
    objectContextMenuItems: MenuItemModel[] = [
        { text: 'Delete' },
        { text: "Show Information" },        
        { text: 'Move' },
        { text: 'Target' },
        {
            text: "Dock",
            items: [
                { text: 'Dock Right' },
                { text: 'Dock Left'  },
                { text: 'Dock Bottom' },
                { text: 'Dock Top' },
                { text: 'Dock Farwards' },
                { text: 'Dock Backwards' }
            ]
        },
        { text: 'Connect to DomainObject' }
    ];

    // Shoots rays to detect interaction of a mouse pointer ray and objects that collide with that ray
    public raycaster: THREE.Raycaster;
    public pointer: THREE.Vector2;

    public canvas;
    public scene: THREE.Scene;

    public sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    }

    public camera: THREE.PerspectiveCamera;

    public cameraControls: OrbitControls;
    public transformControls: TransformControls;

    public renderer: THREE.WebGLRenderer;

    public ambientLight: THREE.AmbientLight;

    public gui = new dat.GUI();


    // Mock Data to allow Connections to these objects
    public domainObjectsMock: any[] = [
        {
            text: "Machine 1",
            id: "machine1",
            domainObjectType: "machine",
            propertyDefinitions: [
              {
                propertyName: "State",
                propertyId: "34",
                stateName: "On",
                stateId: "34a",
              },
              {
                propertyName: "Heat",
                propertyId: "35",
                stateName: "[50°, ...]",
                stateId: "35c",
              },
              {
                propertyName: "Position",
                propertyId: "36",
                isPosition: true,
                position: [-2.6,11.5,-3.7]
              }
            ]
        },
        {
            text: "Machine 2",
            id: "machine2",
            domainObjectType: "machine",
            propertyDefinitions: [
              {
                propertyName: "State",
                propertyId: "34",
                stateName: "Off",
                stateId: "34b",
              },
              {
                propertyName: "Heat",
                propertyId: "35",
                stateName: "[..., 20°[",
                stateId: "35a",
              },
              {
                propertyName: "Position",
                propertyId: "36",
                isPosition: true,
                position: [-2.5,18.5,6.8]
              }
            ]
        },        
        {
            text: "Machine 3",
            id: "machine3",
            domainObjectType: "machine",
            propertyDefinitions: [
              {
                propertyName: "State",
                propertyId: "34",
                stateName: "Off",
                stateId: "34b",
              },
              {
                propertyName: "Heat",
                propertyId: "35",
                stateName: "[50°, ...]",
                stateId: "35c",
              },
              {
                propertyName: "Position",
                propertyId: "36",
                isPosition: true,
                position: [6.3,1.5,-1.8]
              }
            ]
        },        
        {
            text: "Machine 4",
            id: "machine4",
            domainObjectType: "machine",
            propertyDefinitions: [
              {
                propertyName: "State",
                propertyId: "34",
                stateName: "Off",
                stateId: "34a",
              },
              {
                propertyName: "Heat",
                propertyId: "35",
                stateName: "[50°, ...]",
                stateId: "35d",
              },
              {
                propertyName: "Position",
                propertyId: "36",
                isPosition: true,
                position: [-9,1.5,-8.5]
              }
            ]
        },
        {
            text: "Sensor 1",
            id: "sensor1",
            domainObjectType: "sensor",
            propertyDefinitions: [
                {
                    propertyId: "12",
                    propertyName: "Status",
                    stateId: "12b",
                    stateName: "Okay"
                }
            ]
            
        },
        {
            text: "Sensor 2",
            id: "sensor2",
            domainObjectType: "sensor",
            propertyDefinitions: [
                {
                    propertyId: "12",
                    propertyName: "Status",
                    stateId: "12c",
                    stateName: "Kritisch",
                },
                {
                    propertyName: "Position",
                    propertyId: "36",
                    isPosition: true,
                    position: [6.3,1.5,-1.8]
                }
            ]
        },
        {
            text: "Forklift 1",
            id: "forklift1",
            domainObjectType: "forklift",
            propertyDefinitions: [
                {
                    propertyId: "80",
                    propertyName: "efficiency",
                    stateId: "80c",
                    stateName: "Very Efficient",
                },
                {
                    propertyName: "Position",
                    propertyId: "36",
                    isPosition: true,
                    position: [1.7,1.5,7.8]
                }
            ]
        },
        {
            text: "Forklift 2",
            id: "forklift2",
            domainObjectType: "forklift",
            propertyDefinitions: [
                {
                    propertyId: "80",
                    propertyName: "efficiency",
                    stateId: "80b",
                    stateName: "Okay",
                },
                {
                    propertyName: "Position",
                    propertyId: "36",
                    isPosition: true,
                    position: [1.7,11.5,7.8]
                }
            ]
        },
        {
            text: "Package 1",
            id: "package1",
            domainObjectType: "package",
            propertyDefinitions: [
                {
                    propertyName: "Position",
                    propertyId: "36",
                    isPosition: true,
                    position: [1.7,0.5,-7.8]
                }
            ]
        },
        {
            text: "Package 2",
            id: "package2",
            domainObjectType: "package",
            propertyDefinitions: [
                {
                    propertyName: "Position",
                    propertyId: "36",
                    isPosition: true,
                    position: [1.7,10.5,-7.8]
                }
            ]
        },
        {
            text: "Package 3",
            id: "package3",
            domainObjectType: "package",
            propertyDefinitions: [
                {
                    propertyName: "Position",
                    propertyId: "36",
                    isPosition: true,
                    position: [-1.7,10.5,7.8]
                }
            ]
        },
        {
            text: "Package 4",
            id: "package4",
            domainObjectType: "package",
            propertyDefinitions: [
                {
                    propertyName: "Position",
                    propertyId: "36",
                    isPosition: true,
                    position: [-1.7,0.5,7.8]
                }
            ]
        }
    ];
        
    addGroupButtons: any[] = []

    fontLoader: FontLoader;
    loader: THREE.ObjectLoader;
    tdsLoader: TDSLoader;
    fbxLoader: FBXLoader;
    gltfLoader: GLTFLoader;

    groups: THREE.Group[] = [];

    axesHelper: THREE.AxesHelper;

    currentAlarmsPlaying: any[] = [];

    @ViewChild("objectContextMenu")
    objectContextMenu: ContextMenuComponent;

    @ViewChild('domainObjectDropdownDialog')
    domainObjectDropdownDialog: DialogComponent;

    @ViewChild('domainObjectDropdown')
    domainObjectDropdown: DropDownListComponent;


    public dlgButtons: object[] = [
        {
            'click': this.domainObjectDropdownDialogApplied.bind(this), 
            buttonModel: { content: 'OK', isPrimary: 'true' } 
        },
        {
            'click': this.domainObjectDropdownDialogCancelled.bind(this),
            buttonModel: {
                content: 'Cancel',
                cssClass: 'e-flat'
            },
        }
    ];

    ngOnInit(): void {
        // Init socket communcation channel
        const socket = io("http://localhost:3000");

        socket.on("receive-change", args => this.receivedChange(args));
        socket.on("receive-position-change", args => this.receivedPositionChange(args));


        // Initialize ThreeJS Scene
        this.raycaster = new THREE.Raycaster(); 
        this.pointer = new THREE.Vector2();

        this.canvas = document.querySelector('canvas.webgl');
        this.scene = new THREE.Scene();        


        var ambientLight = new THREE.AmbientLight();
        this.scene.add(ambientLight);

        this.renderer = new THREE.WebGLRenderer({        
            canvas: this.canvas,
            alpha: true
        });
        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor("#383838");

        this.loader = new THREE.ObjectLoader();
        this.tdsLoader = new TDSLoader();
        this.fbxLoader = new FBXLoader();
        this.gltfLoader = new GLTFLoader();

        this.axesHelper = new THREE.AxesHelper(100);
        this.scene.add(this.axesHelper);

        for (var i = 0; i < localStorage.length; i++){
            if((localStorage.key(i) as string)?.startsWith("threeJSGroupPrefix")){
                let groupString = localStorage.getItem(localStorage.key(i) as string);
                let groupJSON = JSON.parse(groupString as string);
                let threeJSGroup: THREE.Group = this.loader.parse(groupJSON);

                this.groups.push(threeJSGroup);
            }
        }

        for(let group of this.groups){
            console.log(group);
            this.addGroupButtons.push(
                {
                    text: group.name
                }
            )    
        }

        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (event) => this.onPointerMove(event), false);
        window.addEventListener('click', (event) => this.onClick(event), false);

        window.addEventListener('contextmenu', (event) => this.onRightClick(event), false);


        if(localStorage.getItem("sceneConfig") !== null){

            // TODO:Why does a scene that is built from config lack object lines 
            // and why is the background mesh not recognized as one?

            console.log("Setting Scene based on Config");
            this.scene = new ObjectLoader().parse(JSON.parse(localStorage.getItem("sceneConfig")!));
            this.scene.add(this.transformControls);
            for(let child of this.scene.children){
                if(child.type === "Group" && child.userData.isBackgroundMesh !== true){
                    for(let grandChild of child.children){
                        if (grandChild instanceof THREE.Mesh) { 
                            this.intersectableObjects.push(grandChild);
                        }
                    }
                }
            }
        }
        if(localStorage.getItem("cameraConfig") !== null){
            this.camera = new ObjectLoader().parse(JSON.parse(localStorage.getItem("cameraConfig")!));
        }
        else{
            this.camera = new THREE.PerspectiveCamera(55, this.sizes.width / this.sizes.height, 0.1, 10000);
            this.camera.position.set(this.initialPosition.x, this.initialPosition.y, this.initialPosition.z);
        }
        this.scene.add(this.camera);        
    
        this.cameraControls = new OrbitControls(this.camera, this.canvas);
        
        this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
        this.transformControls.addEventListener("dragging-changed", (e) => this.draggingChanged(e))
        this.transformControls.setMode("translate");

        this.scene.add(this.transformControls);

        this.tick(this);
    }

    tick(comp){
        comp.cameraControls.update();

        comp.raycaster.setFromCamera(comp.pointer, comp.camera);

        comp.renderer.render(comp.scene, comp.camera);

        window.requestAnimationFrame(() => {
            comp.tick(comp);
        });
    }

    /**
     * Adapt a potential mesh based on a state change received via the 
     * Socket Channel
     * @param changeArgs Object that contains the necessary identifiers 
     * and names for domainObject and property and state
     */
    receivedChange(changeArgs){
        let domainObjectId = changeArgs.domainObjectId
        for(let object of this.scene.children){
            // Find the object with the according domainObject ID          
            if(object.userData["domainObjectID"] === domainObjectId){
                this.changeObjectVisualization(object, 
                    changeArgs.propertyId, changeArgs.stateId, 
                    changeArgs.propertyName, changeArgs.stateName
                );
            }
        }

        // Change the "database" value 
        var propDefs: any[] = this.domainObjectsMock.find(
            domainObject => domainObject.id === domainObjectId)
            .propertyDefinitions;
        var propDef = propDefs.find(propDef => propDef.propertyId 
            === changeArgs.propertyId);
        propDef.stateId = changeArgs.stateId;
        propDef.stateName = changeArgs.stateName;        
    }

    /**
     * Adapts a potential mesh based on a position change received via
     * the Socket Channel
     * @param changeArgs Object that contains the necessary identifier 
     * for the domainObject and the new coordinates
     */
    receivedPositionChange(changeArgs){
        let domainObjectId = changeArgs.domainObjectId
        for(let object of this.scene.children){
            // Find the object with the according domainObject ID          
            if(object.userData["domainObjectID"] === domainObjectId){
                // Animate the position change using the gsap library
                gsap.to(object.position, {
                    duration: 1,
                    x: changeArgs.coordinates[0],
                    y: changeArgs.coordinates[1],
                    z: changeArgs.coordinates[2]
                })
            }
        }
    }

    // Close dialog on "Cancel"
    domainObjectDropdownDialogCancelled(){
        if(this.domainObjectDropdownDialog) this.domainObjectDropdownDialog.hide();
    }

    // Prepare a newly set domain object 
    domainObjectDropdownDialogApplied(){
        if(this.domainObjectDropdown.value !== null){
            // Mark the connection in the object's userData
            this.selectedObject.userData["domainObjectID"] = this.domainObjectDropdown.value;
            this.setInitialStates(this.selectedObject);
        }
        this.domainObjectDropdownDialog.hide();
    }

    // Sets the initial states of an object after the domain object connection 
    setInitialStates(object){
        // Set the domain object ID in the userData
        var domainObjectID = object.userData["domainObjectID"];        
        
        // Get the current values for the domain object
        var propertyDefinitions: any[] = this.domainObjectsMock.find(domainObject => domainObject.id === domainObjectID).propertyDefinitions;

        this.changeObjectVisualization(object, propertyDefinitions[0].propertyId, propertyDefinitions[0].stateId,
            propertyDefinitions[0].propertyName, propertyDefinitions[0].stateName);

        // Look for a potential position property definition
        var positionPropDef = propertyDefinitions.find(propDef => propDef.isPosition === true);
        if(positionPropDef){
            // Place the newly connected object according to the initial position
            gsap.to(object.position, {
                duration: 1,
                x: positionPropDef.position[0],
                y: positionPropDef.position[1],
                z: positionPropDef.position[2],
            })
        }
    }

    /**
     * Add particle effect to an object to create a visual 
     * marker indicating a recent state change
     * @param obj 
     */
    addParticles(obj: Object3D){
        // Temporarily remove line and label from the object 
        // because they should not be considered for the 
        // bounding box of the group
        var label = obj.children.find((child) => 
            child.userData["isLabel"] === true);
        if(label) obj.remove(label);

        var line = obj.children.find((child) => 
            child.userData["isLine"] === true);
        if(line) obj.remove(line);

        // Remove a currently active particle effect
        for(let child of obj.children){
            if(child.userData["isParticle"] === true){
                obj.remove(child);
            }
        }        

        // Get the bounding box for the object
        var meshBoundingBox = new THREE.Box3();
        meshBoundingBox.setFromObject(obj);

        var min = meshBoundingBox.min;
        var max = meshBoundingBox.max;

        // Get the bounding box corners converted to local space
        var c1 = obj.worldToLocal(new THREE.Vector3(min.x, min.y, min.z));
        var c2 = obj.worldToLocal(new THREE.Vector3(max.x, min.y, min.z));
        var c3 = obj.worldToLocal(new THREE.Vector3(min.x, max.y, min.z));
        var c4 = obj.worldToLocal(new THREE.Vector3(min.x, min.y, max.z));
        var c5 = obj.worldToLocal(new THREE.Vector3(max.x, max.y, min.z));
        var c6 = obj.worldToLocal(new THREE.Vector3(max.x, min.y, max.z));
        var c7 = obj.worldToLocal(new THREE.Vector3(min.x, max.y, max.z));
        var c8 = obj.worldToLocal(new THREE.Vector3(max.x, max.y, max.z));

        // Create vertices based on the bounding box corners
        var vertices: number[] = [];

        vertices.push(c1.x, c1.y, c1.z);
        vertices.push(c2.x, c2.y, c2.z);
        vertices.push(c3.x, c3.y, c3.z);
        vertices.push(c4.x, c4.y, c4.z);
        vertices.push(c5.x, c5.y, c5.z);
        vertices.push(c6.x, c6.y, c6.z);
        vertices.push(c7.x, c7.y, c7.z);
        vertices.push(c8.x, c8.y, c8.z);


        // Create the particles mesh (THREE.Points)
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', 
            new THREE.Float32BufferAttribute(vertices, 3));

        var material = new THREE.PointsMaterial({ 
            size: 0.3, blending: THREE.AdditiveBlending, 
            depthTest: false, transparent: true 
        });

        material.color = new THREE.Color(1,0.6,0);

        const particles = new THREE.Points(geometry, material);
        particles.userData["isParticle"] = true;

        obj.add(particles);

        // Add the temporarily removed line and label again to the object
        if(label) obj.add(label);
        if(line) obj.add(line);
    }


    // Removes particles of an object
    removeParticles(object){
        for(let child of object.children){
            if(child.userData["isParticle"] === true){
                object.remove(child);
            }
        }
    }
    
    // Removes exclamation mark marker of an object
    removeExclamationMark(object,marker){
        object.remove(marker);
    }


    // Mutes all alarms that are currently playing
    silenceAllAlarmsounds(){
        for(let alarmData of this.currentAlarmsPlaying){            
            alarmData.child.userData["alarmPlaying"] = false;
            alarmData.audio.loop = false;
        }
        this.currentAlarmsPlaying = [];
    }

    // Focuses an active alarm to make it easier following critical states
    goToAlarm(){        
        if(this.currentAlarmsPlaying.length === 0){
            console.log("There is no alarm activated!");        
        }
        else{
            // Position the camera relative to the global position of the alarm object and set its position as camera target
            var obj: THREE.Group = this.currentAlarmsPlaying[0].object;
            this.targetObject(obj);
        }
    }

    // Return to the initial camera position
    goToOrigin(){
        this.cameraControls.object.position.set(this.initialPosition.x,this.initialPosition.y,this.initialPosition.z);
        this.cameraControls.target = new THREE.Vector3(0,0,0);
    }

    onResize(){
        // Update sizes
        this.sizes.width = window.innerWidth;
        this.sizes.height = window.innerHeight;

        // Update camera
        this.camera.aspect = this.sizes.width / this.sizes.height;
        this.camera.updateProjectionMatrix();

        // Update renderer
        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    onPointerMove(moveArgs){
        this.pointer.x = (moveArgs.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = - (moveArgs.clientY / window.innerHeight ) * 2 + 1;    
    }

    // Load sorround 3D model
    loadModel(){
        console.log("Loading...");
        this.gltfLoader.load("./assets/warehouse.glb", gltf => this.onLoadModel(gltf));
        // this.fbxLoader.load("./assets/cubeWithTexture.fbx", object => this.onLoadFBXModel(object));
        // "C:\Users\jonas\Documents\Bachelorarbeit\angular-threejs-monitoring\src\assets\warehouse_fbx\warehouse_FBX.FBX"
    }

    backgroundMesh;
    // Initialize sorround 3D model in GLTF format
    onLoadModel(gltf){
        for(let child of this.scene.children){
            if(child.userData.isBackgroundMesh === true){
                this.scene.remove(child);
            }
        }

        gltf.scene.userData = {
            isBackgroundMesh: true
        };

        this.backgroundMesh = gltf.scene;

        for(let child of gltf.scene.children){
            if(child instanceof THREE.Mesh){
                var edges = new THREE.EdgesGeometry(child.geometry);
                var lines = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: "#565656" } ) );
                child.add(lines);
            }
        }
        this.scene.add(gltf.scene);
    }

    // Initialize sorround 3D model in FBX format
    onLoadFBXModel(object: THREE.Object3D){
        this.scene.add(object);
    }

    axesHelperVisibility = true;
    // Toggle the visibilty of axes helpers in the diagram
    toggleAxesHelper(){
        this.axesHelperVisibility = !this.axesHelperVisibility;
        this.axesHelperVisibility ? this.scene.add(this.axesHelper) : this.scene.remove(this.axesHelper);
    }

    intersectableObjects: any[] = [];
    onAddGroupButtonClicked(args){
        var clickedGroup: THREE.Group | undefined = undefined;

        // Identify the clicked group
        for(let group of this.groups){
            if(args.target.name === group.name){
                clickedGroup = group; 
            }
        }

        if(clickedGroup){
            // Make a copy of the group and place it in the scene
            var copyOfGroup = clickedGroup.clone();
            copyOfGroup.userData["objectID"] = Guid.create().toString();
            // Also copy the material, so that different copies of the same group dont share the same material
            for(let child of copyOfGroup.children){
                if (child instanceof THREE.Mesh) { 
                    child.material = child.material.clone();
                    this.intersectableObjects.push(child);
                }
                if(child.userData.addLines === true){
                    // Bring lines to the mesh
                    var edges = new THREE.EdgesGeometry( (child as THREE.Mesh).geometry );
                    var lines = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x808080 } ) );
                    child.children.length = 0;
                    child.add(lines);
                }
            }
            this.scene.add(copyOfGroup);
        }
        else{
            console.log("Couldnt find Group");
        }
    }


    // Reaction to a diagram click
    onClick(clickArgs){
        // Check for intersected objects
        var intersects = this.raycaster.intersectObjects(this.intersectableObjects);
        if(intersects.length > 0){
            // Make SpriteTexts draggable on left click 
            if(intersects[0].object.type === "Sprite"){
                this.transformControls.attach(intersects[0].object);             
            }

            intersects[0].object.parent!.children.forEach((child) => {
                // Remove potential alarm sound
                if(child.userData.alarmPlaying === true){
                    child.userData.alarmPlaying = false;
                    let alarmData = this.currentAlarmsPlaying.find((alarmData) => alarmData.object === intersects[0].object.parent);
                    alarmData.audio.loop = false;
                    let i = this.currentAlarmsPlaying.findIndex((alarmData) => alarmData.object === intersects[0].object.parent);
                    this.currentAlarmsPlaying.splice(i, 1);
                }
                // Remove potential visual marker (exclamation mark)
                // if(child.userData.isVisualMarker === true){                    
                //     intersects[0].object.parent!.remove(child);
                // }
                // Remove potential visual marker (particles)
                if(child.userData.isParticle === true){                    
                    intersects[0].object.parent!.remove(child);
                }
            });
            
        }
    }

    selectedObject;
    // Reaction to a diagram right click
    onRightClick(event){
        this.transformControls.detach();

        // Check for intersected objects
        var intersects = this.raycaster.intersectObjects(this.intersectableObjects);
        if(intersects.length > 0){  
            
            // Show the context menu for the clicked object
            this.objectContextMenu.items[1].text = intersects[0].object.parent?.children.find(child => child.userData["isLabel"] === true) !== undefined ? "Hide Information" : "Show Information";
            this.objectContextMenu.refresh();
            this.objectContextMenu.open(event.clientY,event.clientX, undefined);
            
            // Set the clicked object as selectedObject to make it available for later changes
            this.selectedObject = intersects[0].object.parent;
        }
    }

    // Reaction to an object's dragging event 
    draggingChanged(event){
        // On Drag Start
        if(event.value){
            // Dragged object is a label => Delete the line
            if(event.target.object.type === "Sprite"){
                var object = event.target.object.parent;           
                var possibleLine = object.children.find((child) => child.userData['isLine'] === true);
                if(possibleLine) object.remove(possibleLine);
            }
        }

        // On Drag Stop
        else{
            // If a Label was dragged => Add the line again
            if(event.target.object.type === "Sprite"){                
                var lineMaterial = new THREE.LineBasicMaterial({
                    color: 0xff00ff, linewidth: 5
                });

                var textObject = event.target.object;

                var points: THREE.Vector3[] = [];
                points.push(new THREE.Vector3(0,0,0));
                points.push(new THREE.Vector3(textObject.position.x, textObject.position.y, textObject.position.z));

                var lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                var lineMesh = new THREE.Line(lineGeometry, lineMaterial);

                lineMesh.userData["isLine"] = true;
                event.target.object.parent.add(lineMesh);
            }
        }
        // Disable or enable the camera controls based on whether dragging is starting or stopping        
        this.cameraControls.enabled = !event.value;        
    }

    onObjectContextMenuSelection(args){        
        switch(args.item.text){
            case "Delete":
                // Remove all children of the object from the intersectables array and stop potential alarm
                for(let child of this.selectedObject.children){                
                    var objectIndexInIntersectables = this.intersectableObjects.findIndex((obj) => obj === child);                
                    this.intersectableObjects.splice(objectIndexInIntersectables, 1);

                    if(child.userData["alarmPlaying"] === true){
                        var alarm = this.currentAlarmsPlaying.find((alarm) => alarm.child === child);
                        var i = this.currentAlarmsPlaying.findIndex((alarm) => alarm.child === child);
                        alarm.audio.loop = false;
                        this.currentAlarmsPlaying.splice(i, 1);
                    }
                }
                // Remove the object finally
                this.scene.remove(this.selectedObject);            
                break;
            case "Show Information":
                this.drawLabelForMesh(this.selectedObject);                
                break;
            case "Hide Information":
                // Remove label and line children from the selected object
                var label = this.selectedObject.children.find((child) => child.userData['isLabel'] === true);
                if(label){
                    var labelIndexInIntersectables = this.intersectableObjects.findIndex((obj) => obj === label);                
                    this.intersectableObjects.splice(labelIndexInIntersectables, 1);
                    this.selectedObject.remove(label);
                }
                var line = this.selectedObject.children.find((child) => child.userData['isLine'] === true);
                if(line){
                    this.selectedObject.remove(line);
                }
                break;
            case "Move":
                // Enable the transform controls for the selected object
                this.transformControls.attach(this.selectedObject);        
                break;
            case "Target":
                this.targetObject(this.selectedObject);        
                break;
            case "Dock Left":
                this.dockObject("left");
                break;
            case "Dock Right":
                this.dockObject("right");
                break;
            case "Dock Bottom":
                this.dockObject("bottom");
                break;
            case "Dock Top":
                this.dockObject("top");
                break;
            case "Dock Farwards":
                this.dockObject("farwards");
                break;
            case "Dock Backwards":
                this.dockObject("backwards");
                break;
            case "Connect to DomainObject":                
                this.domainObjectDropdownDialog.show();
                var dataSource: any[] = [];
                for(let element of this.domainObjectsMock){
                    if(element.domainObjectType === this.selectedObject.userData["domainObjectType"]){
                        dataSource.push(element.id);
                    }
                }
                this.domainObjectDropdown.dataSource = dataSource;
                break;
            default:
                console.log("Menu Item not Found");
        }
    }

    // Focus a specific object by changing the camera position accordingly 
    targetObject(object){
        // Position the camera relative to the global position of the alarm object and set its position as camera target
        var globalPosition = new THREE.Vector3();
        object.getWorldPosition(globalPosition);

        this.cameraControls.object.position.x = globalPosition.x;
        this.cameraControls.object.position.y = globalPosition.y + 5;
        this.cameraControls.object.position.z = globalPosition.z + 5;

        this.cameraControls.target = globalPosition;
    }

    drawLabelForMesh(object){
        // Remove potential current label and line
        var line = object.children.find((child => child.userData.isLine === true));
        var label = object.children.find((child => child.userData.isLabel === true));

        if(line) object.remove(line);
        if(label){
            object.remove(label);
            var labelIndexInIntersectables = this.intersectableObjects.findIndex((obj) => obj === label);                
            this.intersectableObjects.splice(labelIndexInIntersectables, 1);
        } 

        // Compute object bounding box to determine the translation vector
        var meshBoundingBox = new THREE.Box3();
        meshBoundingBox.setFromObject(this.selectedObject);

        var objectHeight = meshBoundingBox.max.y - meshBoundingBox.min.y;
        var objectWidth = meshBoundingBox.max.x - meshBoundingBox.min.x;

        // Successively create the text for the label
        var text: SpriteText;
        if(this.selectedObject.userData.domainObjectID === undefined){
            text = new SpriteText("The object is not connected yet", objectHeight / 4, "black");
        }
        else{
            var textFragment: string = "Object is connected to ID " + this.selectedObject.userData.domainObjectID;
            
            var firstHit = true;
            for(let child of this.selectedObject.children){
                if(child.userData.currentState && child.userData.currentState.length == 2){
                    if(firstHit === true){                        
                        textFragment += "\n----"; 
                        firstHit = false;
                    }
                    textFragment = textFragment.concat("\n" + child.userData.currentState[0] + ": " + child.userData.currentState[1]);
                }
            }                    
            text = new SpriteText(textFragment, objectHeight / 4, "black");
        }
        
        // Compute text bounding box to determine the translation vector
        var textBoundingBox = new THREE.Box3();
        textBoundingBox.setFromObject(text);

        var textHeight = textBoundingBox.max.y - textBoundingBox.min.y;
        var textWidth = textBoundingBox.max.x - textBoundingBox.min.x;

        // Position the Label
        text.position.set(1.2 * (objectWidth/2 + textWidth/2), 1.2 * (objectHeight/2 + textHeight/2), 0);
        text.backgroundColor = "white";
        text.fontSize = 150;
        text.userData["isLabel"] = true;

        this.selectedObject.add(text);
        this.intersectableObjects.push(text);

        // Create the connection line between label and object
        var lineMaterial = new THREE.LineBasicMaterial({
            color: 0xff00ff, linewidth: 5
        });

        var points: THREE.Vector3[] = [];
        points.push(new THREE.Vector3(0,0,0));
        points.push(new THREE.Vector3(text.position.x, text.position.y, text.position.z));

        var lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        var lineMesh = new THREE.Line(lineGeometry, lineMaterial);

        lineMesh.userData["isLine"] = true;
        this.selectedObject.add(lineMesh);
    }

    // Dock a selected object to a specific side to the sorround 3D model
    dockObject(side: string){
        // Is there a dockable surrounding 
        if(this.backgroundMesh === undefined){
            console.log("Cannot dock since there is no surrounding yet");
            return;    
        }

        // Compute a direction vector based on the docking side
        var directionVector;
        switch(side){
            case "left":
                directionVector = new Vector3(-1,0,0);
                break;
            case "right":
                directionVector = new Vector3(1,0,0);
                break;
            case "top":
                directionVector = new Vector3(0,1,0);
                break;
            case "bottom":
                directionVector = new Vector3(0,-1,0);
                break;
            case "farwards":
                directionVector = new Vector3(0,0,1);
                break;
            case "backwards":
                directionVector = new Vector3(0,0,-1);
                break;                                       
        }

        // Only extract the meshes from the background group as well as the object group
        // This way, text fields, lines and other children that are irrelevant for the docking are left out
        var backgroundMeshes: THREE.Mesh[] = (this.backgroundMesh.children as any[]).filter((obj) => obj instanceof THREE.Mesh);
        let objectMeshes: THREE.Mesh[] = this.selectedObject.children.filter((child) => child instanceof THREE.Mesh);

        let distance = this.getShortestDistance(objectMeshes, backgroundMeshes, directionVector);

        // No intersection was found => No docking
        if(distance === -1) console.log("Unable to dock.");
         // Intersection was found => Docking      
        else {
            // Move the object according to the docking side and the measured distance to the sorround model
            if(side === "left") this.selectedObject.position.x -= distance;
            else if(side === "right") this.selectedObject.position.x += distance;
            else if(side === "top") this.selectedObject.position.y += distance;
            else if(side === "bottom") this.selectedObject.position.y -= distance;
            else if(side === "farwards") this.selectedObject.position.z += distance;
            else if(side === "backwards") this.selectedObject.position.z -= distance;
        }
    }

    // Compute the shortest distance between a mesh and the sorround model based on a direction vector
    getShortestDistance(meshes: THREE.Mesh[], backgroundMeshes: THREE.Mesh[], directionVector){
        let distances: number[] = [];
        for(let mesh of meshes){
            for(let vertexIndex=0; vertexIndex<mesh.geometry.attributes.position.count; vertexIndex++){

                // Get a 3D vertex position by combining three consecutive vertex array values
                var vertex = new THREE.Vector3(mesh.geometry.attributes.position.array[3 * vertexIndex], 
                    mesh.geometry.attributes.position.array[3 * vertexIndex + 1], 
                    mesh.geometry.attributes.position.array[3 * vertexIndex + 2]);
                
                // Convert the vertex into global space
                mesh.localToWorld(vertex);
                                
                // Create a ray from the vertex position in the according direction
                var ray = new THREE.Raycaster(vertex, directionVector, 0);
        
                // Compute all collisions
                var collisionResults = ray.intersectObjects(backgroundMeshes);
                if(collisionResults.length > 0){
                    distances.push(collisionResults[0].distance)
                }
            }
    
        }
        console.log(Math.min(...distances));
        // Return the minimal distance or -1, if no collision was measured
        if(distances.length > 0) return Math.min(...distances)
        else return -1;
    }

    // Save a config into the localStorage
    saveConfig(){        
        // Detach transform controls to not save the directional arrows in the scene
        this.transformControls.detach();

        var jsonScene = this.scene.toJSON();
        localStorage.setItem("sceneConfig", JSON.stringify(jsonScene));

        var jsonCamera = this.camera.toJSON();
        localStorage.setItem("cameraConfig", JSON.stringify(jsonCamera));
    }

    // Apply a new object visualization 
    changeObjectVisualization(object, propertyId, stateId, propertyName, stateName){
        // Find the subchild that is responsible for the property definition
        var child = object.children.find(child => child.userData["propertyId"] === propertyId);
        var state;
        if(child) state = child.userData.states.find((state) => state.stateId === stateId);
            
        if(state){
            // Apply the new visualization to the object
            child.material.color.set(state.color);
            child.userData.currentState = [propertyName, stateName];
            
            if(state.isAlarmWorthy){
                var audio = new Audio("./assets/sounds/alarmSound.wav");

                audio.loop = true;
                this.currentAlarmsPlaying.push({
                    audio: audio,
                    object: object,
                    child: child
                });
                audio.play();
                child.userData['alarmPlaying'] = true;
            }

            // Delete a potentially existing marker before creating a new one
            object.children.forEach((child) => {
                if(child.userData.isVisualMarker === true){
                    object.remove(child);
                }
            });
            
            // Change the text in the label based on the new value (if a label is open)
            if(object.children.find(child => child.userData.isLabel === true)){
                this.drawLabelForMesh(object);
            }

            this.addParticles(object);
            // Initiate timer to remove marker again
            setTimeout(() => this.removeParticles(object), state.newValueDisplayDuration * 1000);
        }

        // Alternatively, set an exclamation mark above the object
        // Add visual Marker to object
        // var text = new SpriteText("!", 1.5, "#191970");

        // var textBoundingBox = new THREE.Box3();
        // textBoundingBox.setFromObject(text);

        // var textHeight = textBoundingBox.max.y - textBoundingBox.min.y;

        // // Temporarily remove line and label from the object because they should not be considered for the bounding box of the group
        // var label = object.children.find((child) => child.userData["isLabel"] === true);
        // if(label) object.remove(label);

        // var line = object.children.find((child) => child.userData["isLine"] === true);
        // if(line) object.remove(line);

        // var meshBoundingBox = new THREE.Box3();
        // meshBoundingBox.setFromObject(object);

        // var objectHeight = meshBoundingBox.max.y - meshBoundingBox.min.y;

        // console.log(objectHeight);
        
            
        // // Position the Marker
        // text.position.setY(objectHeight/2 + textHeight/2);
        // text.backgroundColor = "transparent";

        // var marker = new THREE.Group();
        // marker.add(text);
        // marker.userData.isVisualMarker = true;

        // object.add(marker);

        // // Add the temporarily removed line and label again to the object
        // if(label) object.add(label);
        // if(line) object.add(line);                

        // setTimeout(() => this.removeExclamationMark(object, marker), currentState.newValueDisplayDuration * 1000);

    }

}
