class Track {
    constructor(node, audioCtx, masterGainNode) {
        this.audioElement = node.querySelector('audio')
        this.track = audioCtx.createMediaElementSource(this.audioElement);
        this.gainNode = audioCtx.createGain();

        // this.track.connect(this.gainNode).connect(masterGainNode).connect(audioCtx.destination)
        this.track.connect(audioCtx.destination)
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
            this.audioElement.play();
            element.dataset.playing = 'true';
        } else if (element.dataset.playing === 'true') {
            this.audioElement.pause();
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
        // console.log(this)
        this.sounds = []
        for (let i=0; i<soundBlocks.length; i++) {
            this.sounds[i] = new Track(soundBlocks[i], this.audioCtx, this.gainNode)
        }
        volumeControl.addEventListener('input', () => {
            console.log('master input')
            this.gainNode.gain.value = volumeControl.value;
        }, false);
        console.log(this)
    }
    changeVolume() {

    }
}


window.onload = function() {
    const soundBlocks = document.querySelectorAll('.sound-block');
    const volumeControl = document.querySelector('#master-volume')
    const player = new AudioPlayer(soundBlocks, volumeControl)
}
