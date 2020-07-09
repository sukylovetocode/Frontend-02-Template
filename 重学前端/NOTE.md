### 预习笔记
---
#### JavaScript 的类型，你忽视了啥
##### 为什么要用void 0代替undefined
`undefined`、`NaN`和`Infinity`都是全局对象window的属性,他只是将这个属性的`[[writable]]`改为了`false`而`null`则是JS的保留字
```javascript
  var undefined = 10;
  console.log(undefined) // undefined
  console.log(Object.getOwnPropertyDescriptor(window, "undefined"))
  // {value: undefined, writable: false, enumerable: false, configurable: false}

  var null = 11
  console.log(null) 
  // Uncaught SyntaxError: Unexpected token 'null'
```
用`void 0`代替`undefined`的目的很简单，保证我们的赋值是纯正的undefined值，因为undefined作为一个变量完全有可能被污染

#### 如何比较我们小数
```javascript
console.log( 0.1 + 0.2 == 0.3); // false
```
这个奇怪的现象我想是一个成功的前端都会碰过壁的东西，那为什么会这样呢？原因在于浮点数并不能准确的表示0.1，0.2，0.3这样的数组，因此我们在编码或者解释的时候，其实0.1已经舍入为与0.1最接近的数字
**正确的比较**
```javascript
console.log( Math.abs(0.1 + 0.2 - 0.3) <= Number.EPSILON); // true
```

#### 拆箱与装箱
每当读取一个基本类型的时候，后台就会创建一个对应的基本包装类型对象，从而让我们能够调用一些方法来操作这些数据。
```javascript
var s1 = "abc";
var s2 = s1.indexOf("a")
```
变量s1是一个基本类型值，它不是对象，它不应该有方法。但是js内部为我们完成了一系列处理（即装箱），使得它能够调用方法,实现的机制如下：
（1）创建String类型的一个实例；
（2）在实例上调用指定的方法；
（3）销毁这个实例；
下面来看看代码实现：
```javascript
  var s1  = new String("some text");
  var s2 = s1.substring(2);
  s1 = null;
```
这样就完成装箱，我们也就能在s1上调用方法了

拆箱：将引用类型对象转换为对应的值类型对象

它是通过引用类型的`valueOf()`或者`toString()`方法来实现的。如果 valueOf 和 toString 都不存在，或者没有返回基本类型，则会产生类型错误 TypeError。如果是自定义的对象，你也可以自定义它的`valueOf()/tostring()`方法，实现对这个对象的拆箱。
```javascript
 var objNum = new Number(123);  
 var objStr =new String("123");   
 console.log( typeof objNum ); //object
 console.log( typeof objStr ); //object 
 console.log( typeof objNum.valueOf() ); //number
 console.log( typeof objStr.valueOf() ); //string

 console.log( typeof objNum.toString() ); // string 
 console.log( typeof objStr.toString() ); // string
```


#### JS究竟面向对象还是基于对象
##### 什么是对象
从人类认知来说： 
  + 一个可以触摸或者可以看见的东西；
  + 人的智力可以理解的东西；
  + 可以指导思考或行动（进行想象或施加动作）的东西

从编程语言来说：
  + 对象具有唯一标识性：即使完全相同的两个对象，也并非同一个对象
  + 对象有状态：对象具有状态，同一对象可能处于不同状态之下。
  + 对象具有行为：即对象的状态，可能因为它的行为产生变迁。

一般的编程语言：类描述对象，JS语言：原型，这种的不一样使得对象具有高度的动态性，这是因为 JavaScript 赋予了使用者在运行时为对象添改状态和行为的能力。

##### JS的两类属性
+ 数据属性
  + value：就是属性的值
  + writable：决定属性能否被赋值
  + enumerable：决定 for in 能否枚举该属性
  + configurable：决定该属性能否被删除或者改变特征值
+ 访问器属性
  + getter：函数或 undefined，在取属性值时被调用
  + setter：函数或 undefined，在设置属性值时被调用
  + enumerable：决定 for in 能否枚举该属性
  + configurable：决定该属性能否被删除或者改变特征值

##### 属性的获取及定义
对象本质就是一个属性的索引结构，比如O对象来说，a就是key，然后{ value: 2, writable: false, enumerable: false, configurable: true }这些对象值就是value
```javascript
  // 定义对象属性
   var o = { a: 1 }
   console.log(Object.getOwnPropertyDescriptor(o, "a"))
   Object.defineProperty(o, "b", { value: 2, writable: false, enumerable: false, configurable: true })
   console.log(Object.getOwnPropertyDescriptor(o, "b"))

    var o = {
        val: null,
        get c() { return this.val },
        set c(val) { this.val = val + 1 }
      };
   o.c = 3
   console.log(o.c); // 1
   console.log(Object.getOwnPropertyDescriptor(o, "c"))
```
Javscript是一个面向对象的语言，但是由于他是以原型的方式来构造对象，使得他能够与其他编程语言不一样的对对象有着高度的动态性

#### 我们真的需要类嘛
JS得原型系统
+ 如果所有对象都有私有字段`[[prototype]]`，就是对象的原型
+ 读一个属性，如果对象本身没有，则会继续访问对象的原型，直到原型为空或者找到为止

操纵原型得方法
+ Object.create 根据指定的原型创建新对象，原型可以是 null
+ Object.getPrototypeOf 获得一个对象的原型
+ Object.setPrototypeOf 设置一个对象的原型

