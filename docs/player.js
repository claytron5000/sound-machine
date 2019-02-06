const formatFileName = function (fileName) { return fileName + '.' + (new Audio().canPlayType('audio/ogg') !== '' ? 'ogg' : 'mp3') };

const promiseDecodeAudioData = function (arrayBuffer, audioCtx) {
    return new Promise((resolve, reject) => {
        audioCtx.decodeAudioData(arrayBuffer, (decodedData) => { resolve(decodedData), (err) => { reject(err) } })
    })
}

const writeSoundBlock = function ({ title, file }) {
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

/**
 * The Track object gives us a place to store the correct uri for the browser, the title, and 
 * potentially other information if required. It also provides methods with which to interact
 * with each sound.
 */
class Track {
    constructor(sound) {
        this.uri = formatFileName(sound.file)
        this.title = sound.title
    }

    addAudioCtx(audioCtx) {
        this.audioCtx = audioCtx
    }

    fetchAndLoad() {
        console.log(this.uri)
        return fetch(this.uri)
            .then(res => res.arrayBuffer())
            .then(buff => this.audioCtx.decodeAudioData(buff))
            .then(decodedData => { this.sourceData = decodedData })
    }

    playSound(element) {
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
    constructor(tracks) {


        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
        this.gainNode = this.audioCtx.createGain();
        // Add a reference to the AudioContext on each track.
        this.tracks = tracks.map(track => { track.addAudioCtx(this.audioCtx); return track; });
    }

    fetchAndLoadTracks() {
        return Promise.all(this.tracks.map(track => track.fetchAndLoad()))
    }
}

window.onload = function () {
    fetch('./audio/sounds.js')
        // we could do better and actually response with json string
        .then(response => response.text())
        .then(data => JSON.parse(data))
        // each of the sounds from our pretend API is mapped to our Track object
        .then(sounds => sounds.data.map(sound => new Track(sound)))
        // Our AudioPlayer object contains the AudioContext, and each of the Tracks.
        .then(tracks => new AudioPlayer(tracks))
        // We fetch the actual arrayBuffer from the files
        .then(audioPlayer => audioPlayer.fetchAndLoadTracks())

        .then(tracks => { console.log(tracks) })
        .catch(err => { console.log('Here be errors ' + err) })

    // .then(sounds => sounds.data.map(sound => writeSoundBlock(sound)))
    // .then(soundBlocks => {
    //     // Side effects! Write the html
    //     const blocks = soundBlocks.reduce((acc, curr) => acc + curr)
    //     document.querySelector('.sounds').insertAdjacentHTML('afterbegin', blocks);
    //     return soundBlocks
    // })
    // .then(soundBlocks => {
    //     const soundBlockNodes = document.querySelectorAll('.sound-block');
    //     const volumeControl = document.querySelector('#master-volume')
    //     const player = new AudioPlayer(soundBlockNodes, volumeControl)
    // })
}
