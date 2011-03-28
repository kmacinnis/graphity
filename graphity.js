var width, height, xmin, xmax, ymin, ymax,
	xscale, yscale, xaxis, yaxis, tool, plane,
	paper, dotty, 
	temp_point, temp_graph;

var pointlist = [];
var line


$(document).ready(function() {
	toolpicker = $("#toolpicker :radio");
	toolpicker.click(function() {
		tool = $("input[name='toolgroup']:checked").val();
		temp_point = false;
		console.log(tool);
	});
	$("#clearbtn").click(function() {
		paper.clear();
		grid = paper.set();
		drawgrid(grid);
		temp_point = null;
		// temp_graph = null;
		for(var i = 0; i < toolpicker.length; i++) {
			toolpicker[i].checked = false;
		};
	});
		
	for(var i = 0; i < toolpicker.length; i++) {
		toolpicker[i].checked = false;
	};
	
	$("#plane").mousemove(papermovement);
	$("#plane").mouseenter(paperactivate);
	$("#plane").mouseleave(paperdeactivate);
	$("#plane").click(paperclick);

});


function init() {
	plane = document.getElementById("plane");
	width = plane.width || 400;
	height = plane.height || 400;

	xmin = -20,
	xmax = 20,
	ymin = -20,
	ymax = 20,

	xscale = width / (xmax - xmin);
	yscale = height / (ymax - ymin);
	xaxis = Math.round(width / 2);
	yaxis = Math.round(height / 2);
	paper = Raphael("plane", width, height);
	grid = paper.set();
	drawgrid(grid);

}





function drawgrid(grid) {

	for (var i = xmin; i <= xmax; i += 1) {
		var c = paper.path(makelinestring(ccx(i), ccy(ymin), ccx(i), ccy(ymax)));
		c.attr({stroke: 'gray', 'stroke-width': .3 });
		grid.push(c)
	}

	for (var i = ymin; i <= ymax; i += 1) {
		var c = paper.path(makelinestring(ccx(xmin), ccy(i), ccx(xmax), ccy(i)));
		c.attr({ stroke: 'gray', 'stroke-width': .3 });
		grid.push(c)
	}

	var d = paper.path(makelinestring(ccx(xmin), ccy(0), ccx(xmax), ccy(0)));
	d.attr({ stroke: 'black', 'stroke-width': 1 });
	grid.push(d);

	var d = paper.path(makelinestring(ccx(0), ccy(ymin), ccx(0), ccy(ymax)));
	d.attr({ stroke: 'black', 'stroke-width': 1 });
	grid.push(d);

}


function paperclick(event) {
	var d;
	Mouse = {
		x: event.pageX - this.offsetLeft,
		y: event.pageY - this.offsetTop
	};
	mousex = Math.round(Mouse.x / xscale) * xscale;
	mousey = Math.round(Mouse.y / yscale) * yscale;
	currentpoint = {
		x: ptx(mousex),
		y: pty(mousey)
	};
	if (tool==='point') {
		d = dotty.clone();
		pointlist.push(currentpoint);
	}
	else {
		if (!temp_point) {
			d = dotty.clone();
			temp_point = currentpoint;
		}
		else {
			d = dotty.clone();
			d = temp_graph.clone();
			temp_graph.remove();
			temp_graph = false;
			temp_point = false;			
		}
	};
}

