/*These lines are all chart setup.  Pick and choose which chart features you want to utilize. */

var lotka_coefs = {'a': 0.04,
                   'b': 0.0005,
                   'c': 0.0001,
                   'd': 0.05,
                   'e': 0.1,
                   'x0': 200,
                   'y0': 50};

var lotka_ids_to_coefs = {
  'aValueLotka': 'a',
  'bValueLotka': 'b',
  'cValueLotka': 'c',
  'dValueLotka': 'd',
  'eValueLotka': 'e',
  'x0ValueLotka': 'x0',
  'y0ValueLotka': 'y0'
};

var chart_names = ["Forward Euler Method", "Midpoint Method"];

function calc_lv(r, f){
  var dx = r * (lotka_coefs['a'] - lotka_coefs['b'] * f - lotka_coefs['c']);
  var dy = f * (lotka_coefs['e'] * lotka_coefs['b'] * r - lotka_coefs['d']);
  return {'dx': dx, 'dy': dy};
}

function create_chart(el_id, name){
  var chart = nv.models.lineChart()
                .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
                .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
                .transitionDuration(350)  //how fast do you want the lines to transition?
                .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
                .showYAxis(true)        //Show the y-axis
                .showXAxis(true)        //Show the x-axis
  ;
  d3.select(el_id + " svg")
    .append("text")
    .attr("x", 350)
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .text(name);

  chart.xAxis     //Chart x-axis settings
      .axisLabel('Time (days)')
      .tickFormat(d3.format(',r'));

  chart.yAxis     //Chart y-axis settings
      .axisLabel('Number of animals')
      .tickFormat(d3.format(',f'));


  d3.select(el_id + ' svg').datum(do_lotka(name)).call(chart);

  //Update the chart when window resizes.
  // nv.utils.windowResize(function() { chart.update() });
  return chart;
}


function filter_every_n(elements, n){
  var new_elements = [];
  var N = elements.length;
  for (var i=0; i< N; i++){
    if (i % n == 0)
      new_elements.push(elements[i]);
  }
  return new_elements;
}

function forward_euler_lotka(rabbits, foxes, coefs, dt, N){
  var dx=0, dy=0, res={};
  for (var i = 0; i < N; i++){
    res = calc_lv(rabbits[i].y, foxes[i].y);
    dx = res['dx'];
    dy = res['dy'];
    var t_new = Math.round(i * dt);
    rabbits[i + 1] = {x: t_new, y: rabbits[i].y + dt * dx};
    foxes[i + 1] = {x: t_new, y: foxes[i].y + dt * dy};
  }
  return [{values: rabbits, key: 'rabbits', color:'#2ca02c'},
          {values: foxes, key: 'foxes', color: '#7777ff'}];
}

function midpoint_lotka(rabbits, foxes, coefs, dt, N){
  var res={};
  for (var i = 0; i < N; i++){
    res = calc_lv(rabbits[i].y, foxes[i].y);
    res = calc_lv(rabbits[i].y + dt * res['dx']/2,
                  foxes[i].y + dt * res['dy']/2)
    var t_new = Math.round(i * dt);
    rabbits[i + 1] = {x: t_new, y: rabbits[i].y + dt * res['dx']};
    foxes[i + 1] = {x: t_new, y: foxes[i].y + dt * res['dy']};
  }
  return [{values: rabbits, key: 'rabbits', color:'#2ca02c'},
          {values: foxes, key: 'foxes', color: '#7777ff'}];
}


function do_lotka(integration){
  var rabbits = [], foxes = [];
  var dt = 0.1;
  var days = 365 * 2;
  var N = Math.floor(days/dt);
  rabbits[0] = {x: 0, y: lotka_coefs['x0']};
  foxes[0] = {x: 0, y: lotka_coefs['y0']};

  if (integration == chart_names[0]){
    arr = forward_euler_lotka(rabbits, foxes, lotka_coefs, dt, N);
  }
  else if (integration == chart_names[1]){
    arr = midpoint_lotka(rabbits, foxes, lotka_coefs, dt, N);
  }
  else{
    arr = [];
  }
  arr[0]['values'] = filter_every_n(arr[0]['values'], 20)
  arr[1]['values'] = filter_every_n(arr[1]['values'], 20)
  return arr;
}

// var lotka_chart1 = create_chart('#lv_euler', chart_names[0]);
var lotka_chart2 = create_chart('#lv_midpoint', chart_names[1]);
// nv.addGraph(lotka_chart1);
nv.addGraph(lotka_chart2);

for (var k in lotka_coefs){
  d3.select("#" + k + "ValueLotka").on("input", update);
}

function update() {
  lotka_coefs[lotka_ids_to_coefs[this.id]] = +this.value;
  // d3.select('#lv_euler svg')
  //   .datum(do_lotka(chart_names[0])).call(lotka_chart1);
  d3.select('#lv_midpoint svg')
    .datum(do_lotka(chart_names[1])).call(lotka_chart2);
}
