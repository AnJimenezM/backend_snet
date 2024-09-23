import Publication from "../models/publications.js"
import { followUserIds } from "../services/followServices.js"

// Método para hacer una publicación
export const savePublication = async (req, res) => {
  try {

    // Obtener datos del body
    const params = req.body;

    // Verificar que llegue desde el body el parámetro text con su información
    if (!params.text){
      return res.status(400).send({
        status: "error",
        message: "Debes enviar el texto de la publicación"
      });
    }

    // Crear el objeto del modelo
    let newPublication = new Publication(params);

    // Agregar la información del usuario autenticado al objeto de la nueva publicación
    newPublication.user_id = req.user.userId;

    // Guardar la nueva publicación en la BD
    const publicationStored = await newPublication.save();

    // Verificar si se guardó la publicación en la BD (si existe publicationStored)
    if (!publicationStored){
      return res.status(500).send({
        status: "error",
        message: "No se ha guardado la publicación"
      });
    }

    // Devolver respuesta exitosa
    return res.status(200).json({
      status: "success",
      message: "¡Publicación creada con éxito!",
      publicationStored
    });

  } catch (error) {
    console.log("Error al crear la publicación:", error);
    return res.status(500).send({
      status: "error",
      message: "Error al crear la publicación"
    });
  }
}

// Método para mostrar la publicación
export const showPublication = async (req, res) => {
  try {

    // Obtener el id de la publicación de la url
    const publicationId = req.params.id;

    // Buscar la publicación por id desde la BD
    const publicationStored = await Publication.findById(publicationId)
    .populate('user_id', 'name last_name');

    // Verificar si se encontró la publicación
    if (!publicationStored) {
      return res.status(500).send({
        status: "error",
        message: "No existe la publicación"
      });
    }

    // Devolver respuesta exitosa
    return res.status(200).json({
      status: "success",
      message: "Publicación encontrada",
      publication: publicationStored
    });

  } catch (error) {
    console.log("Error al mostrar la publicación:", error);
    return res.status(500).send({
      status: "error",
      message: "Error al mostrar la publicación"
    });
  }
}

// Método para eliminar una publicación
export const deletePublication = async (req, res) => {
  try {
    // Obtener el id de la publicación que se quiere eliminar
    const publicationId = req.params.id;

    // Encontrar y eliminar la publicación
    const publicationDeleted = await Publication.findOneAndDelete({ user_id: req.user.userId, _id: publicationId}).populate('user_id', 'name last_name');

    // Verificar si se encontró y eliminó la publicación
    if (!publicationDeleted) {
      return res.status(404).send({
        status: "error",
        message: "No se ha encontrado o no tienes permiso para eliminar esta publicación"
      });
    }

    // Devolver respuesta exitosa
    return res.status(200).json({
      status: "success",
      message: "Publicación eliminada con éxito",
      publication: publicationDeleted
    });

  } catch (error) {
    console.log("Error al mostrar la publicación:", error);
    return res.status(500).send({
      status: "error",
      message: "Error al eliminar la publicación"
    });
  }
}

// Método para listar publicaciones de un usuario
export const publicationsUser = async (req, res) => {
  try {
    // Obtener el id del usuario
    const userId = req.params.id;

    // Asignar el número de página
    let page = req.params.page ? parseInt(req.params.page, 10) : 1;

    // Número de usuarios que queremos mostrar por página
    let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5;

    // Configurar las opciones de la consulta
    const options = {
      page: page,
      limit: itemsPerPage,
      sort: { created_at: -1 },
      populate: {
        path: 'user_id',
        select: '-password -role -__v -email'
      },
      lean: true  // Hace que la consulta retorne objetos JS puros, en vez de documentos Mongoose
    };

    // Buscar las publicaciones del usuario
    const publications = await Publication.paginate({ user_id: userId }, options);

    if (!publications.docs ||publications.docs.length <= 0 ){
      return res.status(404).send({
        status: "error",
        message: "No hay publicaciones para mostrar"
      });
    }

    // Devolver respuesta exitosa
    return res.status(200).json({
      status: "success",
      message: "Publicaciones del usuario: ",
      publications: publications.docs,
      total: publications.totalDocs,
      pages: publications.totalPages,
      page: publications.page,
      limit_items_ppage: publications.limit
    });

  } catch (error) {
    console.log("Error al mostrar la publicación:", error);
    return res.status(500).send({
      status: "error",
      message: "Error al listar las publicación"
    });
  }
}

