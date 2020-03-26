app.controller('mainController', function($scope) {

});



app.controller('modelController', function($scope) {

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

		$scope.params.hallPeriodsA = 0;
		$scope.params.hallPeriodsB = 0;
	} else {
		$scope.params = JSON.parse(localStorage.getItem('params'));
	}

	// dfmr params
	$scope.dfmrOptions = {};
	$scope.dfmrOptions['th'] = 45;



	//$scope.delayIndex = 0;
	$scope.delay = [];
	for (i = 0; i < 360; i=i+10) {
		$scope.delay.push(i);
	} 

	$scope.spinStructure =  [];
	$scope.structureArray =  [];
	$scope.fftStructure = [];


	$scope.$watch('params', function (newVal) {
		localStorage.setItem('params', JSON.stringify($scope.params));
		$scope.processStructure();
    }, true);



	
	$scope.processStructure = function() {
		for (i = 0; i < $scope.delay.length; i++) { 
			// for each delay step
			$scope.spinStructure[i] =  $scope.calculateStructure($scope.delay[i]);
			$scope.fftStructure[i] = $scope.calculateFftStructure($scope.spinStructure[i]);
		}
	}





	
	$scope.calculateStructure = function(timeStep){
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

			// make ellipse
			// modulate size by a parameter that can be given a number of repeats and phase to the structuring.

			
			v0.applyAxisAngle( new THREE.Vector3( 1, 0, 0 ), (90-$scope.params.zeeman)*Math.PI/180 )			// rotate by 90 degrees - zeeman about x axis


		
			// conical structure
			var conicalStep = 2*Math.PI*$scope.params.conicalPeriods * z /$scope.gridSize[2];
			v0.applyAxisAngle( new THREE.Vector3( 0, 0, 1), conicalStep )											// rotate about z axis by conical precession
			
			v0.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), ($scope.params.tiltY * Math.PI / 180));				// rotate about y by tilt angle
			v0.applyAxisAngle( new THREE.Vector3( 0, 0, 1 ), ($scope.params.tiltZ * Math.PI / 180));				// rotate about z by tilt angle
			
			vectors = vectors.concat(v0);
		}}}
		return vectors
	}


	$scope.calculateFftStructure = function(vectors){
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
		
	
		
		

	$scope.structureToArray = function(){
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

	
	//function onWindowResize() {
	//	camera.aspect = window.innerWidth / window.innerHeight;
	// 	camera.updateProjectionMatrix();
	// 	renderer.setSize( window.innerWidth, window.innerHeight );
	// 	controls.handleResize();
	// }
	
});