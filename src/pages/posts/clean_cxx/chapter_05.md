---
layout: ../../../layouts/CleanCXXPost.astro
title: '现代 C++ 的高级概念'
author: 'kok-s0s'
tags: ['C++']
---

## 资源管理

对软件开发人员来说，管理资源是一项基本业务。

大量的各种各样的资源必须合理分配、使用以及使用后归还。

主要的资源包括：

- 内存（栈内存或者堆内存）；
- 访问硬盘或者其它介质（如网络）上的文件（读/写）所需的文件句柄；
- 网络连接（例如：连接服务器、数据库等）；
- 线程、锁、定时器和事务；
- 其它操作系统资源，如 Windows 操作系统上的 GDI 句柄。（GDI 是图形设备借口的缩写。GDI 是微软 Windows 核心操作系统组件并负责呈现图形对象。）

> 资源泄漏是一个**很严重的问题**，特别是那种生命周期长的进程，或者是快速分配很多资源而没有立即释放的进程。如果操作系统缺乏资源，这将直接导致临界系统状态。此外，资源泄漏可能是一个安全问题，因为攻击者可能理由它们进行 “拒绝服务” -- DOS 攻击。

---

**如何保证分配的资源总是被释放？**

### 资源申请即初始化

> Resource Acquisition is Initalization, RAII

构造时获得，析构时释放 -- 基于范围的资源管理

RAII 利用类的构造函数和对应的析构函数的对称性，我们可以在类的构造函数中分配资源，在析构函数中释放资源。

### 智能指针

是线程安全的

定义在 `<memory>` 头文件中

---

1. 具有独占所有权的 `std::unique_ptr<T>`

`std::unique_ptr<T>` 模板类管理了一个指向 T 类型对象的指针。

如其名，该智能指针提供的是独占的所有权，也即，一个对象一次只能由 `std::unique_ptr<T>` 的一个实例拥有。

> move 语义很重要

2. 具有共享所有权的 `std::shared_ptr<T>`

`std::unique_ptr<T>` 模板类的实例可以指向 T 类型的一个对象，也可以与 `std::unique_ptr<T>` 的其它实例共享这个所有权。也即，T 类型的一个实例的所有权以及删除它的责任，可以由**许多**共享这个实例的所有者（`std::unique_ptr<T>` 的实例）接管。

`std::unique_ptr<T>` 提供了简单且有效的垃圾回收机制。这个智能指针的内部实现有一个引用计数器，用于监视当前有多少个 `std::unique_ptr<T>` 的实例。如果智能指针的最后**一个**实例被销毁，智能指针就会释放它持有的资源。

