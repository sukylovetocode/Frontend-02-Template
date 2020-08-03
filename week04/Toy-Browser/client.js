// URL解析HTTP并响应
const net = require('net')
const parser = require('./parser.js')
const { resolve } = require('path')

// request类
class Request{
    // 对请求进行一定的处理
    // 储存传入进来的值
    constructor(options){
        this.method = options.method || 'GET' // 请求方式
        this.host = options.host //请求接口
        this.port = options.port || 80 //请求端口
        this.path = options.path || "/" // 请求路由
        this.body = options.body || {} //请求体
        this.headers = options.headers || {}
        // request中一定要求有content-type
        /* 常见的媒体格式类型如下：

            text/html ： HTML格式
            text/plain ：纯文本格式      
            text/xml ：  XML格式
            image/gif ：gif图片格式    
            image/jpeg ：jpg图片格式 
            image/png：png图片格式
            以application开头的媒体格式类型：

            application/xhtml+xml ：XHTML格式
            application/xml     ： XML数据格式
            application/atom+xml  ：Atom XML聚合格式    
            application/json    ： JSON数据格式（最常用）
            application/pdf       ：pdf格式  
            application/msword  ： Word文档格式
            application/octet-stream ： 二进制流数据（如常见的文件下载）
            application/x-www-form-urlencoded ： <form encType=””>中默认的encType，form表单数据被编码为key/value格式发送到服务器（表单默认的提交数据的格式）
            另外一种常见的媒体格式是上传文件之时使用的：

            multipart/form-data ： 需要在表单中进行文件上传时，就需要使用该格式
             */
        if(!this.headers["Content-Type"]){
            this.headers["Content-Type"] = "application/x-www-form-urlencoded"
        }

        if(this.headers["Content-Type"] === "application/json"){
            this.bodyText = JSON.stringify(this.body)
        }else if(this.headers["Content-Type"] === "application/x-www-form-urlencoded"){
            // 将{name:'suky'}这样的对象格式转化成 name="suky"&...的格式
            // encodeURIComponent 可把字符串作为 URI 组件进行编码(解析成服务器读得懂的形式)
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&')
        }else if(this.headers["Content-Type"] === 'text/plain'){ // 嘻嘻 自己加的试试看
            // 400报错，应该是node端没有对于这个请求的解析器
            this.bodyText = this.body
        }

        this.headers["Content-Length"] = this.bodyText.length // 请求体长度
    }

    // 建立链接并发送请求
    send(connection){
        // step 2 send our request
        // 建立TCP链接应该是流传递，为啥会有Promise
        // 逐步接受并构建，直到构建完成时才会通过Promise返回，这时候就从流传输变为点
        // return new Promise((resolev, reject) => {
        //     console.log('success')
        //     resolve()
        // })

        return new Promise((resolve, reject) => {
            const parser = new ResponseParser() // 接受的是流模式，会将接受到的信息逐步传入进行处理
            // 进行TCP链接
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
                    connection.write(this.makeRequestHead())
                    // console.log(this.toString())
                });
            }

            // 流模式，持续接受参数
            connection.on('data', (data) => {
                console.log('收到响应')
                // 响应也是二进制的Buffer类型,将二进制数据转化为字符串，与this.toString()并不一致
                // console.log(data.toString())

                // 送到响应状态机进行解析
                parser.receive(data.toString())
                
                // 持续检测中,一个个包发送过来
                if(parser.isFinished){
                    console.log('解析完成')
                    resolve(parser.response)
                    connection.end() // 关闭链接
                }else{
                    console.log('kankan')
                }
            });

