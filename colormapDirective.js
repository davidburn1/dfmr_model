app.directive('colormap', ['$window', function ($window) {
    function linkFunc(scope, element, attrs) {

        scope.$watch('model', function (newVal) {
			
			var data = [];
			for (var j=0; j < scope.model.length; j++) {
				for (var i=0; i < scope.model[j].length; i++) {
					data.push({x:scope.x[j], y:scope.y[i], value:scope.model[j][i]});
				}
			}
		
			element.html("");
			new ColormapPlot( element[0], data);
		}, true);
    }

    return {
		scope: {'model': '=', 'x':'=', 'y':'='},
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
		.attr("transform", 
			  "translate(" + margin.left + "," + margin.top + ")");

		

	//var x = d3.scaleBand().range([0, width]).padding(0.1);
	//var y = d3.scaleBand().range([0, width]).padding(0.1);
	var	x = d3.scaleLinear().range([0,width]);
	var	y = d3.scaleLinear().range([height, 0]);

	//x.domain(data.map(function(d,i) { return i-8; }));
	x.domain(d3.extent(data, function(d) { return d.x; }));
	y.domain(d3.extent(data, function(d) { return d.y; }));

	
	
	
	
	
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


	
	svg.append("text")             
		  .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top + 20) + ")")
		  .style("text-anchor", "middle")
		  .text("Delay");
		  

	svg.append("text")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 0 - margin.left)
		  .attr("x",0 - (height / 2))
		  .attr("dy", "1em")
		  .style("text-anchor", "middle")
		  .text("laa (degrees)");   
	  
  


	var myColor = d3.scaleSequential()
		.interpolator(d3.interpolateRdYlBu)
//		.interpolator(d3.interpolateInferno)
		//.domain(d3.extent(data, function(d) { return d.value; }));
		.domain([-1,1]);
		
	// set the colour scale
	//var color = d3.scaleOrdinal(d3.schemeCategory10);
			
			
  // add the squares
	svg.selectAll()
		.data(data, function(d) {return d.x+':'+d.y;})
		.enter()
		.append("rect")
			  .attr("x", function(d) { return x(d.x) })
			  .attr("y", function(d) { return y(d.y + 10) })
			  .attr("rx", 4)
			  .attr("ry", 4)
			  //.attr("width", x.bandwidth() )
			  //.attr("height", y.bandwidth() )
			  
			  .attr("width", x(15) )
			  .attr("height", 20 )
			  .style("fill", function(d) { return myColor(d.value)} )
			  .style("stroke-width", 4)
			  .style("stroke", "none")
			  .style("opacity", 0.8)

}
