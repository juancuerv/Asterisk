# Sistema de apuestas telefónico del mundial Qatar 2022

Para el desarrollo de esta práctica, se requiere la implementación de una aplicación basada en alguna de las interfaces de Asterisk (AGI, AMI o ARI). Con estos lineamientos, se decidió utilizar la interfaz REST ARI. Para ello se diseñó una aplicación para una casa de apuestas deportivas, en la cual los usuarios pueden llamar a la extensión 1000 y realizar las siguientes funciones. Cuando el usuario marque a la extensión mencionada, se reproducirá un audio en el cual se da una breve bienvenida por parte de la casa de apuestas y las funcionalidades a las que puede acceder, teniendo dos posibilidades de marcado (1 y 2) de la siguiente manera:

1. La opción "1" le permite al usuario conocer el resultado de sus apuestas anteriores, por lo que, en un menú en formato de audio se le pedirá al usuario que digite su número de cédula y seguido a esto digite el símbolo "#" para confirmar que la cédula ingresada es correcta, o * para indicar que la cédula ingresada es incorrecta, lo cual hará que el menú se reinicie y le permita al usuario digitar nuevamente su número de cédula. Una vez confirmada la cédula, se realizará una consulta a una base de datos para corroborar si tiene resultados que informar, o si por el contrario, no se han encontrado registros de ninguna apuesta con el número de cédula proporcionado.

La opción "2" le permite al usuario realizar una nueva apuesta, por lo que, en un menú en formato de audio se le pedirá al usuario que digite su número de cédula y seguido a esto digite el símbolo "#" para confirmar que la cédula ingresada es correcta, o * para indicar que la cédula ingresada es incorrecta, lo cual hará que el menú se reinicie y le permita al usuario digitar nuevamente su número de cédula. Luego, se indicarán los próximos partidos disponibles para apostar en un menú. El usuario debe elegir el partido al cual va a apostar ingresando el digito correspondiente del menú. Justo después se deberá ingresar el marcador del partido, indicando los goles del local y los goles del visitante separados por un "#" (Ejemplo: 3#1). Posteriormente, se deberá ingresar el monto de la apuesta. Y finalmente, se confirma si la apuesta ha sido exitosa o si ha surgido algún problema. Si el usuario desea seguir apostando deberá marcar el "*" y si desea concluir la llamada deberá marcar "#". 

# Configuración del proyecto
npm install, para instalar todas las dependencias de node para el correcto funcionamiento.
npm install gtts, para instalar la api de google text to speech
npm i sox-audio, para instalar la api que convierte de mp3 a gsm
apt install libsox-fmt-all, para maneja las extensiones
npm install mysql

node index.js para ejecutar el sistema.


## Autores

- **Ana Isabel Caicedo**
- **Sofía Dussan Narvaez**
- **Juan Pablo Cuervo**
