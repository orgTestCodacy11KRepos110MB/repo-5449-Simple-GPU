var  size  = 0.75 ;
var  offc  = 1.05;
var  width = 0.0125;
var  rep   = 15 ;

var plnormal = normalize(vec3(1, 1, -1));
var n1 = normalize(vec3(-PHI,PHI-1.0,1.0));
var n2 = normalize(vec3(1.0,-PHI,PHI+1.0));
var n3 = normalize(vec3(0.0,0.0,-1.0));

fn pmin( a:f32,  b: f32,  k:f32) {
  var h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
  return mix( b, a, h ) - k*h*(1.0-h);
}

fn dodec(  z:vec3<f32>) {
  var p = z;
  var t;
  z = abs(z);
  t=dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
  t=dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
  z = abs(z);
  t=dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
  t=dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
  z = abs(z);

  var dmin=dot(z-vec3(size,0.,0.),plnormal);
        
  dmin = abs(dmin) - width*7.5*(0.55 + 0.45*sin(10.0*length(p) - 0.5*p.y + TTIME/9.0));
        
  return dmin;
}

void rot(p:vec2<f32>, a:f32) {
  var c = cos(a);
  var s = sin(a);
  p = vec2(c*p.x + s*p.y, -s*p.x + c*p.y);
}

fn df( p:vec2<f32>) {
  var d = 100000.0;
  var off = 0.30  + 0.25*(0.5 + 0.5*sin(TTIME/11.0));
  for (int i = 0; i < rep; ++i) {
    var ip = p;
    rot(ip, float(i)*TAU/float(rep));
    ip -= vec2(offc*size, 0.0);
    vec2 cp = ip;
    rot(ip, TTIME/73.0);
    var dd = dodec(vec3(ip, off*size));
    var cd = length(cp - vec2(0.25*sin(TTIME/13.0), 0.0)) - 0.125*size;
    cd = abs(cd) - width*0.5;
    d = pmin(d, dd, 0.05);
    d = pmin(d, cd, 0.025);
  }
  return d;
}



fn mainImage( ) {
 var mouse = (u.mouseX, u.mouseY);
    

  var q = fragCoord.xy / iResolution.xy;
  var p = 2.0*(q - 0.5) * (mouse.x*2.0);
  p.x *= iResolution.x/iResolution.y;
  var d = df(p);

  var fuzzy = 0.0025;
    
  var col = vec3<f32>(0.0);

  var baseCol = vec3<f32>(240.0, 175.0, 20.0)/255.0;
  
  col += (mouse.y*2.0)*0.9*baseCol*vec3(smoothstep(fuzzy, -fuzzy, d));

  rgb = 0.5 + 0.5*vec3(sin(TAU*vec3(50.0, 49.0, 48.0)*(d - 0.050) + TTIME/3.0));

  col += baseCol.xyz*pow(rgb, vec3(8.0, 9.0, 7.0)); 
  col *= 1.0 - tanh(0.05+length(8.0*d));

  var phase = TAU/4.0*(-length(p) - 0.5*p.y) + TTIME/11.0;
 
  var wave = sin(phase);
  var fwave = sign(wave)*pow(abs(wave), 0.75);
 
  col = abs(0.79*(0.5 + 0.5*fwave) - col);
  col = pow(col, vec3<f32>(0.25, 0.5, 0.75));
  //col = postProcess(col, q, p);

  fragColor = vec4<f32>(col, 1.0);
}
