import { Express, json } from "express"
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from "body-parser"

export default (app: Express) => {
    app.use(cors())
    app.use(morgan('dev'))
    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: false }))

    // parse application/json
    app.use(bodyParser.json())
}