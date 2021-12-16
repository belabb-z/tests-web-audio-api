import * as player from './player.js';

const audioContext = player.context;

const sourceNode = player.createOscillator(440, 'sine');
const volume = player.createGain();
const panner = player.createPanner(0.5);
const analyzer = player.createAnalyser(1024);

sourceNode.connect(volume);
volume.connect(panner);
panner.connect(analyzer);
analyzer.connect(audioContext.destination);
