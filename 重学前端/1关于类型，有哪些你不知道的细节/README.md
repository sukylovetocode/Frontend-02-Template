#### JS模块分为三个阶段，文法阶段（就是我们在编译器中敲代码的阶段）、运行时阶段（编译完成阶段）、执行过程（预解析的过程）

#### JS运行时7种语言类型
+ Undefined
+ Null (关键字)
+ Boolean
+ String
+ Number
+ Symbol
+ Object

##### 为啥要用void 0代替undefined？
+ undefined 是个变量，非关键字
+ void 0 会返回一个undefined值， 但其实void 任何东西都会是undefined值，but 约定俗成，大家都用undefined
+ undefined是个类型，其底下的值也是undefined
+ 我们在函数内部定义undefined时还能够重新赋值

##### 字符串和其他其他数据类型在内存中的储存和引用



