import { WebSocketServer } from 'ws'
import webSocketStream from 'websocket-stream'
import ffmpeg from 'fluent-ffmpeg'
 
// 建立WebSocket服务
const wss = new WebSocketServer({ port: 15001, perMessageDeflate: false })
 
// 监听连接
wss.on('connection', handleConnection)
 
// 连接时触发事件
function handleConnection (ws, req) {
  // 获取前端请求的流地址（前端websocket连接时后面带上流地址）
  const url = decodeURIComponent(req.url.slice(1))
  console.log(url)
  //const url = "rtsp://admin:a12345678@192.168.7.12:554/cam/realmonitor?channel=1&subtype=0"
  // 传入连接的ws客户端 实例化一个流
  const stream = webSocketStream(ws, { binary: true })
  // 通过ffmpeg命令 对实时流进行格式转换 输出flv格式
  const ffmpegCommand = ffmpeg(url)
    .addInputOption('-analyzeduration', '100000', '-max_delay', '1000000')
    .on('start', function () { console.log('Stream started.') })
    .on('codecData', function () { console.log('Stream codecData.') })
    .on('error', function (err) {
      console.log('An error occured: ', err.message)
      stream.end()
    })
    .on('end', function () {
      console.log('Stream end!')
      stream.end()
    })
    .outputFormat('flv').videoCodec('copy').noAudio()
 
  stream.on('close', function () {
    ffmpegCommand.kill('SIGKILL')
  })
 
  try {
    // 执行命令 传输到实例流中返回给客户端
    ffmpegCommand.pipe(stream)
  } catch (error) {
    console.log(error)
  }
}

console.log('application start')