
'use strict'

const client = require('ari-client');

const generarAudio = require('./helpers/tts');
const convertirAudio = require('./helpers/sox');

//base de datos
///const connection = require('./db');
const { connection, consultasDB } = require('./db');

//-----------------------------------------------------

let cedula = '';
let datosApuesta = '';
let cedulaApuesta = '';
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
        case '1':    //Consultar resultados de apuestas
          incoming.removeListener('ChannelDtmfReceived', introMenu);
          play(channel, 'sound:resultadosApuestas');
          resultadosApuestas(event, incoming, channel)
          break;

        case '2': //Realizar nueva apuesta 
          incoming.removeListener('ChannelDtmfReceived', introMenu);
          play(channel, 'sound:datosCita');
          citas(event, incoming);
          break;
        default:
          console.log('default')
          text = 'Opción no válida. Inténtelo de nuevo.'
          await generarAudio(text);
          await convertirAudio();
          play(channel, pathAudios)
          
          break;
      }
    }

    function resultadosApuestas(event, incoming, channel) {
      cedula = '';
      console.log('---------Consulta de resultados apuestas---------');
      incoming.on('ChannelDtmfReceived', resultadosCedula);
    }

    function citas(event, incoming) {
      datosApuesta = '';
      console.log('---------Realizar nueva apuesta---------');
      incoming.on('ChannelDtmfReceived', realizarApuesta);
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

  async function resultadosCedula(event, incoming) {

    let dato = event.digit;

    // Grabacion de peticion de cedula y marcacion de #
    switch (dato) {
      case '#':
        incoming.removeListener('ChannelDtmfReceived', resultadosCedula);        
        query = 'SELECT * FROM apuestas a JOIN usuarios u ON u.id = a.id_usuario WHERE u.cedula = ${cedula} LIMIT 1'
        

        resultado = await consultasDB(query)
          .then(function (resultado) {

            if (!resultado){
              text = 'No existen apuestas registradas en el sistema.'
              generarAudio(text);
              convertirAudio()
              return
            } 

            switch (resultado.resultado) {
              case 0: //Perdió la apuesta
                text = `Ha perdido la apuesta. Más suerte a la próxima.`
                break;

              case 1: //Ganó la apuesta
                text = `Ganó la apuesta. Felicitaciones, ${resultado.nombre}`
                break;

              case 2: //No se ha jugado el partido
                text = `El partido no se ha jugado.`
                break;

              default:
                break;
            }
          })
          .catch(text = 'Lo sentimos. La consulta falló, intente de nuevo.')

        await generarAudio(text);
        await convertirAudio()

        query = '';
        await play(incoming, pathAudios);
        incoming.removeListener('ChannelDtmfReceived', realizarApuesta);

        setTimeout(function () {
          colgarLLamada(incoming);
        }, 5000)

        break;

      case '*':
        cedula = '';
        incoming.removeListener('ChannelDtmfReceived', resultadosCedula);
        incoming.on('ChannelDtmfReceived', resultadosCedula)
        break

      default:
        cedula += dato;
        console.log('Guardando la cédula...');
        console.log(cedula); 
        break;
    }
  }


  async function realizarApuesta(event, incoming) {

    let dato = event.digit;
    

    // Grabacion de petición de cedula y marcacion de #
    switch (dato) {
      case '#':      
      
      incoming.removeListener('ChannelDtmfReceived', apostarPartido);   
      incoming.on('ChannelDtmfReceived', apostarPartido)      
      break

      default:
        cedulaApuesta += dato;
        console.log('Guardango cedula');
        console.log(cedula);
        break;
    }
  }
  
  async function apostarPartido(event, incoming){
    //Se muestran los últimos partidos disponibles para apostar en la fase de la competencia seleccionada
    let Partido;  
    query = 'SELECT * FROM partidos WHERE instancia="Grupos" and fecha >= now() LIMIT 1'
    
    resultado = await consultasDB(query)
        .then(function (resultado) {            
      if (!resultado){
        text = 'No existen partidos disponibles para apostar en el sistema.'
        generarAudio(text);
        convertirAudio()
        return
      } 

      switch (resultado.instancia) {
        case "Grupos": 
          text = `El último partido disponible en la fase de grupos es: ${resultado.local} vs ${resultado.visitante}. Si desea apostar, presione 1.`
          Partido = resultado.id;
          break;

        case "Octavos":
          text = `El último partido disponible en los octavos de final es: ${resultado.local} vs ${resultado.visitante}. Si desea apostar, presione 1.`
          Partido = resultado.id;
          break;

        case "Semifinales": 
          text = `El último partido disponible en las semifinales es: ${resultado.local} vs ${resultado.visitante}. Si desea apostar, presione 1.`
          Partido = resultado.id;
          break;
        
        case "Final": 
          text = `La final es: ${resultado.local} vs ${resultado.visitante}. Si desea apostar, presione 1.`
          Partido = resultado.id;
          break;              
        default:
          break;
      }
    })
    .catch(text = 'Lo sentimos. La consulta falló, intente de nuevo.')
    await generarAudio(text);
    await convertirAudio()

    //Se verifica si se presiona 1 para realizar la apuesta
    let datoPartido = event.digit;
          
    switch (datoPartido) {
    case '1':        
      await generarAudio("Ingresa el marcador y el monto que apostarás. Primero ingrese los goles del local, luego presione asterisco e ingrese los goles del visitante. Finalmente, presione asterisco e ingrese el monto de la apuesta. Cuando hayas acabado, presiona numeral");
      await convertirAudio()    
      incoming.removeListener('ChannelDtmfReceived', apostarDatos);   
      incoming.on('ChannelDtmfReceived', apostarDatos)     
    default:
      console.log('default')
      text = 'Opción no válida, inténtelo de nuevo'
      await generarAudio(text);
      await convertirAudio();
      play(channel, pathAudios)          
      break;
    
    }
    
  }   

  async function apostarDatos(event, incoming){
    let datoApuesta = event.digit;
    switch (datoApuesta) {
    case '#':
      datosApuesta = datosApuesta.split('*');
      cedulaApuesta = datosApuesta[0];
      marcadorLocal = datosApuesta[1];
      marcadorVisitante = datosApuesta[2];
      monto = datosApuesta[3];                
      
    query = `INSERT INTO apuesta (cedulaUsuario, fecha) VALUES ('${cedulaCita}', '${fecha}')`;

    await consultasDB(query)
      .then(async function () {

        text = 'Su apuesta se ha registrado correctamente.'
      })
      .catch(function () {
        text = 'No se ha podido registrar su apuesta, inténtelo de nuevo'
      }); 

    await generarAudio(text);
    await convertirAudio()
    await play(incoming, pathAudios);


    await setTimeout(function () {
      colgarLLamada(incoming);
    }, 5000)

    query = '';
    datosApuesta = '';
    cedulaApuesta ='';
    marcadorLocal = '';
    marcadorVisitante = '';
    monto = '';      
    //play(incoming, 'sound:vm-goodbye');//Confirmacion de datos    
    break;


    default:
    datosApuesta += datoApuesta;
    console.log('Guardando datos de apuesta');
    break;
    }    
  }
  
  function colgarLLamada(incoming) {
    setTimeout(function () {
      incoming.hangup()
    }, 2000);
  }

  // can also use ari.start(['app-name'...]) to start multiple applications
  ari.start('apuestas');

});
