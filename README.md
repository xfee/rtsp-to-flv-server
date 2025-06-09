# RTSP to FLV Server

一个使用Docker快速容器化部署的， 基于Node.js的RTSP流转FLV格式的转码服务。

## 项目简介

该项目提供了一个简单高效的解决方案，用于将RTSP视频流转换为FLV格式，并通过WebSocket传输给客户端。主要用于在Web浏览器中实时查看RTSP摄像头视频流。

## 技术栈

- Node.js
- WebSocket (ws)
- FFmpeg
- Docker

## 功能特点

- 实时转换RTSP流为FLV格式
- 通过WebSocket传输视频流
- 支持Docker容器化部署
- 低延迟视频传输

## 安装与使用

### 前提条件

- Node.js (推荐v22.2.0或更高版本)
- FFmpeg
- Docker和Docker Compose (可选，用于容器化部署)

### 本地安装

```bash
# 克隆项目
git clone [repository-url]
cd rtsp-to-flv-server

# 安装依赖
npm install

# 启动服务
npm start
```

### Docker部署

```bash
# 使用Docker Compose构建并启动,若首次构建需要数分钟
docker-compose up -d

# 或者手动构建Docker镜像
docker build -t rtsp-to-flv-server .

# 运行Docker容器
docker run -d --name rtsp-to-flv-server -p 15001:15001 rtsp-to-flv-server
```

## 使用方法

1. 启动服务后，服务将在15001端口监听WebSocket连接
2. 客户端通过WebSocket连接到服务，连接URL中包含RTSP流地址
3. 服务将RTSP流转换为FLV格式并通过WebSocket发送给客户端

### 客户端示例代码

```html
<!-- 完整的HTML示例 -->
<!DOCTYPE html>
<html>
<head>
  <title>RTSP to FLV 播放器</title>
  <!-- 引入flv.js库 -->
  <script src="https://cdn.jsdelivr.net/npm/flv.js@1.6.2/dist/flv.min.js"></script>
</head>
<body>
  <!-- 视频播放元素 -->
  <video id="videoElement" controls style="width: 100%; max-width: 800px;"></video>
  
  <script>
    // 检查浏览器是否支持flv.js
    if (flvjs.isSupported()) {
      // 转码服务的地址和端口
      const serverAddress = '192.168.1.231:15001';
      // 标准的rtsp协议的视频流地址，建议先使用vlc等软件验证此rtsp地址是否可以播放
      const rtspUrl = 'rtsp://admin:yf202505@192.168.1.211:554/cam/realmonitor?channel=1&subtype=0';
      
      // 创建flv播放器实例
      const flvPlayer = flvjs.createPlayer({
        type: 'flv',
        // 使用变量构建WebSocket URL
        url: `ws://${serverAddress}/${encodeURIComponent(rtspUrl)}`
      });
      
      // 将播放器绑定到video元素
      flvPlayer.attachMediaElement(document.getElementById('videoElement'));
      
      // 加载并播放
      flvPlayer.load();
      flvPlayer.play();
      
      // 页面卸载时销毁播放器
      window.addEventListener('beforeunload', () => {
        flvPlayer.destroy();
      });
    } else {
      console.error('您的浏览器不支持flv.js，请使用现代浏览器如Chrome、Firefox或Edge。');
    }
  </script>
</body>
</html>
```

## 配置说明

服务默认监听15001端口，可以在app.js中修改：

```javascript
const wss = new WebSocketServer({ port: 15001, perMessageDeflate: false })
```

## 许可证

ISC

## 贡献指南

欢迎提交问题和功能请求。如果您想贡献代码，请先讨论您想要进行的更改。

## 注意事项

- 确保您有权访问RTSP流
- 高并发场景下需要考虑服务器性能和网络带宽
- FFmpeg转码过程会消耗一定的CPU资源