<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="711px" height="281px" viewBox="-0.5 -0.5 711 281" content="&lt;mxfile&gt;&lt;diagram id=&quot;RWH3pmnmcIniIE7BRjk1&quot; name=&quot;Page-1&quot;&gt;7VlLc9owEP41XDt+YOAak7Q9JDOZcGh6YoQtbE1ki5FFDPn1XcmSn3FCGjC0E+Cg/byS9vFpJYuRO092PzjaxHcsxHTkWOFu5F6PHGfmOCP5s8J9AUyccQFEnIQFZFfAgrxgDVoa3ZIQZw1FwRgVZNMEA5amOBANDHHO8qbamtHmrBsU4Q6wCBDtor9IKGLtlmdV+E9MotjMbFv6yQoFTxFn21TPl7IUF08SZIbRqlmMQpbXIPdm5M45Y6JoJbs5pjKqJmJFv+89T0uTOU7FIR1Mj0zsjds4hChoUVnu+rFIKEg2NPGOiMda+ze0rW+elq5l7i0j7LVQTCHH7bXSmMG2PNBamj0C8QhrrUkZIeAcZgkWfA8qHFMkyHNzdKSzH5V6VRigoSPRE5ViiGdEt3rQgBKwtRsslWUcakfzmAi82CDlQg6Lohk7PSrmAu/ejkTXR7OoNG/0krINj/KKoCUW18g5sY4QFeeDXPm7vLvdvNveQIl3exLf9fzMiXfcIRPvDpL48SuJnw6U+HFP4ruenznx7njAxE86UdkIDsDIvZJBSRAXS4VMUCI9pzC3/4B1Ug0aiTIStThmOUkoUsxZs1QYMsmgBjGh4S3as630JROwnRrJjxknL6CPTIjhMRf68OBaDY2F7KnH5DgDnXsTdrsF3aFdQ/EWZcJYwyhFm4yslH2yI/gdkdRnQrBkMB64zvul3/FORIRphwjLu+U2w8sAVoNQjADQ6q4W8FdmDVESpYBQvJaiDASBg9aVhhMShrKHn0EESRrdKrXrcYU8aH8kxKD7mqpTUwwdMYzgbxhJhXLQ8+EHLs/lqcQDG+Yg25UMP6nOxZylmeCIqPBjyHeOZc59zgQSaFWy8Z3Urgmlc0YZVw67a09+NalrePFRfOXsCdeeTNTnUJL0HIFMdTiQE+4xdoXxILtCsfc3t4XaUfm024KZ/KsCXmAFPJjtx6iAdncv/FgJ7F/3fRXkfy6aPcXxMJb0vA2coQba3Y3xqz5cSn147ah8uvow+6oPl1Ifel4az3FGsjqsgMpQrf8zv1tOpue8VejWzjcPlJiuWH5TAb4CJF9rBc/HaXgl734BDyjKMhI0oxZs+XMZ4Wa8oauukrNW1Zypp+DfY6kKQnH1OfWMXF1+Kulzt59mZznk2FvL1mtENtjBp2M9w71c/jWyWK3y2l4ghfm6l1O7c24P5LVYN2sNVPjcGQjyivY1NV2e+g0etwy2rbftslv6s4Y+NAoLKnaXOTiM8N0t4l8kvHMawk8une+2dyy+O8Pw3bE+xV8Qq/+hCvXqbz735g8=&lt;/diagram&gt;&lt;/mxfile&gt;"><defs/><g><path d="M 120 30 L 233.63 30" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="stroke"/><path d="M 238.88 30 L 231.88 33.5 L 233.63 30 L 231.88 26.5 Z" fill="rgb(0, 0, 0)" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="all"/><rect x="0" y="0" width="120" height="60" fill="rgb(255, 255, 255)" stroke="rgb(0, 0, 0)" pointer-events="all"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" style="overflow: visible; text-align: left;"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe center; width: 118px; height: 1px; padding-top: 30px; margin-left: 1px;"><div data-drawio-colors="color: rgb(0, 0, 0); " style="box-sizing: border-box; font-size: 0px; text-align: center;"><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; pointer-events: all; white-space: normal; overflow-wrap: normal;">client1</div></div></div></foreignObject><text x="60" y="34" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="12px" text-anchor="middle">client1</text></switch></g><path d="M 120 140 L 233.63 140" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="stroke"/><path d="M 238.88 140 L 231.88 143.5 L 233.63 140 L 231.88 136.5 Z" fill="rgb(0, 0, 0)" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="all"/><rect x="0" y="110" width="120" height="60" fill="rgb(255, 255, 255)" stroke="rgb(0, 0, 0)" pointer-events="all"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" style="overflow: visible; text-align: left;"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe center; width: 118px; height: 1px; padding-top: 140px; margin-left: 1px;"><div data-drawio-colors="color: rgb(0, 0, 0); " style="box-sizing: border-box; font-size: 0px; text-align: center;"><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; pointer-events: all; white-space: normal; overflow-wrap: normal;">client2</div></div></div></foreignObject><text x="60" y="144" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="12px" text-anchor="middle">client2</text></switch></g><path d="M 120 250 L 233.63 250" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="stroke"/><path d="M 238.88 250 L 231.88 253.5 L 233.63 250 L 231.88 246.5 Z" fill="rgb(0, 0, 0)" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="all"/><rect x="0" y="220" width="120" height="60" fill="rgb(255, 255, 255)" stroke="rgb(0, 0, 0)" pointer-events="all"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" style="overflow: visible; text-align: left;"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe center; width: 118px; height: 1px; padding-top: 250px; margin-left: 1px;"><div data-drawio-colors="color: rgb(0, 0, 0); " style="box-sizing: border-box; font-size: 0px; text-align: center;"><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; pointer-events: all; white-space: normal; overflow-wrap: normal;">client3</div></div></div></foreignObject><text x="60" y="254" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="12px" text-anchor="middle">client3</text></switch></g><path d="M 240 30 L 240 0 L 490 0 L 490 30" fill="rgb(255, 255, 255)" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="all"/><path d="M 240 30 L 240 60 L 490 60 L 490 30" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="none"/><path d="M 240 30 L 490 30" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="none"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" style="overflow: visible; text-align: left;"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe center; width: 248px; height: 1px; padding-top: 15px; margin-left: 241px;"><div data-drawio-colors="color: rgb(0, 0, 0); " style="box-sizing: border-box; font-size: 0px; text-align: center;"><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; pointer-events: none; white-space: normal; overflow-wrap: normal;">ptr : smart_ptr&lt;Resource&gt;</div></div></div></foreignObject><text x="365" y="19" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="12px" text-anchor="middle">ptr : smart_ptr&lt;Resource&gt;</text></switch></g><rect x="240" y="30" width="250" height="30" fill="#f5f5f5" stroke="#666666" pointer-events="none"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" style="overflow: visible; text-align: left;"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe flex-start; width: 240px; height: 1px; padding-top: 45px; margin-left: 246px;"><div data-drawio-colors="color: #333333; " style="box-sizing: border-box; font-size: 0px; text-align: left; max-height: 26px; overflow: hidden;"><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: rgb(51, 51, 51); line-height: 1.2; pointer-events: none; white-space: normal; overflow-wrap: normal;">\_M_use_count = 3</div></div></div></foreignObject><text x="246" y="49" fill="#333333" font-family="Helvetica" font-size="12px">\_M_use_count = 3</text></switch></g><path d="M 490 140 L 583.63 140" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="none"/><path d="M 588.88 140 L 581.88 143.5 L 583.63 140 L 581.88 136.5 Z" fill="rgb(0, 0, 0)" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="none"/><path d="M 240 140 L 240 110 L 490 110 L 490 140" fill="rgb(255, 255, 255)" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="none"/><path d="M 240 140 L 240 170 L 490 170 L 490 140" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="none"/><path d="M 240 140 L 490 140" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="none"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" style="overflow: visible; text-align: left;"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe center; width: 248px; height: 1px; padding-top: 125px; margin-left: 241px;"><div data-drawio-colors="color: rgb(0, 0, 0); " style="box-sizing: border-box; font-size: 0px; text-align: center;"><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; pointer-events: none; white-space: normal; overflow-wrap: normal;">ptr : smart_ptr&lt;Resource&gt;</div></div></div></foreignObject><text x="365" y="129" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="12px" text-anchor="middle">ptr : smart_ptr&lt;Resource&gt;</text></switch></g><rect x="240" y="140" width="250" height="30" fill="#f5f5f5" stroke="#666666" pointer-events="none"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" style="overflow: visible; text-align: left;"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe flex-start; width: 240px; height: 1px; padding-top: 155px; margin-left: 246px;"><div data-drawio-colors="color: #333333; " style="box-sizing: border-box; font-size: 0px; text-align: left; max-height: 26px; overflow: hidden;"><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: rgb(51, 51, 51); line-height: 1.2; pointer-events: none; white-space: normal; overflow-wrap: normal;">\_M_use_count = 3</div></div></div></foreignObject><text x="246" y="159" fill="#333333" font-family="Helvetica" font-size="12px">\_M_use_count = 3</text></switch></g><path d="M 240 250 L 240 220 L 490 220 L 490 250" fill="rgb(255, 255, 255)" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="none"/><path d="M 240 250 L 240 280 L 490 280 L 490 250" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="none"/><path d="M 240 250 L 490 250" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="none"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" style="overflow: visible; text-align: left;"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe center; width: 248px; height: 1px; padding-top: 235px; margin-left: 241px;"><div data-drawio-colors="color: rgb(0, 0, 0); " style="box-sizing: border-box; font-size: 0px; text-align: center;"><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; pointer-events: none; white-space: normal; overflow-wrap: normal;">ptr : smart_ptr&lt;Resource&gt;</div></div></div></foreignObject><text x="365" y="239" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="12px" text-anchor="middle">ptr : smart_ptr&lt;Resource&gt;</text></switch></g><rect x="240" y="250" width="250" height="30" fill="#f5f5f5" stroke="#666666" pointer-events="none"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" style="overflow: visible; text-align: left;"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe flex-start; width: 240px; height: 1px; padding-top: 265px; margin-left: 246px;"><div data-drawio-colors="color: #333333; " style="box-sizing: border-box; font-size: 0px; text-align: left; max-height: 26px; overflow: hidden;"><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: rgb(51, 51, 51); line-height: 1.2; pointer-events: none; white-space: normal; overflow-wrap: normal;">\_M_use_count = 3</div></div></div></foreignObject><text x="246" y="269" fill="#333333" font-family="Helvetica" font-size="12px">\_M_use_count = 3</text></switch></g><rect x="590" y="110" width="120" height="60" fill="rgb(255, 255, 255)" stroke="rgb(0, 0, 0)" pointer-events="none"/><g transform="translate(-0.5 -0.5)"><switch><foreignObject pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" style="overflow: visible; text-align: left;"><div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: unsafe center; justify-content: unsafe center; width: 118px; height: 1px; padding-top: 140px; margin-left: 591px;"><div data-drawio-colors="color: rgb(0, 0, 0); " style="box-sizing: border-box; font-size: 0px; text-align: center;"><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; pointer-events: none; white-space: normal; overflow-wrap: normal;">:Resource</div></div></div></foreignObject><text x="650" y="144" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="12px" text-anchor="middle">:Resource</text></switch></g><path d="M 490 250 L 560 250 L 560 155 L 582.13 155" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="none"/><path d="M 588.88 155 L 579.88 159.5 L 582.13 155 L 579.88 150.5 Z" fill="rgb(0, 0, 0)" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="none"/><path d="M 490 30 L 560 30 L 560 125 L 582.13 125" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="none"/><path d="M 588.88 125 L 579.88 129.5 L 582.13 125 L 579.88 120.5 Z" fill="rgb(0, 0, 0)" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="none"/></g><switch><g requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"/><a transform="translate(0,-5)" xlink:href="https://www.diagrams.net/doc/faq/svg-export-text-problems" target="_blank"><text text-anchor="middle" font-size="10px" x="50%" y="100%">Text is not SVG - cannot display</text></a></switch></svg>

