import { init } from "../lib/main";
const numParticles = 15000;
import blurShader from './blur.wgsl?raw';
//console.log(blurShader)
const initialParticleData1 = new Float32Array(numParticles * 4);
const initialParticleData2 = new Float32Array(numParticles * 4);
//console.log('blur')
let data = {}
const options = {
  uniforms: {
    howMuchBlur: 0.04,
    texture: '' //
  },
  // vs: ``,
  // fs: ``,
  compute: { 
    cs: blurShader,
    //optional
 buffers: [ 
  initialParticleData1, initialParticleData2
 ],
 //  cs: updateSpritesWGSL,
  }
}
//ignore world, and type

//how to add more compute?
async function physics() {
  options.data = options.data  //extend 

  let draw = await init(options);
  options.stuff = options;
  draw(data);

  requestAnimationFrame(function test() {
    draw(data);
      requestAnimationFrame(test)
  });
  }
  
  export default physics;