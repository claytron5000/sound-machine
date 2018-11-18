// Player 2 for legacy browsers
const AudioContext = window.AudioContext || window.webkitAudioContext;

const format = '.' + (new Audio().canPlayType('audio/ogg') !== '' ? 'ogg' : 'mp3');


const audioCtx = new AudioContext();

function getFile(audioContext, filepath) {
    const request = new Request(filepath)
    return fetch(request)
        .then(response => response.arrayBuffer())
        // wrap decodeAudioData with Promise
        .then(audioBuffer => promiseDecodeAudioData(audioCtx, audioBuffer));
}

function promiseDecodeAudioData(audioCtx, audioBuffer) {
    const callback = function(thing) {
        return new Promise(resolve => thing)
    };
    audioCtx.decodeAudioData(audioBuffer, callback)
}

function setUpSample() {
    const filePath = './audio/porch_rain.mp3';
    // const sample = getFile(audioCtx, filePath);
    return new Promise((resolve, reject) => {
        resolve(getFile(audioCtx, filePath));
    });
}

function playSample(audioContext, audioBuffer) {
    const sampleSource = audioContext.createBufferSource();
    sampleSource.buffer = audioBuffer;
    // sampleSource.playbackRate.setValueAtTime(playbackRate, audioCtx.currentTime);
    sampleSource.connect(audioContext.destination)
    sampleSource.start();
    return sampleSource;
}

setUpSample()
    .then(sample => {
        playSample(audioCtx, sample)
    })
