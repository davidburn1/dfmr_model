



app.service('dfmr', function() {


	this.calculateFftStructure = function(spinStructure){
		fftStructure = Array()
		for (t=0; t<spinStructure.length; t++) { 	
			var mag_u = spinStructure[t].map(function(m){ return m.x });
			var mag_v = spinStructure[t].map(function(m){ return m.y });
			var mag_w = spinStructure[t].map(function(m){ return m.z });
			
			var fft_u = cfft(mag_u);
			var fft_v = cfft(mag_v);
			var fft_w = cfft(mag_w);

			// fftshift
			//var num = this.gridSize[2] / 2
			var num = spinStructure[t].length / 2
			fft_u = fft_u.slice(num).concat(fft_u.slice(0,num));
			fft_v = fft_v.slice(num).concat(fft_v.slice(0,num));
			fft_w = fft_w.slice(num).concat(fft_w.slice(0,num));
			
			fftStructure[t] = [fft_u, fft_v, fft_w];
		}
		return fftStructure
	}
		

	this.structureToJson = function(spinStructure){
		//convert three vectors into normal arrays
		var out = [];
		for (t=0; t<spinStructure.length; t++) { // loop through delay
			out[t] = [];
			for (z=0; z<spinStructure[t].length; z++) { // loop through space
				out[t][z] = [spinStructure[t][z]['x'], spinStructure[t][z]['y'], spinStructure[t][z]['z']]
			}
		}
		return JSON.stringify(out);
	}

	
	this.jsonToStructure = function(json) {
		// convert array back into the three vector array
		//var textBox = document.getElementById("structureTextarea");
		json = JSON.parse(json);

		var spinStructure = Array();
		for (t=0; t<json.length; t++) { 
			spinStructure[t] = Array();
			for (z=0; z<json[t].length; z++) { 
				spinStructure[t][z] = new THREE.Vector3( json[t][z][0], json[t][z][1], json[t][z][2] )
			}
		}
		return spinStructure;
	};

  });











app.controller('modelController', function($scope, dfmr) {

	$scope.gridSize = [36, 1,1,16];

	$scope.spinStructure =  [];
	$scope.fftStructure = [];
	$scope.jsonStructure = "";


	$scope.$watch('params', function (newVal) {
		$scope.spinStructure = $scope.calculateStructure();
		$scope.fftStructure = dfmr.calculateFftStructure($scope.spinStructure);
		$scope.jsonStructure = dfmr.structureToJson($scope.spinStructure);
    }, true);




	
	$scope.calculateStructure = function(){
		output = Array();
		for (t = 0; t < $scope.gridSize[0]; t++) { 
		vectors = Array();
		for (z = 0; z < $scope.gridSize[3]; z++) { 
		for (y = 0; y < $scope.gridSize[2]; y++) { 
		for (x = 0; x < $scope.gridSize[1]; x++) { 
			
			// start with magnetisation pointing along z axis
			var v0 = new THREE.Vector3( 0, 0, 1 );
			
			// dynamic amplitude 
			var ampA = $scope.params.hallAmpA;
			var ampB = $scope.params.hallAmpB;

			// amplitude depends on hallAB with periodic modulation along the the length of the spin chain.
			ampA = ampA + $scope.params.hallAmpPeriodicA * Math.abs(Math.cos((2*Math.PI*$scope.params.hallPeriodsA/2 * z/$scope.gridSize[3]) + ($scope.params.phaseOffsetA * Math.PI/180))); 
			ampB = ampB + $scope.params.hallAmpPeriodicB * Math.abs(Math.cos((2*Math.PI*$scope.params.hallPeriodsB/2 * z/$scope.gridSize[3]) + ($scope.params.phaseOffsetB * Math.PI/180)));


			// dynamic phase
			//var phaseAngle = (timeStep * Math.PI/180); // time dependent
			var phaseAngle = (2*Math.PI * t/$scope.gridSize[0]); // time dependent
			//phaseAngle = phaseAngle + ($scope.params.phaseOffset * Math.PI/180);
			phaseAngle = phaseAngle + (2*Math.PI*  $scope.params.phasePeriods * z/$scope.gridSize[3]); 	// + position dependent phase

			aa = ampA * Math.sin(phaseAngle );
			bb = ampB * Math.cos(phaseAngle );

			// give a rotation in x an y axes for the vectors initially pointing along z
			v0.applyAxisAngle( new THREE.Vector3( 1, 0, 0 ), Math.PI/180*aa );			//  x component
			v0.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI/180*bb );			//  y component

			//rotate dynamic ellipse about z axis
			v0.applyAxisAngle( new THREE.Vector3( 0, 0, 1 ), Math.PI/180*$scope.params.coneRotation );	//  z rotation component


			//v0.applyAxisAngle( new THREE.Vector3( 1, 0, 0 ), $scope.params.zeeman * Math.PI/180 )			// rotate by 90 degrees - zeeman about x axis



			// CHL
			// z dependent rotation with the number of space periods
			var conicalAngle = 2*Math.PI * $scope.params.conicalPeriods * z/$scope.gridSize[3];
			conicalAngle = conicalAngle + (Math.PI/180 * $scope.params.conicalPhase);
			v0.applyAxisAngle( new THREE.Vector3( 0, 1, 0), conicalAngle )	

			//CSL
			//var conicalAngle =  2* Math.atan( (z/$scope.gridSize[3] - 0.5 )*20);
			//v0.applyAxisAngle( new THREE.Vector3( 0, 0, 1), conicalAngle )

			v0.applyAxisAngle( new THREE.Vector3( 1, 0, 0 ), ($scope.params.tiltY * Math.PI / 180));				// rotate about y by tilt angle
			v0.applyAxisAngle( new THREE.Vector3( 0, 0, 1 ), ($scope.params.tiltZ * Math.PI / 180));				// rotate about z by tilt angle



			//var conicalAngle = Math.PI/180 * $scope.params.conicalPeriods2Amp * Math.sin(2*Math.PI * $scope.params.conicalPeriods * 2 * z/$scope.gridSize[3]);
			//v0.applyAxisAngle( new THREE.Vector3( 0, 0, 1), conicalAngle )		

			var conicalAngle = $scope.params.conicalPeriods2/100  *  2*Math.PI * Math.cos(2*Math.PI*$scope.params.conicalPeriods * z /$scope.gridSize[3]);
			v0.applyAxisAngle( new THREE.Vector3( 0, 0, 1), conicalAngle )							// rotate about z axis by conical precession
			


			//v0.applyAxisAngle( new THREE.Vector3( 1, 0, 0 ), $scope.params.zeeman * Math.PI/180 )			// rotate by 90 degrees - zeeman about x axis
			v0 = v0.add( new THREE.Vector3( 0, 0, $scope.params.zeeman)).normalize ();


			// introduce squashing to represent surface effects
			
			vectors = vectors.concat(v0);
		}}}
		output[t] = vectors;
		}
		return output
	}



	
		



	
});