const EOF = Symbol("EOF") // 无任何意义，仅仅用于结束我们的html文件

let currentToken = null
let currentAttribute = null 

// 初始化我们的树形结构
let stack = [{type:"document", children: []}]

//全局状态 用于输出
function emit(token){
    if(token.type === "text"){
        return
    }

    let top = stack[stack.length - 1]

    if(token.type == "startTag"){
        let element = {
            type: "element",
            children: [],
            attributes: []
        }

        element.tagName = token.tagName

        for(let p in token){
            if(p != "type" && p != "tagName"){
                element.attributes.push({
                    name: p,
                    value: token[p]
                })
            }
        }

        top.children.push(element)
        element.parent = top

        if(!token.isSelfClosing){
            stack.push(element)
        }
        
        currentTextNode = null

    }else if(token.type == "endTag"){
        if(top.tagName != token.tagName){
            throw new Error("Tag start end doesn't match")
        }else{
            stack.pop()
        }

        currentTextNode = null
    }else if(token.type == "text"){
        if(currentTextNode == null){
            currentTextNode = {
                type: "text",
                content: ""
            }
            top.children.push(currentTextNode)
        }
        currentTextNode.content += token.content 
    }else if(token.type == 'error'){
        alert('error')
        return
    }
}

function data(c){
    if(c == "<"){
        // 开始状态
        return tagOpen
    }else if(c == EOF){
        // 文档结束
        emit({
            type:"EOF"
        })
        return
    }else{
        emit({
            type: "text",
            content: c
        })
        // 文本节点
        return data
    }
}

function tagOpen(c){
    // 标签结束
    if(c == "/"){
        return endTagOpen
    }else if(c.match(/^[a-zA-Z]$/)){ 
        currentToken = {
            type: "startTag",
            tagName: ""
        }
        return tagName(c)
    }else {
        console.log('EOF-BEFORE-TAG-NAME parser error')
        return
    }
}

function tagName(c){
    if(c.match(/^[\t\n\f ]$/)){
        return beforeAttributeName // 有属性
    }else if(c == '/'){
        return selfClosingStartTag // 自闭合标签
    }else if(c.match(/^[a-zA-Z]$/)){ // 仅接受大小写英文字母
        currentToken.tagName += c  // 字母就追加
        return tagName
    }else if(c == ">"){
        emit(currentToken)
        return data
    }else if(c == EOF){
        emit({
            type:'EOF'
        })
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
        emit({
            type:'error'
        })
        return
    }else if(c == EOF){
        emit({
            type:'EOF'
        })
        return
    }
}


// 对属性的处理，这里忽略
function beforeAttributeName(c){
    if(c.match(/^[\t\n\f ]$/)){
        return beforeAttributeName
    }else if(c == "/" || c == ">" || c ==EOF){
        return afterAttributeName(c)
    }else if(c == "="){
        emit({
            type:'error'
        })
        retun
    }else{
        currentAttribute = {
            name: "",
            value: ""
        }
        return attributeName(c)
    }
}

function attributeName(c){
    if(c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF){
        return afterAttributeName(c)
    }else if(c == "="){
        return beforeAttributeValue
    }else if(c == '\u0000'){
        emit({
            type:'error'
        })
        retun
    }else if(c == "\"" || c == "'" || c == "<"){
        emit({
            type:'error'
        })
        retun
    }else{
        currentAttribute.name += c
        return attributeName
    }
}

function beforeAttributeValue(c){
    if(c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF){
        return beforeAttributeValue
    }else if(c == "\""){
        return doubleQuotedAttributeValue
    }else if(c == "\'"){
        return singleQuotedAttributeValue
    }else if(c == ">"){
        emit({
            type:'error'
        })
        retun
    }else{
        return UnquotedAttributeValue(c)
    }
}

function doubleQuotedAttributeValue(c){
    if(c == "\""){
        currentToken[currentAttribute.name] = currentAttribute.value
        return afterQuotedAttributeValue
    }else if(c == "\u0000"){
        emit({
            type:'error'
        })
        return
    }else if(c == EOF){
        emit({
            type:'EOF'
        })
        return
    }else{
        currentAttribute.value += c
        return doubleQuotedAttributeValue
    }
}

function singleQuotedAttributeValue(c){
    if(c == "\'"){
        currentToken[currentAttribute.name] = currentAttribute.value
        return afterQuotedAttributeValue
    }else if(c == "\u0000"){
        emit({
            type:'error'
        })
        retun
    }else if(c == EOF){
        emit({
            type:'EOF'
        })
        retun
    }else{
        currentAttribute.value += c
        return doubleQuotedAttributeValue
    }
}

function UnquotedAttributeValue(c){
    if(c.match(/^[\t\n\f ]$/)){
        currentToken[currentAttribute.name] = currentAttribute.value
        return beforeAttributeName
    }else if(c == "/"){
        currentToken[currentAttribute.name] = currentAttribute.value
        return selfClosingStartTag
    }else if(c == ">"){
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    }else if(c == "\u0000"){
        emit({
            type:'error'
        })
        return
    }else if(c == "\"" || c == "'" || c == "<" || c == "=" || c == "`"){
        emit({
            type:'error'
        })
        retun
    }else if(c == EOF){
        emit({
            type:"EOF"
        })
        return
    }else{
        currentAttribute.value += c
        return UnquotedAttributeValue
    }
}

function afterQuotedAttributeValue(c){
    if(c.match(/^[\t\n\f ]$/)){
        return beforeAttributeName
    }else if(c == "/"){
        return selfClosingStartTag
    }else if(c == ">"){
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    }else if(c == EOF){
        emit({
            type:"EOF"
        })
        return
    }
}

function selfClosingStartTag(c){
    if(c == ">"){
        currentToken.isSelfClosing = true
        return data
    }else if(c == "EOF"){
        emit({
            type:"EOF"
        })
        return
    }
}

// 要开始将html变成dom树 
module.exports.parseHTML = function parseHTML(html){
    let state = data
    for(let c of html){
        state = state(c)
    }
    state = state(EOF) // end of file 不是真实得字符 是缺少的任意字符
    return stack[0]
}