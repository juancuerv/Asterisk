# Sistema contestador de llamadas para un hospital

Para el desarrollo de esta práctica, se requiere la implementación de una aplicación basada en alguna de las interfaces de Asterisk (AGI, AMI o ARI). Con estos lineamientos, se decidió utilizar la interfaz REST ARI. Para ello se diseñó una aplicación para una IPS (Institución Prestadora de Servicios), en la cual los usuarios de esta IPS pueden llamar a la extensión 1000 y realizar las siguientes funciones.

Cuando el usuario marque a la extensión mencionada, se reproducirá un audio en el cual se da una introducción a la IPS y las funcionalidades a las que puede acceder, teniendo dos posibilidades de marcado (1 y 2) de la siguiente manera.

La opción **1** le permite al usuario conocer el resultado de su prueba de Covid-19 realizada con anterioridad, para ello, un menú en formato de audio le pedirá al usuario que digite su número de cédula y seguido a esto digite el símbolo **#** para confirmar que la cédula ingresada es correcta, o * para indicar que la cédula ingresada es incorrecta, lo cual hará que el menú se reinicie y le permita al usuario digitar nuevamente su número de cédula. Una vez confirmada la cédula, se realizará un consulta en una base de datos para así informarle al llamante si su resultado para prueba de Covid-19 es positivo, negativo, pendiente o si por el contrario no se ha registrado ninguna prueba para el número de cédula proporcionado.

La opción **2** .................

# Configuración del proyecto

Una vez clonado el repositorio, no olvidar ejecutar 
```
npm install
```
para intalar todas las dependencias de node para el correcto funcionamiento.

## Autores

- **Santiago Andrés Zúñiga Sanchez**
- **Lina Virginia Muñoz Garcés**
- **Juan Diego Bravo Guevara**