`std::unique_ptr<T>` 是可以拷贝的，也可强制使用 `std::move<T>` 来移动它指向的资源。

3. 无所有权但是能够安全访问的 `std::weak_prt<T>`

应用场景：一个没有持有资源的指针指向一个或多个 `std::shared_ptr<T>` 实例持有的资源。

`std::weak_prt<T>` -- 没有所有权的指针，对资源的生命周期没有影响。`std::weak_prt<T>` 仅仅 “观察” 它指向的资源，并检查该资源是否有效。

使用 `std::shared_ptr<T>` 和 `std::weak_ptr<T>`，能够区分软件设计中的资源所有者和资源使用者。并不是每个软件单元都想成为资源的所有者，因为它们只需要资源来完成特定的、有时间限制的任务。

- 循环依赖问题

### 避免显式的 new 和 delete

显式调用 new 和 delete 可以通过以下这些措施来避免：

- **尽可能使用栈内存**。分配栈内存很简单，而且安全。栈内存永远不会造成内存泄漏。资源一旦超出它的使用范围就会被销毁。

- **用 make functions 在堆上分配资源**。用 `std::make_unique<T>` 或 `std::make_shared<T>` 实例化资源，然后将它包装成一个资源管理对象去管理资源及智能指针。

- **尽量使用容器（标准库、Boost、或者其它）**。容器会对其元素进行存储空间的管理。相反，自己开发数据结构或序列式容器的时候，必须自己实现所有的内存管理细节，这将是一个复杂的、且容易出错的任务。

