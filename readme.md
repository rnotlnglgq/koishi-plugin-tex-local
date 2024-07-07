# koishi-plugin-tex-local

[![npm](https://img.shields.io/npm/v/koishi-plugin-tex-local?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-tex-local)

根据用户发送的TeX指令来生成图像。

## 依赖

* LaTeX（尤其是 `pdflatex` 程序）：生成PDF
* `pdftoppm` ：生成图像

## 坑

* 错误处理
* 垃圾清理
* 安全性
  * 性能限制
    * 内存
    * 存储：pdf aux log文件大小
    * 时间
    * 图像
* 灵活配置
  * 自定义导言区
  * 几何尺寸
