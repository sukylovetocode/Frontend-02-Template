let Feiting = {
    createElement(type, attributes, ...children){
        let element;
        if(typeof type === "string"){
            element = new ElementWrapper(type);
        }else{
            element = new type; 
        }
        
        for(let name in attributes) {
            element.setAttribute(name, attributes[name]);
        }
        for(let child of children){
            // 对文本节点进行处理
            if(typeof child === 'string'){
                child = new TextWrapper(child);
            }
            element.appendChild(child);
        }
        return element;
    }
};

class ElementWrapper{
    constructor(type){
        this.root = document.createElement(type);
    }
    setAttribute(name, value){
        this.root.setAttribute(name, value);
    }
    appendChild(child){
        child.mountTo(this.root);
    }
    mountTo(parent){
        parent.appendChild(this.root);
    }
}

class TextWrapper{
    constructor(content){
        this.root = document.createTextNode(content);
    }
    setAttribute(name, value){
        this.root.setAttribute(name, value);
    }
    appendChild(child){
        child.mountTo(this.root);
    }
    mountTo(parent){
        parent.appendChild(this.root);
    }
}

class Cute{
    constructor(){
        this.root = document.createElement("div");
    }
    setAttribute(name, value){
        this.root.setAttribute(name, value);
    }
    appendChild(child){
        child.mountTo(this.root);
    }
    mountTo(parent){
        parent.appendChild(this.root);
    }
}

let a =<Cute id="a">
    <span>ff</span>
    <span></span>
    <span></span>
</Cute>

let d = [
    "./img/1.jpg",
    "./img/2.jpg",
    "./img/3.jpg",
]

a.mountTo(document.body);