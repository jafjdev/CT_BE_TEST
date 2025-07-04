
### Tecnologias y Librerias Utilizadas.

Proyecto backend en Node.js que utiliza Mongoose para la gestión de la base de datos y la conexión con los modelos definidos, Axios para realizar peticiones HTTP al proveedor Servivuelos y Zod para la validación de los cuerpos de las peticiones recibidas. Se implementaron Morgan y Winston para un sistema de logging robusto y, aunque no eran estrictamente necesarios en este proyecto, se incluyeron Cors y Helmet para configurar un entorno más seguro y realista.

NOTA: Se aplico una validacion adicional para que si existe algun bonus, como "retired" no apliquen para los children, solo funcionara para los adultos.

### Levantar el proyecto
- Instalar librerías
- `npm run docker:on` Levanta la base de datos y el proveedor (necesitas Docker)
- `npm run docker:off` Apaga y destruye todos los contenedores (necesitas Docker)
- `npm start` Arranca el backend
- `npm run lint` Ejecuta el linter para mostrar errores

### Resultados 

En la busqueda de MAD-BCN en la fecha de 2022-12-24 el resultado es de 2 estaciones, cada una con 2 timetables , 3 accommodations para cada 1 : 

Request directas a servivuelo

![image](https://github.com/user-attachments/assets/cf5b040a-696a-4c02-b6b8-57e559586c72)

![image](https://github.com/user-attachments/assets/92f8a27e-66a4-4b83-bd52-0d1e4337da99)

Request directas a el backend creado

![image](https://github.com/user-attachments/assets/5539c792-de3e-4f0c-aa27-cf09dd501e01)

Resultado en base de datos (2ESTACIONES * 2TIMETABLES *3ACCOMMODATIONS) = 12 elementos que serian las posibles rutas

![image](https://github.com/user-attachments/assets/bdd94b91-af21-4b76-8f14-f2c6b152a5fb)
