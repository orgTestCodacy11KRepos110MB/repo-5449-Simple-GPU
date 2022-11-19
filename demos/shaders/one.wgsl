
//https://www.shadertoy.com/view/mdXSDn
fn translate(p:vec2<f32>, v:vec2<f32>) {
  return p - v;
}

fn sdSphere(p:vec2<f32>, size:f32) {
  return length(p) - size;
}

fn sdBox( p:vec2<f32>, b:vec2<f32>) {
  var d = abs(p) - b;
}

fn ndot(a:vec2<f32>, b:vec<f32>){}

fn sdRhomabus( vec2<f32>:p, v:vec2<f32>){}


  @fragment
  fn main_fragment(
    @location(0) fragUV: vec2<f32>,
        @location(1) fragPosition: vec4<f32>
  ) -> @location(0) vec4<f32> {    
    var color = vec4<f32>(1., 1., 0., 1.);
    if (fragUV.x < .3) { color.x = 0.; }

    var p = fragUV;
    var q = (p.x % 25. * 2.0 < 25.) == (p.y % 25. * 2.0 < 25.);
    var o = f32(q);

    var myz = 

    return vec4<f32>(o,o, u.mouseX, 1.0) * .5;
}