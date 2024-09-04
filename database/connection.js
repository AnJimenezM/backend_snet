import {connect} from "mongoose";
import dotenv from "dotenv"

dotenv.config();

const connection = async()=>{
    try {
        await connect(process.env.MONGODB_URI);
        console.log("conectado correctamente a db_social_net_DWFSV3-179")
    } catch (error) {
        console.error('error en la conexion', error)
        throw new Error("No se ha podido realizar la conexion a la base de datos")
    }
}


export default connection;