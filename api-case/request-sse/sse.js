const http = require("http");
const os = require("os");

const server = http.createServer((req, res) => {
  // 检查请求路径是否为 /sse
  const urlObject = new URL(req.url, `http://${req.headers.host}`);
  console.log(`Received request for: ${urlObject.pathname} with query: ${urlObject.search}`);
  
  // 收集查询参数
  const queryParams = {};
  urlObject.searchParams.forEach((value, key) => {
    console.log(`Query parameter: ${key} = ${value}`);
    queryParams[key] = value;
  });

  let body = "";
  
  // 处理请求体和响应逻辑
  const handleRequest = () => {
    let requestData = {
      method: req.method,
      path: urlObject.pathname,
      query: queryParams,
    };
    
    // 对于非GET请求，添加请求体
    if (body && req.method !== "GET") {
      try {
        // 尝试解析JSON
        requestData.body = JSON.parse(body);
      } catch (e) {
        // 如果不是JSON，保留原始字符串
        requestData.body = body;
      }
    }
    
    if (urlObject.pathname === "/sse") {
      console.log("SSE request");
      // 设置响应头
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "set-cookie": "sse_cookie=example_value1; Path=/; HttpOnly",
        "Set-Cookie": "sse_cookie=example_value2; Path=/; HttpOnly",
        "SET-COOKIE": "sse_cookie=example_value3; Path=/; HttpOnly",
      });

      const duration = 15000; // 15秒

      // 将请求数据作为第一条SSE消息发送
      const firstMessage = [
        `event: start`,
        `id: ${Date.now()}`,
        `data: 欢迎使用 Server-Sent Events (SSE) 本次请求将在 ${duration / 1000} 秒后结束，你的请求数据是: ${JSON.stringify(requestData)}`,
        `retry: 10000`,
      ];
      res.write(firstMessage.join("\n") + "\n\n");
      console.log("SSE connection established, sending first message");

      let messageCount = 1;
      // 每隔一秒发送一条消息
      const intervalId = setInterval(() => {
        const message = [
          `event: message`,
          `id: ${Date.now()}`,
          `data: 第${messageCount}条 message, ${new Date().toLocaleTimeString()}`,
          `retry: 10000`,
        ];
        res.write(message.join("\n") + "\n\n");
        console.log(`SSE connection established, sending 第${messageCount} message`);
        messageCount++;
      }, 1000);

      setTimeout(() => {
        const message = [
          `event: end`,
          `id: ${Date.now()}`,
          `data: 时间到，关闭连接`,
          `retry: 10000`,
        ];
        res.write(message.join("\n") + "\n\n");
        res.end();
        clearInterval(intervalId);
        console.log("SSE connection closed");
      }, duration);

      // 处理客户端断开连接事件
      req.on("close", () => {
        console.log("Client disconnected from SSE");
        // clearInterval(intervalId);
      });
    } else if (urlObject.pathname === "/json") {
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "set-cookie": "sse_cookie=example_value1; Path=/; HttpOnly",
        "Set-Cookie": "sse_cookie=example_value2; Path=/; HttpOnly",
        "SET-COOKIE": "sse_cookie=example_value3; Path=/; HttpOnly",
      });
      // 返回包含请求数据的JSON响应
      res.end(JSON.stringify({ 
        message: "This is a JSON response",
        requestData: requestData
      }));
    } else {
      // 对于其他请求也返回请求数据
      res.writeHead(404, {
        "Content-Type": "application/json",
      });
      res.end(JSON.stringify({
        message: "Request received",
        requestData: requestData
      }));
    }
  };

  // 收集请求体
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      console.log(`Request body: ${body}`);
      // 处理完请求体后进行响应
      handleRequest();
    });
  } else {
    // 对于GET等无请求体的方法，直接处理
    handleRequest();
  }
});

const port = 3123;
server.listen(port, () => {
  const ifaces = os.networkInterfaces();
  console.log(`Server is running on port ${port}`);
  let found = false;
  for (const name of Object.keys(ifaces)) {
    const addrs = ifaces[name].filter(
      (iface) => iface.family === "IPv4" && !iface.internal,
    );
    if (addrs.length) {
      found = true;
      const urls = addrs
        .map((iface) => `http://${iface.address}:${port}`)
        .join(", ");
      console.log(`网卡: ${name}  ip地址：${urls}`);
    }
  }
  if (!found) {
    console.log("未检测到本机可用IPv4地址");
  }
});