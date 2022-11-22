// import { scaleLinear } from "d3-scale";
import utils from "./utils";
// @ts-ignore
import defaultShader from "./default.wgsl?raw";

let makeCompute = (state: any) => {
  let { device } = state;

  if (state.compute.vertexBufferData) {
    state.computeVertexBufferData = device.createBuffer({
      size: state.compute.vertexBufferData.byteLength,
      usage: GPUBufferUsage.VERTEX,
      mappedAtCreation: true,
    });

    new Float32Array(state.computeVertexBufferData.getMappedRange()).set(
      state.compute.vertexBufferData
    );
    state.computeVertexBufferData.unmap();
  }
  //@ts-ignore
  if (state.compute.buffers) {

  }
};

let hasMadeCompute = false;
let makeImgTexture = async (state: any) => {
  const img = document.createElement("img");
  const source = img;
  source.width = innerWidth;
  source.height = innerHeight;

  img.src = state.data.texture;

  await 
  img.decode();

  return await createImageBitmap(img);
};

async function makeTexture(state: any) {

  if (HTMLImageElement === state?.data?.texture?.constructor) {
    let img = state.data.texture;
    await img.decode();
    await createImageBitmap(img);
    await img.decode();
    let imageBitmap =  await createImageBitmap(img); 

    let texture = state.device.createTexture({
      size: [imageBitmap.width, imageBitmap.height, 1],
      format: "rgba8unorm",
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });
    state.device.queue.copyExternalImageToTexture(
      { source: imageBitmap },
      { texture: texture },
      [imageBitmap.width, imageBitmap.height]
    );
    state.texture = texture;
    updateTexture(state);
    return texture;
  } else if ("string" === typeof state.data.texture) {
    let texture = state.device.createTexture({
      size: [900, 500, 1],
      format: "rgba8unorm",
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });

    let imageBitmap = await makeImgTexture(state);

    state.device.queue.copyExternalImageToTexture(
      { source: imageBitmap },
      { texture: texture },
      [imageBitmap.width, imageBitmap.height]
    );
    state.texture = texture;
    updateTexture(state);
    return texture;
  } else {
    let texture = state.device.createTexture({
      size: [256, 1, 1],
      format: "rgba8unorm",
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });
    let music = new Float32Array(
      new Array(800)
        .fill(5)
        .map((d: any, i) =>
          state.data.texture
            ? state.data.texture[(i % state.data.texture.length) + d]
            : Math.random()
        )
    );

    state.texture = texture
    state.data.music = music;
    updateTexture(state);

    return texture;
  }
}
let t = 0;

function updateTexture(state: any) {
  if (! state.texture) return 
  if ((state.data.texture)) {
  let data = new Uint8Array(
    //@ts-ignore
    new Array(1024).fill(5).map((d, i) => {
      return state.data.texture
        ? state.data.texture[i % state.data.texture.length]
        : Math.random();
    })
  );

  state.device.queue.writeTexture(
    { texture: state.texture },
    data.buffer,
    {
      bytesPerRow: 3200,
      rowsPerImage: 600,
    },
    [256, 1]
  );
  }
}

function createRenderPasses(state: any) {
  if (!hasMadeCompute && state.compute) {
    makeCompute(state);
  }

  let {
    particleBuffers,
    computeVertexBufferData,
    device,
  } = state;

  const bindGroup = device.createBindGroup(state.bindGroupDescriptor);
//TODO: parameterize bindGroup here
  const mainRenderPass = {
    renderPassDescriptor: state.renderPassDescriptor,
    texture: state.texture,
    pipeline: state.pipeline,
    bindGroup: bindGroup,
    type: "draw",
  };

  //@ts-ignore
  if (state?.compute?.numVertices)
    //@ts-ignore
    mainRenderPass.numVertices = state.compute.numVertices();
  //@ts-ignore
  if (state.compute && particleBuffers)
    //@ts-ignore
    mainRenderPass.vertexBuffers = [
      particleBuffers[0],
      computeVertexBufferData,
    ];

  state.renderPasses.push(mainRenderPass);
}


