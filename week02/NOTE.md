
### 上课笔记
---
#### 补充知识：图灵机


#### 泛用语言分类方法
按有无严格的规定的语法分类：非形式语言、形式语言
形式语言按照乔姆斯基谱系分类：
 + 0型 无限制文法 产生所有能使图灵机停机(在程序中运行时间有限长）的语言 我认为这里算是规则任意自己定
 + 1型 上下文相关文法 对应线性有界自动机（非确定图灵机） 我认为是有头有尾的
 + 2型 上下文无关文法  下推自动机 
 + 3型 正则文法 有限状态自动机 在产生式的最开头的


 下面的文法是属于上文的，即3型会属于0型、1型、2型，但是0型并不属于3型的

 #### 产生式
 这里说的是巴斯克-诺尔范式（BNF），产生式其实有多种类型：EBNF、ABNF、自定义
 + 尖括号括起来的名称表示语法结构名
 + 语法结构又能进一步分类
    + 基础结构--终结符
    + 要用其他语法结构定义的复合结构--非终结符
+ 引号和中间的字符表示终结符
+ 可以有括号
+ `*` 表示重复多次
+ | 表示或
+ `+`表示至少一次

```javascript
例子：1 + 3+ 4 * 2
终结符： NUMBER + * - /
非终结符：MultiplicativeExpression
AddtiveExpression

<MultiplicativeExpression>::= <Number> | <MultiplicativeExpression>"*"<Number> 
  | <MultiplicativeExpression>"/"<Number>
    
<AddtiveExpression>::= <MultiplicativeExpression> | <MultiplicativeExpression>
  "+"<AddtiveExpression> | <MultiplicativeExpression>"-"<AddtiveExpression> 
```

#### 通过BNF理解乔姆斯基谱系
 + 0型 无限制文法 `?::=?`
 + 1型 上下文相关文法 `?<A>?::=?<B>?`
 + 2型 上下文无关文法  `<A>::=?`
 + 3型 正则文法 `<A>::=?<A>`

 Javascript是上下文无关文法，部分来说能够属于正则文法，但是有些特例
 ```javascript
    {
        get a { return 1 }
        get : 1
    }

    2**1**2
 ```

 #### 语言的分类
 + 形式语言--用途
    + 数据描述语言
      + JSON
      + HTML
      + XAML
      + SQL
      + CSS
    + 编程语言
      + JS
      + C++
      + Python
      + Lisp
+ 形式语言--表达方式
  + 声明式语言
     + JSON
      + HTML
      + XAML
      + SQL
      + CSS
      + Lisp
  + 命令型语言
      + JS
      + C++
      + Python

#### 图灵完备性
所有编程语言都需要具备图灵完备性
所有可计算的问题都是可用来描述的,就是具有图灵完备性

+ 命令式-图灵机
  + goto
  + if和while
+ 声明式-lambda(丘奇)
  + 递归

#### 动态与静态
+ 动态
  + 用户设备/在线服务器上
  + 产品实际运行时
  + runtime
+ 静态
  + 程序员设备上
  + 产品开发时
  + compiletime

#### 类型系统
+ 动态类型和静态类型
+ 强类型和弱类型
  + string  + number
  + string == bollean
+ 复合类型
  + 结构体
  + 函数签名
+ 子类型
+ 泛型
  + 逆变/协变

#### 基本类型
原子
+ 语法
  + literal 字面值
  + variable 变量
  + keywords 关键字
  + whitespace 空格
  + line terminator 换行符

+ 运行时
  + types 类型
    + Number
      + IEEE 754  双精度浮点类型
      + 一个符号位 1 是负 0是正
      + 11个指数位
      + 52精度位 
      + 有基准值
      + 0 .toString()
    + String
      + 字符
         + ASCII 127 字符 
        + Unicode 全世界字符
        + UCS 0000-FFFF
        + GB 国标
          + GB2312 与Unicode字符集不兼容，但更省空间
          + GBK
          + GB18030
        + ISO-8859 冲突
        + BIG-5 大五码
      + 码点
      + 编码方式
        + UTF
          + UTF8 一个字节表示一个字符
          + UTF16
    + Boolean
    + Object
    + Null 有值但为空 typeof为object
    + Undefined
    + Symbol
  + execution context 存储得变化

  对象-分类
  归类 多继承 c++
  分类 单继承 java js接近


  #### 对象
  + property 状态、行为
  + `[[Prototype]]` 

   + {} [] . Object.defineProperty 基本的对象机制
   + Object.create Object.setPrototypeOf Object.getPrototypeOf 基于原型描述对象
   + new class extends 基于分类描述对象
   + new function prototype 不伦不类

#### 特殊对象
+ function object
  + 带`[[call]]`方法对象 