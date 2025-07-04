### Tecnologías y Librerías Utilizadas

Proyecto backend en Node.js que implementa un sistema de logging robusto con **Morgan** y **Winston**, y utiliza **Mongoose** para la gestión de la base de datos y la conexión con los modelos definidos. **Axios** se emplea para realizar las peticiones HTTP al proveedor Servivuelos, mientras que **Zod** se usa para la validación de los cuerpos de las peticiones recibidas. Además, se incluyeron **Cors** y **Helmet**, que aunque no eran estrictamente necesarios en este proyecto, permiten configurar un entorno más seguro y realista.

**Nota:** Se aplicó una validación adicional para que los bonus, como `retired`, solo se apliquen a los adultos y no a los children.

El proyecto permite realizar peticiones tanto con el código de ciudades como con el de las estaciones propiamente. El ajuste para gestionar correctamente las estaciones se implementó en el último commit.

### Levantar el proyecto

- `npm install` Instalar librerías
- `npm run docker:on` Levanta la base de datos y el proveedor (necesitas Docker)
- `npm start` Arranca el backend
- `npm run lint` Ejecuta el linter para mostrar errores


### Apagar proyecto
- `npm run docker:off` Apaga y destruye todos los contenedores (necesitas Docker)
- `docker-compose down -v` Destruye los volumenes asociados para hacer limpieza de base de datos.

### Resultados

En la búsqueda de MAD-BCN en la fecha de 2022-12-24, el resultado incluye 2 estaciones, cada una con 2 timetables y 3 accommodations por cada uno:

**Request directas a Servivuelo**

![image](https://github.com/user-attachments/assets/cf5b040a-696a-4c02-b6b8-57e559586c72)

![image](https://github.com/user-attachments/assets/92f8a27e-66a4-4b83-bd52-0d1e4337da99)

**Request directas al backend creado**

![image](https://github.com/user-attachments/assets/5539c792-de3e-4f0c-aa27-cf09dd501e01)

**Resultado en base de datos** (2 estaciones * 2 timetables * 3 accommodations) = **12 elementos**, que representan las posibles rutas

![image](https://github.com/user-attachments/assets/bdd94b91-af21-4b76-8f14-f2c6b152a5fb)
