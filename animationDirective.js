app.directive('animation', ['$window', function ($window) {

    function linkFunc(scope, element, attrs) {
		scope.timeStep = 5;
		scope.tickCounter = 0;

		scope.annotations = [];
		scope.controls;
		scope.renderer;
		scope.scene;
		//scope.camera;
		scope.arrows;

        scope.$watch('model', function (newVal) {
			scope.scene.remove(scope.annotations); 
			scope.annotations = drawCircles(scope.model);
			scope.scene.add(scope.annotations);
			
		}, true);

		
		scope.tick = function(){
			scope.tickCounter += 1;
			if (scope.speed > 0 ){
				if (scope.tickCounter >= (100/scope.speed)){
					scope.tickCounter = 0;
					scope.timeStep = (scope.timeStep  + 1) % scope.model.length;
					scope.updateArrowDirection( scope.model, scope.timeStep);
				}
			}
			scope.controls.update();
			scope.renderer.render( scope.scene, camera );
		}



		
		scope.updateArrowDirection = function(spinStructure, timeStep) {
			for (i = 0; i < scope.arrows.children.length; i++ ) { 
				scope.arrows.children[i].setDirection(spinStructure[timeStep][i]);
			}
		}	


		scope.init = function(){
			container = element[0];
			camera = new THREE.PerspectiveCamera( 50, container.offsetWidth/container.offsetHeight, 0.01, 1e10 );  //distance , 
			camera.position.set( 10, 10, 10);		
			camera.up.set( 0, 0, 1 );
			camera.lookAt( 0,0, 0);
		
			scope.controls = new THREE.TrackballControls(camera, container );
			scope.controls.dynamicDampingFactor = 0.5;
			scope.controls.rotateSpeed = 5;
			scope.scene = new THREE.Scene();
			scope.scene.add( camera );
		
			scope.arrows = drawArrows();
			scope.scene.add(scope.arrows);

			scope.renderer = new THREE.WebGLRenderer( { antialias: true } );
			scope.renderer.setPixelRatio( window.devicePixelRatio );
			scope.renderer.setSize(container.offsetWidth, container.offsetHeight );
			scope.renderer.setClearColor( 0xffffff, 1);
			container.appendChild( scope.renderer.domElement );

			scope.scene.add(drawAxes())






			var light = new THREE.AmbientLight( 0x666666 ); // soft white light
			scope.scene.add( light );

			var pointLight = new THREE.PointLight( 0x666666, 1, 0 );
			pointLight.position.set( 0, 0, 10 );
			scope.scene.add( pointLight );




		}


		element.html("");
		scope.init();
		setInterval(scope.tick, 10);
	}


    return {
		scope: {'model':'=', 'speed':'='},
        link: linkFunc
    };
}]);





var camera
//controls, scene, renderer;

var gridSize = [1,1,16];
var translateToCenter = new THREE.Matrix4().makeTranslation( -(gridSize[0]-1)/2,-(gridSize[1]-1)/2,-(gridSize[2]-1)/2)



function drawAxes(){
	axes = new THREE.Group();
	//arrow = new THREE.ArrowHelper(new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,0), 5, 0xff0000, 0.5, 0.4);
	//axes.add(arrow);
	//arrow = new THREE.ArrowHelper(new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,0), 5, 0x00ff00, 0.5, 0.4);
	//axes.add(arrow);
	//arrow = new THREE.ArrowHelper(new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,0), 5, 0x0000ff, 0.5, 0.4);
	//axes.add(arrow);

	arrow = new THREE.ArrowHelper(new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,0), gridSize[2], 0xffffff, 0.5, 0.4);

	arrow.cone.geometry = new THREE.ConeGeometry( 0.5, 1, 16 );
	//arrow.line.geometry = new THREE.CylinderBufferGeometry( 0.02, 0.02, 1, 16 );

	var tt = new THREE.Matrix4().makeTranslation( 0,-0.5,0)
	arrow.cone.geometry.applyMatrix(tt); // move to rotation center
	//var tt = new THREE.Matrix4().makeTranslation( 0,0.5,0)
	//arrow.line.geometry.applyMatrix(tt); // move to rotation center



	var material = new THREE.MeshLambertMaterial({
		color: 0x0000ff
	  });
	arrow.cone.material = material;
	arrow.line.material = material;

	arrow.applyMatrix(translateToCenter); // move to rotation center
	axes.add(arrow);


	return axes;
}




