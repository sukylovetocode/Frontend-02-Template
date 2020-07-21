### 浏览器工作原理

#### 浏览器页面渲染步骤
![](./image/pic1.png)

#### 有限状态机处理字符串
+ 每一个状态都是一个机器 互相解耦
    + 在每一个机器里，我们可以做计算，储存，输出
    + 所有的机器接受的输入是一致的
    + 状态机的每一个机器本身没有状态，如果我们用函数来表示的话，他应该是纯函数（无副作用）
+ 每一个机器知道下一个状态
    + 每个机器都有确定的下一个状态 Moore
    + 每个机器根据输入决定下一个状态 Mealy

游戏中敌人的AI其实就是类似于状态机

##### Mealy 
```javascript
    function state(input) // 函数参数就是输入
    {
        // 函数中可以自由地编写代码，处理每个状态的逻辑
        return next; //返回值作为下一个状态
    }

    /* 以下是调用 */
    while(input){
        // 获取输入
        state = state(input) //把状态机的返回值作为下一个状态
    }
```

#### HTTP解析
![](./image/pic2.png)

TCP 三次握手
+ 流
+ 端口
+ require('net')

IP
+ 包
+ IP地址
+ libnet/libpcap c++


#### 如何实现我们的Toy-Browser
###### 实现一个HTTP请求
+ 设计一个HTTP请求的类
+ content type是一个必要的字段，要有默认值
+ body是kv格式
+ 不同的content-type影响body的格式

###### send函数总结
+ 在Request构造器中收集必要的信息
+ 设计一个send函数，把请求真实发送到服务器
+ send函数应该是异步的，所以返回promise 

###### 发送请求
+ 设计支持已有的connection或者自己新建的connection
+ 收到数据传给parser
+ 根据parser状态resolve Promise