function papermovement(event) {
	var drawit, forbidvert;
	Mouse = {
		x: event.pageX - this.offsetLeft,
		y: event.pageY - this.offsetTop
	}
	mousex = Math.round(Mouse.x / xscale) * xscale;
	mousey = Math.round(Mouse.y / yscale) * yscale;
	currentpoint = {
		x: ptx(mousex),
		y: pty(mousey)
	}
	dotty.animate({ cx: mousex, cy: mousey }, 30);
	$("#under").html("( " + ptx(mousex) + " , " + pty(mousey) + " )");
	switch (tool) {
		case 'line':
			drawit = drawline;
			forbidvert = false;
			break;
		case 'circle':
			drawit = drawcircle;
			forbidvert = false;
			break;
		case 'parabola':
			drawit = drawparabola;
			forbidvert = true;
			break;
		case 'sqrt':
			drawit = drawsqrt;
			forbidvert = true;
			break;
		case 'absval':
			drawit = drawabsvalue;
			forbidvert = true;
			break;
		case 'cubic':
			drawit = drawcubic;
			forbidvert = true;
			break;
		case 'cuberoot':
			drawit = drawcuberoot;
			forbidvert = true;
			break;	
	}
	if (drawit) {
		if (temp_point) {
			if (forbidvert && temp_point.x === currentpoint.x) {
				if (temp_graph) {
					temp_graph.remove();
					temp_graph = null;
				}
			}
			else {
				drawit(temp_point, currentpoint);
			}
		}
	}

};

function paperactivate(event) {
	Mouse = {
		x: event.pageX - this.offsetLeft,
		y: event.pageY - this.offsetTop
	}
	mousex = Math.round(Mouse.x / xscale) * xscale;
	mousey = Math.round(Mouse.y / yscale) * yscale;
	currentpoint = {
		x: ptx(mousex),
		y: pty(mousey)
	};
	if (tool) {
		dotty = paper.circle(mousex, mousey, 3).attr({ stroke: "none", fill: "#000099" });
	};

};

function paperdeactivate(event) {
	dotty.remove();
	dotty = false;
	$("#under").html("")
	if (temp_graph) {
		temp_graph.remove();
		temp_graph = null;
	};


};


function makelinestring(x1, y1, x2, y2) { return "M" + x1 + " " + y1 + " L " + x2 + " " + y2; };
function ccx(x) { return xaxis + x * xscale; };
function ccy(y) { return yaxis - y * yscale; };
function ptx(x) { return (x - xaxis) / xscale; };
function pty(y) { return - (y - yaxis) / yscale; };
function sign(num) {
	if (num > 0) return 1;
	if (num < 0) return -1;
	return 0;
};
function cbrt(num) {
	if (num >= 0) return Math.pow(num,1/3)
	else return -Math.pow(-num,1/3);
}


function drawline(pt1, pt2) {
	var edgept1, edgept2;
	if (pt1.x === pt2.x) {
		if (pt1.y === pt2.y) {
			edgept1 = pt1;
			edgept2 = pt2;
		}
		else {
			edgept1 = { x: pt1.x, y: ymin };
			edgept2 = { x: pt1.x, y: ymax };
		}
	}
	else {
		var m = (pt2.y - pt1.y) / (pt2.x - pt1.x);
		var ytemp1 = m * (xmin - pt1.x) + pt1.y
		var ytemp2 = m * (xmax - pt1.x) + pt1.y
		edgept1 = { x: xmin, y: ytemp1 };
		edgept2 = { x: xmax, y: ytemp2 };
	}
	connectdots(edgept1, edgept2)
}

function drawcircle(center, edge) {
	function distance(A,B) {
		return Math.sqrt(Math.pow((A.x-B.x),2) + Math.pow((A.y-B.y),2));
	}
	if (!temp_graph) {
		temp_graph = paper.circle(ccx(center.x),ccy(center.y),xscale*distance(center,edge)).attr({ stroke: 'purple', 'stroke-width': 1.5 });
	}
	else {
		temp_graph.animate({r:xscale*distance(center,edge)},30);
	}
}


function connectdots(A, B) {
	if (!temp_graph) {
		temp_graph = paper.path(makelinestring(ccx(A.x), ccy(A.y), ccx(B.x), ccy(B.y))).attr({ stroke: 'purple', 'stroke-width': 1.5 });
	}
	else {
		temp_graph.animate({path: makelinestring(ccx(A.x), ccy(A.y), ccx(B.x), ccy(B.y))},30);
	}
	
}