const recordRenderPass = async function (state: any) {
  let { device } = state;

  const renderPassDescriptor = {
    colorAttachments: [
      {
        view: void 0,
        clearValue: { r: 0.5, g: 0.5, b: 0.5, a: 1.0 },
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  };

  renderPassDescriptor.colorAttachments[0].view = state.context
    .getCurrentTexture()
    .createView();

  const commandEncoder = device.createCommandEncoder();

  state.renderPasses.forEach(function render(_: any) {
    let isCompute = _.type === "compute";

    let passEncoder = isCompute
      ? commandEncoder.beginComputePass()
      : commandEncoder.beginRenderPass(renderPassDescriptor);

    if (_.texture) updateTexture(state);

    passEncoder.setPipeline(_.pipeline);

    // passEncoder.setBindGroup(0,
    //    Array.isArray(_.bindGroup) ? _.bindGroup[t % 2] : _.bindGroup
    //    );
if (Array.isArray(_.bindGroup)) {
  _.bindGroup.forEach(function (bindGroup, i) {
//console.log(bindGroup, i )
    passEncoder.setBindGroup(i,
        bindGroup
         );
  })
} else {
      passEncoder.setBindGroup(0,
       Array.isArray(_.bindGroup) ? _.bindGroup[t % 2] : _.bindGroup
       );
}


    if (_.vertexBuffers)
      _.vertexBuffers.forEach(function (vertexBuffer: any, i: any) {
        passEncoder.setVertexBuffer(i, vertexBuffer);
      });

    if (_.numVertices) passEncoder.draw(3, _.numVertices, 0, 0);
    else !isCompute && _.type === passEncoder.draw(3 * 2, 1, 0, 0);


    if (_.dispatchWorkGroups) {
      if (Array.isArray(_.dispatchWorkGroups))
        passEncoder.dispatchWorkgroups(..._.dispatchWorkGroups);
      else passEncoder.dispatchWorkgroups(_.dispatchWorkGroups);
    }

    passEncoder.end();
  });

  device.queue.submit([commandEncoder.finish()]); //async
  t++;

};

function updateUniforms(state: any) {
  let { data, device } = state;

  let values: any = Object.values(data).filter(
    (val) => typeof val !== "object"
  );

  let uniformsArray = new Float32Array(values.length);
  uniformsArray.set(values, 0);

  if (state.uniformsBuffer) {
    device.queue.writeBuffer(
      state.uniformsBuffer,
      0,
      uniformsArray.buffer,
      0,
      4 * uniformsArray.length
    );
    return state.uniformsBuffer;
  } else {
    return (state.uniformsBuffer = utils.createBuffer(
      device,
      uniformsArray,
      GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    ));
  }
}

async function makePipeline(state: any) {
  let { device } = state;

  let pipelineDesc = {
    layout: "auto",
    vertex: {
      module: state.shader,
      entryPoint: "main_vertex",
      buffers: [],
    },
    fragment: {
      module: state.shader,
      entryPoint: "main_fragment",
      targets: [{ format: "bgra8unorm" }],
    },

    primitive: {
      topology: "triangle-list",
    },
  } as GPURenderPipelineDescriptor;

  if (state.compute) {
    //@ts-ignore
    pipelineDesc.vertex.buffers.push(
      {
        // instanced particles buffer
        arrayStride: 4 * 4,
        stepMode: "instance",
        attributes: [
          {
            // instance position
            shaderLocation: 0,
            offset: 0,
            format: "float32x2",
          },
          {
            // instance velocity
            shaderLocation: 1,
            offset: 2 * 4,
            format: "float32x2",
          },
        ],
      },
      {
        // vertex buffer
        arrayStride: 2 * 4,
        stepMode: "vertex",
        attributes: [
          {
            // vertex positions
            shaderLocation: 2,
            offset: 0,
            format: "float32x2",
          },
        ],
      }
    );
  }
  const sampler = device.createSampler({
    addressModeU: 'repeat',
    addressModeV: 'repeat',
    magFilter: "linear",
    minFilter: "linear",
    mipmapFilter: "linear",
  });


  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
        buffer: {
          type: "uniform",
          minBindingSize: 4 * 7,
        },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
        type: "sampler",
        sampler,
      },
      {
        binding: 2,
        visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
        texture: {},
      },
    ],
  });

  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout],
  });

  state.bindGroupLayout = bindGroupLayout;
  updateUniforms(state);

  let pipeline = device.createRenderPipeline({
    ...pipelineDesc,
    layout: pipelineLayout,
  });

  let texture = await makeTexture(state);
  state.bindGroupDescriptor = {
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: { buffer: state.uniformsBuffer },
      },

      {
        binding: 1,
        resource: sampler,
      },
      {
        binding: 2,
        resource: texture.createView({
          baseMipLevel: 0, // Make sure we're getting the right mip level...
          mipLevelCount: 1,
        }),
        texture: {
          sampleType: "float",
          viewDimension: "2d",
          multisampled: 0,
        },
      },
    ],
  };

  state.bindGroupDescriptor.entries[0].resource.buffer = updateUniforms(state);

  state.bindGroupDescriptor.entries[2].resource = texture.createView({
    baseMipLevel: 0, // Make sure we're getting the right mip level...
    mipLevelCount: 1,
  });

  return pipeline;
}