function drawArrows(){
	arrows = new THREE.Group();
	for (z = 0; z < gridSize[2]; z++) { 
	for (y = 0; y < gridSize[1]; y++) { 
	for (x = 0; x < gridSize[0]; x++) { 
		
		var arrow = new THREE.ArrowHelper(new THREE.Vector3(0,0,0), new THREE.Vector3( x,y,z ), 1, 0xffffff, 0.5, 0.4);
		//arrow.setColor(new THREE.Color( 0xffffff ));


		arrow.cone.geometry = new THREE.ConeGeometry( 0.5, 1, 16 );
		arrow.line.geometry = new THREE.CylinderBufferGeometry( 0.02, 0.02, 1, 16 );
		//console.log(arrow.line.geometry);

		var tt = new THREE.Matrix4().makeTranslation( 0,-0.5,0)
		arrow.cone.geometry.applyMatrix(tt); // move to rotation center
		var tt = new THREE.Matrix4().makeTranslation( 0,0.5,0)
		arrow.line.geometry.applyMatrix(tt); // move to rotation center


		var material = new THREE.MeshLambertMaterial({
			color: 0xffffff,
			wireframe: false
		  });
		arrow.cone.material = material;
		arrow.line.material = material;


		arrows.add(arrow);
	}}}





	arrows.applyMatrix(translateToCenter); // move to rotation center
	return arrows
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

	
function drawCircles(spinStructure) {
	annotations = new THREE.Group();

	if (spinStructure.length == 0) {return;}

	var centersLineGeometry = new THREE.Geometry();
	var centersVertArray = centersLineGeometry.vertices;

	for (z = 0; z < gridSize[2]; z++) { 
	for (y = 0; y < gridSize[1]; y++) { 
	for (x = 0; x < gridSize[0]; x++) { 
		// static circles
		//length = Math.cos(Math.PI/180*$scope.params.zeeman);
		//circ = circle(length, 0xaaffaa);							// static circles in x-y plane
		//translation = new THREE.Matrix4().makeTranslation(0,0, Math.sin(Math.PI/180*$scope.params.zeeman));
		//circ.applyMatrix(translation);
		//rotation = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), ($scope.params.tiltY * Math.PI / 180));
		//circ.applyMatrix(rotation);									// rotate by tilt angles
		//rotation = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), ($scope.params.tiltZ * Math.PI / 180));
		//circ.applyMatrix(rotation);									// rotate by tilt angles


		//translation = new THREE.Matrix4().makeTranslation(x,y,z);	// translate to position of spin
		//circ.applyMatrix(translation);
		//circles.add( circ );
	

		

		// dynamic circles
		var lineGeometry = new THREE.Geometry();
		var vertArray = lineGeometry.vertices;
		circleCenter = [0,0,0];
		for (var i=0; i < spinStructure.length; i++) { // loop through time steps
			vertArray.push(spinStructure[i][z]);
			circleCenter[0] += spinStructure[i][z]['x'];
			circleCenter[1] += spinStructure[i][z]['y'];
			circleCenter[2] += spinStructure[i][z]['z'];
		}
		vertArray.push(spinStructure[0][z]); 		// add first point agian to join up the path

		var lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
		var circ = new THREE.Line(lineGeometry, lineMaterial);

		transformation = new THREE.Matrix4().makeTranslation(x,y,z);


		circleCenter[0] /= spinStructure.length;
		circleCenter[1] /= spinStructure.length;
		circleCenter[2] /= spinStructure.length;
		centersVertArray.push(new THREE.Vector3(circleCenter[0]+x, circleCenter[1]+y, circleCenter[2]+z));


		circ.applyMatrix(transformation);					// translate to position of spin
		annotations.add( circ );
	}}}

	var lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
	var centerLine = new THREE.Line(centersLineGeometry, lineMaterial);
	annotations.add( centerLine );

	annotations.applyMatrix(translateToCenter);
	return annotations;
}


