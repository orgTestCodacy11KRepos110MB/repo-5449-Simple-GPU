import shapeTransition from "./webgl/shape-transition";
import { init} from "../lib/main";
import rings from './shaders/rings.wgsl?raw';
import stripes from './shaders/stripes.wgsl?raw';
import checkerboard from './shaders/checkerboard.wgsl?raw';
import one from './shaders/one.wgsl?raw';
import mouse from './shaders/mouse.wgsl?raw';
import texture from './shaders/texture.wgsl?raw';
import sky from './shaders/sky.wgsl?raw';

import four from  '/Users/awahab/Simple-webgpu-compute/demos/shaders/four.wgsl?raw'

import five from  '/Users/awahab/Simple-webgpu-compute/demos/shaders/five.wgsl?raw'
// import hello from  '/Users/awahab/Simple-webgpu-compute/demos/shaders/morning.wgsl?raw'
import music from  '/Users/awahab/Simple-webgpu-compute/demos/shaders/music.wgsl?raw'


import six from  '/Users/awahab/Simple-webgpu-compute/demos/shaders/six.wgsl?raw'

import seven from  '/Users/awahab/Simple-webgpu-compute/demos/shaders/seven.wgsl?raw'

import light from  '/Users/awahab/Simple-webgpu-compute/demos/shaders/light.wgsl?raw'

//import halfBaked from  '/Users/awahab/Simple-webgpu-compute/demos/shaders/halfBaked.wgsl?raw'

import physics from "./webgl/physics";

import postProcessing from "./postProcessing";

import signalvsNoise from  '/Users/awahab/Simple-webgpu-compute/demos/shaders/signal.wgsl?raw'

let defaultDemo = 'signal';
let data = {}
let stuff 
function then(stream) {
  const context = new AudioContext();
  const analyser = context.createAnalyser();
  context.createMediaStreamSource(stream).connect(analyser);
  const fftSize = analyser.frequencyBinCount;
  const frequencies = new Uint8Array(fftSize);
  stuff = function abc() {
    if (analyser)analyser.getByteFrequencyData(frequencies);
    return frequencies;
  }
}
(async function () {
  let stream = await navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then(then)
})();


async function start_loop_static(options) {
  options.data = options.data || data; //extend 
  console.log('start draw loop')

  let draw = await init(options);
  draw(data);
  console.log('drawn')
  
  requestAnimationFrame(function test() {
    if (stuff) data.texture = stuff()
    // data.texture = './static.png'
    draw(data);
      requestAnimationFrame(test)
      //setTimeout(test, 500)
  });
}

function textureDemo() {
  let img = document.createElement('img')
  img.src = './october.png'
  
  customShader({
    data: {texture: img},
    shader: textureShader,
  }); 
}

let demoTitles = [
  'signalvsNoise',  'stripes', 'rings', 'checkerboard', 'one', 'mouse', 'texture', 'sky', 
   'four', 'five', 'music', 'six', 'seven', 'light', 'physics', 
   'postProcessing', 
]

let demos = [
  signalvsNoise,  stripes, rings, checkerboard, one, mouse, texture, sky,

   four, five, music, six, seven, light, physics, postProcessing
  //  carrots
]
function select(name) {
  let idx = demoTitles.indexOf(name);
  let demo = demos[idx];

  cleanup() 
  document.querySelectorAll('input')[idx].checked = true
  if (typeof demo === 'function') demo()
  else {
    customShader({
      shader: demo,
    }); 
  }
}

let template = document.querySelector('template').innerHTML
let controlpanel  =  document.querySelector('#control-panel');

controlpanel.innerHTML += Object.keys(demos).map(
  title => template
  .replace(/{template}/g, demoTitles[title]))
  .join('\n')
  
  document.querySelectorAll('input').forEach(e => {
   e.addEventListener('click', (event) => {
      select(event.target.value)
    })
  })

function customShader(options) {
  let start = window.location.host === "localhost:3000" ? start_loop_static : start_loop_nb;
  start(options);
}

function cleanup () {
  document.querySelector(':checked').checked = null  
  let canvas = document.querySelector('canvas')
  
  if (canvas) canvas.remove()
}

let choice = 0
function choose (idx) {
  let input = document.querySelectorAll('input')
  
  if (idx) choice = idx
  // else  choice += 1;


  input[ 0 ].click()
}

//setInterval(choose, 2500)
choose(demoTitles.indexOf(defaultDemo))

document.querySelectorAll('label').forEach((el, idx) =>
  el.addEventListener('mouseover', () => {
    cleanup() 

    choose(idx)
  })
)