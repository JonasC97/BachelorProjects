import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import * as THREE from 'three';
import * as dat from "dat.gui";
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { DropDownListComponent, Fields, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { ColorPicker } from '@syncfusion/ej2-angular-inputs';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import * as FS from "file-saver"

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.css'],
    changeDetection: ChangeDetectionStrategy.Default
})

export class EditorComponent implements OnInit, AfterViewInit {

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

    public renderer: THREE.WebGLRenderer;

    public ambientLight: THREE.AmbientLight;

    public gui = new dat.GUI();

    gltfLoader: GLTFLoader;



    gridSideLength = 100;
    intersectableObjects: any[] = [];
    groupObjects: any[] = [];
    currentObject: any = null;
    propertyDefinitions: string[] = [];


    public dlgButtons: object[] = [
        {
            'click': this.configurationDialogApplied.bind(this), 
            buttonModel: { content: 'OK', isPrimary: 'true' } 
        },
        {
            'click': this.cancelDialog.bind(this),
            buttonModel: {
                content: 'Cancel',
                cssClass: 'e-flat'
            },
        }

    ];


    domainObjectType = localStorage.getItem("currentDomainObjectType");
    propertyDefinitionsMock = this.getPropertyDefinitionsForDomainObjectType(this.domainObjectType);
    configurations = [];



    @ViewChild('stateConfigurationDialog')
    stateConfigurationDialog: DialogComponent;

    @ViewChild('propertyDefinitionsDropdown')
    propertyDefinitionsDropdown: DropDownListComponent;



    identify(index, item){
        return item.name; 
    }

    itemList:any[] = [];
    ngOnInit(): void {
        this.raycaster = new THREE.Raycaster(); 
        this.pointer = new THREE.Vector2();

        this.canvas = document.querySelector('canvas.webgl');
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(55, this.sizes.width / this.sizes.height, 0.1, 1000);
        this.camera.position.x = 0;
        this.camera.position.y = this.gridSideLength / 4;
        this.camera.position.z = -this.gridSideLength;
        this.scene.add(this.camera);

        this.cameraControls = new OrbitControls(this.camera, this.canvas);

        this.gltfLoader = new GLTFLoader();


        var ambientLight = new THREE.AmbientLight();
        this.scene.add(ambientLight);

        this.renderer = new THREE.WebGLRenderer({            
            canvas: this.canvas,
            alpha: true
        });
        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor("#383838");


        var groundGrid = new THREE.GridHelper(this.gridSideLength, this.gridSideLength);
        this.scene.add(groundGrid);

        for(let propertyDefinition of this.propertyDefinitionsMock){
            this.propertyDefinitions.push(propertyDefinition.propertyName);
        }

        console.log(this.propertyDefinitions);
        

        
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (event) => this.onPointerMove(event), false);
        window.addEventListener('click', (event) => this.onClick(event), false);


