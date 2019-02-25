class AudioPlayer {

    constructor(tracks) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
        this.tracks = tracks;
        this.mainGainNode = this.audioCtx.createGain();
        document.querySelector('#main-volume').addEventListener('input', (e) => {
            this.mainGainNode.gain.value = e.target.value;
        }, false);
    }

    writeToDocument(sound) {
        const container = document.querySelector('#sounds');
        const track = new Track(sound, this.audioCtx, this.mainGainNode);
        container.insertAdjacentElement('beforeend', track.soundBlock);
        return track
    }

}

class Track {
    constructor(sound, audioCtx, mainGainNode) {
        this.audioCtx = audioCtx
        this.soundBlock = this.createSoundBlock(sound)
        this.mainGainNode = mainGainNode
        this.mainGainNode.connect(this.audioCtx.destination);
        this.localGain = this.audioCtx.createGain();

        fetch(this.formatFileName(sound.file))
            .then(res => res.arrayBuffer())
            .then(buffer => this.promiseDecodeAudioData(buffer))
            .then(decodedAudio => {
                this.audioBuffer = decodedAudio
            })

    }

    play() {
        this.source = this.audioCtx.createBufferSource();
        this.source.buffer = this.audioBuffer;
        this.source.connect(this.localGain);
        this.localGain.connect(this.mainGainNode);
        this.source.start();
        this.source.loop = true;
    }

    pause() {
        this.source.stop()
    }

    formatFileName(fileName) {
        return fileName + '.' + (new Audio().canPlayType('audio/ogg') !== '' ? 'ogg' : 'mp3')
    }

    // Safari doesn't return promise, so we return our own.
    promiseDecodeAudioData(arrayBuffer) {
        return new Promise((resolve, reject) => {
            this.audioCtx.decodeAudioData(arrayBuffer, (decodedData) => { resolve(decodedData), (err) => { reject(err) } })
        })
    }

    createSoundBlock({ title, file }) {
        const div = document.createElement('div')
        div.classList.add('sound-block')
        const write = title => `<h2>${title}</h2>
        <button class="play" style="cursor: pointer" role="switch" aria-checked="false" loop="true">play</button>
        <button class="pause" style="display: none" role="switch" aria-checked="false" loop="true">pause</button>
        <span>
            <label for="volume">volume</label>
            <input type="range" class="volume" min="0" max="2" value="1" step="0.01" />
        </span>`

        div.insertAdjacentHTML('afterbegin', write(title))
        div.querySelector('.play').addEventListener('click', (e) => {
            e.target.style = "display: none"
            e.target.nextElementSibling.style = "cursor: pointer"
            this.play();
        });
        div.querySelector('.pause').addEventListener('click', (e) => {
            e.target.style = "display: none"
            e.target.previousElementSibling.style = "cursor: pointer"
            this.pause()
        });
        div.querySelector('input').addEventListener('input', (sliderEvent) => {
            this.localGain.gain.value = sliderEvent.target.value;
        }, false);
        return div
    }

}

window.onload = function () {

    fetch('./audio/sounds.js')
        .then(response => response.text())
        .then(text => JSON.parse(text).data)
        .then(data => new AudioPlayer(data))
        .then(AudioPlayer => {
            AudioPlayer.tracks.forEach((track, index) => {
                AudioPlayer.writeToDocument(track);
            })
        })
        .catch(err => { console.log('Here be errors ' + err) })
}




