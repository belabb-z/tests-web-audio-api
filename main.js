import * as player from './player.js';

const audioContext = player.context;

let sourceNode = null;

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        sourceNode = audioContext.createMediaStreamSource(stream);
    } catch (err) {
        console.log('Could not use mic: ', err);
    }
} else {
    console.log('Could not use mic: no media devices available');
}

const convolver = await player.createConvolver();
const gainNode = player.createGain();
const panner = player.createPanner(0);
const analyzer = player.createAnalyser(1024);
const delayNode = player.createDelay(0.5);

sourceNode.connect(convolver);
convolver.connect(panner);
panner.connect(gainNode);
gainNode.connect(delayNode);
delayNode.connect(analyzer);
analyzer.connect(audioContext.destination);

document.querySelector('#echoSwitch').addEventListener('change', (e) => {
    if (e.target.checked) {
        sourceNode.disconnect(panner);
        sourceNode.connect(convolver);
        convolver.connect(panner);
    } else {
        sourceNode.disconnect(convolver);
        convolver.disconnect(panner);
        sourceNode.connect(panner);
    }
});
