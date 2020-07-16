### 学习笔记
#### 表达式
+ 运算符优先级
+ 左手及右手运算 能不能放到等号左边
    + 左手运算
        + Member
            + a.b
            + a[b]
            + foo`string` 可以传参
            + super.b
            + super['b']
            + new.target
            + new Foo()
        + Reference类型
            + Object
            + delete
            + key
            + assign
        + call expressions
            + foo()
            + super()
            + foo()['b']
            + foo().b
            + foo()`abc`
    + 右手运算
        + update expressions
            + a++ a--
            + --a ++a
        + unary expressions 单目运算符
            + delete a.b
            + void foo()
            + typeof a
            + `+` a
            + `-` a
            + `~` a 整数按位取反
            + !a
            + await a 
        + exponental expressions
            + **
!!a 能把所有类型的数值强制换成布尔类型

    + 加减乘除
    + 左移右移
    + 关系表达
    
    + 相等