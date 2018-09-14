import net from 'net'

let server = new net.Server(socket => {
  console.log(3333)
})

server.on('close', () => {

})

server.on('error', error => {

})

server.listen(8083, () => {
  console.log(222)
})