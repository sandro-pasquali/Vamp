
(function($) {

var render = function(opts) {

    var sel = opts.selector;

    var svg = d3.select(sel)
      .append("svg")
        .call(d3.behavior.zoom()
        .on("zoom", redraw))
      .append("g");
    
    var counties = svg.append("g")
        .attr("id", "counties");
    
    var path = d3.geo.path();
    
    var fill = d3.scale.log()
        .domain([10, 500])
        .range(["brown", "steelblue"]);
    
    d3.json("gui/d3/examples/data/us-counties.json", function(json) {
      counties.selectAll("path")
          .data(json.features)
        .enter().append("path")
          .attr("d", path)
          .attr("fill", function(d) { return fill(path.area(d)); });
    });
    
    function redraw() {
      svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
}

$._.heatmap = {
    render  : function(opts) {
        render(opts);
    }
}

}(jQuery));