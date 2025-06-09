import { WebSocketServer } from 'ws'
import webSocketStream from 'websocket-stream'
import ffmpeg from 'fluent-ffmpeg'
 
const wss = new WebSocketServer({ port: 15001, perMessageDeflate: false })
 
wss.on('connection', handleConnection)
 
function handleConnection (ws, req) {
  const url = decodeURIComponent(req.url.slice(1))
  // const url = "rtsp://admin:admin123@192.168.1.236:554/cam/realmonitor?channel=1&subtype=0" // 测试
  console.log(url)
  const stream = webSocketStream(ws, { binary: true })
  const ffmpegCommand = ffmpeg(url)
    .addInputOption('-analyzeduration', '100000', '-max_delay', '1000000')
    .addInputOption('-rtsp_transport', 'tcp')
    .addInputOption('-re')
    // 转H264编码
    .addOutputOption('-c:v', 'libx264')
    .addOutputOption('-preset', 'ultrafast')
    .addOutputOption('-tune', 'zerolatency')
    .addOutputOption('-profile:v', 'baseline')
    .on('start', function (commandLine) { 
      console.log('Stream started with command:', commandLine) 
    })
    .on('codecData', function (data) { 
      console.log('Stream codecData:', data) 
    })
    .on('error', function (err) {
      console.log('An error occured: ', err)
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