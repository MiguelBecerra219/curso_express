const express = require('express')
const moviesJSON = require('./movies.json')
const cypto = require('node:crypto')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')
const app = express()
app.disable('x-powered-by')

const PORT = process.env.PORT ?? 3000

const ACCEPTED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:1234',
    'http://movies.com'
]

app.use(express.json())

app.get('/movies', (req, res) => {
    // permitir todos los origenes que no son nuestro propio origen
    // res.header('Access-Control-Allow-Origin', '*')
    //* permitir host especifico
    // res.header('Access-Control-Allow-Origin', 'http://localhost:8080')
    // con lista de origenes
    const origin = req.header('origin')

    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin)
    }

    const { genre } = req.query // http://localhost:3000/movies?genre=Sci-Fi
    let filteredMovies
    if (genre) {
        filteredMovies = moviesJSON.filter(
            // De esta manera podemos filtrar en un arreglo sin importar las mayusculas o minusculas
            movie => movie.genre.some(g => g.toLowerCase() === genre.toLocaleLowerCase())
        )
        return res.json(filteredMovies)
    }
    res.json(moviesJSON)
})

app.get('/movies/:id', (req, res) => {
    const { id } = req.params
    const movie = moviesJSON.find(movie => movie.id === id)
    if (movie) return res.json(movie)

    res.status(404).json({ message: 'Movie not found' })
})

app.post('/movies', (req, res) => {
    const validationResult = validateMovie(req.body)

    if (validationResult.error) {
        return res.status(400).json({ error: JSON.parse(validationResult.error.message) })
    }

    // Esto no seria rest porque estamos guardando el estado en memoria
    // const { title, genre, year, director, duration, rate, poster } = req.body // esto es posble hacerlo asi gracias a el express.json() de la linea 9
    const newMovie = {
        id: cypto.randomUUID(),
        ...validationResult.data // esto se puede hacer porque tenemos los datos validados por zod
        // title,
        // genre,
        // year,
        // director,
        // duration,
        // rate: rate ?? 0,
        // poster

    }
    moviesJSON.push(newMovie)
    res.status(201).json(newMovie) // la enviamos al cliente para que lo pueda usar
})

app.patch('/movies/:id', (req, res) => {
    const validationResult = validatePartialMovie(req.body)

    if (validationResult.error) {
        return res.status(400).json({ error: JSON.parse(validationResult.error.message) })
    }

    const { id } = req.params
    const movieIndex = moviesJSON.findIndex(movie => movie.id === id)

    if (movieIndex < 0) return res.status(404).json({ message: 'movie not found' })

    const updateMovie = {
        ...moviesJSON[movieIndex],
        ...validationResult.data
    }

    moviesJSON[movieIndex] = updateMovie
    return res.json(updateMovie)
})

app.delete('/movies/:id', (req, res) => {
    const origin = req.header('origin')

    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin)
    }

    const { id } = req.params

    const indexMovie = moviesJSON.findIndex(movie => movie.id === id)

    if (indexMovie === -1) {
        return res.status(404).json({ message: 'Movie not found' })
    }

    moviesJSON.splice(indexMovie, 1)

    return res.json({ message: 'Movie deleted' })
})

app.options('/movies/:id', (req, res) => {
    const origin = req.header('origin')

    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin)
        res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
    }

    res.send(200)
})

app.listen(PORT, () => {
    console.log(`Server listening on port http://localhost:${PORT}`)
})
