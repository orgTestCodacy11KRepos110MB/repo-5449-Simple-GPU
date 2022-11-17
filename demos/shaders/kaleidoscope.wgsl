fn palette(  t: f32, a: vec3<f32>,  b: vec3<f32>, c:vec3<f32>, d:vec3<f32>) -> vec3<f32> {
    return a + b*cos( 6.28318*(c*t+d) );
}

@fragment
fn main_fragment(
       @location(0) fragUV: vec2<f32>,
    @location(1) fragPosition: vec4<f32>,
) -> @location(0) vec4<f32> {
var color =  vec4<f32>(.5);
var speed_modifier = 0.0005;
var halfPhase =  7.5;

var activeTime = u.time * speed_modifier;

var col = vec3<f32>(0);
var timeMorph = 0.0;

var p = -1.0 + 3.0 * ((fragPosition.xy - vec2<f32>(-1, -1) )* 100. )  / vec2<f32>(u.width, u.height);

p *= 99.0;

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

    	var m = fragUV.xy / vec2<f32>(u.width, u.height);


    col = palette(
        m.x, vec3<f32>(0.9,0.5,0.4),
        vec3<f32>(0.8,8.4,0.2), 
        vec3<f32>(9.1,1.0,9.0),
        vec3<f32>(0.0,0.25,0.25) 
    ) * 1.1;


    return vec4<f32>(col*w*x, 1.0);
}