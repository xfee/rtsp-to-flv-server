# 使用 nodejs 官方镜像作为基础镜像
FROM node:22.2.0

# 在容器内创建一个工作目录
WORKDIR /app

# 将当前目录下的 package.json 文件复制到容器中的工作目录
COPY package.json .

# 安装依赖
RUN npm install

# 如果需要安装其他扩展，可以在此处添加相关命令


# 换源
# 设置 apt 源为阿里云的源
RUN echo "deb http://mirrors.aliyun.com/debian/ bookworm main" > /etc/apt/sources.list
RUN echo "deb-src http://mirrors.aliyun.com/debian/ bookworm main" >> /etc/apt/sources.list

# 安装 ffmpeg 扩展
RUN apt-get update && apt-get install -y ffmpeg

# 将当前目录下的所有文件复制到容器中的工作目录
COPY . .

# 暴露端口 15001
EXPOSE 15001

# 运行 node 服务
CMD ["node", "app.js"]