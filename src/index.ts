import { Context, Schema, h } from 'koishi'

import { pathToFileURL } from 'url'
import { join } from 'path'
import { mkdtempSync, rmdir, writeFileSync } from 'fs'
import { execFileSync } from 'child_process'

export const name = 'tex-local'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

const texprog: string = "pdflatex"
const preamble: string = ""
// const preamble: string = "\\usepackage{xeCJK}"
const strut: string = ""
const display: string = "\\displaystyle"
const fontsize: string = "12"
const skipsize: string = "14.4"

export function apply(ctx: Context) {
  ctx.command('tex <code:rawtext>')
    .action(async ({ session }, tex_code) => {
      let tex_working_dir: string
      try {
        tex_working_dir = mkdtempSync(join(process.cwd(), 'cache/tex-local/', session.id.toString()))
      } catch (err) {
        const report: string = `创建临时文件夹时遇到错误：\n${err}`
        console.log(report)
        session.send(report)
        setTimeout(() => {rmdir(tex_working_dir, ()=>{})}, 120000)
        return
      }
      try {
        writeFileSync(join(tex_working_dir, 'main.tex'), tex_doc(tex_code), {})
      } catch (err) {
        const report: string = `将TeX源码写入文件时遇到错误：\n${err}`
        console.log(report)
        session.send(report)
        setTimeout(() => {rmdir(tex_working_dir, ()=>{})}, 120000)
        return
      }
      try {
        execFileSync(texprog, ['-interaction=nonstopmode', "-halt-on-error", 'main.tex'], {cwd: tex_working_dir})
      } catch (err) {
        const report: string = `编译TeX源码生成PDF时遇到错误：\n${err}`
        console.log(report)
        session.send(report)
        setTimeout(() => {rmdir(tex_working_dir, ()=>{})}, 120000)
        return
      }
      try {
        execFileSync('pdftoppm', ['-jpeg', "-r", "300", "-singlefile", "-sep", "", 'main.pdf', 'main'], {cwd: tex_working_dir})
      } catch (err) {
        const report: string = `转换PDF为JPEG时遇到错误：\n${err}`
        console.log(report)
        session.send(report)
        setTimeout(() => {rmdir(tex_working_dir, ()=>{})}, 120000)
        return
      }
      session.send(h.image(
        pathToFileURL(join(tex_working_dir, 'main.jpg')).toString()
      ))
    })
}

function tex_doc(tex: string): string {
  // This template is from https://github.com/szhorvat/MaTeX (MIT License)
  return `\\documentclass[12pt, border=1pt, multi]{standalone}
  \\newenvironment{matex}{\\ignorespaces}{\\ignorespacesafterend}
  \\standaloneenv{matex}
  \\newbox\\MaTeXbox
  \\newcommand{\\MaTeX}[1]{
    \\begin{matex}
      \\setbox\\MaTeXbox\\hbox{%
        ${strut}%
        \\(%
          ${display}%
          #1%
        \\)}%
      \\typeout{MATEXDEPTH:\\the\\dp\\MaTeXbox}%
      \\typeout{MATEXHEIGHT:\\the\\ht\\MaTeXbox}%
      \\typeout{MATEXWIDTH:\\the\\wd\\MaTeXbox}%
      \\unhbox\\MaTeXbox%
    \\end{matex}
  }
  %\\usepackage[utf8]{inputenc}
  ${preamble}
  \\begin{document}
  \\fontsize{${fontsize}pt}{${skipsize}pt}\\selectfont
  \\MaTeX{${tex}}
  \\end{document}`
}
