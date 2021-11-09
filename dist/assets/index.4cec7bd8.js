var V=Object.defineProperty;var w=Object.getOwnPropertySymbols;var Y=Object.prototype.hasOwnProperty,X=Object.prototype.propertyIsEnumerable;var O=(e,t,o)=>t in e?V(e,t,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[t]=o,R=(e,t)=>{for(var o in t||(t={}))Y.call(t,o)&&O(e,o,t[o]);if(w)for(var o of w(t))X.call(t,o)&&O(e,o,t[o]);return e};import{l as S,c as L}from"./vendor.6dc65a70.js";const j=function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))r(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function o(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerpolicy&&(i.referrerPolicy=n.referrerpolicy),n.crossorigin==="use-credentials"?i.credentials="include":n.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(n){if(n.ep)return;n.ep=!0;const i=o(n);fetch(n.href,i)}};j();let G=`
    let size = 3.0;



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
    return vec4<f32>(.5, color, color, 1.);
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
  `,k={width:900,height:500,pixelRatio:2,time:0,mouseX:0,mouseY:0,angle:0};const $=async function(e){let{attribsBuffer:t,context:o,gpuDevice:r,pipeline:n,uniformsBuffer:i,renderPassDescriptor:a}=e;const c=r.createCommandEncoder(),s=o.getCurrentTexture().createView();a.colorAttachments[0].view=s;const u=c.beginRenderPass(a);u.setPipeline(n);const v=r.createBindGroup({layout:n.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:i}}]});u.setBindGroup(0,v),u.setVertexBuffer(0,t),u.draw(3*2,1,0,0),u.endPass(),r.queue.submit([c.finish()])};function P(e){let{data:t,gpuDevice:o,uniformsBuffer:r,state:n,renderPassDescriptor:i,pipeline:a,attribsBuffer:c}=e,s=Object.values(t),u=new Float32Array(s.length);return u.set(s,0,s.length),z(o,u,GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST)}function H(e,t,o){let r={vertex:{module:e,entryPoint:"main_vertex",buffers:[{arrayStride:Float32Array.BYTES_PER_ELEMENT*2,attributes:[{offset:0,shaderLocation:0,format:"float32x2"}]}]},fragment:{module:e,entryPoint:"main_fragment",targets:[{format:"bgra8unorm"}]},primitives:{topology:"triangle-list"}};return t.createRenderPipeline(r)}const z=(e,t,o)=>{let r={size:t.byteLength+3&~3,usage:o,mappedAtCreation:!0},n=e.createBuffer(r);return(t instanceof Uint16Array?new Uint16Array(n.getMappedRange()):new Float32Array(n.getMappedRange())).set(t),n.unmap(),n};function N(e,t,o){let r=o||G;const n=Object.keys(t).map(a=>`${a}: f32;`).join(`
`);return e.createShaderModule({code:`
  [[block]] struct Uniforms {
    ${n}
  };
  [[group(0), binding(0)]] var<uniform> u: Uniforms;
  // [[group(0), binding(1)]] var mySampler: sampler;
  // [[group(0), binding(2)]] var myTexture: texture_external;
  struct VertexInput {
    [[location(0)]] pos: vec2<f32>;
  };
  struct VertexOutput {
    [[builtin(position)]] pos: vec4<f32>;
    [[location(0)]] uv: vec2<f32>;
  };

  [[stage(vertex)]]
  fn main_vertex(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    var pos: vec2<f32> = input.pos * 3.0 - 1.0;
    output.pos = vec4<f32>(pos, 0.0, 1.0);
    output.uv = input.pos;
    return output;
  }
  ${r}`})}function W(){return console.log("todo")}async function Z(e){const t={data:e.data,canvas:e.canvas||W(),state:{}},o=t.canvas.value||t.canvas.getContext("webgpu"),r=await navigator.gpu.requestAdapter(),n=await r.requestDevice(),i=o.getPreferredFormat(r),a=[e.width*devicePixelRatio,e.height*devicePixelRatio];Object.assign(t,{gpuDevice:n,context:o,adapter:r}),o.configure({device:n,format:i,size:a});let c=N(n,k,e.shader);const s=H(c,n),u=o.getCurrentTexture().createView(),v={colorAttachments:[{view:u,loadValue:{r:0,g:0,b:0,a:1},storeOp:"store"}]};t.renderPassDescriptor=v,Object.assign(t,{textureView:u,renderPassDescriptor:v,pipeline:s});const U=new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]);t.attribsBuffer=z(n,U,GPUBufferUsage.VERTEX);function E(y){let q=P(t);return t.uniformsBuffer=q,$(t).finally(()=>{}),y}return{draw:E,canvas:e.canvas,updateUniforms:function(y){t.data=y,P(t)}}}var A={init:Z};async function K(){const e=document.createElement("video");return e.loop=!0,e.autoplay=!0,e.muted=!0,e.width="480",e.height="270",e.currentTime=25,e.loop=!0,e.crossorigin="anonymous",e.controls="true",e.src="./data/ue5-short.webm",e.style.zIndex=-1002,e.style.position="absolute",await e.play(),document.body.appendChild(e),e}let l={width:900,height:500,pixelRatio:2,time:0,mouseX:0,mouseY:0,angle:0};console.log("a");const x=960,_=500;async function J(){const e=document.createElement("canvas");e.addEventListener("mousemove",function(i){l.mouseX=i.clientX/x,l.mouseY=i.clientY/_});let t=Object.assign({},l);t.time=Date.now()%1e3;let o={data:t,canvas:e,width:x,height:_},r=await A.init(o);return r.draw(r)}async function Q(e){const t=document.querySelector(".three");let o=await K(),r=Object.assign({},l);r.texture=o;let n=R({data:r,canvas:t,width:x,height:_},e);n.width=t.clientWidth,n.height=t.clientHeight;let i=await A.init(n);requestAnimationFrame(function s(){l.time=performance.now(),i.updateUniforms(l),i.draw(i),requestAnimationFrame(s)});let a=S().domain([0,1]).range([0,.3]),c=S().domain([1,0]).range([0,1]);t.addEventListener("mousemove",function(s){l.mouseX=a(s.clientX/s.target.clientWidth),l.mouseY=c(s.clientY/s.target.clientHeight),i.updateUniforms(l)})}/*
 * From https://www.redblobgames.com/x/2122-shape-transition/
 * Copyright 2021 Red Blob Games <redblobgames@gmail.com>
 * @license CC-0 <https://creativecommons.org/share-your-work/public-domain/cc0/>
 */const C=2*Math.PI,d=1e5,ee=.9,te=.4;let p={circleCount1:1,multiplier1:1,circleCount2:6,multiplier2:4},g={alpha:.3,speed:.2,spread:.1,chromaticblur:.1};const f=L({canvas:document.querySelector(".two")});let I=f.buffer(d),B=f.buffer(d),ne=Array.from({length:d},e=>C*Math.random()),oe=Array.from({length:d},e=>Math.random());function M(e,t){if(t===1)return[[0,0]];let o=[];for(let r=0;r<t;r++){let n=r%t*C/t;o.push([e*Math.sin(n),e*Math.cos(n)])}return o}function T(e,t,o,r){let n=[];for(let i=0;i<d;i++){let a=ne[i],c=t[i%t.length];n.push(c[0]+o*Math.sin(r*a),c[1]+o*Math.cos(r*a))}e({data:n})}function re(){let e=ee,t=te;T(I,M(e,p.circleCount1),e,p.multiplier1),T(B,M(t,p.circleCount2),t,p.multiplier2)}const m=f({frag:`
        precision highp float;
        uniform vec3 u_color;
        uniform float u_alpha;
        void main () {
            gl_FragColor = vec4(u_color * u_alpha, u_alpha);
        }`,vert:`
        precision highp float;
        uniform float u_time, u_chromaticblur, u_spread, u_speed;
        attribute float a_jitter;
        attribute vec2 a_position1, a_position2;
        void main () {
            float phase = 0.5 * (1.0 + cos(u_speed * (u_time + u_chromaticblur) + a_jitter * u_spread));
            phase = smoothstep(0.1, 0.9, phase);
            // TODO: make this a parameter, as the range seems like it's interesting to play with
            // phase = smoothstep(-0.9, 0.9, phase);
            // phase = smoothstep(0.1, 1.5, phase);
            gl_PointSize = 2.0; // TODO: should this be a parameter too?
            gl_Position = vec4(mix(a_position1, a_position2, phase), 0, 1);
        }`,depth:{enable:!1},blend:{enable:!0,func:{src:"one",dst:"one"}},attributes:{a_jitter:oe,a_position1:I,a_position2:B},uniforms:{u_alpha:()=>g.alpha,u_speed:()=>4*g.speed,u_spread:()=>C*g.spread,u_color:f.prop("u_color"),u_chromaticblur:f.prop("u_chromaticblur"),u_time:e=>e.time},count:d,primitive:"points"});function ie(){f.clear({color:[0,0,0,1],depth:1});const e=.1*g.chromaticblur;m({u_color:[0,.1,.9],u_chromaticblur:0}),m({u_color:[0,.3,.5],u_chromaticblur:e}),m({u_color:[.1,.7,.1],u_chromaticblur:2*e}),m({u_color:[.5,.3,0],u_chromaticblur:3*e}),m({u_color:[.9,.1,0],u_chromaticblur:4*e})}function ae(){console.log("hi"),re(),f.frame(ie)}let h=L({canvas:document.querySelector(".one")}),se=e=>{console.log("after get user media");const t=new AudioContext,o=t.createAnalyser();t.createMediaStreamSource(e).connect(o);const r=o.frequencyBinCount,n=new Uint8Array(r),i=h.buffer({length:r,type:"uint8",usage:"dynamic"}),a=h({vert:`
  precision mediump float;

  #define FFT_SIZE ${r}
  #define PI ${Math.PI}

  attribute float index, frequency;

  void main() {
    float theta = 2.0 * PI * index / float(FFT_SIZE);
    gl_Position = vec4(
      0.5 * cos(theta) * (1.0 + frequency),
      0.5 * sin(theta) * (1.0 + frequency),
      0,
      1);
  }`,frag:`
  void main() {
    gl_FragColor = vec4(1, 1, 1, 1);
  }`,attributes:{index:Array(r).fill().map((c,s)=>s),frequency:{buffer:i,normalized:!0}},elements:null,instances:-1,lineWidth:1,depth:{enable:!1},count:r,primitive:"line loop"});h.frame(({tick:c})=>{h.clear({color:[0,0,0,1],depth:1}),o.getByteFrequencyData(n),i.subdata(n),a()})},ce=e=>{console.log(e),console.log("ground")};async function ue(){console.log("b4 get user media"),await navigator.mediaDevices.getUserMedia({audio:!0}).then(se).then(ce),console.log("hello")}var le=`let size = 3.0;

    let b = .3;		//size of the smoothed border

    fn mainImage(fragCoord: vec2<f32>, iResolution: vec2<f32>) -> vec4<f32> {
      let aspect = iResolution.x/iResolution.y;
      let position = (fragCoord.xy) * aspect;
      let dist = distance(position, vec2<f32>(aspect*0.5, 0.5));
      let offset=u.time * .0001;
      let conv=4.;
      let v=dist*4.-offset;
      let ringr=floor(v);
      
      var stuff = 0.;
      if (v % 3. > .5) {
        stuff = 0.;
      }

	var color=smoothStep(-b, b, abs(dist- (ringr+stuff+offset)/conv));
      //let color=smoothstep(-b, b, abs(dist- (ringr+((v)>0.5)+offset)/conv));
   //   var color = b;
      if (ringr % 2. ==1.) {
       color=2.-color;
      }

    let distToMouseX = distance(u.mouseX, fragCoord.x);
    let distToMouseY = distance(u.mouseY, fragCoord.y);

    // if ( 
    //  distance(u.mouseX, fragCoord.x) > .1 || 
    //  distance(u.mouseY, fragCoord.y) > 2.
    //   ) {
    //     return vec4<f32>(.5);
    //   }

    //if (fragCoord.x > .5) {color = 1.; }
    return vec4<f32>(
      1. -distToMouseX, 
      distToMouseY  , 
      color, 
      1.
      );
  };


  fn main(uv: vec2<f32>) -> vec4<f32> {
    let fragCoord = vec2<f32>(uv.x, uv.y);
    var base = vec4<f32>(cos(u.time), .5, sin(u.time), 1.);
    let dist = distance( fragCoord, vec2<f32>(u.mouseX,  u.mouseY));
    return mainImage(fragCoord, vec2<f32>(u.width, u.height));
  }

  [[stage(fragment)]]
  fn main_fragment(in: VertexOutput) -> [[location(0)]] vec4<f32> {
    return main(in.uv);
  }
  `,fe=`let size = 3.0;

    let b = 0.003;		//size of the smoothed border

    fn mainImage(fragCoord: vec2<f32>, iResolution: vec2<f32>) -> vec4<f32> {
      let aspect = iResolution.x/iResolution.y;
      let position = (fragCoord.xy/iResolution.xy) * aspect;
      let dist = distance(position, vec2<f32>(aspect*0.5, 0.5));
      let offset=u.time * 0.0000001;
      let conv=4.;
      let v=dist*4.-offset;
      let ringr=floor(v);
      //let color=smoothstep(-b, b, abs(dist- (ringr+float(fract(v)>0.5)+offset)/conv));
      //let color=smoothstep(-b, b, abs(dist- (ringr+((v)>0.5)+offset)/conv));
      var color = b;
      if (ringr % 2. ==1.) {
       color=2.-color;
      }

    if (fragCoord.x > .5) {color = 1.; }
    return vec4<f32>(.5, 0., color, 1.);
  };


  fn main(uv: vec2<f32>) -> vec4<f32> {
    let fragCoord = vec2<f32>(uv.x, uv.y);
    var base = vec4<f32>(cos(u.time), .5, sin(u.time), 1.);
    let dist = distance( fragCoord, vec2<f32>(u.mouseX,  u.mouseY));
    return vec4<f32>(.3, .3, sin(u.time * .00000001), 1.);
  }

  [[stage(fragment)]]
  fn main_fragment(in: VertexOutput) -> [[location(0)]] vec4<f32> {
    return main(in.uv);
  }
  `,de=`let size = 30.0;
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
`,me=`//credits to Danilo Guanabara
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
  `;F();let D={shapeTransition:ae,breath:ue,stripes:ve,rings:pe,chessboard:ge,light:F};function ve(){console.log(fe),ye()}function pe(){b({shader:le})}function ge(){b({shader:de})}let he=document.querySelector("template").innerHTML,be=document.querySelector("#control-panel");be.innerHTML+=Object.keys(D).map(e=>he.replace(/{demo_title}/g,e)).join(`
`);function b(e){(window.location.host==="localhost:3000"?Q:J)(e)}function ye(){b({data:["video-tag"]})}function F(){b({shader:me})}document.querySelectorAll("button").forEach(e=>{e.addEventListener("click",t=>{console.log("name",t.target.name),t.target.classList.toggle("dot"),D[t.target.name]()})});
