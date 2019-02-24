class AudioPlayer {

    constructor(tracks) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
        this.tracks = tracks;
        this.mainGainNode = this.audioCtx.createGain();
        this.handleStart = this.handleStart.bind(this);
        // this.mainGainNode.connect(this.audioCtx.destination)
        document.querySelector('#main-volume').addEventListener('input', (e) => {
            this.mainGainNode.gain.value = e.target.value;
            console.log(e)
        }, false);
    }

    formatFileName(fileName) {
        return fileName + '.' + (new Audio().canPlayType('audio/ogg') !== '' ? 'ogg' : 'mp3')
    }

    writeSoundBlock({ title, file }) {
        return (
            `<div class="sound-block">
            <h2>${title}</h2>
            <audio type="audio/mpeg"></audio>
            <button style="cursor: pointer" data-playing="false" role="switch" aria-checked="false" loop="true">play</button>
            <span>
                <label for="volume">volume</label>
                <input type="range" class="volume" min="0" max="2" value="1" step="0.01" />
            </span>
        </div>`)
    }
    // Safari doesn't return promise, so we return our own.
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
                last.querySelector('button').addEventListener('click', (buttonEvent) => {

                    let parent = last.querySelector('button').parentNode;
                    last.querySelector('button').remove();

                    const newButton = document.createElement('button')
                    newButton.appendChild(document.createTextNode('pause'));

                    newButton.addEventListener('click', () => {
                        source.stop()
                    })
                    parent.insertAdjacentElement('afterbegin', newButton);

                    const source = this.audioCtx.createBufferSource();
                    source.buffer = decodedAudio;
                    const localGain = this.audioCtx.createGain();
                    last.querySelector('input').addEventListener('input', (sliderEvent) => {
                        localGain.gain.value = sliderEvent.target.value;
                    }, false);
                    // Safari returns undefined, so we have to step-by step connect the nodes instead of chaining.
                    source.connect(localGain);
                    localGain.connect(this.mainGainNode);
                    this.mainGainNode.connect(this.audioCtx.destination);
                    source.start();
                    source.loop = true;
                });
                return decodedAudio;
            })
    }

    handleStart(buttonEvent) {
        const source = this.audioCtx.createBufferSource();
        source.buffer = decodedAudio;
        const localGain = this.audioCtx.createGain();
        last.querySelector('input').addEventListener('input', (sliderEvent) => {
            localGain.gain.value = sliderEvent.target.value;
        }, false);
        // Safari returns undefined, so we have to step-by step connect the nodes instead of chaining.
        source.connect(localGain);
        localGain.connect(this.mainGainNode);
        this.mainGainNode.connect(this.audioCtx.destination);
        source.start();
        source.loop = true;
        // buttonEvent.target.removeEventListener('click')
        buttonEvent.target.addEventListener('click', () => {
            source.stop();
        })
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
                // AudioPlayer.tracks[index].decodedAudio = decodedAudio;
            })
        })
        .catch(err => { console.log('Here be errors ' + err) })
}




