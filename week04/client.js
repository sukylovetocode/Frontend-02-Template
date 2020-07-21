const net = require('net')
const { runInThisContext } = require('vm')

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
            this.headers["Content-Type"] = 'application/x-www-form-urlencoded'
        }

        if(this.headers["Content-Type"] === "application/json"){
            this.bodyText = JSON.stringify(this.body)
        }else if(this.headers["Content-Type"] === "application/x-www-form-urlencoded"){
            this.bodyText = Objects.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&')
        }

        this.headers['Content-Length'] = this.bodyText.length
    }

    // 建立链接并发送请求
    send(connection){
        return new Promise((resolve, reject) => {
            const parser = new ResponseParser // 接受的是流模式
            if(connection){
                // 建立链接的话，数据写进去传出去
                connection.write(this.toString())
            }else{
                // 建立一个TCP链接
                connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, () => {
                    connection.write(this.toString())
                })
            }

            // 流模式，持续接受参数
            connection.on('data', (data) => {
                console.log(data.toString())
                parser.receive(data.toString())
                if(parser.isFinished){
                    resolve(parser.response)
                    connection.end() // 关闭链接
                }
            })

            connection.on('error', (err) => {
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


void async function(){
    let request = new Request({
        method: 'POST',
        host: '127.0.0.1',
        post: '8088',
        path: '/',
        headers:{
            ["X-Foo2"]:'customed'
        },
        body: {
            name:'suky'
        }
    })

    let response = await request.send()

    console.log(response)
}

// 逐步接收
class ResponseParser{
    constructor(){}
    receive(string){
        for(let i=0;i<string.length;i++){
            this.receiveChar(string.chatAt(i))
        }
    }
    receiveChar(char){

    }
}