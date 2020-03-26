
app.controller('mainController', function($scope) {
	$scope.timeStep = 0;
	$scope.speed = 30;

	$scope.gridSize = [1,1,16];
	$scope.circlesGridSize = [1,1,16];
	

	if (localStorage.getItem("params") === null) {
		// default spin structure params
		$scope.params = {};
		$scope.params.tiltY = 0;
		$scope.params.tiltZ = 0;
		$scope.params.zeeman = 0;
		$scope.params.conicalPeriods = 2; // in z direction
		$scope.params.phasePeriods = 0;
		$scope.params.hallA = 10;
		$scope.params.hallB = 10;

		$scope.params.hallPeriodsA = 2;
		$scope.params.hallPeriodsB = 2;
	} else {
		$scope.params = JSON.parse(localStorage.getItem('params'));
	}


	
	


	// dfmr params
	$scope.dfmrOptions = {};
	$scope.dfmrOptions['th'] = 45;



	$scope.delayIndex = 0;
	$scope.delay = [];
	for (i = 0; i < 360; i=i+10) {
		$scope.delay.push(i);
	} 

	$scope.spinStructure =  [];
	$scope.structureArray =  [];
	$scope.fftStructure = [];


	$scope.$watch('params', function (newVal) {
		localStorage.setItem('params', JSON.stringify($scope.params));
		processStructure();
		drawCircles();
    }, true);

	$scope.$watch('timeStep', function (newVal) {
		showStructure(arrows, $scope.spinStructure[$scope.timeStep]);
	}, true);
		
	$scope.tickCounter = 0;
	var tick = function() {
		$scope.tickCounter += 1;

		if ($scope.speed >0 ){
			if ($scope.tickCounter >= (100/$scope.speed)){
				$scope.tickCounter = 0;
				$scope.timeStep = ($scope.timeStep  + 1) % $scope.delay.length;
				$scope.$applyAsync();
			}
		}
	
		controls.update();
		renderer.render( scene, camera );
	}

	setInterval(tick, 10);
	


	var container;
	var camera, controls, scene, renderer;
	var time = 0;
	
	var circles;
	var arrows;

	var translateToCenter = new THREE.Matrix4().makeTranslation( -($scope.gridSize[0]-1)/2,-($scope.gridSize[1]-1)/2,-($scope.gridSize[2]-1)/2)


	init();
	





			
	function init( ) {
		container = document.getElementById("structure");
	
		camera = new THREE.PerspectiveCamera( 50, container.offsetWidth/container.offsetHeight, 0.01, 1e10 );  //distance , 
		camera.position.set( 10, 10, 10);		
		camera.up.set( 0, 0, 1 );
		camera.lookAt( 0,0, 0);

		controls = new THREE.TrackballControls( camera, container );
		controls.dynamicDampingFactor = 0.5;
		controls.rotateSpeed = 5;
		scene = new THREE.Scene();
		scene.add( camera );

		drawArrows();
		drawCircles();
		
		processStructure();
		showStructure(arrows, $scope.spinStructure[0]);
		

		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize(container.offsetWidth, container.offsetHeight );
		renderer.setClearColor( 0xffffff, 1);
		container.appendChild( renderer.domElement );
		
		// axes arrows
		arrow = new THREE.ArrowHelper(new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,0), 5, 0xff0000, 0.5, 0.4);
		scene.add(arrow);
		arrow = new THREE.ArrowHelper(new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,0), 5, 0x00ff00, 0.5, 0.4);
		scene.add(arrow);
		arrow = new THREE.ArrowHelper(new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,0), 5, 0x0000ff, 0.5, 0.4);
		scene.add(arrow);
	}


	$scope.loadStructure = function() {
		// convert array back into the three vector array
		$scope.spinStructure = JSON.parse($scope.structureArray);
		for (i = 0; i < $scope.spinStructure.length; i++) { 
			for (j=0; j < $scope.spinStructure[i].length; j++) { 
				$scope.spinStructure[i][j] = new THREE.Vector3( $scope.spinStructure[i][j][0], $scope.spinStructure[i][j][1], $scope.spinStructure[i][j][2] )
			}
		}

		for (i = 0; i < $scope.spinStructure.length; i++) { 
			$scope.fftStructure[i] = fftStructure($scope.spinStructure[i]);
		}
		drawCircles();
	};
	

	
	function processStructure() {
		for (i = 0; i < $scope.delay.length; i++) { 
			$scope.spinStructure[i] =  structure($scope.delay[i]);
			$scope.fftStructure[i] = fftStructure($scope.spinStructure[i]);
		}

		// convert three vectors into normal arrays
		var out = [];
		for (i=0; i < $scope.spinStructure.length; i++) { // loop through delay
			out[i] = [];
			for (j=0; j < $scope.spinStructure[i].length; j++) { // loop through space
				out[i][j] = [$scope.spinStructure[i][j]['x'], $scope.spinStructure[i][j]['y'], $scope.spinStructure[i][j]['z']]
			}
		}
		$scope.structureArray = JSON.stringify(out);
	}	
	
	function structure(timeStep){
		vectors = Array();
		for (z = 0; z < $scope.gridSize[2]; z++) { 
		for (y = 0; y < $scope.gridSize[1]; y++) { 
		for (x = 0; x < $scope.gridSize[0]; x++) { 
			
			// start with magnetisation pointing along z axis
			var v0 = new THREE.Vector3( 0, 0, 1 );
			
			// dynamics
			var phaseStep = 2*Math.PI* $scope.params.phasePeriods * z /$scope.gridSize[2] + timeStep/180*Math.PI; 	// provides an angle
			var aa = $scope.params.hallA;// * Math.sin(2*Math.PI* $scope.params.hallPeriodsA * z /$scope.gridSize[2]);
			var bb = $scope.params.hallB * Math.cos(2*Math.PI* $scope.params.hallPeriodsB  * z /$scope.gridSize[2]);
			v0.applyAxisAngle( new THREE.Vector3( 1, 0, 0 ), Math.PI/180 * aa  * Math.sin(phaseStep));			// rotate about x 
			v0.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI/180 * bb  * Math.cos(phaseStep));			// rotate about y
			
			
			v0.applyAxisAngle( new THREE.Vector3( 1, 0, 0 ), (90-$scope.params.zeeman)*Math.PI/180 )				// rotate by 90 degrees - zeeman about x axis


		
			// conical structure
			var conicalStep = 2*Math.PI*$scope.params.conicalPeriods * z /$scope.gridSize[2];
			v0.applyAxisAngle( new THREE.Vector3( 0, 0, 1), conicalStep )											// rotate about z axis by conical precession
			
			v0.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), ($scope.params.tiltY * Math.PI / 180));				// rotate about y by tilt angle
			v0.applyAxisAngle( new THREE.Vector3( 0, 0, 1 ), ($scope.params.tiltZ * Math.PI / 180));				// rotate about z by tilt angle
			
			vectors = vectors.concat(v0);
		}}}
		return vectors
	}


	function fftStructure(vectors){
		var mag_u = vectors.map(function(m){ return m.x });
		var mag_v = vectors.map(function(m){ return m.y });
		var mag_w = vectors.map(function(m){ return m.z });
		
		var fft_u = cfft(mag_u);
		var fft_v = cfft(mag_v);
		var fft_w = cfft(mag_w);

		// fftshift
		var num = $scope.gridSize[2] / 2
		fft_u = fft_u.slice(num).concat(fft_u.slice(0,num));
		fft_v = fft_v.slice(num).concat(fft_v.slice(0,num));
		fft_w = fft_w.slice(num).concat(fft_w.slice(0,num));
		
		return [fft_u, fft_v, fft_w];
	}
		
		
	function circle(r, color){
		var lineGeometry = new THREE.Geometry();
		var vertArray = lineGeometry.vertices;
		for (var i=0; i < 2*Math.PI; i+=0.01) {
			vertArray.push(new THREE.Vector3(r * Math.cos(i), r * Math.sin(i), 0));
		}
		lineGeometry.computeLineDistances();
		var lineMaterial = new THREE.LineBasicMaterial({ color: color });
		var circle = new THREE.Line(lineGeometry, lineMaterial);

		return circle;
	}

		
	function drawCircles() {
		scene.remove(circles); 
		circles = new THREE.Group();

		if ($scope.spinStructure.length == 0) {return;}

		for (z = 0; z < $scope.circlesGridSize[2]; z++) { 
		for (y = 0; y < $scope.circlesGridSize[1]; y++) { 
		for (x = 0; x < $scope.circlesGridSize[0]; x++) { 
			// static circles
			length = Math.cos(Math.PI/180*$scope.params.zeeman);
			circ = circle(length, 0xaaffaa);							// static circles in x-y plane
			translation = new THREE.Matrix4().makeTranslation(0,0, Math.sin(Math.PI/180*$scope.params.zeeman));
			circ.applyMatrix(translation);
			rotation = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), ($scope.params.tiltY * Math.PI / 180));
			circ.applyMatrix(rotation);									// rotate by tilt angles
			rotation = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), ($scope.params.tiltZ * Math.PI / 180));
			circ.applyMatrix(rotation);									// rotate by tilt angles


			translation = new THREE.Matrix4().makeTranslation(x,y,z);	// translate to position of spin
			circ.applyMatrix(translation);
			circles.add( circ );



			// dynamic circles
			var lineGeometry = new THREE.Geometry();
			var vertArray = lineGeometry.vertices;
			for (var i=0; i < $scope.spinStructure.length; i++) { // loop through time steps
				vertArray.push($scope.spinStructure[i][z]);
			}
			vertArray.push($scope.spinStructure[0][z]); 		// add first point agian to join up the path
			lineGeometry.computeLineDistances();
			var lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
			var circ = new THREE.Line(lineGeometry, lineMaterial);

			transformation = new THREE.Matrix4().makeTranslation(x,y,z);
			circ.applyMatrix(transformation);					// translate to position of spin
			circles.add( circ );

		}}}
				
		circles.applyMatrix(translateToCenter);
		scene.add(circles);
	}
		
		
	function drawArrows(){
		arrows = new THREE.Group();
		for (z = 0; z < $scope.gridSize[2]; z++) { 
		for (y = 0; y < $scope.gridSize[1]; y++) { 
		for (x = 0; x < $scope.gridSize[0]; x++) { 
			var arrow = new THREE.ArrowHelper(new THREE.Vector3(0,0,0), new THREE.Vector3( x,y,z ), 1, 0xffffff, 0.5, 0.4);
			arrow.setColor(new THREE.Color( 0x000000 ));
			arrows.add(arrow);
		}}}
		arrows.applyMatrix(translateToCenter); // move to rotation center
		scene.add(arrows);
	}

	function showStructure(object, omf) {
		for (i = 0; i < arrows.children.length; i++ ) { 
			arrows.children[i].setDirection(omf[i]);
		}
	}	
	
	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
		controls.handleResize();
	}
	
});