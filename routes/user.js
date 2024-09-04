import { Router } from "express";
const router = Router();
import {  register, login, testUser, profile, listUsers, updateUser, uploadAvatar, avatar, counters} from "../controllers/user.js";
import { ensureAuth } from "../middlewares/auth.js";
import multer from 'multer';
import User from '../models/users.js'
import { checkEntityExists } from "../middlewares/checkEntityExists.js";

// Configuracion de subida de archivos 
const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "./uploads/avatars")
    }, 
    filename: (req, file, cb) =>{
        cb(null, "avatar-"+Date.now()+ "-"+file.originalname);
    }
});
const uploads = multer({storage});



//definir las rutas

router.post('/register', register);
router.post('/login', login);
router.get('/test-user', ensureAuth, testUser)
router.get('/profile/:id', ensureAuth, profile);
router.get('/list/:page?', ensureAuth, listUsers);
router.put('/update', ensureAuth, updateUser);
router.post('/upload-avatar', [ensureAuth, checkEntityExists(User, 'user_id'), uploads.single("file0")], uploadAvatar);
router.get('/avatar/:file', avatar);
router.get('/counters/:id?', ensureAuth, counters);
//Exportar router

export default router;