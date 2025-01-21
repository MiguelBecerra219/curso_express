const z = require('zod')

// validacion del objeto que se esta intentando crear
const movieSchema = z.object({
    //* No ponemos la id para que si se intenta cambiar la ignore
    // decimos que title debe ser un string
    title: z.string({
        // definimos respuestas personalizadas para los errores
        invalid_type_error: 'Movie title musst be a string',
        required_error: 'Movie title is required. Please, check url'
    }),
    // validaciones en cadena
    year: z.number().int().positive().min(1900).max(2025), // en este caso positive no es necesario por el rango pero es para ver que existe
    director: z.string(),
    duration: z.number().int().positive(),
    rate: z.number().min(0).max(10).default(5), // tambien esta optional() nullable()
    poster: z.string().url({
        message: 'Poster must be a valid URL'
    }),
    genre: z.array(
        z.enum(["Action", "Crime", "Drama", "Adventure", "Sci-Fi", "Romance", "Animation", "Biography", "Fantasy"]),
        {
            required_error: 'Movie genre is required.',
            invalid_type_error: 'Movie genre mus be an array of enum Genre'
        }
    )
})

const validateMovie = (object) => {
    return movieSchema.safeParse(object)
}

const validatePartialMovie = (object) => {
    // partial hace que todas las propiedades sean opcionales
    // de modo que podemos validar modificaciones donde solo nos manden la propiedad que se modificara
    return movieSchema.partial().safeParse(object)
}

module.exports = {
    validateMovie,
    validatePartialMovie,
}