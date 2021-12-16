const AudioContext = window.AudioContext || window.webkitAudioContext;
const ctx = new AudioContext();

let analyzer = null;
let panner = null;
let gain = null;

let convolverInitialBuffer = null;
let convolver = null;

export function createOscillator(freq, type) {
    if (typeof freq !== 'number') {
        throw new Error('freq must be a number');
    }
    if (typeof type !== 'string') {
        throw new Error('type must be a string');
    }

    const oscillator = ctx.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = freq;
    oscillator.start();
    return oscillator;
}

export async function createConvolver() {
    convolver = ctx.createConvolver();

    let response = await fetch('impulse-response.wav');
    let buffer = await response.arrayBuffer();
    convolverInitialBuffer = await ctx.decodeAudioData(buffer);
    convolver.buffer = convolverInitialBuffer;
    return convolver;
}

export function createGain() {
    gain = ctx.createGain();
    return gain;
}

export function createPanner(pan) {
    if (typeof pan !== 'number') {
        throw new Error('pan must be a number');
    }

    panner = ctx.createStereoPanner({ pan });
    return panner;
}

export function createAnalyser(fftSize) {
    analyzer = ctx.createAnalyser({ fftSize });
    drawAnalysis();
    return analyzer;
}

export function createDelay(delayTime) {
    if (typeof delayTime !== 'number') {
        throw new Error('delayTime must be a number');
    }

    return new DelayNode(ctx, { delayTime, maxDelayTime: delayTime + 0.5 });
}


// handle gain with the volume input
const volumeInput = document.querySelector('#volume');
volumeInput.addEventListener('input', () => {
    gain.gain.value = volumeInput.value;
});

// handle stereo panning
const panInput = document.querySelector('#panner');
panInput.addEventListener('input', () => {
    panner.pan.value = panInput.value;
});

// handle play/pause with the pause button
const pauseButton = document.querySelector('#pause');
pauseButton.addEventListener('click', () => {
    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    if (ctx.state === 'running') {
        ctx.suspend();
        pauseButton.textContent = '▶️';
    } else {
        ctx.resume();
        pauseButton.textContent = '⏸';
    }
});

ctx.suspend();

function drawAnalysis() {
    // draw the waveform
    const bufferLength = analyzer.frequencyBinCount;

    const waveCanvas = document.querySelector('#waveform');
    const waveCanvasCtx = waveCanvas.getContext('2d');
    const waveformDataArray = new Float32Array(bufferLength);

    function draw() {
        requestAnimationFrame(draw);

        waveCanvasCtx.fillStyle = '#000';
        waveCanvasCtx.fillRect(0, 0, waveCanvas.width, waveCanvas.height);

        waveCanvasCtx.beginPath();
        waveCanvasCtx.lineWidth = 2;
        waveCanvasCtx.strokeStyle = '#00f';

        waveCanvasCtx.moveTo(0, waveCanvas.height / 2);

        analyzer.getFloatTimeDomainData(waveformDataArray);

        for (let i = 0; i < bufferLength; i++) {
            const value = waveformDataArray[i] * waveCanvas.height / 2;
            const x = waveCanvas.width * i / bufferLength;
            const y = waveCanvas.height / 2 + value;

            if (i === 0) {
                waveCanvasCtx.moveTo(x, y);
            } else {
                waveCanvasCtx.lineTo(x, y);
            }
        }

        waveCanvasCtx.stroke();
    }

    draw();

    // draw the frequencies as a bar graph
    const freqCanvas = document.querySelector('#frequency');
    const freqCanvasCtx = freqCanvas.getContext('2d');
    const freqDataArray = new Uint8Array(bufferLength);

    function drawFreq() {
        requestAnimationFrame(drawFreq);

        freqCanvasCtx.fillStyle = '#000';
        freqCanvasCtx.fillRect(0, 0, freqCanvas.width, freqCanvas.height);

        freqCanvasCtx.beginPath();
        freqCanvasCtx.lineWidth = 1;
        freqCanvasCtx.strokeStyle = '#00f';

        analyzer.getByteFrequencyData(freqDataArray);

        for (let i = 0; i < bufferLength; i++) {
            const value = freqDataArray[i] / 2;
            const x = freqCanvas.width * i / bufferLength;
            const y = freqCanvas.height - value;

            if (i === 0) {
                freqCanvasCtx.moveTo(x, y);
            } else {
                freqCanvasCtx.lineTo(x, y);
            }
        }

        freqCanvasCtx.stroke();
    }

    drawFreq();
}

export { ctx as context };