// Método para subir archivos (imagen) a las publicaciones que hacemos
export const uploadMedia = async (req, res) => {
  try {
    // Obtener el id de la publicación
    const publicationId = req.params.id;

    // Verificar si la publicación existe en la base de datos antes de subir el archivo
    const publicationExists = await Publication.findById(publicationId);
    if (!publicationExists) {
      return res.status(404).send({
        status: "error",
        message: "No existe la publicación"
      });
    }

    // Verificar si se ha subido un archivo
    if (!req.file) {
      return res.status(400).send({
        status: "error",
        message: "La petición no incluye la imagen"
      });
    }

    // Comprobamos que existe el archivo en el body
    if (!req.file) {
      return res.status(400).send({
        status: "error",
        message: "La petición no incluye la imagen"
      });
    }

    // Obtener la URL de Cloudinary
    const mediaUrl = req.file.path;

    // Si todo es correcto, actualizar la publicación con la URL de la imagen en Cloudinary
    const publicationUpdated = await Publication.findByIdAndUpdate(
      publicationId,
      { file: mediaUrl },
      { new: true }
    );

    // Verificar si la actualización fue exitosa
    if (!publicationUpdated) {
      return res.status(500).send({
        status: "error",
        message: "Error en la subida del archivo"
      });
    }

    // Devolver respuesta exitosa
    return res.status(200).json({
      status: "success",
      message: "Archivo subido con éxito",
      publication: publicationUpdated,
      file: mediaUrl
    });

  } catch (error) {
    console.error("Error al subir el archivo a la publicación", error);
    return res.status(500).send({
      status: "error",
      message: "Error al subir el archivo a la publicación"
    });
  }
}

// Método para mostrar el archivo subido a la publicación
export const showMedia = async (req, res) => {
  try {
    // Obtener el id de la publicación
    const publicationId = req.params.file;

    // Buscar la publicación en la base de datos
    const publication = await Publication.findById(publicationId).select('file');

    // Verificar si la publicación existe y tiene un archivo
    if (!publication || !publication.file) {
      return res.status(404).send({
        status: "error",
        message: "No existe el archivo para esta publicación"
      });
    }

    // Devolver la URL del archivo almacenado en Cloudinary
    return res.status(200).json({
      status: "success",
      fileUrl: publication.file
    });

  } catch (error) {
    console.error("Error al mostrar el archivo de la publicación", error);
    return res.status(500).send({
      status: "error",
      message: "Error al mostrar archivo en la publicación"
    });
  }
}

// Método para listar todas las publicaciones de los usuarios que yo sigo (Feed)
export const feed = async (req, res) => {
  try {
    // Asignar el número de página
    let page = req.params.page ? parseInt(req.params.page, 10) : 1;

    // Número de publicaciones que queremos mostrar por página
    let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5;

    // Verificar que el usuario autenticado existe y tiene un userId
    if(!req.user || !req.user.userId) {
      return res.status(404).send({
        status: "error",
        message: "Usuario no autenticado"
      });
    }

    // Obtener un array de IDs de los usuarios que sigue el usuario autenticado
    const myFollows = await followUserIds(req);

    // Verificar que la lista de usuarios que sigo no esté vacía
    if (!myFollows.following || myFollows.following.length === 0){
      return res.status(404).send({
        status: "error",
        message: "No sigues a ningún usuario, no hay publicaciones que mostrar"
      });
    }

    // Configurar las options de la consulta
    const options = {
      page: page,
      limit: itemsPerPage,
      sort: { created_at: -1 },
      populate: {
        path: 'user_id',
        select: '-password -role -__v -email'
      },
      lean: true
    };

    // Consulta a la base de datos con paginate
    const result = await Publication.paginate(
      { user_id: { $in: myFollows.following }},
      options
    );

    // Verificar si se encontraron publicaciones en la BD
    if (!result.docs || result.docs.length <= 0) {
      return res.status(404).send({
        status: "error",
        message: "No hay publicaciones para mostrar"
      });
    }

    // Devolver respuesta exitosa
    return res.status(200).json({
      status: "success",
      message: "Feed de Publicaciones",
      publications: result.docs,
      total: result.totalDocs,
      pages: result.totalPages,
      page: result.page,
      limit: result.limit
    });

  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al mostrar las publicaciones en el feed"
    });
  }
}