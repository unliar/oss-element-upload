const express = require("express")
const path = require('path')
const bodyParser = require("body-parser")
const router = require("./router")
const app = express()
const http = require("http")
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))
console.log(path.join(__dirname, 'fe'))
app.use("/demo", express.static(path.join(__dirname, 'fe')))

app.use("/api", router)


app.use((req, res, next) => {
  const err = new Error("not Found")
  err.status = 404
  next(err)
})

app.use((err, req, res, next) => {
  console.log(err)
  res.status(err.status || 500)
  res.json({
    statusCode: err.status || 500,
    message: `errors`,
    result: `${err}`
  })
  next()
})



const port = 2050
app.set("port", port)
const onError = err => {
  console.log(err)
}
const onListen = () => {
  console.log(server.address())
}
const server = http.createServer(app)
server.listen(port)
server.on("error", onError)
server.on("listening", onListen)