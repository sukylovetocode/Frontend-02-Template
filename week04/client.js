const net = require('net')
const { runInThisContext } = require('vm')

class Request{
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

    send(){
        return new Promise((resolve, reject) => {
            const parser = new ResponseParser // 接受的是流模式
            resolve("")
        })
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