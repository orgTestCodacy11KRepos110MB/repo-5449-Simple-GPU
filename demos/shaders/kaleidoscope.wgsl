@fragment
fn main_fragment(

       @location(0) fragUV: vec2<f32>,
    @location(1) fragPosition: vec4<f32>,

) -> @location(0) vec4<f32> {
var color =  vec4<f32>(.5);
var speed_modifier = 0.0005;
var halfPhase =  3.5;

var activeTime = u.time * speed_modifier;

var col = vec3<f32>(0);
var timeMorph = 0.0;

var p = -1.0 + 4.0 * fragPosition.xy / vec2<f32>(u.width, u.height);

p *= 7.0;

var a = atan2(p.x, p.y);
var r = sqrt(dot(p, p));

    if (activeTime % 2.0 * halfPhase < halfPhase) {
        timeMorph = (halfPhase - activeTime  % halfPhase);
    } else {
        timeMorph = (halfPhase - (activeTime % halfPhase));
    }

    timeMorph = 2.0 * timeMorph + 1.0;

    var w = 0.25 + 3.0 * (sin(activeTime + 1.0 * 4) + 3.0 * cos(activeTime + 5.0 * a) / timeMorph);
    var x = 0.8 + 3.0 * (sin(activeTime + 1.0 * r) + 3.0 * cos(activeTime + 5.0 * a) / timeMorph);

    

    col = vec3<f32>(0.1, 0.1, 0.82) * 1.1;


    return vec4<f32>(col*w*x, 1.0);
}