initSunburst()

$(window).on('resize', function () {
	$('#tool').remove()
	$('svg').remove()
	_.defer(initSunburst, 300)
})

function initSunburst () {

$('#tool').remove()
$('svg').remove()

var screen_width;

if (window.screen.width > window.screen.height) {
	screen_width = window.screen.availHeight
} else {
	screen_width = window.screen.availWidth
}

var depth = 1

var margin = {top: screen_width, right: screen_width, bottom: screen_width, left: screen_width},
	radius = Math.min(margin.top, margin.right, margin.bottom, margin.left) / 3;

function filter_min_arc_size_text(d, i) {return (d.dx*d.depth*radius/3)>14};

var lastItem;
var lastZoomInColor;

var hue = d3.scale.category10();

var color = d3.scale.category20();

var color = d3.scale.ordinal()
  // .domain(["New York", "San Francisco", "Austin"])
  .range([
  	"#F44336",
  	"#E91E63",
  	"#9C27B0",
  	"#673AB7",
  	"#3F51B5",
  	"#2196F3",
  	"#039BE5",
  	"#0097A7",
  	"#009688",
  	"#43A047",
  	"#689F38",
  	"#827717",
  	"#EF6C00",
  	"#FF5722",
  	"#795548",
  	"#757575",
  	"#607D8B",
  	]);

var luminance = d3.scale.sqrt()
	.domain([0, 1e6])
	.clamp(true)
	.range([90, 20]);

var svg = d3.select("body").append("svg")
	.attr("id", "circle1")
	.attr("width", screen_width)
	.attr("height", '100%')
	.append("g")
	.attr("transform", "translate(" + screen_width / 2 + ", " + (screen_width / 2 - window.screen.availTop * 2) + ")")
	.style("filter", "url(#drop-shadow)")

var partition = d3.layout.partition()
	.sort(function(a, b) { return d3.ascending(a.name, b.name); })
	.size([2 * Math.PI, radius])

var arc = d3.svg.arc()
	.startAngle(function(d) { return d.x; })
	.endAngle(function(d) { return d.x + d.dx - .01 / (d.depth + .5); })
	.innerRadius(function(d) { return radius / 3 * d.depth; })
	.outerRadius(function(d) { return radius / 3 * (d.depth + 1) - 1; });

var filter = svg.append("filter")
    .attr("id", "drop-shadow")
    .attr("height", "130%")

// SourceAlpha refers to opacity of graphic that this filter will be applied to
// convolve that with a Gaussian with standard deviation 3 and store result
// in blur
filter.append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("stdDeviation", 8)
    .attr("result", "blur")

// translate output of Gaussian blur to the right and downwards with 2px
// store result in offsetBlur
filter.append("feOffset")
    .attr("in", "blur")
    .attr("dx", 3)
    .attr("dy", 3)
    .attr("result", "offsetBlur")

filter.append("feFlood")
    .attr("flood-color", "#999")
    // .attr("flood-opacity", 1)
    .attr("result", "offsetColor")

filter.append("feComposite")
    .attr("in", "offsetColor")
    .attr("in2", "offsetBlur")
    .attr("operator", 'in')
    .attr("result", "offsetBlur")


var feMerge = filter.append("feMerge");

feMerge.append("feMergeNode")
    .attr("in", "offsetBlur")
feMerge.append("feMergeNode")
    .attr("in", "SourceGraphic");

//Tooltip description
var tooltip = d3.select("body")
	.append("div")
	.attr("id", "tooltip")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("opacity", 0);

function format_number(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function format_description(d) {
	var description = d.description;
	if (d.parent)
		return  '<b>' + d.parent.name + ' '+ d.name + ' (' + format_number(d.value) + ')';
	else
		return  '<b>' + d.name + ' '+ d.description + ' (' + format_number(d.value) + ')';
}

function computeTextRotation(d) {
	var angle=(d.x +d.dx/2)*180/Math.PI - 90

	return angle;
}

function mouseOverArc(d) {
	 d3.select(this).attr("stroke","#C6FF00")

	tooltip.html(format_description(d));
	return tooltip.transition()
	.duration(50)
	.style("opacity", 0.9);
}

function mouseOutArc(){
	d3.select(this).attr("stroke","")
	return tooltip.style("opacity", 0);
}

function mouseMoveArc (d) {
	return tooltip
	// .style("top", (d3.event.pageY-10)+"px")
	// .style("left", (d3.event.pageX+10)+"px");
}

var root_ = null;
d3.json("./data.json", function(error, root) {
	if (error) return console.warn(error);
	// Compute the initial layout on the entire tree to sum sizes.
	// Also compute the full name and fill color for each node,
	// and stash the children so they can be restored as we descend.

	partition
		.value(function(d) { return d.size; })
		.nodes(root)
		.forEach(function(d) {
		d._children = d.children;
		d.sum = d.value;
		d.key = key(d);
		d.fill = fill(d);
		});

	// Now redefine the value function to use the previously-computed sum.
	partition
		.children(function(d, depth) { return depth < 3 ? d._children : null; })
		.value(function(d) {
			return d.sum || _.random(40000, 50000);
		});

	var gg = svg.append('g')

	var center = gg.append("circle")
		.attr('fill', 'transparent')
		.attr('stroke', 'white')
		.attr('stroke-width', 2)
		.attr("r", radius / 3)
		.on("click", function (p) {

			if (!p) {

				tooltip.html(format_description(root));
							tooltip.transition()
							.duration(50)
							.style("opacity", 0.9);
			}
			zoomOut(p)
		});

	center
		.append("title")
		.text("zoom out");

	var partitioned_data=partition.nodes(root).slice(1)

	var path = svg.selectAll("path")
		.data(partitioned_data)
		.enter().append("path")
		.attr("d", arc)
		.style("fill", function(d) { return color((d.children ? d : d.parent).name); })
		// .style("fill", function(d) { return d.fill; })
		.each(function(d) { this._current = updateArc(d); })
		.on("click", function (p) {
			center.attr('fill', this.style.fill)
			zoomIn(p)
		})
		.on("mouseover", mouseOverArc)
		.on("mousemove", mouseMoveArc)
		.on("mouseout", mouseOutArc);


	var texts = svg.selectAll("text")
		.data(partitioned_data)
		.enter().append("text")
		.filter(filter_min_arc_size_text)
		.attr("transform", function(d) { return "rotate(" + computeTextRotation(d) + ")"; })
		.attr("x", function(d) { return radius / 3 * d.depth; })
		.attr("dx", "6") // margin
		.attr("dy", ".35em") // vertical-align
		.text(function(d,i) {
			if (d.depth == depth)
				return d.name
			// return d.name
		})
		.attr("pointer-events", "none")
		.attr('fill', 'white')
		.attr('z-index', 999)

	var currentPoint = gg.append('text')
		.style('text-anchor', 'middle')
		.style('fill', 'black')
		.text(root.name)
		.attr("pointer-events", "none")
		.attr('dy', 6)

	function zoomIn(p, node) {
	if (p.depth > 1) p = p.parent;
	if (!p.children) return;
	zoom(p, p);
	currentPoint
		.text(p.name)
		.style('fill', 'white')
	}

	function zoomOut(p) {``
	if (!p || !p.parent) return;
	zoom(p.parent, p);
		if (p.parent && !p.parent.parent) {
			currentPoint.style('fill', 'black')
			center.attr('fill', 'transparent')
		}
		currentPoint.text(p.parent.name)
	}

	// Zoom to the specified new root.
	function zoom(root, p) {
	if (document.documentElement.__transition__) return;

	// Rescale outside angles to match the new layout.
	var enterArc,
		exitArc,
		outsideAngle = d3.scale.linear().domain([0, 2 * Math.PI]);

	function insideArc(d) {
		return p.key > d.key
			? {depth: d.depth - 1, x: 0, dx: 0} : p.key < d.key
			? {depth: d.depth - 1, x: 2 * Math.PI, dx: 0}
			: {depth: 0, x: 0, dx: 2 * Math.PI};
	}

	function outsideArc(d) {
		return {depth: d.depth + 1, x: outsideAngle(d.x), dx: outsideAngle(d.x + d.dx) - outsideAngle(d.x)};
	}

	center.datum(root);

	// When zooming in, arcs enter from the outside and exit to the inside.
	// Entering outside arcs start from the old layout.
	if (root === p) enterArc = outsideArc, exitArc = insideArc, outsideAngle.range([p.x, p.x + p.dx]);

	var new_data=partition.nodes(root).slice(1)

	path = path.data(new_data, function(d) { return d.key; });

	 // When zooming out, arcs enter from the inside and exit to the outside.
	// Exiting outside arcs transition to the new layout.
	if (root !== p) enterArc = insideArc, exitArc = outsideArc, outsideAngle.range([p.x, p.x + p.dx]);

	d3.transition().duration(d3.event.altKey ? 7500 : 750).each(function() {
		path.exit().transition()
			.style("fill-opacity", function(d) { return d.depth === 1 + (root === p) ? 1 : 0; })
			.attrTween("d", function(d) { return arcTween.call(this, exitArc(d)); })
			.remove();

		path.enter().append("path")
			.style("fill-opacity", function(d) { return d.depth === 2 - (root === p) ? 1 : 0; })
			.style("fill", function(d) { return color((d.children ? d : d.parent).name); })
			// .style("fill", function(d) { return d.fill; })
			.on("click", function (p) {
				center.attr('fill', this.style.fill)
				zoomIn(p)
			})
			 .on("mouseover", mouseOverArc)
		 .on("mousemove", mouseMoveArc)
		 .on("mouseout", mouseOutArc)
			.each(function(d) { this._current = enterArc(d); });

		path.transition()
			.style("fill-opacity", 1)
			.style("fill", function(d) { return color((d.children ? d : d.parent).name); })
			.attrTween("d", function(d) { return arcTween.call(this, updateArc(d)); });

	});

	texts = texts.data(new_data, function(d) { return d.key; })

	texts.exit()
		 .remove()

	texts.enter()
		.append("text")

	texts.style("opacity", 0)
		.attr("transform", function(d) { return "rotate(" + computeTextRotation(d) + ")"; })
		.attr("x", function(d) { return radius / 3 * d.depth; })
		.attr("dx", "6") // margin
		.attr("dy", ".35em") // vertical-align
		.filter(filter_min_arc_size_text)
		.text(function(d,i) {
			if (d.depth == depth)
				return d.name
		})
		.transition().delay(750).style("opacity", 1)
		.attr("pointer-events", "none")
		.attr('fill', 'white')
	}
});

function key(d) {
	var k = [], p = d;
	while (p.depth) k.push(p.name), p = p.parent;
	return k.reverse().join(".");
}

function fill(d) {
	var p = d;
	while (p.depth > 1) p = p.parent;
	var c = d3.lab(hue(p.name));
	c.l = luminance(d.sum);
	return c;
}

function arcTween(b) {
	var i = d3.interpolate(this._current, b);
	this._current = i(0);
	return function(t) {
	return arc(i(t));
	};
}

function updateArc(d) {
	return {depth: d.depth, x: d.x, dx: d.dx};
}

d3.select(self.frameElement).style("height", margin.top + margin.bottom + "px");

}
