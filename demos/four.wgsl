let size = 30.0;
let b = 0.003;		//size of the smoothed border
    fn mainImage(fragCoord: vec2<f32>, iResolution: vec2<f32>) -> vec4<f32> {
      let aspect = iResolution.x/iResolution.y;
      let position = (fragCoord.xy/iResolution.xy) * aspect;
      let dist = distance(position, vec2<f32>(aspect*0.5, 0.5));
      let offset=u.time;
      let conv=4.;
      let v=dist*4.-offset;
      let ringr=floor(v);
      //let color=smoothstep(-b, b, abs(dist- (ringr+float(fract(v)>0.5)+offset)/conv));
      //let color=smoothstep(-b, b, abs(dist- (ringr+((v)>0.5)+offset)/conv));
      var color = b;
      if (ringr % 2. ==1.) {
       color=2.-color;
      }

    if (fragCoord.x > .5) {color = .5; }
    return vec4<f32>(.5, 0., color, 1.);
  };


  fn main(uv: vec2<f32>) -> vec4<f32> {
    let fragCoord = vec2<f32>(uv.x, uv.y);
    var base = vec4<f32>(cos(u.time), .5, sin(u.time), 1.);
    let dist = distance( fragCoord, vec2<f32>(u.mouseX,  u.mouseY));
    return vec4<f32>(.3, .3, sin(u.time), 1.) + mainImage(fragCoord, vec2<f32>(u.width, u.height));
  }

  [[stage(fragment)]]
  fn main_fragment(in: VertexOutput) -> [[location(0)]] vec4<f32> {
    return main(in.uv);
  }
  
  precision highp float;

#define BG_COLOR     vec4(1.0, 0.4313, 0.3411, 1.0)
#define FILL_COLOR   vec4(0.3804, 0.7647, 1.0, 1.0)

// void mainImage( out vec4 fragColor, in vec2 fragCoord )
// {    
//     vec2 v = fragCoord.xy;
//     v.x += sin(iTime * 10.0) * 30.0;
//     v.y += cos(iTime * 10.0) * 30.0;
    
//     fragColor = BG_COLOR;
    
//     if (mod(v.y, 32.0) < 16.0) {
//         if (mod(v.x, 32.0) > 16.0)
//             fragColor = FILL_COLOR;
//     } else {
//         if (mod(v.x, 32.0) < 16.0)
//             fragColor = FILL_COLOR;
//     }
// }
