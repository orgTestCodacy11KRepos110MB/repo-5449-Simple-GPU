import shapeTransition from "./webgl/shape-transition";
import audioTexture from "./webgl/breath";
import { init } from "../lib/main";
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

let defaultDemo = 'music';
let data = {}, context

let audio = document.querySelector('audio')
audio.controls = true;
audio.addEventListener('play', function abc() {
  context = new AudioContext();
  var src = context.createMediaElementSource(audio);
  var analyser = context.createAnalyser();
  src.connect(analyser);
  analyser.connect(context.destination);
  analyser.fftSize = 256;
  var bufferLength = analyser.frequencyBinCount;
  console.log(bufferLength)
})

async function start_loop_static(options) {
  options.data = options.data || data; //extend 
  let draw = await init(options);


  requestAnimationFrame(function test() {
    data.time = performance.now()

    //data.data = new Uint8Array(1024);

    draw(data);
    requestAnimationFrame(test)

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
  'shapeTransition', 'audioTexture', 'stripes', 'rings', 'checkerboard', 'one', 'mouse', 'texture', 'sky', 

  'four', 'five', 'music'
]

let demos = [
   shapeTransition, audioTexture, stripes, rings, checkerboard, one, mouse, texture, sky,

   four, five, music
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
  .replace(/{replace_me}/g, demoTitles[title]))
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
  else  choice += 1;
  input[choice].click()
}

//setInterval(choose, 2500)
choose(demoTitles.indexOf(defaultDemo))

document.querySelectorAll('label').forEach((el, idx) =>
  el.addEventListener('mouseover', () => {
    cleanup() 

    choose(idx)
  })
)