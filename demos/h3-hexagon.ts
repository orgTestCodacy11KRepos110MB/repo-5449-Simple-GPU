 function mustHave<T>(x:T|null|undefined) : T {
  if (!x) {
    document.body.innerHTML = `Your browser does not support WebGPU`	
    throw new Error('WebGPU not supported')
  }
  return x
}
mustHave(navigator.gpu)

 function makeCanvas () {
  const canvas = document.createElement('canvas')
  Object.assign(canvas.style, {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: '0',
    top: '0',
    margin: '0',
    padding: '0'
  })
  canvas.width = window.innerWidth * window.devicePixelRatio
  canvas.height = window.innerHeight * window.devicePixelRatio
  document.body.appendChild(canvas)
  return canvas
}
async function main () {
  const adapter = mustHave(await navigator.gpu.requestAdapter())
  const device = await adapter.requestDevice()
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat()

  const canvas = makeCanvas()
  const context = mustHave(canvas.getContext('webgpu'))
  context.configure({
    device,
    format: presentationFormat,
    alphaMode: 'opaque',
  })

  const shaderModule = device.createShaderModule({
    code: `
@fragment
fn fragMain() -> @location(0) vec4<f32> {
    return vec4(1.0, 0.0, 0.0, 1.0);
}
struct VertexOutput {
  @builtin(position) clipPosition : vec4<f32>,
  //@location(0) fragColor : vec3<f32>,
}

@vertex
fn vertMain(
    @builtin(vertex_index) VertexIndex : u32,   @location(0) position : vec4<f32>,

) -> VertexOutput {
  var result : VertexOutput;
  result.clipPosition = position;
  return result;
}`
  })

  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: shaderModule,
      entryPoint: 'vertMain',
      buffers: [
        {
          arrayStride: 2 * 4,
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: 'float32x2',
            },
          ],
        },
      ],
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'fragMain',
      targets: [
        {
            format: presentationFormat,
        },
      ],
    },
    primitive: {
      topology: 'triangle-list',
    },
  })
  const cubeVertexArray = new Float32Array(64)

  const verticesBuffer = device.createBuffer({
    size: cubeVertexArray.byteLength,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  });
  new Float32Array(verticesBuffer.getMappedRange()).set(cubeVertexArray);
  verticesBuffer.unmap();

  function frame () {
    const commandEncoder = device.createCommandEncoder()
    const passEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
          loadOp: 'clear',
          storeOp: 'store',
        } as const,
      ],
    })
    passEncoder.setPipeline(pipeline)
    passEncoder.setVertexBuffer(0, verticesBuffer);

    passEncoder.draw(6)
    passEncoder.end()
    device.queue.submit([commandEncoder.finish()])
    requestAnimationFrame(frame)
  }
  frame()
}

export default main