function makeShaderModule(state: any, source: any) {
  const { device, data } = state;
  if (!source) source = defaultShader;
  utils.validateData(data);

  const uniforms = Object.keys(data)
    .filter((name) => typeof data[name] === "number")
    .map((name) => `${name}: f32,`)
    .join("\n");

  let code = `
    struct Uniforms {
     ${uniforms}
   }
  @binding(0) @group(0) var<uniform> u: Uniforms;
  @binding(1) @group(0) var mySampler: sampler;
  @binding(2) @group(0) var myTexture: texture_2d<f32>;

  struct VertexOutput {
    @builtin(position) Position : vec4<f32>,
    @location(0) fragUV : vec2<f32>,
    @location(1) fragPosition: vec4<f32>,
  }
  
  @vertex
  fn main_vertex(
    @builtin(vertex_index) VertexIndex : u32,
  ) -> VertexOutput {
    const pos = array(
      vec2( 1.0,  1.0),
      vec2( 1.0, -1.0),
      vec2(-1.0, -1.0),
      vec2( 1.0,  1.0),
      vec2(-1.0, -1.0),
      vec2(-1.0,  1.0),
    );
  
    const uv = array(
      vec2(1.0, 0.0),
      vec2(1.0, 1.0),
      vec2(0.0, 1.0),
      vec2(1.0, 0.0),
      vec2(0.0, 1.0),
      vec2(0.0, 0.0),
    );
    var output : VertexOutput;
    output.Position = vec4<f32>(pos[VertexIndex], 0.0, 1.0);
    output.fragUV = uv[VertexIndex];
    output.fragPosition = (output.Position + vec4<f32>(1.0, 1.0, 1.0, 1.0));
    output.fragPosition.g = 1.5 - output.fragPosition.g;
    return output;
  }
  ${source}`;

  if (state.options.vs) {
    code = state.options.vs + state.options.shader
  }

  return device.createShaderModule({ code });
}
//pikachu physics / carebear
function makeComputePass(state) {
  let device = state.device;
  let shader = makeShaderModule(state, state.compute.cs);
  
    const computePipeline = state.device.createComputePipeline({
      compute: {
        module: state.device.createShaderModule({
          code: state.compute.shader,
        }),
        entryPoint: "main",
      },
    });

    if (state.compute.bindGroups) {
      state.particleBindGroups = state.compute.bindGroups(state.device, computePipeline,
        state.options, state)
    }

    return {
      pipeline: computePipeline,
      bindGroup: state.particleBindGroups,
      dispatchWorkGroups: state.compute.dispatchWorkGroups(),
      type: "compute",
    }

}
  //@ts-ignore
async function compile(state, options) {
  state.renderPasses = []
  if (state.compute) {
//    if (state.compute.cs)
     state.renderPasses.push(makeComputePass(state))
  }

  let shaderCode = state.options.shader

  state.shader = makeShaderModule(state, shaderCode);
  state.pipeline = await makePipeline(state);
  createRenderPasses(state);
}

let defaultData = {
  width: innerWidth, //based on canvas
  height: innerHeight, //based on canvas
  pixelRatio: 2, //recompile
  time: 0,
  mouseX: 0,
  mouseY: 0,
  angle: 0,
};

async function init(options: any) {
  let canvas = options.canvas || utils.createCanvas();
  const state = {
    renderPassDescriptor: {},
    options,
    data: Object.assign(defaultData, options.data), //user data
    compute: options.compute, //user data
    renderPasses: [], //internal state
  };

  utils.addMouseEvents(canvas, state.data);

  const context = canvas.getContext("webgpu") as GPUCanvasContext;
  const adapter = (await navigator.gpu.requestAdapter()) as GPUAdapter;
  const device = (await adapter?.requestDevice()) as GPUDevice;
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

  Object.assign(state, {
    device,
    context,
    adapter,
  });

  context.configure({
    device,
    format: presentationFormat,
    alphaMode: "opaque",
    usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
  });

  //@ts-ignore
  function draw(newData: any) {
    newData.time = performance.now();

    updateTexture(state);
    Object.assign(state.data, newData);
    updateUniforms(state);
    recordRenderPass(state);

    return draw;
  }

  draw.canvas = canvas;

  compile(state, options);
  return draw;
}

init.version = "0.9.16";

export { init };