            connection.on('error', (err) => {
                console.log('已从服务器断开')
                reject(err)
                connection.end()
            })
        })
    }

    // 解析我们的响应文件成为以下的文件
    /*
       HTTP/1.1 200 OK
        Content-Type: text/html
        Date: Sun, 02 Aug 2020 13:21:12 GMT
        Connection: keep-alive
        Transfer-Encoding: chunked

        c
        Hello world

        0
    */
   // 传输过去构造请求头的样式
    makeRequestHead(){
        return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r
\r
${this.bodyText}`
    }
}

// step 3 construct a response parser to recive data step by step
class ResponseParser{
    constructor(){
        this.WAITING_STATUS_LINE = 'WAITING_STATUS_LINE' //请求行 HTTP/1.1 200 OK 得到我们的状态码
        this.WAITING_STATUS_LINE_END = 'WAITING_STATUS_LINE_END' // 请求行 解析完成后的状态
        this.WAITING_HEADER_NAME = 'WAITING_HEADER_NAME'
        this.WAITING_HEADER_SPACE = 'WAITING_HEADER_SPACE'
        this.WAITING_HEADER_VALUE = 'WAITING_HEADER_VALUE'
        this.WAITING_HEADER_LINE_END = 'WAITING_HEADER_LINE_END'
        this.WAITING_HEADER_BLOCK_END = 'WAITING_HEADER_BLOCK_END'
        this.WAITING_BODY = 'WAITING_BODY'

        this.current = this.WAITING_STATUS_LINE  // 当前状态 
        this.statusLine = "" // 储存状态码的哪一行
        this.headers = {} // 头部键值对储存
        this.headerName = ""
        this.headerValue = ""
        this.bodyParser = null
    }

    // 返回内部状态
    get isFinished(){
        return this.bodyParser && this.bodyParser.isFinished
    }

    get response(){
        this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/)
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            headers: this.headers,
            body: this.bodyParser.content.join('')
        }
    }

    // 响应值传入，传入时进行状态机的处理
    receive(string){
        // 逐个字符解析 
        for(let i=0;i<string.length;i++){
            this.receiveChar(string.charAt(i))
        }
    }

    // 对响应进行状态解析
    /**
     * \r回车 \n换行
     * step 1 获取我们的状态码
     * step 2 将我们头部信息都分解储存，为的是得到Transfer-Encoding:chunked,命令我们body的解析器
     * 
     */
    receiveChar(char){
        // console.log(char)
        switch(this.current){
            case this.WAITING_STATUS_LINE://响应行 HTTP/1.1 200 OK
                if(char === '\r'){ // 等到换行时进入下一个状态
                    this.current = this.WAITING_STATUS_LINE_END
                }else{
                    // this.statusLine += char
                }
                break;
            case this.WAITING_STATUS_LINE_END: 
                if(char === '\n'){
                    this.current = this.WAITING_HEADER_NAME // 响应头 Content-Type: text/html
                }
                break;
            case this.WAITING_HEADER_NAME:
                if(char === ':'){ // Content-Type: text/html  Content-Type: 后面跟着一个空格
                    this.current = this.WAITING_HEADER_SPACE 
                }else if(char === '\r'){
                    this.current = this.WAITING_HEADER_BLOCK_END // 响应头结束
                    // 和head 相关没法一开始就能够建立,选择我们的body
                    if(this.headers['Transfer-Encoding'] === 'chunked'){
                        this.bodyParser = new TrunkedBodyParser()
                    }
                }else{
                    this.headerName += char // Content-Type
                }
                break;
            case  this.WAITING_HEADER_SPACE:
                if(char === ' '){
                    this.current = this.WAITING_HEADER_VALUE //Content-Type: 后面跟着一个空格跳到这里
                }
                break;
            case this.WAITING_HEADER_VALUE:
                // KV值读取完没
                if(char === '\r'){ // this.headerValue 结束后
                    this.current = this.WAITING_HEADER_LINE_END
                    this.headers[this.headerName] = this.headerValue
                    this.headerName = "" 
                    this.headerValue = ""
                }else{
                    this.headerValue += char
                }
                break;
            case this.WAITING_HEADER_LINE_END:
                if(char === '\n'){
                    this.current = this.WAITING_HEADER_NAME // Content-Type 读完
                }
                break;
            case this.WAITING_HEADER_BLOCK_END:
                if(char === '\n'){
                    this.current = this.WAITING_BODY
                }
                break;
            case this.WAITING_BODY:
                this.bodyParser.receiveChar(char)
                break;
            default:
                console.log('出错了')
        }
    }
}

class TrunkedBodyParser{
    constructor(){
        this.WAITING_LENGTH = 'WAITING_LENGTH'
        this.WAITING_LENGTH_LINE_END = 'WAITING_LENGTH_LINE_END'
        this.READING_TRUNK = 'READING_TRUNK' //如果要退出 我们要计算trunk 长度
        this.WAITING_NEW_LINE = 'WAITING_NEW_LINE'
        this.WAITING_NEW_LINE_END = 'WAITING_NEW_LINE_END'

        this.length = 0
        this.content = []
        this.isFinished = false
        this.current = this.WAITING_LENGTH
    }

    receiveChar(char){
        switch(this.current){
            case this.WAITING_LENGTH:
                if(char === '\r'){
                    if(this.length === 0){
                        this.isFinished = true
                    }
                    this.current = this.WAITING_LENGTH_LINE_END
                }else{
                    // 计算我们文档字符长度
                    this.length *= 16 // 16进制的处理
                    this.length += parseInt(char, 16)
                }
            break;
            case this.WAITING_LENGTH_LINE_END:
                if(char === '\n'){
                    this.current = this.READING_TRUNK //准备读取html
                }
            break; 
            case this.READING_TRUNK:
                this.content.push(char)
                this.length --
                if(this.length === 0){
                    this.current = this.WAITING_NEW_LINE
                }
            break;
            case this.WAITING_NEW_LINE:
                if(char === '\r'){
                    this.current = this.WAITING_NEW_LINE_END
                }
            break;
            case this.WAITING_NEW_LINE_END:
                if(char === '\n'){
                    this.current = this.WAITING_LENGTH
                }
            break;
            default:
                console.log('出错了')
        }
      
    }
}


//如何使用来设计我们的请求函数，构造一个http请求
void async function(){ // 自执行函数
    let request = new Request({
        method: "POST",
        host: "127.0.0.1",
        port: "8088",
        path: "/",
        // headers有哪些种类呢？
        headers:{
            ["made"]:"suky own",
            // ["Content-Type"]:"text/plain"
        },
        // 发送的内容
        body: {
            name:"suky"
        }
    })

    let response = await request.send()
    // 真正的浏览器是分布逐段发送的
    let dom = parser.parseHTML(response.body)  
    console.log(dom)
}();

