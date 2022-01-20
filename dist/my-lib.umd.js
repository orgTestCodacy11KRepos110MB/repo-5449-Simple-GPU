(function(o,l){typeof exports=="object"&&typeof module!="undefined"?l(exports):typeof define=="function"&&define.amd?define(["exports"],l):(o=typeof globalThis!="undefined"?globalThis:o||self,l(o.MyLib={}))})(this,function(o){"use strict";const l=(n,t,r)=>{let e={size:t.byteLength+3&~3,usage:r,mappedAtCreation:!0},i=n.createBuffer(e);return t[5]=Date.now(),(t instanceof Uint16Array?new Uint16Array(i.getMappedRange()):new Float32Array(i.getMappedRange())).set(t),i.unmap(),i};function D(n=960,t=500){let r=devicePixelRatio;var e=document.createElement("canvas");return e.width=r*n,e.height=r*t,e.style.width=n+"px",document.body.appendChild(e),e}var _={createBuffer:l,createCanvas:D},M=`struct Params {
  filterDim : u32;
  blockDim : u32;
};

[[group(0), binding(0)]] var samp : sampler;
[[group(0), binding(1)]] var<uniform> params : Params;
[[group(1), binding(1)]] var inputTex : texture_2d<f32>;
[[group(1), binding(2)]] var outputTex : texture_storage_2d<rgba8unorm, write>;

struct Flip {
  value : u32;
};
[[group(1), binding(3)]] var<uniform> flip : Flip;

// This shader blurs the input texture in one direction, depending on whether
// |flip.value| is 0 or 1.
// It does so by running (128 / 4) threads per workgroup to load 128
// texels into 4 rows of shared memory. Each thread loads a
// 4 x 4 block of texels to take advantage of the texture sampling
// hardware.
// Then, each thread computes the blur result by averaging the adjacent texel values
// in shared memory.
// Because we're operating on a subset of the texture, we cannot compute all of the
// results since not all of the neighbors are available in shared memory.
// Specifically, with 128 x 128 tiles, we can only compute and write out
// square blocks of size 128 - (filterSize - 1). We compute the number of blocks
// needed in Javascript and dispatch that amount.

var<workgroup> tile : array<array<vec3<f32>, 128>, 4>;

[[stage(compute), workgroup_size(32, 1, 1)]]
fn main(
  [[builtin(workgroup_id)]] WorkGroupID : vec3<u32>,
  [[builtin(local_invocation_id)]] LocalInvocationID : vec3<u32>
) {
  let filterOffset : u32 = (params.filterDim - 1u) / 2u;
  let dims : vec2<i32> = textureDimensions(inputTex, 0);

  let baseIndex = vec2<i32>(
    WorkGroupID.xy * vec2<u32>(params.blockDim, 4u) +
    LocalInvocationID.xy * vec2<u32>(4u, 1u)
  ) - vec2<i32>(i32(filterOffset), 0);

  for (var r : u32 = 0u; r < 4u; r = r + 1u) {
    for (var c : u32 = 0u; c < 4u; c = c + 1u) {
      var loadIndex = baseIndex + vec2<i32>(i32(c), i32(r));
      if (flip.value != 0u) {
        loadIndex = loadIndex.yx;
      }

      tile[r][4u * LocalInvocationID.x + c] =
        textureSampleLevel(inputTex, samp,
          (vec2<f32>(loadIndex) + vec2<f32>(0.25, 0.25)) / vec2<f32>(dims), 0.0).rgb;
    }
  }

  workgroupBarrier();

  for (var r : u32 = 0u; r < 4u; r = r + 1u) {
    for (var c : u32 = 0u; c < 4u; c = c + 1u) {
      var writeIndex = baseIndex + vec2<i32>(i32(c), i32(r));
      if (flip.value != 0u) {
        writeIndex = writeIndex.yx;
      }

      let center : u32 = 4u * LocalInvocationID.x + c;
      if (center >= filterOffset &&
          center < 128u - filterOffset &&
          all(writeIndex < dims)) {
        var acc : vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);
        for (var f : u32 = 0u; f < params.filterDim; f = f + 1u) {
          var i : u32 = center + f - filterOffset;
          acc = acc + (1.0 / f32(params.filterDim)) * tile[r][i];
        }
        textureStore(outputTex, writeIndex, vec4<f32>(acc, 1.0));
      }
    }
  }
}
`,O=`[[group(0), binding(0)]] var mySampler : sampler;
[[group(0), binding(1)]] var myTexture : texture_2d<f32>;

struct VertexOutput {
  [[builtin(position)]] Position : vec4<f32>;
  [[location(0)]] fragUV : vec2<f32>;
};

[[stage(vertex)]]
fn vert_main([[builtin(vertex_index)]] VertexIndex : u32) -> VertexOutput {
  var pos = array<vec2<f32>, 6>(
      vec2<f32>( 1.0,  1.0),
      vec2<f32>( 1.0, -1.0),
      vec2<f32>(-1.0, -1.0),
      vec2<f32>( 1.0,  1.0),
      vec2<f32>(-1.0, -1.0),
      vec2<f32>(-1.0,  1.0));

  var uv = array<vec2<f32>, 6>(
      vec2<f32>(1.0, 0.0),
      vec2<f32>(1.0, 1.0),
      vec2<f32>(0.0, 1.0),
      vec2<f32>(1.0, 0.0),
      vec2<f32>(0.0, 1.0),
      vec2<f32>(0.0, 0.0));

  var output : VertexOutput;
  output.Position = vec4<f32>(pos[VertexIndex], 0.0, 1.0);
  output.fragUV = uv[VertexIndex];
  return output;
}

[[stage(fragment)]]
fn frag_main([[location(0)]] fragUV : vec2<f32>) -> [[location(0)]] vec4<f32> {
  return textureSample(myTexture, mySampler, fragUV);
}
`;const R=128,m=[4,4];function k(n,t,r){Object.keys(t).map(i=>`${i}: f32;`).join(`
`);const e=`[[group(0), binding(0)]] var mySampler : sampler;
  [[group(0), binding(1)]] var myTexture : texture_2d<f32>;

  
  struct VertexOutput {
    [[builtin(position)]] Position : vec4<f32>;
    [[location(0)]] fragUV : vec2<f32>;
  };
  
  [[stage(vertex)]]
  fn vert_main([[builtin(vertex_index)]] VertexIndex : u32) -> VertexOutput {
    var pos = array<vec2<f32>, 6>(
        vec2<f32>( 1.0,  1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>(-1.0, -1.0),
        vec2<f32>( 1.0,  1.0),
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(-1.0,  1.0));
  
    var uv = array<vec2<f32>, 6>(
        vec2<f32>(1.0, 0.0),
        vec2<f32>(1.0, 1.0),
        vec2<f32>(0.0, 1.0),
        vec2<f32>(1.0, 0.0),
        vec2<f32>(0.0, 1.0),
        vec2<f32>(0.0, 0.0));
  
    var output : VertexOutput;
    output.Position = vec4<f32>(pos[VertexIndex], 0.0, 1.0);
    output.fragUV = uv[VertexIndex];
    return output;
  }
  
  [[stage(fragment)]]
  fn frag_main([[location(0)]] fragUV : vec2<f32>) -> [[location(0)]] vec4<f32> {
    return textureSample(myTexture, mySampler, fragUV);
  }`;return n.createShaderModule({code:e})}const h=async(n,t)=>{const r=await navigator.gpu.requestAdapter(),e=await r.requestDevice(),i=n.getContext("webgpu"),x=window.devicePixelRatio||1,E=[n.clientWidth*x,n.clientHeight*x],w=i.getPreferredFormat(r);i.configure({device:e,format:w,size:E});const p=e.createComputePipeline({compute:{module:e.createShaderModule({code:M}),entryPoint:"main"}}),I=e.createRenderPipeline({vertex:{module:k(e,t),entryPoint:"vert_main"},fragment:{module:e.createShaderModule({code:O}),entryPoint:"frag_main",targets:[{format:w}]},primitive:{topology:"triangle-list"}}),P=e.createSampler({magFilter:"linear",minFilter:"linear"}),B=t.img;console.log("data",t),await B.decode();const g=await createImageBitmap(B),[c,s]=[g.width,g.height],G=e.createTexture({size:[c,s,1],format:"rgba8unorm",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT});e.queue.copyExternalImageToTexture({source:g},{texture:G},[g.width,g.height]);const f=[0,1].map(()=>e.createTexture({size:{width:c,height:s},format:"rgba8unorm",usage:GPUTextureUsage.COPY_DST|GPUTextureUsage.STORAGE_BINDING|GPUTextureUsage.TEXTURE_BINDING})),T=(()=>{const a=e.createBuffer({size:4,mappedAtCreation:!0,usage:GPUBufferUsage.UNIFORM});return new Uint32Array(a.getMappedRange())[0]=0,a.unmap(),a})(),L=(()=>{const a=e.createBuffer({size:4,mappedAtCreation:!0,usage:GPUBufferUsage.UNIFORM});return new Uint32Array(a.getMappedRange())[0]=1,a.unmap(),a})(),U=e.createBuffer({size:8,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM}),z=e.createBindGroup({layout:p.getBindGroupLayout(0),entries:[{binding:0,resource:P},{binding:1,resource:{buffer:U}}]}),N=e.createBindGroup({layout:p.getBindGroupLayout(1),entries:[{binding:1,resource:G.createView()},{binding:2,resource:f[0].createView()},{binding:3,resource:{buffer:T}}]}),S=e.createBindGroup({layout:p.getBindGroupLayout(1),entries:[{binding:1,resource:f[0].createView()},{binding:2,resource:f[1].createView()},{binding:3,resource:{buffer:L}}]}),F=e.createBindGroup({layout:p.getBindGroupLayout(1),entries:[{binding:1,resource:f[1].createView()},{binding:2,resource:f[0].createView()},{binding:3,resource:{buffer:T}}]}),W=e.createBindGroup({layout:I.getBindGroupLayout(0),entries:[{binding:0,resource:P},{binding:1,resource:f[1].createView()}]}),b={filterSize:15,iterations:2};let d;(()=>{d=R-(b.filterSize-1),e.queue.writeBuffer(U,0,new Uint32Array([b.filterSize,d]))})();function j(){const a=e.createCommandEncoder(),u=a.beginComputePass();u.setPipeline(p),u.setBindGroup(0,z),u.setBindGroup(1,N),u.dispatch(Math.ceil(c/d),Math.ceil(s/m[1])),u.setBindGroup(1,S),u.dispatch(Math.ceil(s/d),Math.ceil(c/m[1]));for(let V=0;V<b.iterations-1;++V)u.setBindGroup(1,F),u.dispatch(Math.ceil(c/d),Math.ceil(s/m[1])),u.setBindGroup(1,S),u.dispatch(Math.ceil(s/d),Math.ceil(c/m[1]));u.endPass();const v=a.beginRenderPass({colorAttachments:[{view:i.getCurrentTexture().createView(),loadValue:{r:0,g:0,b:0,a:1},storeOp:"store"}]});v.setPipeline(I),v.setBindGroup(0,W),v.draw(6,1,0,0),v.endPass(),e.queue.submit([a.finish()])}return j};let A={width:900,height:500,pixelRatio:2,time:0,mouseX:0,mouseY:0,angle:0};const C=function(n,t){n.addEventListener("mousemove",r=>{let e=r.pageX,i=r.pageY;t.mouseX=e/r.target.clientWidth,t.mouseY=i/r.target.clientHeight})};async function y(n){let t=n.canvas||_.createCanvas();console.log(h);const r={renderPassDescriptor:{},attribsBuffer:{},data:Object.assign(A,n.data)};return C(t,r.data),h(t,n)}y.version="0.9.0",o.init=y,Object.defineProperty(o,"__esModule",{value:!0}),o[Symbol.toStringTag]="Module"});
