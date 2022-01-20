(function(o,l){typeof exports=="object"&&typeof module!="undefined"?l(exports):typeof define=="function"&&define.amd?define(["exports"],l):(o=typeof globalThis!="undefined"?globalThis:o||self,l(o.MyLib={}))})(this,function(o){"use strict";const l=(t,n,u)=>{let e={size:n.byteLength+3&~3,usage:u,mappedAtCreation:!0},a=t.createBuffer(e);return n[5]=Date.now(),(n instanceof Uint16Array?new Uint16Array(a.getMappedRange()):new Float32Array(a.getMappedRange())).set(n),a.unmap(),a};function D(t=960,n=500){let u=devicePixelRatio;var e=document.createElement("canvas");return e.width=u*t,e.height=u*n,e.style.width=t+"px",document.body.appendChild(e),e}var M={createBuffer:l,createCanvas:D},O=`struct Params {
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
`,A=`[[group(0), binding(0)]] var mySampler : sampler;
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
`;const k=128,m=[4,4];function C(t,n,u){Object.keys(n).map(a=>`${a}: f32;`).join(`
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
  }`;return t.createShaderModule({code:e})}const y=async t=>{const n={},u=await navigator.gpu.requestAdapter(),e=await u.requestDevice(),a=t.getContext("webgpu"),x=window.devicePixelRatio||1,R=[t.clientWidth*x,t.clientHeight*x],I=a.getPreferredFormat(u);a.configure({device:e,format:I,size:R});const p=e.createComputePipeline({compute:{module:e.createShaderModule({code:O}),entryPoint:"main"}}),P=e.createRenderPipeline({vertex:{module:C(e,n),entryPoint:"vert_main"},fragment:{module:e.createShaderModule({code:A}),entryPoint:"frag_main",targets:[{format:I}]},primitive:{topology:"triangle-list"}}),B=e.createSampler({magFilter:"linear",minFilter:"linear"}),b=document.createElement("img");b.src="/late.png",await b.decode();const g=await createImageBitmap(b),[c,s]=[g.width,g.height],G=e.createTexture({size:[c,s,1],format:"rgba8unorm",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT});e.queue.copyExternalImageToTexture({source:g},{texture:G},[g.width,g.height]);const f=[0,1].map(()=>e.createTexture({size:{width:c,height:s},format:"rgba8unorm",usage:GPUTextureUsage.COPY_DST|GPUTextureUsage.STORAGE_BINDING|GPUTextureUsage.TEXTURE_BINDING})),T=(()=>{const r=e.createBuffer({size:4,mappedAtCreation:!0,usage:GPUBufferUsage.UNIFORM});return new Uint32Array(r.getMappedRange())[0]=0,r.unmap(),r})(),E=(()=>{const r=e.createBuffer({size:4,mappedAtCreation:!0,usage:GPUBufferUsage.UNIFORM});return new Uint32Array(r.getMappedRange())[0]=1,r.unmap(),r})(),U=e.createBuffer({size:8,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM}),z=e.createBindGroup({layout:p.getBindGroupLayout(0),entries:[{binding:0,resource:B},{binding:1,resource:{buffer:U}}]}),L=e.createBindGroup({layout:p.getBindGroupLayout(1),entries:[{binding:1,resource:G.createView()},{binding:2,resource:f[0].createView()},{binding:3,resource:{buffer:T}}]}),S=e.createBindGroup({layout:p.getBindGroupLayout(1),entries:[{binding:1,resource:f[0].createView()},{binding:2,resource:f[1].createView()},{binding:3,resource:{buffer:E}}]}),F=e.createBindGroup({layout:p.getBindGroupLayout(1),entries:[{binding:1,resource:f[1].createView()},{binding:2,resource:f[0].createView()},{binding:3,resource:{buffer:T}}]}),N=e.createBindGroup({layout:P.getBindGroupLayout(0),entries:[{binding:0,resource:B},{binding:1,resource:f[1].createView()}]}),h={filterSize:15,iterations:2};let d;(()=>{d=k-(h.filterSize-1),e.queue.writeBuffer(U,0,new Uint32Array([h.filterSize,d]))})();function V(){const r=e.createCommandEncoder(),i=r.beginComputePass();i.setPipeline(p),i.setBindGroup(0,z),i.setBindGroup(1,L),i.dispatch(Math.ceil(c/d),Math.ceil(s/m[1])),i.setBindGroup(1,S),i.dispatch(Math.ceil(s/d),Math.ceil(c/m[1]));for(let _=0;_<h.iterations-1;++_)i.setBindGroup(1,F),i.dispatch(Math.ceil(c/d),Math.ceil(s/m[1])),i.setBindGroup(1,S),i.dispatch(Math.ceil(s/d),Math.ceil(c/m[1]));i.endPass();const v=r.beginRenderPass({colorAttachments:[{view:a.getCurrentTexture().createView(),loadValue:{r:0,g:0,b:0,a:1},storeOp:"store"}]});v.setPipeline(P),v.setBindGroup(0,N),v.draw(6,1,0,0),v.endPass(),e.queue.submit([r.finish()]),requestAnimationFrame(V)}requestAnimationFrame(V)};async function w(t){let n=t.canvas||M.createCanvas();return console.log(y),y(n)}w.version="0.8.0",o.init=w,Object.defineProperty(o,"__esModule",{value:!0}),o[Symbol.toStringTag]="Module"});
