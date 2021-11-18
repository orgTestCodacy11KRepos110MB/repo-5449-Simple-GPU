[[stage(fragment)]]
  fn main_fragment(in: VertexOutput) -> [[location(0)]] vec4<f32> {
    let fragPosition = in.uv * vec2<f32>(u.height, u.width);
    var color = vec4<f32>(3., .3, .5, 1.);
    //if (fragPosition.x % 2. == 1.) { color.x = 0.;}
    var isEven = (in.uv.x * 10.) % 2. == 0.;
    if (isEven) { color.y = 0.;}

    return color;
}