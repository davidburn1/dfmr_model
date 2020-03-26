app.directive('animation', ['$window', function ($window) {

    function linkFunc(scope, element, attrs) {
		scope.timeStep = 5;
		scope.tickCounter = 0;

        scope.$watch('model', function (newVal) {
			drawCircles(scope.model);
		}, true);

		
		scope.tick = function(){
			scope.tickCounter += 1;
			if (scope.speed > 0 ){
				if (scope.tickCounter >= (100/scope.speed)){
					scope.tickCounter = 0;
					scope.timeStep = (scope.timeStep  + 1) % scope.model.length;
					showStructure( scope.model, scope.timeStep);
				}
			}
			controls.update();
			renderer.render( scene, camera );
		}

		element.html("");
		initAnimation(element[0]);
		setInterval(scope.tick, 10);
	}


    return {
		scope: {'model':'=', 'speed':'='},
        link: linkFunc
    };
}]);





var container;
var camera, controls, scene, renderer;

var circles;
var arrows;

var gridSize = [1,1,16];


var translateToCenter = new THREE.Matrix4().makeTranslation( -(gridSize[0]-1)/2,-(gridSize[1]-1)/2,-(gridSize[2]-1)/2)




function initAnimation( container ) {
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









function drawArrows(){
	arrows = new THREE.Group();
	for (z = 0; z < gridSize[2]; z++) { 
	for (y = 0; y < gridSize[1]; y++) { 
	for (x = 0; x < gridSize[0]; x++) { 
		var arrow = new THREE.ArrowHelper(new THREE.Vector3(0,0,0), new THREE.Vector3( x,y,z ), 1, 0xffffff, 0.5, 0.4);
		arrow.setColor(new THREE.Color( 0x000000 ));
		arrows.add(arrow);
	}}}
	arrows.applyMatrix(translateToCenter); // move to rotation center
	scene.add(arrows);
}


function showStructure(spinStructure, timeStep) {
	for (i = 0; i < arrows.children.length; i++ ) { 
		arrows.children[i].setDirection(spinStructure[timeStep][i]);
	}
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
	scene.remove(circles); 
	circles = new THREE.Group();

	if (spinStructure.length == 0) {return;}

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
		for (var i=0; i < spinStructure.length; i++) { // loop through time steps
			vertArray.push(spinStructure[i][z]);
		}
		vertArray.push(spinStructure[0][z]); 		// add first point agian to join up the path
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