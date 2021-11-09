//credits to Danilo Guanabara
//void mainImage( out vec4 fragColor, in vec2 fragCoord ){
// 	vec3 c;
// 	float l,z=t;
// 	for(int i=0;i<3;i++) {
// 		vec2 uv,p=fragCoord.xy/r;
// 		uv=p;
// 		p-=.5;
// 		p.x*=r.x/r.y;
// 		z+=.07;
// 		l=length(p);
// 		uv+=p/l*(sin(z)+1.)*abs(sin(l*9.-z-z));
// 		c[i]=.01/length(mod(uv,1.)-.5);
// 	}
// 	fragColor=vec4(c/l,t);
// }
//https://www.shadertoy.com/view/wsSfDD
fn drawLight( uv: vec2<f32> ) -> vec4<f32> {
    let time = u.time * .001;
    let fragCoord = vec2<f32>(uv.x, uv.y);
    var base = vec4<f32>(cos(u.time), .5, sin(u.time), 1.);
    let dist = distance( fragCoord, vec2<f32>(u.mouseX,  u.mouseY));
    var color = vec4<f32>(.5, .3, sin(u.time * .00001), 1.);
	var l = time;
    var z = time;
    var r = vec2<f32>(u.width, u.height);
	for(var i=0;i<3;i =i + 1) {
		var p=fragCoord.xy;
        var texCoord = p;
	    //centered and more continuous - match orig
		p = p - .5;
	    p.x= p.x * (r.x/r.y);
		z= z + .07;
		l=length(p);
		texCoord =
        texCoord + p/l*(sin(z)+1.)*abs(sin(l*9.-z-z));
        var modded = vec2<f32>(texCoord.x % .2, texCoord.y % 1.);
		color[i] = .3/length(modded) - 0.5;
        //color[i] = .01/length(mod(texCoord,1.) - 0.5);

	}
	// fragColor=vec4(c/l,t);
    return color;
}

[[stage(fragment)]]
fn main_fragment(in: VertexOutput) -> [[location(0)]] vec4<f32> {
    return drawLight(in.uv);
}
  