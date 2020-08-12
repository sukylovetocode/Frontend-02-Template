#### 课后复查
+ JS中的面向对象
+ JS中有那些属性
+ JS真的需要类嘛
+ 什么叫原型
+ new 生成一个对象发生了啥呢
+ 构造函数模式和原型模式区别
+ function 和 object究竟有什么区别
+ JS中对象怎么分类


##### JS中的面向对象
+ JS是基于对象且支持许多面向对象特性，但是和我们主流中基于类的面向对象差异很大（没有类）
+ 对象的三个特征：有唯一标识符（内存地址）、有状态、有行为，JS中状态和行为都是“属性”
+ 具有高度的动态性，赋予使用者在运行时有为对象修改状态和行为的能力
+ 对于面向对象的抽象，我们的行为是能够改变对象的状态的，即狗咬人仅对人的状态产生改变，因此会方法会安在人身上

##### JS中有那些属性
+ JS的属性是一群特征
+ 数据属性有：value、writable（是否可改写值）、enumerable（是否可枚举）、configurable（是否能改变） 四种特征
+ 访问器属性有：getter（访问属性调用）、setter（改写属性时调用）、enumerable、configurable 四种特征
+ 数据属性的特征可以通过Object.getOwnPropertyDescriptor获取，Object.defineProperty改变

##### JS真的需要类嘛
+ JS是基于原型的，这与我们主流上的基于类的语言不一致
+ JS的原型系统更多的是通过实例抽象出一个原型，而普通的类系统我们必须要抽象出了一个类才能诞生出实例
+ ES6以后我们光明正大的拥有了类，那在ES6之前如果单纯只针对原型语言来说，强行制造出一个类的概念其实是不合适的。
+ 仅仅为了让我们的JS更像面向对象的语言，但本质来说还是支持原型，这只是语法糖


##### 什么叫原型
+ 某个对象拥有私有字段[[prototype]]，就是对象原型
+ 遵循原型链系统，直到找到null为止
+ Object.create指定某个原型创建对象
+ Object.getPrototypeOf 获得一个对象的原型；
+ Object.setPrototypeOf 设置一个对象的原型

##### new 生成一个对象发生了啥呢
+ 一个继承自 Foo.prototype 的新对象被创建。
+ 使用指定的参数调用构造函数 Foo，并将 this 绑定到新创建的对象。
+ 由构造函数返回的对象就是 new 表达式的结果。如果构造函数没有显式返回一个对象，则使用步骤1创建的对象。（一般情况下，构造函数不返回值，但是用户可以选择主动返回对象，来覆盖正常的对象创建步骤）
```
// 伪代码
var object = F.prototype
var result = F()
object.call(result)
return object 
```

##### 构造函数模式和原型模式区别
```javascript
    function Person(name){
        this.name = name
        this.say = function(){
            console.log(this.name)
        } 
    }
    var person1 = new Person("suky")

    function Person(){ }
    Person.prototype.name = "abc"
    var person2 = new Person()
```

##### function 和 object究竟有什么区别
+ function 应该是拥有一个[[call]]内部属性的特殊对象，他还有个特别的值prototype来为我们构造对象使用
+ object拥有[[prototype]]内部属性
+ 所有new 函数后面会跟着内在属性[[construct]],而拥有[[construct]]属性的对象必然要拥有[[call]]，因此我们说new 后面的对象必然是function object

##### JS中对象怎么分类
+ 宿主对象：有JS宿主环境提供的对象，行为由宿主环境决定