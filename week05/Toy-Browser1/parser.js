const EOF = Symbol("EOF") // 无任何意义，仅仅用于结束我们的html文件

const layout = require('layout')

let currentToken = null
let currentAttribute = null 

let stack = [{type:"document", children: []}]

const css = require('css')

// 新增函数，处理addCSSRules，把CSS规则暂存到一个数组里
let rules = []
function addCSSRules(text){
    // console.log(text)
    var ast = css.parse(text)
    // console.log(JSON.stringify(ast, null, "   "))
    rules.push(...ast.stylesheet.rules)
}

function getStyle(element){
    if(!element.style){
        element.style = {}
    }

    for(let prop in element.computedStyle){
        var p = element.computedStyle.value
        element.style[prop] = element.computedStyle[prop].value

        if(element.style[prop].toString().match(/px$/)){
            element.style[prop] = parseInt(element.style[prop])
        }

        if(element.style[prop].toString().match(/px$/)){
            element.style[prop] = parseInt(element.style[prop])
        }
    }

    return element.style
}

function layout(element){
    if(!element.computedStyle){
        return
    }

    var elementStyle = getStyle(element)

    if(elementStyle.display !== "flex"){
        return
    }

    var items = element.children.filter(e => e.type === "element")

    items.sort(function(a, b){
        return (a.order || 0) - (n.order || 0)
    })

    var style = elementStyle

    ['width', 'height'].forEach(size => {
        if(style[size] === 'auto' || style[size] === ''){
            style[size] = null
        }
    })

    if(!style.flexDirection || style.flexDirection === 'auto'){
        style.flexDirection = 'row'
    }else if(!style.alignItems || style.alignItems === 'auto'){
        style.alignItems = 'stretch'
    }else if(!style.justifyContent || style.justifyContent === 'auto'){
        style.justifyContent = 'flex-start'
    }else if(!style.flexWrap || style.flexWrap === 'auto'){
        style.flexWrap = 'nowrap'
    }else if(!style.alignContent || style.alignContent === 'auto'){
        style.alignContent = 'stretch'
    }

    var mainSize,mainStart,mainEnd,mainSign,mainBase,crossSize,crossStart,crossEnd,crossSign,crossBase
    if(style.flexDirection === 'row'){
        mainSize = 'width'
        mainStart = 'left'
        mainEnd = 'right'
        mainSign = +1
        mainBase = 0

        crossSize = 'height'
        crossStart = 'top'
        crossEnd = 'bottom'
    }
    if(style.flexDirection === 'row-reverse'){
        mainSize = 'width'
        mainStart = 'right'
        mainEnd = 'left'
        mainSign = -1
        mainBase = style.width

        crossSize = 'height'
        crossStart = 'top'
        crossEnd = 'bottom'
    }
    if(style.flexDirection === 'row-reverse'){
        mainSize = 'width'
        mainStart = 'right'
        mainEnd = 'left'
        mainSign = -1
        mainBase = style.width

        crossSize = 'height'
        crossStart = 'top'
        crossEnd = 'bottom'
    }
    if(style.flexDirection === 'column'){
        mainSize = 'height'
        mainStart = 'top'
        mainEnd = 'bottom'
        mainSign = +1
        mainBase = 0

        crossSize = 'width'
        crossStart = 'left'
        crossEnd = 'right'
    }
    if(style.flexDirection === 'column-reverse'){
        mainSize = 'height'
        mainStart = 'bottom'
        mainEnd = 'top'
        mainSign = -1
        mainBase = style.height

        crossSize = 'width'
        crossStart = 'left'
        crossEnd = 'right'
    }
    if(style.flexDirection === 'wrap-reverse'){
        var tmp = crossStart
        crossStart = crossEnd
        crossEnd = tmp
        crossSign = -1
    }else{
        crossBase = 0
        crossSign = 1
    }

    var isAutoMainSize = false
    if(!style[mainSize]){
        elementStyle[mainSize] = 0
        for(var i = 0;i < items.length; i++){
            var item = items[i]
            if(itemStyle[mainSize] !== null || itemStyle[mainSize] ){
                elementStyle[mainSize] = elementStyle[mainSize]
            }
        }
        isAutoMainSize = true
    }

    var flexLine = []
    var flexLines = [flexLine]

    var mainSpace = elementStyle[mainSize]
    var crossSpace = 0

    for(var i=0;i<items.length;i++){
        var item = items[i]
        var itemStyle = getStyle(item)

        if(itemStyle[mainSize] === null){
            itemStyle[mainSize] = 0
        }

        if(itemStyle.flex){
            flexLine.push(item)
        }else if(style.flexWrap === 'nowrap' && isAutoMainSize){
            mainSpace -= itemStyle[mainSize]
            if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)){
                crossSpace =  Math.max(crossSpace, itemStyle[crossSize])
            }
            flexLine.push(item)
        }else{
            if(itemStyle[mainSize] > style[mainSize]){
                itemStyle[mainSize] = style[mainSize]
            }
            if(mainSpace < itemStyle[mainSize]){ //放不下
                flexLine.mainSpace = mainSpace
                flexLine.crossSpace = crossSpace
                flexLine = [item]
                flexLines.push(flexLine)
                mainSpace = style[mainSize]
                crossSpace = 0
            }else{
                flexLine.push(item)
            }
            if(itemStyle[crossSize] !== null && itemStyle[crossSize]!== (void 0)){
                crossSpace = Math.max(crossSpace, itemStyle[crossSize])
            }
            mainSpace -= itemStyle[mainSize]
        }
    }
    flexLine.mainSpace = mainSpace

    if(style.flexWrap === 'nowrap' || isAutoMainSize){
         flexLine.crossSpace = (style[crossSize] !== undefined) ? style[crossSize] :crossSpace
    }else{
        flexLine.crossSpace = crossSpace
    }

    if(mainSpace < 0){
        var scale = style[mainSize] / (style[mainSize] - mainSpace)
        var currentMain = mainBase
        for(var i=0;i<items.length;i++){
            var item = items[i]
            var itemStyle = getStyle(item)

            if(itemStyle.flex){
                itemStyle[mainSize] = 0
            }

            itemStyle[mainSize] = itemStyle[mainSize] * scale

            itemStyle[mainStart] = currentMain
            itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
            currentMain = itemStyle[mainEnd]
        }
    }else{
            flexLines.forEach(function(items){
                var mainSpace = items.mainSpace
                var flexTotal = 0
                for(var i=0;i<items.length;i++){
                    var item = items[i]
                    var itemStyle = getStyle(item)

                    if((itemStyle.flex !== null) && (itemStyle.flex !== (void 0))){
                        flexTotal += itemStyle.flex
                        continue
                    }
                }

                if(flexTotal > 0){ // 有flex
                    var currentMain = mainBase
                    for(var i=0;i<items.length;i++){
                        var item = items[i]
                        var itemStyle = getStyle(item)
    
                        if(itemStyle.flex){
                            itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex
                        }
                        itemStyle[mainStart] = currentMain
                        itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
                        currentMain = itemStyle[mainEnd]
                    }
                }else{
                    if(style.justifyContent === 'flex-start'){
                        var currentMain = mainBase
                        var step = 0
                    }
                    if(style.justifyContent === 'flex-end'){
                        var currentMain = mainSpace * mainSign + mainBase
                        var step = 0
                    }

                    if(style.justifyContent === 'center'){
                        var currentMain = mainSpace / 2 * mainSign + mainBase
                        var step = 0
                    }

                    if(style.justifyContent === 'space-between'){
                        var currentMain = mainSpace / (items.length - 1) * mainSign
                        var currentMain = mainBase
                    }

                    if(style.justifyContent === 'space-around'){
                        var currentMain = mainSpace / items.length  * mainSign
                        var currentMain = step / 2 + mainBase
                    }
                    for(var i=0;i<items.length;i++){
                        var item = items[i]
                        itemStyle[mainStart, currentMain]
                        itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
                        currentMain = itemStyle[mainEnd] + step
                    }
                }
            })
        }
    }
