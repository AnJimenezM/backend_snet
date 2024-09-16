import { Router } from "express";
const router = Router();
import { savePublication, showPublication, deletePublication, publicationsUser, uploadMedia, showMedia, feed } from "../controllers/publication.js";
import { ensureAuth } from "../middlewares/auth.js";
import multer from "multer";
import Publication from "../models/publications.js"
import { checkEntityExists } from "../middlewares/checkEntityExists.js"
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from 'cloudinary';

// Configuración de subida de archivos
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'publications',
    allowedFormats: ['jpg', 'png', 'jpeg', 'gif'],
    public_id: (req, file) => 'publication-' + Date.now(),
  },
});

// Configurar multer con límites de tamaño
const uploads = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 }  // Limitar tamaño a 1 MB
});

// Definir las rutas
router.post('/new-publication', ensureAuth, savePublication);
router.get('/show-publication/:id', ensureAuth, showPublication);
router.delete('/delete-publication/:id', ensureAuth, deletePublication);
router.get('/publications-user/:id/:page?', ensureAuth, publicationsUser);
router.post('/upload-media/:id', [ensureAuth, checkEntityExists(Publication, 'id'), uploads.single("file0")], uploadMedia);
router.get('/media/:file', showMedia);
router.get('/feed/:page?', ensureAuth, feed);

// Exportar el Router
export default router;