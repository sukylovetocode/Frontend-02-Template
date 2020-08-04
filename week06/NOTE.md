学习笔记

##### CSS并没有现行标准
[CSS2.1标准](https://www.w3.org/TR/CSS21/)

+ CDO、CDC是以前不支持css的文档里做出的适配，他会将能够解析CSS的文档进行解析，而不支持的就会转化成html进行阅读
+ 总体结构
    + @charset
    + @import
    + rules 
        + @media
        + @page
        + rule 普通CSS规则

我们的方向：研究所有的@规则(charset、import、media、page)，在研究其他规则 

##### @-rules
+ @charset
+ @import
+ @media
+ @page 分页媒体特性（通常就是打印机）
+ @counter-style 自定义我们的列表格式
+ @keyframes
+ @fontface
+ @supports 本身具有兼容性，不提倡现在使用
+ @namespace 命名空间，匹配XML还是SVG等。。

##### CSS rules
+ 选择器 
    现行标准 https://www.w3.org/TR/2018/REC-selectors-3-20181106/
    + selector_group
    + selector
        + >
        + <sp>
        + +
        + ~
    + simple_selector
        + type
        + *
        + .
        + #
        + []
        + :
        + ::
        + :not
+ 声明(key)
    + properties
    + variables
+ 声明（value)
