const format = '.' + (new Audio().canPlayType('audio/ogg') !== '' ? 'ogg' : 'mp3');

class Track {
    constructor(node) {
        const uri = node.querySelector('audio').getAttribute('src')
        const url = uri.substring(0, uri.lastIndexOf('.')) + format
        this.sourceUrl = url
        this.addPlayButton(node.querySelector('button'))
    }

    loadIntoContext(audioCtx) {
        const source = audioCtx.createBufferSource();
        fetch(this.sourceUrl)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => {
                source.buffer = audioCtx.createBuffer(arrayBuffer, false);
                source.connect(audioCtx.destination)
                this.audioSource = source;
            })
    }

    playSound(element) {
        console.log('play the sound')
        // play or pause track depending on state
        if (element.dataset.playing === 'false') {
            console.log(this.audioSource)
            this.audioSource.start(0);
            element.dataset.playing = 'true';
        } else if (element.dataset.playing === 'true') {
            this.audioSource.stop(0);
            element.dataset.playing = 'false';
        }
    }
    volumeControl(dial) {
        dial.addEventListener('input', () => {
            this.gainNode.gain.value = dial.value;
        }, false);
    }
    addPlayButton(playButton) {
        playButton.addEventListener('click', () => {
            this.playSound(playButton)
        });
    }
}

class AudioPlayer {
    constructor(soundBlocks, volumeControl) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
        this.gainNode = this.audioCtx.createGain();

        this.sounds = []
        for (let i=0; i<soundBlocks.length; i++) {
            this.sounds[i] = new Track(soundBlocks[i])
            this.sounds[i].loadIntoContext(this.audioCtx)
        }
        volumeControl.addEventListener('input', () => {
            console.log('master input')
            this.gainNode.gain.value = volumeControl.value;
        }, false);

    }

}

window.onload = function() {
    const soundBlocks = document.querySelectorAll('.sound-block');
    const volumeControl = document.querySelector('#master-volume')
    const player = new AudioPlayer(soundBlocks, volumeControl)
}
