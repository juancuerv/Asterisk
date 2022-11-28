//Este archivo lo usamos para crear los archivos de audio
const gTTS = require('gtts');

const generarAudio = ( texto ) => {
    
    const gtts = new gTTS(texto, 'es');

    return new Promise( (resolve, reject ) => {
        gtts.save('audios/mp3/audio.mp3', function (err, result) {
            if (err) return resolve(err)
            resolve("Text to speech converted!");
        });
    });
}


module.exports = generarAudio;