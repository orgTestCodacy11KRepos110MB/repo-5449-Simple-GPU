
//https://webgpuniverse.netlify.app/editor
const size = 3.0;
const b = 0.003;		//size of the smoothed border

fn field(pin: vec3<f32>) -> vec3<f32> {
    var p = pin * 0.1;
    var f = 0.1;
    for (var i: i32; i < 5; i = i + 1) {
        p = vec3<f32>(p[1], p[2], p[0]) * mat3x3<f32>(vec3<f32>(0.8, 0.6, 0.0), vec3<f32>(-0.6, 0.8, 0.0), vec3<f32>(0.0, 0.0, 1.0));
        p = p + vec3<f32>(0.123, 0.456, 0.789) * f32(i);
        p = abs(fract(p) - 0.5);
        p = p * 2.0;
        f = f * 2.0;
    }
    p = p * p;
    return sqrt(p + vec3<f32>(p[1], p[2], p[0])) / f - 0.002;
};

@fragment
fn main_fragment(
      @location(0) fragUV: vec2<f32>,
        @location(1) fragPosition: vec4<f32>
) -> @location(0) vec4<f32> {
    var time = u.time / 500.0;
    var mouse = vec2<f32>(u.mouseX, u.mouseY);
    mouse = mouse / 100.0;
    var pos = fragPosition;
    var res = vec2<f32>(u.width / 1000., u.height / 3000.);

   const maxiter: i32 = 90;

    var dir = normalize(vec3<f32>((pos.xy - res * .5) / res[0], 1.0));
    var position = vec3<f32>(mouse + .1, time);
    var color = vec3<f32>(0.0);
    
    for (var i: i32 = 0; i < maxiter; i = i + 1) {
        var f2 = field(position);
        var f = min(min(f2[0], f2[1]), f2[2]);
        position = position + dir * f;
        color = color + f32(maxiter - i) / (f2 + .01);
    }

    var color3 = vec3<f32>(.0 - 1.0 / (1 + color * (.09 / f32(maxiter * maxiter))));
    color3 = color3 * color3;
    return 1.0 - vec4<f32>(color3[1], color3[2], color3[0], 1.0);
};

