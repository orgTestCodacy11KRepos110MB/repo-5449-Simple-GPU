import { init } from "../lib/main";

let data = {}
const options = {
  uniforms: {
    howMuchBlur: 0.04,
  },
  // vs: ``,
  // fs: ``,
  compute: { //optional
 buffers: [
  initialParticleData,
 ],
//  cs: updateSpritesWGSL,
  }
}
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