// }

// . # div
function match(element, selector){
    if(!selector || !element.attributes){
        return false
    }

    if(selector.charAt(0) == "#"){
        var attr = element.attributes.filter(attr => attr.name === "id")[0]
        if(attr && attr.value === selector.replace('#', '')){
            return true
        }
    }else if(selector.charAt(0) == "."){
            var attr = element.attributes.filter(attr => attr.name === "class")[0]
            if(attr && attr.value === selector.replace('.', '')){
                return true
            }
    }else{
        if(element.tagName === selector){
            return true
          }
    }
    return false
}

function specificity(selector){
    var p = [0, 0, 0, 0]
    var selectorParts = selector.split(" ")
    for(var part of selectorParts){
        if(part.charAt(0) == "#"){
            p[1] += 1
        }else if(part.charAt(0) == "."){
            p[2] += 1
        }else{
            p[3] += 1
        }
    }
    return p
}

function compare(sp1, sp2){
    if(sp1[0] - sp2[0]){
        return sp1[0] - sp2[0]
    }
    if(sp1[1] - sp2[1]){
        return sp1[1] - sp2[1]
    }
    if(sp1[2] - sp2[2]){
        return sp1[2] - sp2[2]
    }
    return sp1[3] - sp2[3]
}


function computeCSS(element){
    console.log("compute CSS for element", element)
    // 根据当前元素逐级得往外匹配
    var elements = stack.slice().reverse()

    // 是否匹配
    if(!element.computedStyle){
        element.computedStyle = {}
    }

    // 检测CSS rules
    // 双循环选择器和元素的父元素来找到他们是否匹配
    for(let rule of rules){
        var selectorParts = rule.selectors[0].split(" ").reverse() // 和元素一样

        // 和当前元素算是否匹配
        if(!match(element, selectorParts[0])){
            continue
        }

        let matched = false

        var j = 1
        // 是否所有选择器都被匹配到了
        for(var i=0;i<elements.length;i++){
            if(match(elements[i], selectorParts[j])){
                j++
            }
        }
        if(j>=selectorParts.length){
            matched = true
        }
        if(matched){
            // 如果匹配到，我们要加入
            // 不能简单的抄属性，我们还需要判断优先级
            console.log("element",element,"matched rule",rule)
            var sp = specificity(rule.selectors[0])
            var computedStyle = element.computedStyle
            for(var declaration of rule.declarations){
                if(!computedStyle[declaration.property]){
                    computedStyle[declaration.property] = {}
                }
                if(!computedStyle[declaration.property].specificity){
                    computedStyle[declaration.property].value = declaration.value
                    computedStyle[declaration.property].specificity = sp
                }else if(compare(computedStyle[declaration.property].specificity, sp) < 0){
                    computedStyle[declaration.propety].value = declaration.value
                    computedStyle[declaration.property].specificity = sp
                }
            }
            console.log(element.computedStyle)
        }
    }
}

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

        computeCSS(element)

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
            // 遇到style 标签时，执行添加CSS规则得操作
            if(top.tagName === "style"){
                addCSSRules(top.children[0].content)
            }
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
    }
}

function data(c){
    console.log('进入data')
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
    }else if(c == "/" || c == ">" || c ==EOF){
        return afterAttributeName(c)
    }else if(c == "="){
        
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

    }else if(c == "\"" || c == "'" || c == "<"){

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

    }else{
        return UnquotedAttributeValue(c)
    }
}

function doubleQuotedAttributeValue(c){
    if(c == "\'"){
        currentToken[currentAttribute.name] = currentAttribute.value
        return afterQuotedAttributeValue
    }else if(c == "\u0000"){

    }else if(c == EOF){
        
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

    }else if(c == EOF){

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

    }else if(c == "\"" || c == "'" || c == "<" || c == "=" || c == "`"){

    }else if(c == EOF){

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

    }else{
        currentAttribute.value += c
        return doubleQuotedAttributeValue
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
    return stack[0]
}