        this.tick(this);
    }

    ngAfterViewInit(): void {

    }

    tick(comp){
        comp.cameraControls.update();

        comp.raycaster.setFromCamera(comp.pointer, comp.camera);

        comp.renderer.render(comp.scene, comp.camera)

        window.requestAnimationFrame(() => {
            comp.tick(comp);
        });
    }

    onResize(){
        // Update sizes
        this.sizes.width = window.innerWidth
        this.sizes.height = window.innerHeight

        // Update camera
        this.camera.aspect = this.sizes.width / this.sizes.height
        this.camera.updateProjectionMatrix()

        // Update renderer
        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    onPointerMove(event){
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = - (event.clientY / window.innerHeight ) * 2 + 1;    
    }

    alreadyAdded = false;
    onClick(clickArgs){
        console.log(this.stateConfigurationDialog);
        console.log(this.stateConfigurationDialog.visible);
        
        
        if(!this.stateConfigurationDialog.visible){
            var intersects = this.raycaster.intersectObjects(this.intersectableObjects);

            if(intersects.length > 0){
                console.log(intersects[0].object.userData);
        
                this.currentObject = intersects[0].object;
        
                console.log(this.currentObject);
                
    
                this.stateConfigurationDialog.show();
                
                console.log(this.propertyDefinitions);
                
                this.propertyDefinitionsDropdown.dataSource = this.propertyDefinitions;
                if(this.alreadyAdded === false){
                    this.propertyDefinitionsDropdown.addEventListener('change', (args) => {this.propertyDefinitionChanged(args)});
                    this.alreadyAdded = true;
                }
                
            }    
        }
        else{
            console.log("Error caught");
            
        }
    }

    public colorPickers: any[];
    propertyDefinitionChanged(args){
        if(args.value === null) return;
    
        var colorpickerCounter = 0;

        var colPicks: string[] = [];

        this.itemList.length = 0;

        for(let state of this.propertyDefinitionsMock.find((propertyDefinition) => propertyDefinition.propertyName === args.value)!.states){
            colPicks.push(state.stateName);
            colorpickerCounter++;
            this.itemList.push({
                state: state.stateName
            });

        }        
    }


    boxCounter = 0;
    // Adds a 1x1x1 box to the origin of the canvas and into the intersectable objects array
    addBox(){
        this.boxCounter++;

        var boxGeometry = new THREE.BoxBufferGeometry(1,1,1);

        // var edges = new THREE.EdgesGeometry(boxGeometry);
        // var lines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }))
        
        var boxMaterial = new THREE.MeshBasicMaterial({color: "lightgrey"});
        var box = new THREE.Mesh(boxGeometry, boxMaterial);


        var edges = new THREE.EdgesGeometry( boxGeometry );
        var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x808080 } ) );
        box.add(line);


        this.scene.add(box);

        console.log(box);
        console.log(line);

        box.userData["addLines"] = true;

        this.intersectableObjects.push(box);

        this.groupObjects.push(box);

        var params = {
            color: "#D3D3D3"
        }

        const boxGui = this.gui.addFolder("Box" + this.boxCounter.toString());

        boxGui.add(box.position, "x").min(-100).max(100).step(0.1);
        boxGui.add(box.position, "y").min(-100).max(100).step(0.1);
        boxGui.add(box.position, "z").min(-100).max(100).step(0.1);

        boxGui.addColor(params, 'color').onChange(function(){
            box.material.color.set(params.color);
        });
    }

    sphereCounter = 0;
    addSphere() {
        this.sphereCounter++;

        var sphereGeometry = new THREE.SphereBufferGeometry(0.5,15,15);

        // var edges = new THREE.EdgesGeometry(boxGeometry);
        // var lines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }))

        var sphereMaterial = new THREE.MeshBasicMaterial({color: "lightgrey"});
        var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.scene.add(sphere);

        this.intersectableObjects.push(sphere);
        this.groupObjects.push(sphere);

        var params = {
            color: "#D3D3D3"
        }

        const sphereGui = this.gui.addFolder("Sphere" + this.sphereCounter.toString());

        sphereGui.add(sphere.position, "x").min(-100).max(100).step(0.1);
        sphereGui.add(sphere.position, "y").min(-100).max(100).step(0.1);
        sphereGui.add(sphere.position, "z").min(-100).max(100).step(0.1);
    
        sphereGui.addColor(params, 'color').onChange(function(){
            sphere.material.color.set(params.color);
        });
    }

    addForkliftModel(){
        console.log("Loading...");
        this.gltfLoader.load("./assets/forklift20K/scene.gltf", gltf => {
            gltf.scene.scale.set(0.01, 0.01, 0.01);
            // this.scene.add(gltf.scene);

            this.intersectableObjects.push(gltf.scene);

            var meshBoundingBox = new THREE.Box3();
            meshBoundingBox.setFromObject(gltf.scene);
            console.log(meshBoundingBox);

            var boxGeometry = new THREE.BoxBufferGeometry(meshBoundingBox.max.x - meshBoundingBox.min.x,meshBoundingBox.max.y - meshBoundingBox.min.y,meshBoundingBox.max.z - meshBoundingBox.min.z);
            var material = new THREE.MeshBasicMaterial();
            material.transparent = true;
            material.opacity = 0;

            var mesh = new THREE.Mesh(boxGeometry, material);

            mesh.add(gltf.scene);

            mesh.children[0].position.sub(new THREE.Vector3(0.45, (meshBoundingBox.max.y - meshBoundingBox.min.y) / 2,0));

            this.scene.add(mesh)
            
            this.intersectableObjects.push(mesh);

            this.groupObjects.push(mesh);
        });
    }

    addPackageModel(){

    }

    configurationDialogApplied(){
        let configurations: any[] = [];

        let i = 0;
        for(let colorPicker of document.getElementsByClassName("stateColorPicker")){            
            let color = (colorPicker as HTMLInputElement).value;
            let stateId = this.propertyDefinitionsMock.find((propertyDefinition) => propertyDefinition.propertyName == this.propertyDefinitionsDropdown.value)!.states[i].stateId;
            
            configurations.push( {
                stateId: stateId,
                color: color,
            });
            i++;
        }
        i = 0;
        for(let checkboxInstance of document.getElementsByClassName("isAlarmWorthyCheckbox")){
            configurations[i].isAlarmWorthy = (checkboxInstance as HTMLInputElement).checked;
            i++;
        }
        i = 0;
        console.log(document.getElementsByClassName("newValueDisplayDurationTextbox"));
        
        for(let textboxInstance of document.getElementsByClassName("newValueDisplayDurationTextbox")){
            console.log(configurations);
            console.log(i);

            for(let textbox of textboxInstance.getElementsByTagName("input")){
                configurations[i].newValueDisplayDuration = textbox.value;
            }
            
            
            // configurations[i].newValueDisplayDuration = (textboxInstance as HTMLInputElement).value;
            i++;
        }


        let propertyDefinition = this.propertyDefinitionsMock.find((propDef) => propDef.propertyName == this.propertyDefinitionsDropdown.value);
    
        this.currentObject!.userData["propertyId"] = propertyDefinition!.propertyId;
        this.currentObject.userData["states"] = configurations;
        
        this.propertyDefinitionsDropdown.value = "";
        this.stateConfigurationDialog.hide();    
    }

    cancelDialog(){
        if(this.stateConfigurationDialog) this.stateConfigurationDialog.hide();
    }

    saveGroup(){        

        var objectGroup = new THREE.Group();
        for(let object of this.groupObjects){
            objectGroup.add(object);
        }
        objectGroup.name = this.domainObjectType as string;
        objectGroup.userData["domainObjectType"] = this.domainObjectType;
    

        console.log(JSON.stringify(objectGroup.toJSON()));
        console.log(objectGroup);
        
        localStorage.setItem("threeJSGroupPrefix" + this.domainObjectType, JSON.stringify(objectGroup.toJSON()));
        window.location.href = "landing";

    }

    getPropertyDefinitionsForDomainObjectType(connectedDomainObjectType){
        switch (connectedDomainObjectType){
            case "sensor":
                return [                    
                    { propertyId: "12", propertyName: "Status", states: [
                            { stateId: "12a", stateName: "Ideal" },
                            { stateId: "12b", stateName: "Okay" },
                            { stateId: "12c", stateName: "Kritisch" },
                        ]
                    }
                ];
            case "machine":
                return [                    
                    { propertyId: "34", propertyName: "State", states: [
                            { stateId: "34a", stateName: "On" },
                            { stateId: "34b", stateName: "Off" },
                        ]
                    },
                    { propertyId: "35", propertyName: "Heat", states: [
                            { stateId: "35a", stateName: "[..., 20°[" },
                            { stateId: "35b", stateName: "[20°, 50°[" },
                            { stateId: "35c", stateName: "[50°, ...]" },
                        ]
                    }
                ];
            case "door":
                return [
                    { propertyId: "13", propertyName: "Stand", states: [
                        { stateId: "13a", stateName: "Offen" },
                        { stateId: "13b", stateName: "Geschlossen" }
                    ]
                }
            ];
            case "forklift":
                return [
                    { propertyId: "80", propertyName: "efficiency", states: [
                        { stateId: "80a", stateName: "Unefficient" },
                        { stateId: "80b", stateName: "Okay" },
                        { stateId: "80c", stateName: "Very Efficient" },
                    ]
                }
            ];
            case "package":
                return [];
            default:
                return [];
        }
      }
  

}
