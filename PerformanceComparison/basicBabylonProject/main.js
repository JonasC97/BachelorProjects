window.addEventListener("DOMContentLoaded", function(){

    // const initMark = "mk1"
    // performance.mark(initMark);
    var canvas = document.getElementById("canvas");
    var engine = new BABYLON.Engine(canvas, true);

    var scene = new BABYLON.Scene(engine);
    // scene.clearColor = new BABYLON.Color3.White();
    var camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0,100,100), scene);
    camera.setTarget(BABYLON.Vector3.Zero());

    performanceTestAmount = 10000;

    console.time("Init");
    for(let i = 0; i < performanceTestAmount; i++){
        var box = BABYLON.Mesh.CreateBox("Box", 1.0, scene);
        box.position = new BABYLON.Vector3(200 * Math.random() - 100, 200 * Math.random() - 100,200 * Math.random() - 100)
    }
    console.timeEnd("Init");

    var times = [];
    engine.runRenderLoop(function(){
        // console.time("Render");
        var start = performance.now();

        camera.position.x += 0.5;
        camera.position.y -= 0.5;    
        scene.render();

        var end = performance.now();
        var time = end-start;

        times.push(time);
        if(times.length === 500){
            console.log(times.toString());
        }
    });


});


