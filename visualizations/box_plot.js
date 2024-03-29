(function($) {

var w = 100;
var h = 300;
var m = [10, 40, 20, 40]; // top right bottom left
var  min = Infinity;
var max = -Infinity;

var chart = d3.chart.box()
    .whiskers(iqr(1.5))
    .width(w - m[1] - m[3])
    .height(h - m[0] - m[2]);

var render = function(opts) {

    var sel = opts.selector;

    d3.csv(opts.dataFile, function(csv) {
      var data = [];
    
      csv.forEach(function(x) {
        var e = ~~x.Expt - 1,
            r = ~~x.Run - 1,
            s = ~~x.Speed,
            d = data[e];
        if (!d) d = data[e] = [s];
        else d.push(s);
        if (s > max) max = s;
        if (s < min) min = s;
      });
    
     // chart.domain([min, max]);
      
      var vis = d3.select(sel).selectAll("svg")
          .data(data)
        .enter().append("svg")
          .attr("class", "box")
          .attr("width", w)
          .attr("height", h)
        .append("g")
          .attr("transform", "translate(" + m[3] + "," + m[0] + ")")
          .call(chart);
    
      chart.duration(1000);
      window.transition = function() {
        vis.map(randomize).call(chart);
      };
    });
};

function randomize(d) {
  if (!d.randomizer) d.randomizer = randomizer(d);
  return d.map(d.randomizer);
}

function randomizer(d) {
  var k = d3.max(d) * .02;
  return function(d) {
    return Math.max(min, Math.min(max, d + k * (Math.random() - .5)));
  };
}

// Returns a function to compute the interquartile range.
function iqr(k) {
  return function(d, i) {
    var q1 = d.quartiles[0],
        q3 = d.quartiles[2],
        iqr = (q3 - q1) * k,
        i = -1,
        j = d.length;
    while (d[++i] < q1 - iqr);
    while (d[--j] > q3 + iqr);
    return [i, j];
  };
}

$._.box_plot = {
    render  : function(opts) {
        render(opts);
    }
}

}(jQuery));