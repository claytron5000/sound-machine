const format = '.' + (new Audio().canPlayType('audio/ogg') !== '' ? 'ogg' : 'mp3');

class Track {
    constructor(node, audioCtx, masterGainNode) {
        const uri = node.querySelector('audio').getAttribute('src')
        const url = uri.substring(0, uri.lastIndexOf('.')) + format
        console.log(url)
        const source = audioCtx.createBuffer();
        this.gainNode = audioCtx.createGain();
        source.connect(audioCtx.destination);

        loadSoundIntoContext(url, audioCtx).then(buffer => {
            source.buffer = buffer;
            // source.noteOn(0)
            this.audioElement = source;
        })

        node.querySelector('button').addEventListener('click', () => {
            console.log(node)
            this.playSound(node.querySelector('button'))
        });
        this.volumeControl = node.querySelector('.volume');
        this.volumeControl.addEventListener('input', () => {
            this.gainNode.gain.value = this.volumeControl.value;
        }, false);
    }
    playSound(element) {
        console.log('play the sound')
        // play or pause track depending on state
        if (element.dataset.playing === 'false') {
            console.log(this.audioElement)
            this.audioElement.noteOn(0);
            element.dataset.playing = 'true';
        } else if (element.dataset.playing === 'true') {
            this.audioElement.noteOff(0);
            element.dataset.playing = 'false';
        }
    }
}

class AudioPlayer {
    constructor(soundBlocks, volumeControl) {
        console.log(soundBlocks, volumeControl)
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
        this.gainNode = this.audioCtx.createGain();

        this.sounds = []
        for (let i=0; i<soundBlocks.length; i++) {
            this.sounds[i] = new Track(soundBlocks[i], this.audioCtx, this.gainNode)
        }
        volumeControl.addEventListener('input', () => {
            console.log('master input')
            this.gainNode.gain.value = volumeControl.value;
        }, false);

    }
    changeVolume() {

    }
}


window.onload = function() {
    const soundBlocks = document.querySelectorAll('.sound-block');
    const volumeControl = document.querySelector('#master-volume')
    const player = new AudioPlayer(soundBlocks, volumeControl)
}


const loadSoundIntoContext = function(url, context) {
    return new Promise(function(resolve, reject) {
        fetch(url)
            .then(response => response.arrayBuffer())
            .then(buffer => {context.decodeAudioData(buffer, (decodeddata) => {
                resolve(decodeddata)
                }
             )})
            .catch(err => console.log(err))
    })

}
