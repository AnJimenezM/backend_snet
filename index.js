import express from 'express';
import connection from './database/connection.js'
import bodyParser from 'body-parser';
import cors from 'cors';
import UserRoutes from './routes/user.js'
import PublicationRoutes from './routes/publication.js'
import FollowRoutes from './routes/follow.js'
import dotenv from "dotenv";
import { v2 as cloudinary } from 'cloudinary';


dotenv.config();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});




//Mensaje de bienvenida para verificar que ejecuta correctamente la API de node

console.log("API Node en ejecucion")

//Conexion a la base de datos

connection();

//Crear el servidor de Node 

 const app = express();
 const puerto = process.env.PORT || 3900;

 //Configurar cors para hacer las peticiones
app.use(cors({
        origin: '*',
        preflightContinue: false,
        methods: 'GET, HEAD, PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204
        
}));

//Decodificar los datos desde los formularios js

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Configurar  rutas del aplicativo 

app.use('/api/user', UserRoutes);
app.use('/api/publication', PublicationRoutes);
app.use('/api/follow', FollowRoutes);




//Configurar el servidor

app.listen(puerto, ()=>{
        console.log("Servidor de Node conectado y ejecutandose en el puerto", puerto);
});


 export default app;