@fragment
fn main_fragment(
  @location(0) fragUV: vec2<f32>,
    @location(1) fragPosition: vec4<f32>
) -> @location(0) vec4<f32> {
  let value = vec4<f32>(1., .5, .1, 1.);

  return value;
}