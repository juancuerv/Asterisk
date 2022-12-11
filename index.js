'use strict';

var ClienteARI = require('ari-client');             //cliente

const generarAudio = require('./helpers/tts');
const convertirAudio = require('./helpers/sox');

const { connection, consultadb } = require('./dataBase');
let cedula = '';
let tipo_apuesta='';
let id_usuario;
let id_partido='';
let marcador1='';
let marcador2='';
let datosapuesta='';
let monto='';

let query='';
let resultado='';
let text = '';
let resultaux='';
const pathAudios = `sound:/${__dirname}/audios/gsm/audio`;


ClienteARI.connect('http://localhost:8088', 'asterisk', 'asterisk', function (err, ari) {

  if (err) {
    throw err;
  }

  // Use once to start the application
  ari.on('StasisStart', function (event, incoming) {

    incoming.answer(setTimeout((err) => {
     play(incoming,`sound:/${__dirname}/menuIntro`)
    }, 2000));

    console.log('---- Menu Inicio ---');
    console.log('Ingrese 1 para consultar una apuesta.');
    console.log('Ingrese 2 para realizar una nueva apuesta.');
    incoming.on('ChannelDtmfReceived', introMenu);


    async function introMenu(event, channel) {

      const digit = event.digit;

      switch (digit) {
        case '1':    //Consultar resultados de apuestas
          incoming.removeListener('ChannelDtmfReceived', introMenu);
          //play(channel, 'sound:ConsultaApuestaCedula');
          console.log('- ConsultarApuesta -');
	 text='Por favor digite su cédula, seguida de la tecla numeral.';
	  await generarAudio(text);
          await convertirAudio();
          await play(incoming,pathAudios);
          console.log('Digite su cedula seguido de la tecla #');
          console.log('Si está inconforme con el número ingresado, digite *');
          consultA(event, incoming, channel);
          break;

        case '2': //Realizar una nueva apuesta
          incoming.removeListener('ChannelDtmfReceived', introMenu);
          //play(channel, 'sound:nuevaApuesta');
          console.log('- RealizarApuesta -');
	  text='Por favor digite su cédula, seguida de la tecla numeral.';
	  await generarAudio(text);
 	  await convertirAudio();
 	  await play(incoming,pathAudios);
          console.log('Digite su cedula seguido de la tecla #');
          console.log('Si está inconforme con el número ingresado, digite *');
          nuevaA(event, incoming);
          break;

        default:
          console.log('default');
          text = 'opción no válida, inténtelo de nuevo';
          console.log(text);
          break;
      }
    }

    function consultA(event, incoming, channel) {
      cedula = '';
      console.log('---------consultar resultados de apuestas---------');
      incoming.on('ChannelDtmfReceived', consultarApuesta);
    }

    function nuevaA(event, incoming) {
      cedula = '';
      console.log('---------Realizar una nueva apuesta---------');
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



  async function consultarApuesta(event, incoming) {
    let dato = event.digit;
    // Grabacion de peticion de cedula y marcacion de #
    switch (dato) {
      case '#':
        incoming.removeListener('ChannelDtmfReceived', consultarApuesta);
	console.log('## Seleccion de tipo de apuesta a consultar ##');
        console.log('1. última apuesta ganada y no pagada');
        console.log('2. Última apuesta pérdida');
        console.log('3. Última apuesta no jugada');
	text='Seleccion de tipo de apuesta a consultar: 1. última apuesta ganada y no pagada. 2. Última apuesta pérdida. 3. Última apuesta no jugada.';
	await generarAudio(text);
	await convertirAudio();
	await play(incoming, pathAudios);
        incoming.on('ChannelDtmfReceived', consultaTipoA);
        break;

      case '*':
        cedula = cedula.substring(0,cedula.length-1);
        console.log('retirando cedula');
        console.log(cedula);
        break;

      default:
        cedula += dato;
        console.log('ingresando cedula');
        console.log(cedula);
        break;
    }
  }

  async function consultaTipoA(event, incoming) {
    let dato = event.digit;
    switch (dato) {
      case '1':
        console.log('-- Consulta última apuesta ganada y no pagada --');
        tipo_apuesta='2';
        incoming.removeListener('ChannelDtmfReceived', consultaTipoA);
        query = 'SELECT partidos.local, partidos.visitante, apuestas.goles_local, apuestas.goles_visitante, apuestas.monto, partidos.fecha_partido FROM apuestas INNER JOIN usuarios ON apuestas.id_usuario=usuarios.id_usuario INNER JOIN partidos ON partidos.id_partido=apuestas.id_partido WHERE usuarios.cedula = '+cedula+' and apuestas.jugado='+tipo_apuesta+' and apuestas.pagado=0 ORDER BY apuestas.id_apuesta desc limit 1';
        console.log(query);
        resultado = await consultadb(query)
          .then(async function (resultado) {
            if (!resultado) return
            if(resultado.length!=0){
              resultaux=JSON.parse(JSON.stringify(resultado));
              text ='Usted ha ganado la apuesta '+resultaux[0].local+' versus '+resultaux[0].visitante+' con el marcador '+resultaux[0].goles_local+' a '+resultaux[0].goles_visitante+' y el monto de '+resultaux[0].monto+'. Este partido se jugó el '+resultaux[0].fecha_partido.slice(0,10)+'. ';
	    }else{
              text = 'Usted no cuenta con apuestas ganadas. ';
              console.log('Resultado vacío');
            }
          })
          .catch(text = 'La consulta realizada ha sido fallida, intente de nuevo. ')
	  query = '';
	text=text+'Gracias por preferirnos, esperamos que disfrutes de este mundial. Hasta pronto. ';
        console.log(text);
        await generarAudio(text);
        await convertirAudio();
        await play(incoming, pathAudios);
	setTimeout(function () {
          colgarLLamada(incoming);
        }, 20000)
        break;

      case '2':
        console.log('-- Consulta última apuesta pérdida--');
        tipo_apuesta='1';
        incoming.removeListener('ChannelDtmfReceived', consultaTipoA);
        query = 'SELECT partidos.local, partidos.visitante, apuestas.goles_local, apuestas.goles_visitante, apuestas.monto, partidos.fecha_partido FROM apuestas INNER JOIN usuarios ON apuestas.id_usuario=usuarios.id_usuario INNER JOIN partidos ON partidos.id_partido=apuestas.id_partido WHERE usuarios.cedula = '+cedula+' and apuestas.jugado='+tipo_apuesta+' ORDER BY apuestas.id_apuesta desc limit 1';
        console.log(query);
        resultado = await consultadb(query)
            .then(function (resultado) {
              console.log('se obtiene resultado');
              console.log(resultado);
             if(resultado.length!=0){
                resultaux=JSON.parse(JSON.stringify(resultado));
                text ='Usted ha pérdido la apuesta '+resultaux[0].local+' versus '+resultaux[0].visitante+' con el marcador '+resultaux[0].goles_local+' a '+resultaux[0].goles_visitante+' y el monto de '+resultaux[0].monto+'. Este partido se jugò el '+resultaux[0].fecha_partido.slice(0,10)+'. ';
              }else{
                text = 'Usted no cuenta con apuestas pérdidas. ';
                console.log('Resultado vacío');
              }
            })
            .catch(text = 'La consulta realizada ha sido fallida, intente de nuevo. ')

        query = '';
	text=text+'Gracias por preferirnos, esperamos que disfrutes de este mundial. Hasta pronto. ';
        console.log(text);
        await generarAudio(text);
        await convertirAudio();
        await play(incoming, pathAudios);
	setTimeout(function () {
            colgarLLamada(incoming);
        }, 20000)
        break;

      case '3':
        console.log('-- Consulta última apuesta no jugada--');
        tipo_apuesta='0';
        incoming.removeListener('ChannelDtmfReceived', consultaTipoA);
        query = 'SELECT partidos.local, partidos.visitante, apuestas.goles_local, apuestas.goles_visitante, apuestas.monto, partidos.fecha_partido FROM apuestas INNER JOIN usuarios ON apuestas.id_usuario=usuarios.id_usuario INNER JOIN partidos ON partidos.id_partido=apuestas.id_partido WHERE usuarios.cedula = '+cedula+' and apuestas.jugado='+tipo_apuesta+' ORDER BY apuestas.id_apuesta desc limit 1';
        console.log(query);
        resultado = await consultadb(query)
            .then(function (resultado) {
              if(resultado.length!=0){
		resultaux=JSON.parse(JSON.stringify(resultado));
                text ='Usted ha apostado al partido '+resultaux[0].local+' versus '+resultaux[0].visitante+' con el marcador '+resultaux[0].goles_local+' a '+resultaux[0].goles_visitante+' y el monto de '+resultaux[0].monto+'. Este partido se jugará el '+resultaux[0].fecha_partido.slice(0,10)+'. ';
              }else{
                text = 'Usted no ha realizado ninguna apuesta o todas ya cuantan con un resultado.';
                console.log('Resultado vacío');
              }
            })
            .catch(text = 'La consulta realizada ha sido fallida, intente de nuevo')
	query = '';
        text=text+'Gracias por preferirnos, esperamos que disfrutes de este mundial. Hasta pronto. ';
	console.log(text);
	await generarAudio(text);
        await convertirAudio();
        await play(incoming, pathAudios);
        setTimeout(function () {
            colgarLLamada(incoming);
        }, 20000)
        break;

      default:
        incoming.removeListener('ChannelDtmfReceived', consultaTipoA);
        console.log('default');
        text = 'Tipo de apuesta no válida, inténtelo de nuevo. ';
        console.log(text);
	await generarAudio(text);
        await convertirAudio();
        await play(incoming, pathAudios);
        incoming.on('ChannelDtmfReceived', consultarApuesta);
        break;
    }
  }

  async function realizarApuesta(event, incoming) {
    let dato2 = event.digit;
    switch (dato2) {
      case '#':
        incoming.removeListener('ChannelDtmfReceived', realizarApuesta);
	console.log('Concluye ingreso de cèdula');
        incoming.on('ChannelDtmfReceived', elegirPartido);
        break;

      case '*':
        cedula = cedula.substring(0,cedula.length-1);
        console.log('retirando cedula');
        console.log(cedula);
        break;

      default:
        cedula += dato2;
        console.log('ingresando cedula');
        console.log(cedula);
        break;
    }
  }

  async function elegirPartido(event, incoming) {
    console.log('-- Consulta partidos para apostar --');
    query = 'SELECT * FROM partidos WHERE fecha_partido>=now() ORDER BY fecha_partido ASC LIMIT 2;';
      console.log(query);
      resultado = await consultadb(query)
        .then(async function (resultado) {
          if (!resultado) return
          if(resultado.length!=0){
            resultaux=JSON.parse(JSON.stringify(resultado));
            text ='1. '+resultaux[0].local+' versus '+resultaux[0].visitante+'. Fecha: '+resultaux[0].fecha_partido.slice(0,10)+'. ';
            text =text+'2. '+resultaux[1].local+' versus '+resultaux[1].visitante+'. Fecha: '+resultaux[1].fecha_partido.slice(0,10)+'. ';
            console.log(text);
   	    await generarAudio(text);
            await convertirAudio();
            await play(incoming, pathAudios);
   	    incoming.removeListener('ChannelDtmfReceived', elegirPartido);
            incoming.on('ChannelDtmfReceived', elegirPartido2);
          }else{
            text = 'No hay partido próximos para apostar. ';
            console.log('Resultado vacío');
            console.log(text);
   	    await generarAudio(text);
            await convertirAudio();
            await play(incoming, pathAudios);
            incoming.removeListener('ChannelDtmfReceived', elegirPartido);
   	    setTimeout(function () {
              colgarLLamada(incoming);
            }, 4000)
          }
        })
        .catch(console.log('La consulta realizada ha sido fallida, intente de nuevo'))
}

  async function elegirPartido2(event, incoming) {
    let dato3 = event.digit;
    switch (dato3) {
      case '1':
        datosapuesta='';
        id_partido=resultaux[0].id_partido;
        incoming.removeListener('ChannelDtmfReceived', elegirPartido2);
        console.log('-- apuesta --');
        text='ingrese los datos en el siguiente formato: marcador1, marcador2, monto de la apuesta y #. Sin espacios. Recuerde que el marcador de cada equipo sólo puede ir de 0 a 9. ';
	console.log(text);
	await generarAudio(text);
        await convertirAudio();
        await play(incoming, pathAudios);
	incoming.on('ChannelDtmfReceived', elegirPartido21);
        break;

      case '2':
        datosapuesta='';
        id_partido=resultaux[1].id_partido;
        incoming.removeListener('ChannelDtmfReceived', elegirPartido2);
        console.log('-- apuesta --');
        text='ingrese los datos en el siguiente formato: marcador1, marcador2, monto de la apuesta y #. Sin espacios. Recuerde que el marcador de cada equipo sólo puede ir de 0 a 9. ';
        console.log(text);
        await generarAudio(text);
        await convertirAudio();
        await play(incoming, pathAudios);
        incoming.on('ChannelDtmfReceived', elegirPartido22);
        break;

      default:
        console.log('default');
        text = 'Opción no válida, inténtelo de nuevo. ';
        console.log(text);
        await generarAudio(text);
        await convertirAudio();
        await play(incoming, pathAudios);
        incoming.on('ChannelDtmfReceived', elegirPartido);
        break;
    }
  }

  async function elegirPartido21(event, incoming) {
  let dato4 = event.digit;
        switch (dato4) {
          case '#':
            incoming.removeListener('ChannelDtmfReceived', elegirPartido21);
            marcador1=datosapuesta.slice(0,1);
            marcador2=datosapuesta.slice(1,2);
            monto=datosapuesta.slice(2,datosapuesta.length);
            incoming.on('ChannelDtmfReceived', registrarApuesta);
            break;

          case '*':
            datosapuesta = datosapuesta.substring(0,datosapuesta.length-1);
            console.log('retirando datos apuesta');
            console.log(datosapuesta);
            break;

          default:
            datosapuesta += dato4;
            console.log('ingresando datos apuesta');
            console.log(datosapuesta);
            break;
        }
  }

  async function elegirPartido22(event, incoming) {
    let dato5 = event.digit;
    switch (dato5) {
      case '#':
        incoming.removeListener('ChannelDtmfReceived', elegirPartido22);
        marcador1=datosapuesta.slice(0,1);
        marcador2=datosapuesta.slice(1,2);
        monto=datosapuesta.slice(2,datosapuesta.length);
        incoming.on('ChannelDtmfReceived', registrarApuesta);
        break;

      case '*':
        datosapuesta = datosapuesta.substring(0,datosapuesta.length-1);
        console.log('retirando datos apuesta');
        console.log(datosapuesta);
        break;

      default:
        datosapuesta += dato5;
        console.log('ingresando datos apuesta');
        console.log(datosapuesta);
        break;
    }
  }

  async function registrarApuesta(event, incoming) {
    incoming.removeListener('ChannelDtmfReceived', registrarApuesta);
    query = 'SELECT * FROM `usuarios` WHERE cedula='+cedula;
    console.log(query);
    resultado = await consultadb(query)
      .then(async function (resultado) {
        if (!resultado) return
        if(resultado.length!=0){
          resultaux=JSON.parse(JSON.stringify(resultado));
          id_usuario=resultaux[0].id_usuario;
          console.log(id_usuario);
        }else{
          text = 'Usted no se encuentra registrado en nuestro sistema. ';
          console.log('Resultado vacío');
 	  await generarAudio(text);
          await convertirAudio();
          await play(incoming, pathAudios);
          console.log(text);
          setTimeout(function () {
            colgarLLamada(incoming);
          }, 4000)
        }
      })
      .catch(console.log('La consulta realizada ha sido fallida, intente de nuevo. '))
   // console.log(cedula);
   // console.log(id_partido);
   // console.log(marcador1);
   // console.log(marcador2);
   // console.log(monto);
    query = 'INSERT INTO apuestas(`id_usuario`, `id_partido`, `goles_local`, `goles_visitante`, `monto`, `fecha_apuesta`, `jugado`, `pagado`) VALUES ('+id_usuario+','+id_partido+','+marcador1+','+marcador2+','+monto+',now(),0,0)';
    console.log(query);
    resultado = await consultadb(query)
      .then(function (resultado) {
        if (!resultado) return
          text = 'Apuesta registrada Exitosamente. ';
      })
      .catch(text = 'La apuesta no fue registrada, intentelo de nuevo. ')
    query = '';
    text=text+'Gracias por preferirnos, esperamos que disfrutes de este mundial. Hasta pronto. ';
    console.log(text);
    await generarAudio(text);
    await convertirAudio();
    await play(incoming, pathAudios);
    setTimeout(function () {
      colgarLLamada(incoming);
    }, 10000)
       
  }

  function colgarLLamada(incoming) {
    setTimeout(function () {
      incoming.hangup();
    }, 2000);
  }

  ari.start('mundialFutbol3');

});
