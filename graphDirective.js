//var graphPlotter = angular.module('graphPlotter', []);


app.directive('graphPlot', ['$window', function ($window) {
    function linkFunc(scope, element, attrs) {
		//scope.graphPlot = "";

			
		//angular.element($window).bind('resize', function(){
			//	scope.g.render();
		//	var inside = [];
		//	var outside = [];
			
		//	for (i = 0; i < scope.model.length; i++) {
		//		inside.push({'y':Number(scope.model[i]['tempInside']), 'x':new Date(scope.model[i]['time'] * 1000) });	
		//		outside.push({'y':Number(scope.model[i]['tempOutside']), 'x':new Date(scope.model[i]['time'] * 1000) });	
		//	}
			
			
		//	element.html("");
		//	new TimeScatterPlot([inside, outside], element[0]);
		//});

        scope.$watch('model', function (newVal) {
			element.html("");
			new GraphPlot( element[0], scope.model);
		}, true);
    }

    return {
		scope: {'model': '='},
        link: linkFunc
    };
}]);










function GraphPlot(id, data){
	//console.log(data);
//var GraphPlot = (function (id) {
	//function GraphPlot( id) {
		
		//this.width = parseInt(d3.select(id).style("width")) ;
		
		var	margin = {top: 10, right: 10, bottom: 25, left: 25};
		var width = 500 - margin.left - margin.right;
		var height = 150 - margin.top - margin.bottom;
		
			
		var svg = d3.select(id).append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
		  .append("g")
			.attr("transform", 
				  "translate(" + margin.left + "," + margin.top + ")");

			

			
			
//		var x = d3.scaleLinear().range([0, width]);
		var x = d3.scaleBand().range([0, width]).padding(0.1);
		var	y = d3.scaleLinear().range([height, 0]);

		x.domain(data.map(function(d,i) { return i-8; }));
		//x.domain([0,16]);
		y.domain([0,10]);

		
		
		
		
		
		var axisBottom = d3.axisBottom(x).ticks(4);
		svg.append("g")
			.attr("class", "axis axis--xb")
			.attr("transform", "translate(0," + height + ")")
			.call(axisBottom)
			
		var axisTop = d3.axisBottom(x).tickFormat("");
		svg.append("g")
			.attr("class", "axis axis--xt")
			.call(axisTop);
			
		var axisLeft = d3.axisLeft(y);
		svg.append("g")
			.attr("class", "axis axis--yl")
			.call(axisLeft);
			
		var axisRight = d3.axisLeft(y).tickFormat("");
		svg.append("g")
			.attr("class", "axis axis--yr")
			.attr("transform", "translate(" + width + ",0)")
			.call(axisRight);
	
		

	
			
				// set the colour scale
		//var color = d3.scaleOrdinal(d3.schemeCategory10);
			
			

			  

			  
		svg.selectAll(".bar")
				  .data(data)
				.enter().append("rect")
				  .attr("class", "bar")
				  .attr("x", function(d,i) { return x(i-8); })
				  .attr("width", x.bandwidth())
				  .attr("y", function(d) { return y(Math.sqrt(d.re**2 + d.im**2)); })
				  .attr("height", function(d) { return height - y(Math.sqrt(d.re**2 + d.im**2)); })
				  .attr("fill", "steelblue");




	//return GraphPlot;
//}());
}
