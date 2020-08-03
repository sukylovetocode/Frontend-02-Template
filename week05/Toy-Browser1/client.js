// URL解析HTTP并响应
const net = require('net')
const parser = require('./parser.js')
const { parse } = require('path')

class Request{
    // 对请求进行一定的处理
    constructor(options){
        this.method = options.method || 'GET'
        this.host = options.host
        this.port = options.port || 80
        this.path = options.path || "/"
        this.body = options.body || {}
        this.headers = options.headers || {}
        if(!this.headers["Content-Type"]){
            this.headers["Content-Type"] = "application/x-www-form-urlencoded"
        }

        if(this.headers["Content-Type"] === "application/json"){
            this.bodyText = JSON.stringify(this.body)
        }else if(this.headers["Content-Type"] === "application/x-www-form-urlencoded"){
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&')
        }

        this.headers["Content-Length"] = this.bodyText.length
    }

    // 建立链接并发送请求
    send(connection){
        return new Promise((resolve, reject) => {
            const parser = new ResponseParser // 接受的是流模式
            if(connection){
                console.log('已有连接');
                // 建立链接的话，数据写进去传出去
                connection.write(this.toString());
            }else{
                // 建立一个TCP链接
                connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, () => {
                    console.log('连接到服务器')
                    connection.write(this.toString())
                });
            }

            // 流模式，持续接受参数
            connection.on('data', function(data){
                parser.receive(data.toString())
                console.log('流')
                
                if(parser.isFinished){
                    resolve(parser.response)
                    connection.end() // 关闭链接
                }
            });

            connection.on('error', (err) => {
                console.log('已从服务器断开')
                reject(err)
                connection.end()
            })
        })
    }

    toString(){
        return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r
\r
${this.bodyText}`
    }
}

class ResponseParser{
    constructor(){
        this.WAITING_STATUS_LINE = 0
        this.WAITING_STATUS_LINE_END = 1
        this.WAITING_HEADER_NAME = 2
        this.WAITING_HEADER_SPACE = 3
        this.WAITING_HEADER_VALUE = 4
        this.WAITING_HEADER_LINE_END = 5
        this.WAITING_HEADER_BLOCK_END = 6
        this.WAITING_BODY = 7

        this.current = this.WAITING_STATUS_LINE  // 当前状态 
        this.statusLine = ""
        this.headers = {}
        this.headerName = ""
        this.headerValue = ""
        this.bodyParser = null
    }

    get isFinished(){
        return this.bodyParser && this.bodyParser.isFinished
    }

    get response(){
        console.log(this.bodyParser)
        this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/)
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            headers: this.headers,
            body: this.bodyParser.content.join('')
        }
    }

    receive(string){
        for(let i=0;i<string.length;i++){
            this.receiveChar(string.charAt(i))
        }
    }

    // 对响应进行状态解析
    receiveChar(char){
        if(this.current === this.WAITING_STATUS_LINE){ //请求行 HTTP/1.1 200 OK
            if(char === '\r'){ // 等到换行时进入下一个状态
                this.current = this.WAITING_STATUS_LINE_END
            }else{
                this.statusLine += char
            }
        }else if(this.current === this.WAITING_STATUS_LINE_END){ // HTTP/1.1 200 OK 的结尾
            if(char === '\n'){
                this.current = this.WAITING_HEADER_NAME // 响应头 Content-Type: text/html
            }
        }else if(this.current === this.WAITING_HEADER_NAME){
            if(char === ':'){ // Content-Type: text/html  Content-Type: 后面跟着一个空格
                this.current = this.WAITING_HEADER_SPACE 
            }else if(char === '\r'){
                this.current = this.WAITING_HEADER_BLOCK_END // 响应头结束
                // 和head 相关没法一开始就能够建立
                if(this.headers['Transfer-Encoding'] === 'chunked'){
                    this.bodyParser = new TrunkedBodyParser()
                }
            }else{
                this.headerName += char // text/html
            }
        }else if(this.current === this.WAITING_HEADER_SPACE){
            if(char === ' '){
                this.current = this.WAITING_HEADER_VALUE //Content-Type: 后面跟着一个空格跳到这里
            }
        }else if(this.current === this.WAITING_HEADER_VALUE){
            if(char === '\r'){ // this.headerValue 结束后
                this.current = this.WAITING_HEADER_LINE_END
                this.headers[this.headerName] = this.headerValue
                this.headerName = "" // zhi kong
                this.headerValue = ""
            }else{
                this.headerValue += char
            }
        }else if(this.current === this.WAITING_HEADER_LINE_END){ 
            if(char === '\n'){
                this.current = this.WAITING_HEADER_NAME // Content-Type 读完
            }
        }else if(this.current === this.WAITING_HEADER_BLOCK_END){
            if(char === '\n'){
                this.current = this.WAITING_BODY
            }
        }else if(this.current === this.WAITING_BODY){
             this.bodyParser.receiveChar(char)
        }
    }
}

class TrunkedBodyParser{
    constructor(){
        this.WAITING_LENGTH = 0
        this.WAITING_LENGTH_LINE_END = 1
        this.READING_TRUNK = 2 //如果要退出 我们要计算trunk 长度
        this.WAITING_NEW_LINE = 3
        this.WAITING_NEW_LINE_END = 4

        this.length = 0
        this.content = []
        this.isFinished = false
        this.current = this.WAITING_LENGTH
    }

    receiveChar(char){
        if(this.current === this.WAITING_LENGTH){
            if(char === '\r'){
                if(this.length === 0){
                    this.isFinished = true
                }
                this.current = this.WAITING_LENGTH_LINE_END
            }else{
                this.length *= 16 // 16进制的处理
                this.length += parseInt(char, 16)
            }
        }else if(this.current === this.WAITING_LENGTH_LINE_END){
            if(char === '\n'){
                this.current = this.READING_TRUNK 
            }
        }else if(this.current === this.READING_TRUNK){
            this.content.push(char)
            this.length --
            if(this.length === 0){
                console.log(this.length)
                this.current = this.WAITING_NEW_LINE
            }
        }else if(this.current === this.WAITING_NEW_LINE){
            if(char === '\r'){
                this.current = this.WAITING_NEW_LINE_END
            }
        }else if(this.current === this.WAITING_NEW_LINE_END){
            if(char === '\n'){
                this.current = this.WAITING_LENGTH
            }
        }
    }
}


void async function(){
    let request = new Request({
        method: "POST",
        host: "127.0.0.1",
        port: "8088",
        path: "/",
        headers:{
            ["X-Foo2"]:"customed"
        },
        body: {
            name:"suky"
        }
    })


    let response = await request.send()

    console.log(response)

    let dom = parser.parseHTML(response.body)
    console.log(dom)
}();

