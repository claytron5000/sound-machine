const format = '.' + (new Audio().canPlayType('audio/ogg') !== '' ? 'ogg' : 'mp3');
const promiseDecodeAudioData = function(arrayBuffer, audioCtx) {
    return new Promise((resolve, reject) => {
        audioCtx.decodeAudioData(arrayBuffer, (decodedData) => {resolve(decodedData)})
    })
}

class Track {
    constructor(node) {
        const uri = node.querySelector('audio').getAttribute('data-src')
        const url = uri + format
        this.sourceUrl = url
        this.addPlayButton(node.querySelector('button'))
    }

    loadIntoContext(audioCtx) {
        const source = audioCtx.createBufferSource();
        fetch(this.sourceUrl)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => promiseDecodeAudioData(arrayBuffer, audioCtx))
            .then(decodedData => {
                source.buffer = decodedData;
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

const writeSoundBlock = function({title, file}) {
    return (
    `<div class="sound-block">
        <h2>${title}</h2>
        <audio data-src="${file}" type="audio/mpeg" loop></audio>
        <button data-playing="false" role="switch" aria-checked="false" loop="true">play/pause</button>
        <span>
            <label for="volume">volume</label>
            <input type="range" class="volume" min="0" max="2" value="1" step="0.01" />
        </span>
    </div>`)
}

window.onload = function() {
    fetch('./audio/sounds.js')
        .then(response => response.text())
        .then(data => JSON.parse(data))
        .then(sounds => sounds.data.map(sound => writeSoundBlock(sound)))
        .then(soundBlocks => {
            // Side effects! Write the html
            document.querySelector('.sounds').insertAdjacentHTML('afterbegin', soundBlocks);
            return soundBlocks
        })
        .then(soundBlocks => {
            const soundBlockNodes = document.querySelectorAll('.sound-block');
            const volumeControl = document.querySelector('#master-volume')
            const player = new AudioPlayer(soundBlockNodes, volumeControl)
        })

}
