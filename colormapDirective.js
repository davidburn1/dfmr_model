app.directive('colormap', ['$window', function ($window) {
    function linkFunc(scope, element, attrs) {

		scope.laa = [0,15,30,45,60,75,90,105,120,135,150,165];

		//$scope.delay = [0, 10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170,180,190,200,210,220,230,240,250,260];
		scope.delay = [];
		for (i = 0; i < 360; i=i+10) { scope.delay.push(i); } 

			// dfmr params
		scope.options = {};
		scope.options['th'] = 45;


        scope.$watch('model', function (newVal) {
			refreshDFMR();
		}, true);

        scope.$watch('options', function (newVal) {
			refreshDFMR();
		}, true);


		function refreshDFMR() {
			scope.ki = new THREE.Vector3(Math.sin(scope.options.th* Math.PI / 180) , 0, Math.cos(scope.options.th* Math.PI / 180));
			scope.ks = new THREE.Vector3(-Math.sin(scope.options.th* Math.PI / 180) , 0,Math.cos(scope.options.th* Math.PI / 180));

			var P = PS(scope.laa);
			
			var laaDelayGrid = [];
			for (var j=0; j < scope.delay.length; j++) {
				laaDelayGrid[j] = [];
				for (var i=0; i < P.length; i++) {
					laaDelayGrid[j][i] = intensity(P[i], scope.model[j], scope.idx);
				}
			}


			// differentiate grid along delay 
			// var laaDelayGridDiff = [];
			// for (var j=0; j < scope.delay.length; j++) {
			// 	laaDelayGridDiff[j] = [];
			// 	for (var i=0; i < P.length; i++) {
			// 		if (j==0) {
			// 			laaDelayGridDiff[j][i] = laaDelayGrid[j][i]  - laaDelayGrid[scope.delay.length-1][i];
			// 		} else {
			// 			laaDelayGridDiff[j][i] = laaDelayGrid[j][i]  - laaDelayGrid[j-1][i];
			// 		}
			// 	}
			// }
			// laaDelayGrid = laaDelayGridDiff;	





			var laaDelayGridPhaseMod = [];
			for (var t=0; t<scope.delay.length; t++) {
				t180 = (t + scope.delay.length/2) % scope.delay.length;
				//console.log(t, t180);
				laaDelayGridPhaseMod[t] = [];
				for (var i=0; i < P.length; i++) {
					laaDelayGridPhaseMod[t][i] = laaDelayGrid[t][i]  - laaDelayGrid[t180][i];
				}
			}
			laaDelayGrid = laaDelayGridPhaseMod;



			var data = [];
			for (var j=0; j < laaDelayGrid.length; j++) {
				for (var i=0; i < laaDelayGrid[j].length; i++) {
					data.push({x:scope.delay[j], y:scope.laa[i], value:laaDelayGrid[j][i]});
				}
			}
		
			element.html("");
			new ColormapPlot( element[0], data);
		}





	
	




		function PS(laa) {
			//""" 
			//Poincare-Stokes representation of polarisation 
			//based on arbitary linear polarisation angle laa
			//https://en.wikipedia.org/wiki/Stokes_parameters
			//"""
			
			var chi = 0;
			var I = 1;
			var Ip = 1;
			
			var out = [];
			for (var i = 0; i < laa.length; i++) {
				var s0 = I; 
				var s1 = Ip * Math.cos(2*laa[i] * Math.PI/180) * Math.cos(2*chi);
				var s2 = Ip * Math.sin(2*laa[i] * Math.PI/180) * Math.cos(2*chi);
				var s3 = Ip * Math.sin(2*chi);
				out[i] = [s0, s1, s2, s3];
			}
			return out;
		}
		

		
		function intensity(P, fftStructure, idx){ //mag, P,ki,ks
			//"""
			//Scattered intensity from an input polarisation P and incident vector ki and output vector ks
			//From equation A6 in Zhang_PRB_2017
			//equation 17 in VanderLaan_CRPhysique_2008
			//"""
			var F = 1;

			var MQ = new THREE.Vector3(fftStructure[0][idx], fftStructure[1][idx], fftStructure[2][idx]);		
			var MQconj = new THREE.Vector3(conjugate(fftStructure[0][idx]), conjugate(fftStructure[1][idx]), conjugate(fftStructure[2][idx]));
			
			out =       0.5*F**2 * (P[0] + P[1]) *  abs( dot(scope.ks, MQ) )**2;   
			out = out + 0.5*F**2 * (P[0] - P[1]) * (abs( dot(scope.ki, MQ) )**2  + abs( dot( scope.ks.cross(scope.ki)  , MQ))**2);
			a = new Complex(P[2], P[3]);
			a = a.mul(dot( scope.ks, MQconj ), a);
			a = a.mul( dot( scope.ks.cross(scope.ki) , MQ), a);
			out = out -     F**2 * a['re'] ; 
			
			return out;
		}


	}


    return {
		scope: {'model':'=',  'idx':'='},
        link: linkFunc
    };
}]);










function ColormapPlot(id, data){
	var	margin = {top: 10, right: 10, bottom: 40, left: 50};
	var width = 300 - margin.left - margin.right;
	var height = 280 - margin.top - margin.bottom;
	
	var svg = d3.select(id).append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	  	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		


	var	x = d3.scaleLinear().range([0, width]);
	var	y = d3.scaleLinear().range([height, 0]);

	x.domain([0,360]);
	y.domain([0,180]);

	



	var myColor = d3.scaleSequential()
	.interpolator(d3.interpolateRdYlBu)
//		.interpolator(d3.interpolateInferno)
	.domain(d3.extent(data, function(d) { return d.value; }));
	//.domain([-1,1]);
	

// add the squares
svg.selectAll()
	.data(data, function(d) {return d.x+':'+d.y;})
	.enter()
	.append("rect")
		  .attr("x", function(d) { return x(d.x) })
		  .attr("y", function(d) { return y(d.y )-y(0)+y(15)  })
		  .attr("width", x(10) )
		  .attr("height", y(0)-y(15) )
		  .style("fill", function(d) { return myColor(d.value)} )
		  .style("stroke-width", 0)
		  .style("stroke", "none")
		  .style("opacity", 1)
	
	
	
	
	var axisBottom = d3.axisBottom(x).tickValues([0, 45, 90, 135, 180, 225, 270, 315, 360]); 
	svg.append("g")
		.attr("class", "axis axis--xb")
		.attr("transform", "translate(0," + height + ")")
		.style("font", "14px Arial")
		.call(axisBottom)
		
	var axisTop = d3.axisBottom(x).tickFormat("");
	svg.append("g")
		.attr("class", "axis axis--xt")
		.call(axisTop);
		
	var axisLeft = d3.axisLeft(y).tickValues([0, 45, 90, 135, 180]);;
	svg.append("g")
		.attr("class", "axis axis--yl")
		.style("font", "14px Arial")
		.call(axisLeft);
		
	var axisRight = d3.axisLeft(y).tickFormat("");
	svg.append("g")
		.attr("class", "axis axis--yr")
		.attr("transform", "translate(" + width + ",0)")
		.call(axisRight);


	
	svg.append("text")             
		  .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top + 25) + ")")
		  .style("text-anchor", "middle")
		  .text("Delay");
		  

	svg.append("text")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 0 - (margin.left + 5))
		  .attr("x",0 - (height / 2))
		  .attr("dy", "1em")
		  .style("text-anchor", "middle")
		  .text("laa (degrees)");   
	  
  




}
