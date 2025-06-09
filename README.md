# RTSP to FLV Server

一个基于Node.js的RTSP流转FLV格式的转码服务，使用Docker快速容器化部署。

## 项目简介

该项目提供了一个简单高效的解决方案，用于将RTSP视频流转换为FLV格式，并通过WebSocket传输给客户端。主要用于在Web浏览器中实时查看RTSP摄像头视频流。

## 技术栈

- Node.js
- WebSocket
- FFmpeg
- Docker


## 为什么使用此方案？

将RTSP流转换为FLV格式并通过WebSocket传输具有以下优势：

1. **兼容性**：RTSP不是为WEB设计的，WEB原生不支持RTSP（必须转码，你用的播放插件底层也是转码），本方案通过转码flv，结合flv.js库，使几乎所有现代浏览器都能播放

2. **低延迟**：相比HLS（.m3u8格式）等分段协议，WebSocket+FLV可实现更低的延迟。HLS由于其切片机制（通常为2-10秒每片），天然存在较高延迟，而本方案延迟通常可控制在1-2秒内。

3. **服务器负载低**：按需转码，服务启动后，当没有客户端连接时不会进行转码处理，因此在不播放时服务器资源消耗极低，也不会占用带宽。

4. **网络穿透**：WebSocket基于HTTP协议，网络方面非常友好。可以被Nginx等工具轻松代理，当然也可以域名+后缀转发，很适合政府和企业网络环境（80端口总得给开吧？能开就能用。）。

5. **后端简单**：使用docker容器化部署，一行命令：docker compose up 即可配置好全部服务，无需你精通ffmpeg，nodejs，websocket等。

6. **前端简单**：前端集成非常简单，只需引入flv.js库并编写几行JavaScript代码（下面有示例代码）即可实现视频播放功能，大大降低开发成本。

7. **适用场景广泛**：低延迟和易于集成，非常适合集成到你系统中， 用于在你的系统中，远程查看园区、小区、工厂等的视频监控等应用场景。




## 安装与使用

### 前提条件

- Docker >= 20.10 (内置docker compose), 20.10以下版本需安装docker-compose

### Docker部署

```bash
git clone https://github.com/xfee/rtsp-to-flv-server.git
cd rtsp-to-flv-server
docker compose up -d
```



### 客户端示例代码

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>FLV over WebSocket</title>
  <script src="https://cdn.jsdelivr.net/npm/flv.js@1.6.2/dist/flv.min.js"></script>
</head>
<body>
  <video id="videoElement" controls autoplay muted width="640" height="360"></video>

  <script>
    if (flvjs.isSupported()) {
      const videoElement = document.getElementById('videoElement');

      // 转码服务地址
      const serverAddress = '192.168.1.231:15001';

      // RTSP流地址
      let rtspUrl = 'rtsp://admin:yf202505@192.168.1.211:554/cam/realmonitor?channel=1&subtype=0';

      const flvPlayer = flvjs.createPlayer({
        type: 'flv',
        isLive: true,
        url: 'ws://' + serverAddress + '/' + rtspUrl
        // url: `ws://192.168.1.231:15001/rtsp://admin:yf202505@192.168.1.211:554/cam/realmonitor?channel=1&subtype=0`
      });

      flvPlayer.attachMediaElement(videoElement);
      flvPlayer.load();
      flvPlayer.play();
    } else {
      alert('FLV.js is not supported in your browser.');
    }
  </script>
</body>
</html>

```

## 使用方法

1. 启动服务后，服务将在15001端口监听WebSocket连接
2. 客户端通过WebSocket连接到服务，把rtsp地址作为参数拼接到ws服务的url的后面
3. 服务将RTSP流转换为FLV格式并通过WebSocket发送给客户端，客户端接收到FLV数据后，通过flv.js库播放
4. 客户端实例代码请参考实例代码或`web-client-examples/index.html`,包含一个最基础的客户端示例。
5. 服务默认监听15001端口，可以在app.js中修改：
```javascript
const wss = new WebSocketServer({ port: 15001, perMessageDeflate: false })
```

## 许可证

ISC

## 贡献指南

欢迎提交问题和功能请求。如果您想贡献代码，请先讨论您想要进行的更改。

## 注意事项

- 确保您有权访问RTSP流，建议先使用vlc等工具测试RTSP流是否可以正常播放
- 高并发场景下需要考虑服务器性能和网络带宽
- FFmpeg转码过程会消耗一定的CPU资源
- 确保你的容器能访问RTSP流
