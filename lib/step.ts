import blurWGSL from './blur.wgsl?raw';

import fullscreenTexturedQuadWGSL from './fullscreenTexturedQuad.wgsl?raw';
const tileDim = 128;
const batch = [4, 4];


function makeShaderModule(gpuDevice:any, data:any, source:any,) {
  //validateData(data)
  const uniforms = Object.keys(data).map((name) => `${name}: f32;`).join("\n");
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
  }`
  return gpuDevice.createShaderModule({ code: code });
}

const step = async (canvasRef) => {
  const data = {}
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();

  //if (canvasRef.current === null) return;
  const context = canvasRef.getContext('webgpu');

  const devicePixelRatio = window.devicePixelRatio || 1;
  const presentationSize = [
    canvasRef.clientWidth * devicePixelRatio,
    canvasRef.clientHeight * devicePixelRatio,
  ];
  const presentationFormat = context.getPreferredFormat(adapter);

  context.configure({
    device,
    format: presentationFormat,
    size: presentationSize,
  });

  const blurPipeline = device.createComputePipeline({
    compute: {
      module: device.createShaderModule({
        code: blurWGSL,
      }),
      entryPoint: 'main',
    },
  });

  const fullscreenQuadPipeline = device.createRenderPipeline({
    vertex: {
      module: makeShaderModule(device, data, fullscreenTexturedQuadWGSL),
      entryPoint: 'vert_main',
    },
    fragment: {
      module: device.createShaderModule({
        code: fullscreenTexturedQuadWGSL,
      }),
      entryPoint: 'frag_main',
      targets: [
        {
          format: presentationFormat,
        },
      ],
    },
    primitive: {
      topology: 'triangle-list',
    },
  });

  const sampler = device.createSampler({
    magFilter: 'linear',
    minFilter: 'linear',
  });

  const img = document.createElement('img');
  img.src = ('/late.png');
  await img.decode();
  const imageBitmap = await createImageBitmap(img);

  const [srcWidth, srcHeight] = [imageBitmap.width, imageBitmap.height];
  const cubeTexture = device.createTexture({
    size: [srcWidth, srcHeight, 1],
    format: 'rgba8unorm',
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT,
  });
  device.queue.copyExternalImageToTexture(
    { source: imageBitmap },
    { texture: cubeTexture },
    [imageBitmap.width, imageBitmap.height]
  );

  const textures = [0, 1].map(() => {
    return device.createTexture({
      size: {
        width: srcWidth,
        height: srcHeight,
      },
      format: 'rgba8unorm',
      usage:
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.STORAGE_BINDING |
        GPUTextureUsage.TEXTURE_BINDING,
    });
  });

  const buffer0 = (() => {
    const buffer = device.createBuffer({
      size: 4,
      mappedAtCreation: true,
      usage: GPUBufferUsage.UNIFORM,
    });
    new Uint32Array(buffer.getMappedRange())[0] = 0;
    buffer.unmap();
    return buffer;
  })();

  const buffer1 = (() => {
    const buffer = device.createBuffer({
      size: 4,
      mappedAtCreation: true,
      usage: GPUBufferUsage.UNIFORM,
    });
    new Uint32Array(buffer.getMappedRange())[0] = 1;
    buffer.unmap();
    return buffer;
  })();

  const blurParamsBuffer = device.createBuffer({
    size: 8,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
  });

  const computeConstants = device.createBindGroup({
    layout: blurPipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: sampler,
      },
      {
        binding: 1,
        resource: {
          buffer: blurParamsBuffer,
        },
      },
    ],
  });

  const computeBindGroup0 = device.createBindGroup({
    layout: blurPipeline.getBindGroupLayout(1),
    entries: [
      {
        binding: 1,
        resource: cubeTexture.createView(),
      },
      {
        binding: 2,
        resource: textures[0].createView(),
      },
      {
        binding: 3,
        resource: {
          buffer: buffer0,
        },
      },
    ],
  });

  const computeBindGroup1 = device.createBindGroup({
    layout: blurPipeline.getBindGroupLayout(1),
    entries: [
      {
        binding: 1,
        resource: textures[0].createView(),
      },
      {
        binding: 2,
        resource: textures[1].createView(),
      },
      {
        binding: 3,
        resource: {
          buffer: buffer1,
        },
      },
    ],
  });

  const computeBindGroup2 = device.createBindGroup({
    layout: blurPipeline.getBindGroupLayout(1),
    entries: [
      {
        binding: 1,
        resource: textures[1].createView(),
      },
      {
        binding: 2,
        resource: textures[0].createView(),
      },
      {
        binding: 3,
        resource: {
          buffer: buffer0,
        },
      },
    ],
  });

  const showResultBindGroup = device.createBindGroup({
    layout: fullscreenQuadPipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: sampler,
      },
      {
        binding: 1,
        resource: textures[1].createView(),
      },
     
    ],
  });

  const settings = {
    filterSize: 15,
    iterations: 2,
  };

  let blockDim: number;
  const updateSettings = () => {
    blockDim = tileDim - (settings.filterSize - 1);
    device.queue.writeBuffer(
      blurParamsBuffer,
      0,
      new Uint32Array([settings.filterSize, blockDim])
    );
  };
  //gui.add(settings, 'filterSize', 1, 33).step(2).onChange(updateSettings);
  //gui.add(settings, 'iterations', 1, 10).step(1);

  updateSettings();

  function frame() {
    // Sample is no longer the active page.
    //if (!canvasRef.current) return;

    const commandEncoder = device.createCommandEncoder();

    const computePass = commandEncoder.beginComputePass();
    computePass.setPipeline(blurPipeline);
    computePass.setBindGroup(0, computeConstants);

    computePass.setBindGroup(1, computeBindGroup0);
    computePass.dispatch(
      Math.ceil(srcWidth / blockDim),
      Math.ceil(srcHeight / batch[1])
    );

    computePass.setBindGroup(1, computeBindGroup1);
    computePass.dispatch(
      Math.ceil(srcHeight / blockDim),
      Math.ceil(srcWidth / batch[1])
    );

    for (let i = 0; i < settings.iterations - 1; ++i) {
      computePass.setBindGroup(1, computeBindGroup2);
      computePass.dispatch(
        Math.ceil(srcWidth / blockDim),
        Math.ceil(srcHeight / batch[1])
      );

      computePass.setBindGroup(1, computeBindGroup1);
      computePass.dispatch(
        Math.ceil(srcHeight / blockDim),
        Math.ceil(srcWidth / batch[1])
      );
    }

    computePass.endPass();

    const passEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          loadValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
          storeOp: 'store',
        },
      ],
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


export  {
    step
}