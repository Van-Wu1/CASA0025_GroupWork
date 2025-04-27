# From Oballinger

Use this repository to host a website for your CASA0025 final project by following these stpes: 

1. clone this repository 
2. install [quarto](https://quarto.org/docs/download/) 
3. edit the 'index.qmd' file with the contents of your project
4. using terminal, navigate to the project directory and run "quarto render" 
5. push the changes to your github repository 
6. on github, navigate to Settings>Pages>Build and Deployment. Make sure that under "Source" it says "deploy from branch". Under "Branch", select "Main" in the first dropdown and "Docs" under the second drop down. Then press "Save" 

Your website should now be available under 
https://{your_username}.github.io/{your_repo_name}


# 关于readme文件的更新_250328

1. 目标到本地位置，克隆本仓库

```bash
cd ...
git clone https://github.com/Van-Wu1/CASA0025_GroupWork.git
```
2. 下载安装 [quarto](https://quarto.org/docs/download/)
3. 内容在 'index.qmd' 文件中进行编辑
4. 编辑结束后在终端输入，完成pdf渲染
```bash
Quarto render
```
5. 上传Github

### Debugging completed, Website deployed in [OurWeb](https://van-wu1.github.io/CASA0025_GroupWork/).

#### eg. 个人感觉编辑器用VS简单粗暴一些，直接连接远程仓库一键推送，可以免掉很多重复性终端操作
# 项目简介

---
# 项目结构说明
```bash
CASA0025_GroupWork/
│
├── .quarto/               # Quarto内部索引文件，自动生成，可忽略
│   ├── idx/               # 渲染索引文件
│   └── xref/              # 交叉引用文件
│
├── .vscode/               # VSCode项目配置（如编辑器格式设置）
│
├── docs/                  # 渲染后输出的静态网页（用于GitHub Pages部署）
│   ├── images/            # 网站中的图片（渲染版）
│   ├── site_libs/         # 网站所需的库文件（CSS/JS等）
│   ├── index.html         # 网站首页
│   └── 其他辅助文件       # （如search.json、readme.html等）
│
├── GEE_code/              # Google Earth Engine脚本与辅助文件
│   ├── *.js               # 分块编写的GEE JavaScript文件
│   ├── *.md               # GEE项目文档或笔记
│   ├── merge_js_files.py  # 合并脚本的小工具
│
├── images/                # 原始图片资源（供网页和报告使用）
│
├── .DS_Store              # macOS系统自动生成文件，可忽略
├── .gitignore             # Git忽略规则配置
├── favicon.ico            # 网站标签的小图标
├── index.qmd              # 项目的主文档（包含内容与代码）
├── index.log              # 渲染时生成的日志文件
├── index.tex              # 渲染PDF过程中生成的中间TeX文件
├── logo.png               # 项目Logo图片
├── monokai.theme          # 代码块配色主题文件（支持暗/亮主题切换）
├── readme.md              # 当前项目说明文档
├── _quarto.yml            # Quarto主配置文件（包括网站外观、导航栏等）


```
## 小点
.quarto/ 文件夹一般不需要手动编辑，是渲染过程中自动生成的。

docs/ 文件夹中的内容是渲染输出物，请勿直接修改，而应该通过编辑 index.qmd 然后 quarto render 来更新。

GEE_code/ 文件夹包含了大量小组成员撰写的Google Earth Engine脚本，是重要的代码部分，注意整理和归档。

推送（push）到GitHub之前，确保 .gitignore 文件中忽略了不必要的大文件（比如 .DS_Store）。

#### ⚠ 关于.gitignore：
json或者shp文件等，在本地下载保存可以加快代码运行，但如果要上传git请在这个文件中加忽略，如果出现已经上传了commit但是文件过大而无法push，可能会造成不可逆的污染（呃呃呃我之前吃过这个亏然后fix了很久）


### 先写到这。没啥过于特别的，多了一个Quarto的渲染和网站部署，其他按照正常的git推送走。