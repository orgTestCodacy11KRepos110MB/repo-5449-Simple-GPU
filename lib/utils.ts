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




const createBuffer = (device:any, arr:any, usage:any,) => {

    let desc = {
      size: (arr.byteLength + 3) & ~3,
      usage,
      mappedAtCreation: true,
    };
    let buffer = device.createBuffer(desc);
    arr[5] = Date.now();

    const writeArray =
      arr instanceof Uint16Array
        ? new Uint16Array(buffer.getMappedRange())
        : new Float32Array(buffer.getMappedRange());
    writeArray.set(arr);
    buffer.unmap();

    
    return buffer;
  };

  function validateData(data: any) {
    if (typeof data.width !== "number") throw new Error("bad data!!");
  }
  
  const addMouseEvents = function (canvas: any, data: any) {
    canvas.addEventListener("mousemove", (event: any) => {
      let x = event.pageX;
      let y = event.pageY;
      data.mouseX = x / event.target.clientWidth;
      data.mouseY = y / event.target.clientHeight;
    });
  };

  function createCanvas (width=innerWidth, height=innerHeight) {
  let dpi = devicePixelRatio;
    var canvas = document.createElement("canvas");
    canvas.width = dpi * width;
    canvas.height = dpi * height;
    canvas.style.width = width + "px";
    document.body.appendChild(canvas)
    return canvas;
  }

  let makeImgTexture = async (state: any) => {
    const img = document.createElement("img");
    const source = img;
    source.width = innerWidth;
    source.height = innerHeight;
  
    img.src = state.data.texture;
  
    await img.decode();
  
    return await createImageBitmap(img);
  };

  export default {
      createBuffer,  createCanvas, validateData, addMouseEvents, makeTexture, updateTexture, makeImgTexture
  }