function drawparabola(vertex,point) {
	var my_x, my_y;
	var pathstring = "";
	var ML = "M";
	var a = (point.y - vertex.y)/Math.pow((point.x - vertex.x),2);
	
	for (var xi = 0; xi <= width; xi += 5) {
		my_x = ptx(xi);
		my_y = a * Math.pow((my_x - vertex.x),2) + vertex.y;
		pathstring += ML + ccx(my_x) + " " + ccy(my_y);
		ML = " L "
	};
	if (!temp_graph) {
		temp_graph = paper.path(pathstring).attr({ stroke: 'purple', 'stroke-width': 1.5 });
	} 
	else {
		temp_graph.animate({path:pathstring},30);
	}
}

function drawsqrt(vertex,point) {
	var my_x, my_y, a, yreflect, m;
	var pathstring = "";
	var ML = "M";	
	if ( point.x > vertex.x) {
		a = (point.y - vertex.y)/Math.sqrt(point.x - vertex.x);
		m = 1;
	}
	else {
		a = (vertex.y - point.y)/Math.sqrt(vertex.x - point.x);
		yreflect = true;
		m = -1;
	}	
	for (var xi = 0; xi <= width; xi += 1) {
		my_x = ptx(xi);
		my_y = a * m * Math.sqrt(m*(my_x - vertex.x)) + vertex.y;
		if ((( my_x >= vertex.x ) ^ (yreflect) ) || (my_x === vertex.x) ) {
			pathstring += ML + ccx(my_x) + " " + ccy(my_y);			
			ML = " L "
		}
	};
	if (!temp_graph) {
		temp_graph = paper.path(pathstring).attr({ stroke: 'purple', 'stroke-width': 1.5 });
	} 
	else {
		temp_graph.animate({path:pathstring},10);
	}
}


function drawabsvalue(vertex,point) {
	var my_x, my_y;
	var pathstring = "";
	var ML = "M";
	var a = (point.y - vertex.y)/(point.x - vertex.x) * sign(point.x - vertex.x);
	
	for (var xi = 0; xi <= width; xi += 5) {
		my_x = ptx(xi);
		my_y = a * Math.abs((my_x - vertex.x)) + vertex.y;
		pathstring += ML + ccx(my_x) + " " + ccy(my_y);
		ML = " L "
	};
	if (!temp_graph) {
		temp_graph = paper.path(pathstring).attr({ stroke: 'purple', 'stroke-width': 1.5 });
	} 
	else {
		temp_graph.animate({path:pathstring},30);
	}
}

function drawcubic(inflect,point) {
	var my_x, my_y;
	var pathstring = "";
	var ML = "M";
	var a = (point.y - inflect.y)/Math.pow((point.x - inflect.x),3);
	
	for (var xi = 0; xi <= width; xi += 5) {
		my_x = ptx(xi);
		my_y = a * Math.pow((my_x - inflect.x),3) + inflect.y;
		pathstring += ML + ccx(my_x) + " " + ccy(my_y);
		ML = " L "
	};
	if (!temp_graph) {
		temp_graph = paper.path(pathstring).attr({ stroke: 'purple', 'stroke-width': 1.5 });
	} 
	else {
		temp_graph.animate({path:pathstring},30);
	}
}

function drawcuberoot(inflect,point) {
	var my_x, my_y;
	var pathstring = "";
	var ML = "M";
	var a = (point.y - inflect.y)/cbrt((point.x - inflect.x));
	
	for (var xi = 0; xi <= width; xi += 1) {
		my_x = ptx(xi);
		my_y = a * cbrt((my_x - inflect.x)) + inflect.y;
		pathstring += ML + ccx(my_x) + " " + ccy(my_y);
		ML = " L "
	};
	if (!temp_graph) {
		temp_graph = paper.path(pathstring).attr({ stroke: 'purple', 'stroke-width': 1.5 });
	} 
	else {
		temp_graph.animate({path:pathstring},10);
	}
}