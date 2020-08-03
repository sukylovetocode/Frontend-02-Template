const CSS = require('css')


/**
 * AST 抽象语法树
 * 
 */
let rules = [] // 储存css的规则
function addCssRules(text){
    var ast = CSS.parse(text)
    // console.log(JSON.stringify(ast, null, "  "))
    rules.push(...ast.stylesheet.rules)
}

function computeCSS(stack, element){
    // 获取父元素才知道元素与规则是否匹配
    // stack.slice() 将整个数组复制一次，防止元素不断变化产生污染
    // reverse将父元素从内 向外寻找
    var elements = stack.slice().reverse()
    // console.log(element)

    /**
     * 选择器层级结构：选择器列表、复杂选择器、符合选择器 我们只实现简单选择器
     */
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
            // console.log("element",element,"matched rule",rule)

            // 比较优先级
            var sp = specificity(rule.selectors[0])

            var computedStyle = element.computedStyle
            for(var declaration of rule.declarations){
                if(!computedStyle[declaration.property]){
                    computedStyle[declaration.property] = {}
                }
                // 存值
                // computedStyle[declaration.property].value = declaration.value
                // 比较优先级
                if(!computedStyle[declaration.property].specificity){
                    computedStyle[declaration.property].value = declaration.value
                    computedStyle[declaration.property].specificity = sp
                }else if(compare(computedStyle[declaration.property].specificity, sp) < 0){
                    computedStyle[declaration.propety].value = declaration.value
                    computedStyle[declaration.property].specificity = sp
                }
            }
            // console.log(element.computedStyle)
        }
    }
}

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

// 比较CSS之间的优先级
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

// 优先级计算
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


module.exports = {
    addCssRules,
    computeCSS
}