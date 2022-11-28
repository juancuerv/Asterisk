//Este archivo lo usamos para pasar los audios de extension mp3 a extension gsm y poder ser reroducidos por asterisk

const SoxCommand = require('sox-audio');

const convertirAudio = () => {

  return new Promise((resolve, reject) => {

    const command = SoxCommand()
      .input('audios/mp3/audio.mp3')     //Aqui le pasamos la ruta del archivo de audio que va a er convertido
      .output('audios/gsm/audio.gsm');   //Aqui ponemos la ruta donde se guardara el archivo de audio

    command.on('prepare', function (args) {
      console.log('Preparing sox command with args ' + args.join(' '));
    });

    command.on('start', function (commandLine) {
      console.log('Spawned sox with command ' + commandLine);
    });

    command.on('progress', function (progress) {
      console.log('Processing progress: ', progress);
    });

    command.on('error', function (err, stdout, stderr) {
      console.log('Cannot process audio: ' + err.message);
      console.log('Sox Command Stdout: ', stdout);
      console.log('Sox Command Stderr: ', stderr)
      //reject(err);
    });

    command.on('end', function () {
      resolve('Sox command succeeded!');
    });

    command.run();
  })
  
}

module.exports = convertirAudio;