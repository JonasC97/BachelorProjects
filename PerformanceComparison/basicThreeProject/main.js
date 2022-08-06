let camera, scene, renderer, cube, controls;

function init() {
	// Init scene
	scene = new THREE.Scene();

	// Init camera (PerspectiveCamera)
	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);

	// Init renderer
	renderer = new THREE.WebGLRenderer({ antialias: true });

	// Set size (whole window)
	renderer.setSize(window.innerWidth, window.innerHeight);

	// Render to canvas element
	document.body.appendChild(renderer.domElement);


    performanceTestingAmount = 10000;
	console.time("Init");
    for(let i = 0; i < performanceTestingAmount; i++){
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        cube = new THREE.Mesh(geometry, material);
        cube.position.x = 200 * Math.random() - 100;
        cube.position.y = 200 * Math.random() - 100;
        cube.position.z = 200 * Math.random() - 100;

        scene.add(cube);
    }
	console.timeEnd("Init");


	// Position camera
    camera.position.x = 0;
	camera.position.z = 100;
    camera.position.y = 100;
    camera.lookAt(new THREE.Vector3(0,0,0));
}

var times = [];

// Draw the scene every time the screen is refreshed
function animate() {
	// console.time("Render");
	var start = performance.now();
	requestAnimationFrame(animate);
	camera.position.x += 0.5;
	camera.position.y -= 0.5;
	renderer.render(scene, camera);

	var end = performance.now();
	var time = end-start;

	times.push(time);
	if(times.length === 500){
		console.log(times.toString());
	}

	// console.timeEnd("Render");
}

function onWindowResize() {
	// Camera frustum aspect ratio
	camera.aspect = window.innerWidth / window.innerHeight;
	// After making changes to aspect
	camera.updateProjectionMatrix();
	// Reset size
	renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

init();
animate();