- 如果有特殊的内存管理，**利用特有的第三方库封装资源**

### 管理特有资源

如

文件系统中打开文件、动态链接模块等

这些资源是通过所谓的**句柄**（handle）来管理的。

**句柄**是操作系统资源的一个抽象以及唯一的引用。

RAII 原则即可

> 注意：在 C++ 中不允许定义 `std::unique_ptr<void>` 类型！这是因为 `std::shared_ptr<T>` 实现了类型删除，但是 `std::unique_ptr<T>` 没有。如果一个类支持类型删除，也就意味着它可以存储任意类型的对象，而且会正确地释放对象占用的内存。

## Move 语义

OLD：旧的 C++ 语言强迫程序员使用复制构造函数，实际上并没有真正想要对象的深拷贝。相反，只是想移动对象的负载，即对象的数据，如其它对象、数据成员或原始数据类型等。

---

Move 语义特性 -- 可以移动对象的内部数据。

### 左值和右值的关系

> 历史术语， 左值通常出现在赋值运算符的左边（有时也会出现在左边），而右值一般出现在赋值运算符的右边。

左值的另一个解释为一个 locator value,可以清楚地表明左值是一个在内存有位置的对象（即它具有可访问和可识别的内存地址）。

相对于左值，右值是一些表达式，不是左值的对象，是一个临时对象或者子对象。

C++11 后引入更多种类的定义（xvalue、glvalue、prvalue）来支持 Move 语义。

### 右值引用

右值引用使右值的内存位置成为可能

临时的内存分配给右值引用后，内存将变成 “永久” 的。

### 不要滥用 Move

`std::move<T>()` 函数并不是可以 move 任何东西，或多或少是对 T 类型右值引用对象的一个强制类型转换。

将 `std::move<T>()` 作为返回值是完全没有必要的。

**小心优化！**

大篇幅的 `std::move<T>()` 会影响代码的可读性，而且编译器可能无法正确执行其优化策略。

### 零原则

在实现类的时候，应该不需要声明/定义析构函数，也不需要声明/定义 copy/move 构造器和 copy/move 赋值运算符。用 C++ 智能指针和标准类库来管理资源。

