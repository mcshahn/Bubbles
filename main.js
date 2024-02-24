var audioCtx;
var brownNoise1;
var brownNoise2;
var lpf1;
var lpf2; 
var rhpf;
function initBrownNoise(){
    if (!audioCtx){
        audioCtx = new (window.AudioContext || window.webkitAudioContext);
    }
    var bufferSize = 10 * audioCtx.sampleRate,
    noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate),
    output = noiseBuffer.getChannelData(0);

    var lastOut = 0;
    for (var i = 0; i < bufferSize; i++) {
        var brown = Math.random() * 2 - 1;
    
        output[i] = (lastOut + (0.02 * brown)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
    }

    brownNoise = audioCtx.createBufferSource();
    brownNoise.buffer = noiseBuffer;
    brownNoise.loop = true;
    brownNoise.start(0);
    
    return brownNoise;
    // brownNoise.connect(audioCtx.destination)
}

function initLowPass(freq) {

    biquadFilter = audioCtx.createBiquadFilter();

    biquadFilter.type = "lowpass";
    biquadFilter.frequency.setValueAtTime(freq, audioCtx.currentTime);
    biquadFilter.gain.setValueAtTime(0, audioCtx.currentTime);

    return biquadFilter;

}

function initRHPF(){
    biquadFilter = audioCtx.createBiquadFilter();

    biquadFilter.type = "highpass";
    biquadFilter.Q.value = 1.0/0.03;
   
    return biquadFilter;
}

function initGain(){
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 400;
    return gainNode
}

const playButton = document.getElementById('play');
playButton.addEventListener('click', function () {

    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext);
        var globalGain = audioCtx.createGain()
        globalGain.gain.value = 0.25;
        globalGain.connect(audioCtx.destination)
        brownNoise1 = initBrownNoise();
        lpf1 = initLowPass(400);
        rhpf = initRHPF();
        

        brownNoise1.connect(lpf1).connect(rhpf).connect(globalGain);

        brownNoise2 = initBrownNoise();
        lpf2 = initLowPass(14);

        gainNode = initGain();
        osc = audioCtx.createOscillator();
        osc.frequency.value = 500;
        osc.start();
        interGainNode = audioCtx.createGain();
        interGainNode.gain.value = 1;

        gainNode.connect(interGainNode);
        osc.connect(interGainNode);

        brownNoise2.connect(lpf2).connect(gainNode)
        interGainNode.connect(rhpf.frequency);
        
        return;
    }

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if (audioCtx.state === 'running') {
        audioCtx.suspend();
    }

}, false);