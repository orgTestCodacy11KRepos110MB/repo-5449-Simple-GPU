fn sphIntersect(ro:vec3<f32>, rd:vec3<f32>, sph:vec4<f32>) -> f32 {
  var oc = ro - sph.xyz;
  var b = dot(oc, rd);
  var c = dot(oc, oc) - sph.w * sph.w;
  var h = b*b -c;
  if ( h < 0.0 ) { return - 1.0; }
  h = sqrt(h);
  return -b - h;
}

// fn sphere(ro: vec3<f32>, rd: vec3<f32>){
//         var b = dot(ro, rd);
//         var c = dot(ro,ro)-1.0;
//         var h = b * b -c;
//         return h<0.0 ? -1.0 : -b - sqrt(h);
// }

fn xrot(angle:f32) -> mat3x3<f32> {
    var m = mat3x3<f32>
    ( 1.6, 0.0, 0.0,
      0.0, cos(angle), -sin(angle),
      0.0, sin(angle), cos(angle)
    );
    // var m[0] = vec3<f32>(1.0, 0.0, 0.0);
    // var m[1] = vec3<f32>(0.0, cos(angle), -sin(angle));
    // var m[2] = vec3<f32>(0.0, sin(angle), cos(angle));
    return m;
}

fn yrot(angle: f32) -> mat3x3<f32> {
    var m = mat3x3<f32>(cos(angle), 0.0, 0.0,
      0.0, cos(angle), -sin(angle),
      0.0, sin(angle), cos(angle)
    );
    // var m[0] = vec3<f32>(1.0, 0.0, 0.0);
    // var m[1] = vec3<f32>(0.0, cos(angle), -sin(angle));
    // var m[2] = vec3<f32>(0.0, sin(angle), cos(angle));
    return m;
}

// fn render (uv: vec2<f32>, time: f32,) -> vec4<f32> {
// }

fn intersectSphere(camera: vec3<f32>, ray:vec3<f32>, sphereOrigin:vec3<f32>, sphereRadius:f32) -> f32 {
    var radiusSquared = sphereRadius * sphereRadius;
    var dt = dot(ray, sphereOrigin - camera);
    if (dt < 0.0) {
        return -1.0;
    }
    var tmp = camera - sphereOrigin;
    tmp.x = dot(tmp, tmp);
    tmp.x = tmp.x - dt * dt;
    if (tmp.x > radiusSquared) {
        return -1.0;
    }
    var distanceFromCamera = dt - sqrt(radiusSquared - tmp.x);
    return distanceFromCamera;
}

// @fragment
//   fn main_fragment(
//     @location(0) fragUV: vec2<f32>,
//     @location(1) fragPosition: vec4<f32>
//   ) -> @location(0) vec4<f32> {
//     var col = .1;    
//     var ssaa = 4;
//     var c = vec3<f32>(0.0);
//     var m = 0;
//     loop {
//         if (m > ssaa) {break;}
//             col += .1;
//         m++;
//     }
//     var cubemapVec2 = fragPosition.xy;
                   
//     // let color = render(fragUV, u.time);
//         var lightPosition = vec3<f32>(0.0, 0.0, -25.0);
//     var spherePosition = vec3<f32>(0.0, 0.0, 0.0);
//     var cameraPosition = vec3<f32>(0.0, 0.0, 0.0);
//     var sphereRadius = 1.4;


//     var fuv = fragUV * 2.0;
//     fuv.y -= 1.0;
//     fuv.x -= (1.0 / (u.width));

//     var pixelPosition = vec3<f32>(fuv.x / 5.0, fuv.y / 5.0, 1.0);

//     var ray = pixelPosition - cameraPosition;
//     ray = normalize(ray);

//     ray = ray * xrot(u.time * .3) * yrot(u.time * .3);
//     cameraPosition = cameraPosition * xrot(u.time * .3);

//     lightPosition = cameraPosition;

//     var distance = intersectSphere(cameraPosition, ray, spherePosition, sphereRadius);

//     if (distance > 0.0) {
//         var pointOfIntersection = cameraPosition +ray * distance;
//         var normal = normalize(pointOfIntersection - spherePosition);

//         var u = 0.5 + atan2(normal.z, normal.x) / (3.1415926 * 2.0);
//         var v = 0.5 - sin(normal.y) / -3.1415926;

//         var brightness = dot(normalize(lightPosition - spherePosition), normal);
//         if (brightness < 0.0) {
//             brightness = 0.0;
//         }
//         var cubemapVec2 = fuv.xy;
//         var time = sin(vec2<f32>(u.time, u.time) * .0001);

//         var outputColor = textureSample(myTexture, mySampler, cubemapVec2);
//         var x = u * 18.0;
//         var y = v * 10.0;
//         if (fract(x) < .1 || fract(y) < .1) {
//             outputColor *= 0.5;
//         }
//         return outputColor * brightness;
//     } else {
//         return vec4<f32>(0., 0., 0., 1.);
//     }

//     return vec4<f32>(col, col, col, 1.);
// }

@fragment
  fn main_fragment(
     @location(0) fragUV: vec2<f32>,
     @location(1) fragPosition: vec4<f32>
  ) ->  @location(0) vec4<f32> {
    var col = .55;    
    return vec4<f32>(col, col, col, 1.);
  }