该原则背后的原理：写更少的代码做更多的事情。

## 编译器 -- 搭档

使用编译器时应遵循的三个指导原则：

- 能在编译阶段解决的事情就在编译阶段解决。
- 能在编译阶段检查的事情就在编译阶段检查。
- 编译器对程序所知道的一切都应该由编译器决定。

### 自动类型推导

`auto` 可用来实现自动类型推导，也称作类型推导。

在不产生歧义的情况下，尽量使用 `auto` 关键词。

### 编译时计算

C++11 引入了 `constexpr` 关键词，用来声明一个常量表达式。

`constexpr` 声明的函数可以在编译时计算。

### 模板变量

模板也能使用 `constexpr` 关键词，用来声明一个模板变量。

eg

```cpp
template <typename T>
constexpr T pi = T(3.1415926535897932385L);
```

类可实现编译时计算，可以将类的成员函数声明为 `constexpr`，这样就可以在编译时计算。

同样，constexpr 类在运行及编译时都能使用。然而，与常规的类相反，constexpr 类中不允许定义虚成员函数（编译时没有多态性），并且它的析构函数不能显式定义出来。

## 不允许未定义的行为

避免未定义的行为！未定义行为是一个严重的错误，并且最终会导致程序悄无声息地出错。

## Type-Rich 编程

> 不要相信名字，
>
> 而是相信类型
>
> 因为类型不会说谎
>
> 类型是你的好朋友
>
> --- Mario Fusco(@mariofusco), April 13, 2016, on Twitter

类型安全在编译期间即得到保障！

SI units --- standard international unit 基于模板的库，提供了物理量的类型。

## 了解你使用的库

Not invented here (NIH)，是一种组织反模式。

NIH 综合症是许多组织的一个贬义词，它描述了对现有知识的忽视或原生的尝试和测试的解决方案，它是 “重新造轮子” 的一种形式，即认为重新实现一些（库或框架）已经在某些地方可用的高质量的东西。作为开发者一定要避免这种症状。

在过去的几十年中，基于 C++ 语言，出现了许多优秀的库和框架，这些解决方案经历了很长的一段时间，已经趋于成熟并成功应用于数万个项目。没有必要重新造轮子。合格的软件开发者应该知道这些库，不需要了解这些库及 API 的每个实现细节。但是，最好知道已经有针对某些应用领域的，经过试验和测试的解决方案，这些解决方案在软件开发项目中可能会是较好的选择。

### 熟练使用 algorithm 库

> 如果你想提高团队的代码质量，那么请用一个目标替换所有的编码指南：没有原始循环！ --- Sean Parent, Principal software architect with Adobe, at CppCon 2013

C++ 标准库提供了 100 多种有用的算法，可以用于搜索、计数和操作 1 容器或序列中的元素，这些算法包含在 `<algorithm>` 头文件中

### 熟练使用 Boost

使用 Boost 库中的内容可以解决工作中遇到的许多问题和 C++ 开发人员在日常工作中面临的问题。

### 应该了解的一些库

- `<chrono>` 日期时间库

- `<regex>` 正则表达式库

- `<filesystem>` 文件系统库

- Range-v3 迭代器相关的代码

- `libcds` 并发数据结构，C++ 模板库，提供了无锁算法和并发数据结构的实现，主要用于高性能的并发计算。该库基于 C++11 编写的，并遵循 BSD 许可。

## 恰当的异常和错误处理机制

> 横切关注点（Cross-Cutting Concerns），指的是难以用模块化的概念解决的问题，通常用软件架构和设计来解决。

### 防患于未然

处理错误和异常的基本策略通常是避免它们。原因很简单：问题没有发生，就没有必要去处理。

### 异常即异常---字面上的意思

仅在非常特殊的情况下抛出异常。不要滥用异常来控制正确的程序流程。

### 如果不能恢复则尽快推出

如果遇到异常导致不能恢复，通常的做法是写日志记录异常，或者生成一个 crash dump 文件稍后分析，然后立即终止程序。

> Dead Program Tell No Lies

没有什么比在一个严重错误之后当作没有发生过继续下去更糟糕，比如生成数以万计的错误订单；或者把电梯从地下室送到顶楼，然后再回来循环数百次。相反，在大多灾难性的后果发生之前推出程序是明智的决定。

### 用户自定义异常

只需继承 `std::exception`（定义在头文件 `<stdexcept>` 中）即可。

重写继承自 `std::exception` 的虚成员方法 `what()`，可为调用者提供出错信息。

### 值类型抛出，常量引用类型捕获

### 注意 catch 的正确顺序
