app.controller('modelController', function($scope) {



	$scope.gridSize = [1,1,16];

	// dfmr params
	$scope.dfmrOptions = {};
	$scope.dfmrOptions['th'] = 45;

	$scope.delay = [];
	for (i = 0; i < 360; i=i+10) {
		$scope.delay.push(i);
	} 

	$scope.spinStructure =  [];
	$scope.fftStructure = [];
	$scope.jsonStructure="";


	$scope.$watch('params', function (newVal) {
		$scope.processStructure();
		$scope.jsonStructure = $scope.structureToJson();
    }, true);



	
	$scope.processStructure = function() {
		for (i = 0; i < $scope.delay.length; i++) { 
			// for each delay step
			$scope.spinStructure[i] = $scope.calculateStructure($scope.delay[i]);
			$scope.fftStructure[i] = $scope.calculateFftStructure($scope.spinStructure[i]);
		}
	}





	
	$scope.calculateStructure = function(timeStep){
		// timestep varies from 0 -> 360
		vectors = Array();
		for (z = 0; z < $scope.gridSize[2]; z++) { 
		for (y = 0; y < $scope.gridSize[1]; y++) { 
		for (x = 0; x < $scope.gridSize[0]; x++) { 
			
			// start with magnetisation pointing along z axis
			var v0 = new THREE.Vector3( 0, 0, 1 );
			
			
			
			// dynamic amplitude 
			var ampA = $scope.params.hallAmpA;
			var ampB = $scope.params.hallAmpB;

			// amplitude depends on hallAB with periodic modulation along the the length of the spin chain.
			ampA = ampA + $scope.params.hallAmpPeriodicA * Math.abs(Math.cos((2*Math.PI*$scope.params.hallPeriodsA/2 * z/$scope.gridSize[2]) + ($scope.params.phaseOffsetA * Math.PI/180))); 
			ampB = ampB + $scope.params.hallAmpPeriodicB * Math.abs(Math.cos((2*Math.PI*$scope.params.hallPeriodsB/2 * z/$scope.gridSize[2]) + ($scope.params.phaseOffsetB * Math.PI/180)));

			// dynamic phase
			var phaseAngle = (timeStep * Math.PI/180); // time dependent
			//phaseAngle = phaseAngle + ($scope.params.phaseOffset * Math.PI/180);
			phaseAngle = phaseAngle + (2*Math.PI*  $scope.params.phasePeriods * z/$scope.gridSize[2]); 	// + position dependent phase

			aa = ampA * Math.sin(phaseAngle );
			bb = ampB * Math.cos(phaseAngle );

			// give a rotation in x an y axes for the vectors initially pointing along z
			v0.applyAxisAngle( new THREE.Vector3( 1, 0, 0 ), Math.PI/180*aa );			//  x component
			v0.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI/180*bb );			//  y component

			//rotate dynamic ellipse about z axis
			v0.applyAxisAngle( new THREE.Vector3( 0, 0, 1 ), Math.PI/180*$scope.params.coneRotation );	//  z rotation component





			v0.applyAxisAngle( new THREE.Vector3( 1, 0, 0 ), (90-$scope.params.zeeman)*Math.PI/180 )			// rotate by 90 degrees - zeeman about x axis




		
			// CHL
			// z dependent rotation with the number of space periods
			var conicalAngle = 2*Math.PI * $scope.params.conicalPeriods * z/$scope.gridSize[2];
			v0.applyAxisAngle( new THREE.Vector3( 0, 0, 1), conicalAngle )	

			//CSL
			//var conicalAngle =  2* Math.atan( (z/$scope.gridSize[2] - 0.5 )*20);
			//v0.applyAxisAngle( new THREE.Vector3( 0, 0, 1), conicalAngle )


			//var conicalAngle = Math.PI/180 * $scope.params.conicalPeriods2Amp * Math.sin(2*Math.PI * $scope.params.conicalPeriods * 2 * z/$scope.gridSize[2]);
			//v0.applyAxisAngle( new THREE.Vector3( 0, 0, 1), conicalAngle )		

			var conicalAngle = $scope.params.conicalPeriods2/100  *  2*Math.PI * Math.cos(2*Math.PI*$scope.params.conicalPeriods * z /$scope.gridSize[2]);
			v0.applyAxisAngle( new THREE.Vector3( 0, 0, 1), conicalAngle )							// rotate about z axis by conical precession
			


			v0.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), ($scope.params.tiltY * Math.PI / 180));				// rotate about y by tilt angle
			v0.applyAxisAngle( new THREE.Vector3( 0, 0, 1 ), ($scope.params.tiltZ * Math.PI / 180));				// rotate about z by tilt angle


			// introduce squashing to represent surface effects
			
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
		
	
		

	$scope.structureToJson = function(){
		//convert three vectors into normal arrays
		var out = [];
		for (i=0; i < $scope.spinStructure.length; i++) { // loop through delay
			out[i] = [];
			for (j=0; j < $scope.spinStructure[i].length; j++) { // loop through space
				out[i][j] = [$scope.spinStructure[i][j]['x'], $scope.spinStructure[i][j]['y'], $scope.spinStructure[i][j]['z']]
			}
		}
		return JSON.stringify(out);
	}




	
	//function onWindowResize() {
	//	camera.aspect = window.innerWidth / window.innerHeight;
	// 	camera.updateProjectionMatrix();
	// 	renderer.setSize( window.innerWidth, window.innerHeight );
	// 	controls.handleResize();
	// }
	
});