const createBuffer = (gpuDevice, arr, usage) => {
  let desc = {
    size: arr.byteLength + 3 & ~3,
    usage,
    mappedAtCreation: true
  };
  let buffer = gpuDevice.createBuffer(desc);
  arr[5] = Date.now();
  const writeArray = arr instanceof Uint16Array ? new Uint16Array(buffer.getMappedRange()) : new Float32Array(buffer.getMappedRange());
  writeArray.set(arr);
  buffer.unmap();
  return buffer;
};
function createCanvas(width = 960, height = 500) {
  let dpi = devicePixelRatio;
  var canvas = document.createElement("canvas");
  canvas.width = dpi * width;
  canvas.height = dpi * height;
  canvas.style.width = width + "px";
  document.body.appendChild(canvas);
  return canvas;
}
var utils = {
  createBuffer,
  createCanvas
};
var blurWGSL = "struct Params {\n  filterDim : u32;\n  blockDim : u32;\n};\n\n[[group(0), binding(0)]] var samp : sampler;\n[[group(0), binding(1)]] var<uniform> params : Params;\n[[group(1), binding(1)]] var inputTex : texture_2d<f32>;\n[[group(1), binding(2)]] var outputTex : texture_storage_2d<rgba8unorm, write>;\n\nstruct Flip {\n  value : u32;\n};\n[[group(1), binding(3)]] var<uniform> flip : Flip;\n\n// This shader blurs the input texture in one direction, depending on whether\n// |flip.value| is 0 or 1.\n// It does so by running (128 / 4) threads per workgroup to load 128\n// texels into 4 rows of shared memory. Each thread loads a\n// 4 x 4 block of texels to take advantage of the texture sampling\n// hardware.\n// Then, each thread computes the blur result by averaging the adjacent texel values\n// in shared memory.\n// Because we're operating on a subset of the texture, we cannot compute all of the\n// results since not all of the neighbors are available in shared memory.\n// Specifically, with 128 x 128 tiles, we can only compute and write out\n// square blocks of size 128 - (filterSize - 1). We compute the number of blocks\n// needed in Javascript and dispatch that amount.\n\nvar<workgroup> tile : array<array<vec3<f32>, 128>, 4>;\n\n[[stage(compute), workgroup_size(32, 1, 1)]]\nfn main(\n  [[builtin(workgroup_id)]] WorkGroupID : vec3<u32>,\n  [[builtin(local_invocation_id)]] LocalInvocationID : vec3<u32>\n) {\n  let filterOffset : u32 = (params.filterDim - 1u) / 2u;\n  let dims : vec2<i32> = textureDimensions(inputTex, 0);\n\n  let baseIndex = vec2<i32>(\n    WorkGroupID.xy * vec2<u32>(params.blockDim, 4u) +\n    LocalInvocationID.xy * vec2<u32>(4u, 1u)\n  ) - vec2<i32>(i32(filterOffset), 0);\n\n  for (var r : u32 = 0u; r < 4u; r = r + 1u) {\n    for (var c : u32 = 0u; c < 4u; c = c + 1u) {\n      var loadIndex = baseIndex + vec2<i32>(i32(c), i32(r));\n      if (flip.value != 0u) {\n        loadIndex = loadIndex.yx;\n      }\n\n      tile[r][4u * LocalInvocationID.x + c] =\n        textureSampleLevel(inputTex, samp,\n          (vec2<f32>(loadIndex) + vec2<f32>(0.25, 0.25)) / vec2<f32>(dims), 0.0).rgb;\n    }\n  }\n\n  workgroupBarrier();\n\n  for (var r : u32 = 0u; r < 4u; r = r + 1u) {\n    for (var c : u32 = 0u; c < 4u; c = c + 1u) {\n      var writeIndex = baseIndex + vec2<i32>(i32(c), i32(r));\n      if (flip.value != 0u) {\n        writeIndex = writeIndex.yx;\n      }\n\n      let center : u32 = 4u * LocalInvocationID.x + c;\n      if (center >= filterOffset &&\n          center < 128u - filterOffset &&\n          all(writeIndex < dims)) {\n        var acc : vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);\n        for (var f : u32 = 0u; f < params.filterDim; f = f + 1u) {\n          var i : u32 = center + f - filterOffset;\n          acc = acc + (1.0 / f32(params.filterDim)) * tile[r][i];\n        }\n        textureStore(outputTex, writeIndex, vec4<f32>(acc, 1.0));\n      }\n    }\n  }\n}\n";
var fullscreenTexturedQuadWGSL = "[[group(0), binding(0)]] var mySampler : sampler;\n[[group(0), binding(1)]] var myTexture : texture_2d<f32>;\n\nstruct VertexOutput {\n  [[builtin(position)]] Position : vec4<f32>;\n  [[location(0)]] fragUV : vec2<f32>;\n};\n\n[[stage(vertex)]]\nfn vert_main([[builtin(vertex_index)]] VertexIndex : u32) -> VertexOutput {\n  var pos = array<vec2<f32>, 6>(\n      vec2<f32>( 1.0,  1.0),\n      vec2<f32>( 1.0, -1.0),\n      vec2<f32>(-1.0, -1.0),\n      vec2<f32>( 1.0,  1.0),\n      vec2<f32>(-1.0, -1.0),\n      vec2<f32>(-1.0,  1.0));\n\n  var uv = array<vec2<f32>, 6>(\n      vec2<f32>(1.0, 0.0),\n      vec2<f32>(1.0, 1.0),\n      vec2<f32>(0.0, 1.0),\n      vec2<f32>(1.0, 0.0),\n      vec2<f32>(0.0, 1.0),\n      vec2<f32>(0.0, 0.0));\n\n  var output : VertexOutput;\n  output.Position = vec4<f32>(pos[VertexIndex], 0.0, 1.0);\n  output.fragUV = uv[VertexIndex];\n  return output;\n}\n\n[[stage(fragment)]]\nfn frag_main([[location(0)]] fragUV : vec2<f32>) -> [[location(0)]] vec4<f32> {\n  return textureSample(myTexture, mySampler, fragUV);\n}\n";
const tileDim = 128;
const batch = [4, 4];
function makeShaderModule(gpuDevice, data, source) {
  Object.keys(data).map((name) => `${name}: f32;`).join("\n");
  const code = `[[group(0), binding(0)]] var mySampler : sampler;
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
  }`;
  return gpuDevice.createShaderModule({ code });
}
const step = async (canvasRef, data) => {
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();
  const context = canvasRef.getContext("webgpu");
  const devicePixelRatio2 = window.devicePixelRatio || 1;
  const presentationSize = [
    canvasRef.clientWidth * devicePixelRatio2,
    canvasRef.clientHeight * devicePixelRatio2
  ];
  const presentationFormat = context.getPreferredFormat(adapter);
  context.configure({
    device,
    format: presentationFormat,
    size: presentationSize
  });
  const blurPipeline = device.createComputePipeline({
    compute: {
      module: device.createShaderModule({
        code: blurWGSL
      }),
      entryPoint: "main"
    }
  });
  const fullscreenQuadPipeline = device.createRenderPipeline({
    vertex: {
      module: makeShaderModule(device, data),
      entryPoint: "vert_main"
    },
    fragment: {
      module: device.createShaderModule({
        code: fullscreenTexturedQuadWGSL
      }),
      entryPoint: "frag_main",
      targets: [
        {
          format: presentationFormat
        }
      ]
    },
    primitive: {
      topology: "triangle-list"
    }
  });
  const sampler = device.createSampler({
    magFilter: "linear",
    minFilter: "linear"
  });
  const img = data.img;
  console.log("data", data);
  await img.decode();
  const imageBitmap = await createImageBitmap(img);
  const [srcWidth, srcHeight] = [imageBitmap.width, imageBitmap.height];
  const cubeTexture = device.createTexture({
    size: [srcWidth, srcHeight, 1],
    format: "rgba8unorm",
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
  });
  device.queue.copyExternalImageToTexture({ source: imageBitmap }, { texture: cubeTexture }, [imageBitmap.width, imageBitmap.height]);
  const textures = [0, 1].map(() => {
    return device.createTexture({
      size: {
        width: srcWidth,
        height: srcHeight
      },
      format: "rgba8unorm",
      usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING
    });
  });
  const buffer0 = (() => {
    const buffer = device.createBuffer({
      size: 4,
      mappedAtCreation: true,
      usage: GPUBufferUsage.UNIFORM
    });
    new Uint32Array(buffer.getMappedRange())[0] = 0;
    buffer.unmap();
    return buffer;
  })();
  const buffer1 = (() => {
    const buffer = device.createBuffer({
      size: 4,
      mappedAtCreation: true,
      usage: GPUBufferUsage.UNIFORM
    });
    new Uint32Array(buffer.getMappedRange())[0] = 1;
    buffer.unmap();
    return buffer;
  })();
  const blurParamsBuffer = device.createBuffer({
    size: 8,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
  });
  const computeConstants = device.createBindGroup({
    layout: blurPipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: sampler
      },
      {
        binding: 1,
        resource: {
          buffer: blurParamsBuffer
        }
      }
    ]
  });
  const computeBindGroup0 = device.createBindGroup({
    layout: blurPipeline.getBindGroupLayout(1),
    entries: [
      {
        binding: 1,
        resource: cubeTexture.createView()
      },
      {
        binding: 2,
        resource: textures[0].createView()
      },
      {
        binding: 3,
        resource: {
          buffer: buffer0
        }
      }
    ]
  });
  const computeBindGroup1 = device.createBindGroup({
    layout: blurPipeline.getBindGroupLayout(1),
    entries: [
      {
        binding: 1,
        resource: textures[0].createView()
      },
      {
        binding: 2,
        resource: textures[1].createView()
      },
      {
        binding: 3,
        resource: {
          buffer: buffer1
        }
      }
    ]
  });
  const computeBindGroup2 = device.createBindGroup({
    layout: blurPipeline.getBindGroupLayout(1),
    entries: [
      {
        binding: 1,
        resource: textures[1].createView()
      },
      {
        binding: 2,
        resource: textures[0].createView()
      },
      {
        binding: 3,
        resource: {
          buffer: buffer0
        }
      }
    ]
  });
  const showResultBindGroup = device.createBindGroup({
    layout: fullscreenQuadPipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: sampler
      },
      {
        binding: 1,
        resource: textures[1].createView()
      }
    ]
  });
  const settings = {
    filterSize: 15,
    iterations: 2
  };
  let blockDim;
  const updateSettings = () => {
    blockDim = tileDim - (settings.filterSize - 1);
    device.queue.writeBuffer(blurParamsBuffer, 0, new Uint32Array([settings.filterSize, blockDim]));
  };
  updateSettings();
  function frame() {
    const commandEncoder = device.createCommandEncoder();
    const computePass = commandEncoder.beginComputePass();
    computePass.setPipeline(blurPipeline);
    computePass.setBindGroup(0, computeConstants);
    computePass.setBindGroup(1, computeBindGroup0);
    computePass.dispatch(Math.ceil(srcWidth / blockDim), Math.ceil(srcHeight / batch[1]));
    computePass.setBindGroup(1, computeBindGroup1);
    computePass.dispatch(Math.ceil(srcHeight / blockDim), Math.ceil(srcWidth / batch[1]));
    for (let i = 0; i < settings.iterations - 1; ++i) {
      computePass.setBindGroup(1, computeBindGroup2);
      computePass.dispatch(Math.ceil(srcWidth / blockDim), Math.ceil(srcHeight / batch[1]));
      computePass.setBindGroup(1, computeBindGroup1);
      computePass.dispatch(Math.ceil(srcHeight / blockDim), Math.ceil(srcWidth / batch[1]));
    }
    computePass.endPass();
    const passEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          loadValue: { r: 0, g: 0, b: 0, a: 1 },
          storeOp: "store"
        }
      ]
    });
    passEncoder.setPipeline(fullscreenQuadPipeline);
    passEncoder.setBindGroup(0, showResultBindGroup);
    passEncoder.draw(6, 1, 0, 0);
    passEncoder.endPass();
    device.queue.submit([commandEncoder.finish()]);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
};
let defaultData = {
  width: 900,
  height: 500,
  pixelRatio: 2,
  time: 0,
  mouseX: 0,
  mouseY: 0,
  angle: 0
};
const addMouseEvents = function(canvas, data) {
  canvas.addEventListener("mousemove", (event) => {
    let x = event.pageX;
    let y = event.pageY;
    data.mouseX = x / event.target.clientWidth;
    data.mouseY = y / event.target.clientHeight;
  });
};
async function init(options) {
  let canvas = options.canvas || utils.createCanvas();
  console.log(step);
  const state = {
    renderPassDescriptor: {},
    attribsBuffer: {},
    data: Object.assign(defaultData, options.data)
  };
  addMouseEvents(canvas, state.data);
  return step(canvas, options);
}
init.version = "0.8.0";
export { init };
