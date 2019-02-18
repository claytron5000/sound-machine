class AudioPlayer {
    constructor(tracks) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
        this.tracks = tracks;
    }

    formatFileName(fileName) {
        return fileName + '.' + (new Audio().canPlayType('audio/ogg') !== '' ? 'ogg' : 'mp3')
    }

    writeSoundBlock({ title, file }) {
        return (
            `<div class="sound-block">
            <h2>${title}</h2>
            <audio type="audio/mpeg"></audio>
            <button style="cursor: pointer" data-playing="false" role="switch" aria-checked="false" loop="true">play/pause</button>
            <span>
                <label for="volume">volume</label>
                <input type="range" class="volume" min="0" max="2" value="1" step="0.01" />
            </span>
        </div>`)
    }

    promiseDecodeAudioData(arrayBuffer) {
        return new Promise((resolve, reject) => {
            this.audioCtx.decodeAudioData(arrayBuffer, (decodedData) => { resolve(decodedData), (err) => { reject(err) } })
        })
    }

    writeToDocument(sound) {
        const container = document.querySelector('#sounds');
        container.insertAdjacentHTML('beforeend', this.writeSoundBlock(sound));
        const nodes = container.querySelectorAll('.sound-block')
        const last = nodes[nodes.length - 1];
        fetch(this.formatFileName(sound.file))
            .then(res => res.arrayBuffer())
            .then(buffer => this.promiseDecodeAudioData(buffer))
            .then(decodedAudio => {
                last.querySelector('button').addEventListener('click', () => {
                    const source = this.audioCtx.createBufferSource();
                    source.buffer = decodedAudio;
                    source.connect(this.audioCtx.destination);
                    source.start();
                });
            })
    }

}

window.onload = function () {

    fetch('./audio/sounds.js')
        // we could do better and actually response with json string
        .then(response => response.text())
        .then(text => JSON.parse(text).data)
        .then(data => new AudioPlayer(data))
        .then(AudioPlayer => {
            AudioPlayer.tracks.forEach(track => {
                AudioPlayer.writeToDocument(track);
            })
        })
        .catch(err => { console.log('Here be errors ' + err) })
}
