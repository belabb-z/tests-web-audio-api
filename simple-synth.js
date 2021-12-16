import * as player from './player.js';

const ctx = player.context;
const osc = player.createOscillator(440, 'sine');
const volume = player.createGain();
const panner = player.createPanner(0.5);
const analyzer = player.createAnalyser(1024);

// create oscillators for each note of the A4 scale
const osc1 = 440;
const osc2 = 440 * Math.pow(2, 1 / 12);
const osc3 = 440 * Math.pow(2, 2 / 12);
const osc4 = 440 * Math.pow(2, 3 / 12);
const osc5 = 440 * Math.pow(2, 4 / 12);
const osc6 = 440 * Math.pow(2, 5 / 12);
const osc7 = 440 * Math.pow(2, 6 / 12);
const osc8 = 440 * Math.pow(2, 7 / 12);
const osc9 = 440 * Math.pow(2, 8 / 12);
const osc10 = 440 * Math.pow(2, 9 / 12);
const osc11 = 440 * Math.pow(2, 10 / 12);
const osc12 = 440 * Math.pow(2, 11 / 12);

const keys = [
    osc1, osc2, osc3, osc4, osc5, osc6, osc7, osc8, osc9, osc10, osc11, osc12
];

osc.connect(volume);
volume.connect(panner);
panner.connect(analyzer);
analyzer.connect(ctx.destination);

const keyboard = document.querySelector('#keyboard');
const keyButtons = keys.map(freq => {
    const key = document.createElement('button');
    key.textContent = freq.toFixed(0);
    key.addEventListener('mousedown', () => {
        osc.frequency.value = freq;
        ctx.resume();
    });
    key.addEventListener('mouseup', () => {
        setTimeout(() => {
            ctx.suspend();
        }, 200);
    });
    keyboard.appendChild(key);
});

ctx.suspend();
