// mobile safari test
var myAudioContext = new webkitAudioContext();

request = new XMLHttpRequest();

request.open('GET', './audio/train.mp3', true);

request.responseType = 'arraybuffer';

request.addEventListener('load', bufferSound, false);

request.send();

var mySource;

function bufferSound(event) {

    var request = event.target;

    var source = myAudioContext.createBufferSource();

    source.buffer = myAudioContext.createBuffer(request.response, false);

    mySource = source;

    mySource.connect(myAudioContext.destination);
}

document.querySelector("#playButton").addEventListener("touchstart", function() {
    mySource.start(0);
    alert("yeah")
}, false)