模拟生成类
```javascript
  function Cat() {

　　　　this.name = "大毛";

　　}
  var cat1 = new Cat();

　alert(cat1.name); // 大毛

  function c2(){}
  c2.prototype.p1 = 1;
  c2.prototype.p2 = function(){ console.log(this.p1);}
  var o2 = new c2;
  o2.p2();
```

用原型抽象并继承得例子
```javascript
  var cat = { 
    say(){ 
      console.log("meow~"); 
      }, 
    jump(){ 
      console.log("jump"); 
    }}
    
    var tiger = Object.create(cat, { 
      say:{ 
        writable:true, 
        configurable:true, 
        enumerable:true, 
        value:function(){ 
          console.log("roar!"); 
          } 
        }
      })
          
    var anotherCat = Object.create(cat);
    anotherCat.say();
    var anotherTiger = Object.create(tiger);
    anotherTiger.say();
```
+ __proto__和constructor属性是对象所独有的

+ prototype属性是函数所独有的。但是由于JS中函数也是一种对象，所以函数也拥有__proto__和constructor属性

+ 每个实例对象（ object ）都有一个私有属性（称之为` __proto__ `）指向它的构造函数的原型对象（prototype ）

#### Javascript 对象分类
+ 宿主对象 JS宿主环境提供 window属性由标准及浏览器共同形成
+ 内置对象 JS提供对象
  + 固有对象 由标准制定，JS运行时创建 
  + 原生对象  使用内部构造器/特殊语法创建
  + 普通对象  {}、Object构造器、class关键字定义，**能被原型继承**

> 固有对象和原生对象多数有私有字段，使得原型继承失效

内置对象一览表
![](./image/pic1.png)

#### 函数对象&构造器对象
+ 具有`[[call]]`私有字段的对象，构造器对象的定义是：具有私有字段`[[construct]]`的对象
+ `[[construct]]`的执行过程如下：以 `Object.prototype` 为原型创建一个新对象；以新对象为 this，执行函数的`[[call]]`；如果`[[call]]`的返回值是对象，那么，返回这个对象，否则返回第一步创建的新对象。

这样的规则造成了个有趣的现象，如果我们的构造器返回了一个新的对象，那么 new 创建的新对象就变成了一个构造函数之外完全无法访问的对象，这一定程度上可以实现“私有”。
```javascript
function cls(){ 
  this.a = 100; 
  return { getValue:() => this.a }
  }
  var o = new cls;
  o.getValue(); //100
  //a在外面永远无法访问到
```

#### 特殊行为的对象
除了上面介绍的对象之外，在固有对象和原生对象中，有一些对象的行为跟正常对象有很大区别。它们常见的下标运算（就是使用中括号或者点来做属性访问）或者设置原型跟普通对象不同，这里我简单总结一下。
+ Array：Array 的 length 属性根据最大的下标自动发生变化。
+ Object.prototype：作为所有正常对象的默认原型，不能再给它设置原型了
+ String：为了支持下标运算，String 的正整数属性访问会去字符串里查找
+ Arguments：arguments 的非负整数型下标属性跟对应的变量联动。模块的 namespace 对象：特殊的地方非常多，跟一般对象完全不一样，尽量只用于 import 吧。
+ 类型数组和数组缓冲区：跟内存块相关联，下标运算比较特殊。
+ bind 后的 function：跟原来的函数相关联。

#### Promise得代码比setTimeout先执行？
js引擎会常驻内存中，等待我们把js代码或者函数传递给它执行
+ 宏观任务 宿主发起的任务
  + setTimeout
  + setInterval
  + setImmediate
  + requestAnimationFrame
  + I/O
  + UI rendering
+ 微观任务 JS引擎发起的任务
  + process.nextTick
  + Promise
  + Object.observe
  + MutationObserver
  + async/await

**宏观任务是按顺序一个个执行的，而每个宏观任务中的微观任务也是按照顺序一个个执行**

#### Promise 怎么用
```javascript
  function sleep(duration) {
     return new Promise(function(resolve, reject) { 
       setTimeout(resolve,duration); 
       }) 
    } 
      
    sleep(1000).then( ()=> console.log("finished"));
```

#### 闭包
古典的闭包定义
+ 环境部分
  + 环境
  + 标识符列表
+ 表达式部分

JS标准中的闭包
+ 环境部分
  + 环境：函数的词法环境（执行上下文的一部分）
  + 标识符列表：函数中用到的未声明的变量
+ 表达式部分：函数体

因此JS的函数就是闭包

#### 执行上下文
+ ES3
  + scope 作用域
  + variable object 变量对象
  + this value this值
+ ES5
  + lexical environment：词法环境，当获取变量时使用
  + variable environment：变量环境，当声明变量时使用
  + this value：this 值
+ ES2018
  + lexical environment：词法环境，当获取变量或者 this 值时使用。
  + variable environment：变量环境，当声明变量时使用。
  + code evaluation state：用于恢复代码执行位置。
  + Function：执行的任务是函数时使用，表示正在被执行的函数。
  + ScriptOrModule：执行的任务是脚本或者模块时使用，表示正在被执行的代码。
  + Realm：使用的基础库和内置对象实例。
  + Generator：仅生成器上下文有这个属性，表示当前生成器。