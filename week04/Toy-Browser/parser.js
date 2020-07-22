const EOF = Symbol("EOF") // 无任何意义，仅仅用于结束我们的html文件

let currentToken = null

//全局状态 用于输出
function emit(token){
    console.log(token)
}

function data(c){
    if(c == "<"){
        return tagOpen
    }else if(c == EOF){
        emit({
            type:"EOF"
        })
        return
    }else{
        emit({
            type: "text",
            content: c
        })
        return data
    }
}

function tagOpen(c){
    if(c == "/"){
        return endTagOpen
    }else if(c.match(/^[a-zA-Z]$/)){
        currentToken = {
            type: "startTag",
            tagName: ""
        }
        return tagName(c)
    }else {
        return
    }
}

function endTagOpen(c){
    if(c.match(/^[a-zA-Z]$/)){
        currentToken = {
            type: "endTag",
            tagName: ""
        }
        return tagName(c) // 找闭合标签
    }else if(c == ">"){
        
    }else if(c == EOF){

    }else{

    }
}

function tagName(c){
    if(c.match(/^[\t\n\f ]$/)){
        return beforeAttributeName // 有属性
    }else if(c == '/'){
        return selfClosingStartTag // 自闭合标签
    }else if(c.match(/^[a-zA-Z]$/)){
        currentToken.tagName += c  // 字母就追加
        return tagName
    }else if(c == ">"){
        emit(currentToken)
        return data
    }else {
        return tagName
    }
}

// 对属性的处理，这里忽略
function beforeAttributeName(c){
    if(c.match(/^[\t\n\f ]$/)){
        return beforeAttributeName
    }else if(c == ">"){
        return data
    }else if(c == "="){
        return beforeAttributeName
    }else{
        return beforeAttributeName
    }
}

function selfClosingStartTag(c){
    if(c == ">"){
        currentToken.isSelfClosing = true
        return data
    }else if(c == "EOF"){

    }else{

    }
}

module.exports.parserHTML = function parserHTML(html){
    let state = data
    for(let c of html){
        state = state(c)
    }
    state = state(EOF)
}