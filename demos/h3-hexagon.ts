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
    width: '500px',
    height: '500px',
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
    frontFace: 'ccw',
    cullMode: 'none'
  })

  const cubeVertexArray = new Float32Array(1e6)
  const center = {x:0, y: 0}

  var x = 0; //x coordinate for the center of the hexagon
  var y = 0; //y coordinate for the center of the hexagon
  var r = .1; //radius of the circle upon which the vertices of the hexagon lie.
  var xCoord = new Array(3 * 6);
  var yCoord = new Array(3 * 6);

  const DEG2RAD = Math.PI / 180;

  function makeHexagon(x, y, r, i, j=0) { 
    let deg1 = (i / 3)  * 60
    let deg2 = (i / 3 + 1) * 60
    xCoord[i+0+j] = x;
    yCoord[i+0+j] = y;
    xCoord[i+1+j] = x + r * Math.cos(deg1 * DEG2RAD)
    yCoord[i+1+j] = y + r * Math.sin(deg1 * DEG2RAD)
    xCoord[i+2+j] = x + r * Math.cos(deg2  * DEG2RAD)
    yCoord[i+2+j] = y + r * Math.sin(deg2 * DEG2RAD)
  }  

//  for (let j = 0; j < 3; j++) {
  for (let i = 0; i < 18; i+= 3) {
    makeHexagon(x,y,r, i)
  }

  for (let i = 0; i < 18; i+= 3) {
    makeHexagon(x+.33,y,r, i, 18)
  }

  for (let i = 0; i < 18; i+= 3) {
    makeHexagon(x-.25,y,r, i, 36)
  }


  for (let i = 0; i < 18; i+= 3) {
    makeHexagon(x+.15,y+.15,r, i, 54)
  }
//}

// for (let i = 0; i < xCoord.length; i+= 3) {
//   makeHexagon(x,y,r, i)
// }

 //for (let i = 0; i < xCoord.length; i+= 3) {

// }

  
  //     xCoord[0] = x;
  //     yCoord[0] = y;
  //     xCoord[1] = x + r * Math.cos(0 * DEG2RAD)
  //     yCoord[1] = y + r * Math.sin(0 * DEG2RAD)
  //     xCoord[2] = x + r * Math.cos(60  * DEG2RAD)
  //     yCoord[2] = y + r * Math.sin(60 * DEG2RAD)
    

  // xCoord[3] = x;
  // yCoord[3] = y;
  // xCoord[4] = x + r * Math.cos(120 * DEG2RAD)
  // yCoord[4] = y + r * Math.sin(120 * DEG2RAD)
  // xCoord[5] = x + r * Math.cos(180 * DEG2RAD)
  // yCoord[5] = y + r * Math.sin(180 * DEG2RAD)

  // xCoord[6] = x;
  // yCoord[6] = y;
  // xCoord[7] = x + r * Math.cos(240 * DEG2RAD)
  // yCoord[7] = y + r * Math.sin(240 * DEG2RAD)
  // xCoord[8] = x + r * Math.cos(300 * DEG2RAD)
  // yCoord[8] = y + r * Math.sin(300 * DEG2RAD)

  // xCoord[8] = x;
  // yCoord[8] = y;
  // xCoord[9] = x + r * Math.cos(300 * DEG2RAD)
  // yCoord[9] = y + r * Math.sin(300 * DEG2RAD)
  // xCoord[10] = x + r * Math.cos(360 * DEG2RAD)
  // yCoord[10] = y + r * Math.sin(360 * DEG2RAD)
  


 
  //h3 hexagons in webGPU so compute shaders can be used for interactive query processing
  //estimate 2 weeks 

  var vertices = [xCoord[0],yCoord[0]];// Initialize Array
  
    for ( var i = 1; i < xCoord.length; ++i ) {
    vertices.push(xCoord[i]);
        vertices.push(yCoord[i]);
    console.log("Coordinate " + i + ": " + xCoord[i] + "," + yCoord[i]);
    }
    cubeVertexArray.set(
      vertices
      
    )

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

    passEncoder.draw(128)
    passEncoder.end()
    device.queue.submit([commandEncoder.finish()])
    requestAnimationFrame(frame)
  }
  frame()
}

export default main