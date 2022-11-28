
'use strict'

const client = require('ari-client');

const generarAudio = require('./helpers/tts');
const convertirAudio = require('./helpers/sox');

//base de datos
///const connection = require('./db');
const { connection, consultasDB } = require('./db');

//-----------------------------------------------------

let cedula = '';
let datosCita = '';
let cedulaCita = '';
let fecha = '';
let query = '';
let resultado = '';
let text = '';
const pathAudios = `sound:/${__dirname}/audios/gsm/audio`;


client.connect('http://localhost:8088', 'asterisk', 'asterisk', function (err, ari) {

  if (err) {
    throw err; // program will crash if it fails to connect
  }

  // Use once to start the application
  ari.on('StasisStart', function (event, incoming) {

    // Handle DTMF events
    incoming.answer(setTimeout((err) => {
      play(incoming, 'sound:menuIntro')
    }, 3000));

    incoming.on('ChannelDtmfReceived', introMenu);

    async function introMenu(event, channel) {

      const digit = event.digit;

      switch (digit) {
        case '1':    //Consultar prueba de covid
          incoming.removeListener('ChannelDtmfReceived', introMenu);
          play(channel, 'sound:covidCedula');
          covid(event, incoming, channel)
          break;

        case '2': //Agendar cita medica 
          incoming.removeListener('ChannelDtmfReceived', introMenu);
          play(channel, 'sound:datosCita');
          citas(event, incoming);
          break;
        default:
          console.log('default')
          text = 'opción no válida, inténtelo de nuevo'
          await generarAudio(text);
          await convertirAudio();
          play(channel, pathAudios)
          //play(channel, 'sound:introduccion')
          break;
      }
    }

    function covid(event, incoming, channel) {
      cedula = '';
      console.log('---------consulta resultado covicho---------');
      incoming.on('ChannelDtmfReceived', covidCedula);
    }

    function citas(event, incoming) {
      datosCita = '';
      console.log('---------Agendar cita---------');
      incoming.on('ChannelDtmfReceived', agendarCita);
    }

  });


  /**
   *  Initiate a playback on the given channel.
   *
   *  @function play
   *  @memberof example
   *  @param {module:resources~Channel} channel - the channel to send the
   *    playback to
   *  @param {string} sound - the string identifier of the sound to play
   *  @param {Function} callback - callback invoked once playback is finished
   */
  function play(channel, sound, callback) {
    var playback = ari.Playback();
    playback.once('PlaybackFinished',
      function (event, instance) {

        if (callback) {
          callback(null);
        }
      });
    channel.play({ media: sound }, playback, function (err, playback) { });
  }

  async function covidCedula(event, incoming) {

    let dato = event.digit;

    // Grabacion de peticion de cedula y marcacion de #
    switch (dato) {
      case '#':
        incoming.removeListener('ChannelDtmfReceived', covidCedula);
        query = `SELECT * FROM covid c JOIN usuarios u ON u.cedula = c.cedulaUsuario WHERE u.cedula = ${cedula} LIMIT 1`

        resultado = await consultasDB(query)
          .then(function (resultado) {

            if (!resultado) return

            switch (resultado.resultado) {
              case 0:
                text = `${resultado.nombre}su resultado es negativo`
                break;

              case 1:
                text = `${resultado.nombre}su resultado es positivo`
                break;

              case 2:
                text = `${resultado.nombre}su resultado se encuentra pendiente`
                break;

              default:
                break;
            }
          })
          .catch(text = 'La consulta realizada ha sido fallida, intente de nuevo')

        await generarAudio(text);
        await convertirAudio()

        query = '';
        await play(incoming, pathAudios);
        incoming.removeListener('ChannelDtmfReceived', agendarCita);

        setTimeout(function () {
          colgarLLamada(incoming);
        }, 5000)

        break;

      case '*':
        cedula = '';
        incoming.removeListener('ChannelDtmfReceived', covidCedula);
        incoming.on('ChannelDtmfReceived', covidCedula)
        break

      default:
        cedula += dato;
        console.log('guardando cedula');
        console.log(cedula);
        break;
    }
  }


  async function agendarCita(event, incoming) {

    let dato = event.digit;

    //play(incoming, 'sound:hello-world');//Ingresa la fecha y cedula separados por * NOTA: No olvidar recordar el formato de los datos en el audio...

    // Grabacion de peticion de cedula y marcacion de #
    switch (dato) {
      case '#':
        incoming.removeListener('ChannelDtmfReceived', agendarCita);

        datosCita = datosCita.split('*');
        cedulaCita = datosCita[0];
        fecha = datosCita[1];

        const day = fecha.slice(6, 8);
        const month = fecha.slice(4, 6);
        const year = fecha.slice(0, 4);

        fecha = `${year}-${month}-${day}`;

        //console.log(`Cedula: ${cedulaCita} y fecha: ${fecha}`);

        query = `INSERT INTO citas (cedulaUsuario, fecha) VALUES ('${cedulaCita}', '${fecha}')`;

        await consultasDB(query)
          .then(async function () {

            text = 'Su cita ha sido agendada correctamente.'
          })
          .catch(function () {
            text = 'No se ha podido agendar su cita, inténtelo de nuevo'
          });

        await generarAudio(text);
        await convertirAudio()
        await play(incoming, pathAudios);


        await setTimeout(function () {
          colgarLLamada(incoming);
        }, 5000)


        query = '';
        cedulaCita = '';
        fecha = '';
        datosCita = '';

        //play(incoming, 'sound:vm-goodbye');//Confirmacion de datos

        break;

      default:
        datosCita += dato;
        console.log('guardando datos de cita');
        break;
    }
  }

  function colgarLLamada(incoming) {
    setTimeout(function () {
      incoming.hangup()
    }, 2000);
  }

  // can also use ari.start(['app-name'...]) to start multiple applications
  ari.start('hospital');

});