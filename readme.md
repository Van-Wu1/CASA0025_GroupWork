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

---
# 项目结构说明
```bash
CASA0025_GroupWork/
│
├── .quarto/             # 项目配置目录，不用管
│
├── docs/                # Output内容在这里，用于GitHub Pages输出
│
├── images/              # 报告用到的图放这里
│
├── .DS_Store            # macOS 自动生成的文件，不用管
├── .gitignore           # Git 配置忽视
├── _quarto.yml          # Quarto 的主配置文件（输出格式、主题等）
├── favicon.ico          # 网页标签上的小图标（咱搞个漂亮的？）
│
├── index.qmd            # 主报告文件（你写的内容 + 代码都在这里）
├── index.tex            # 渲染 PDF 报告时中间生成的 LaTeX 文件，不用管
├── index.log            # 渲染日志，一般情况不用管
│
├── logo.png             # 项目 Logo，谁出一下logo美工
├── monokai.theme        # Quarto 使用的代码块配色主题（右上角的黑白页面转换）
└── readme.md            # 这个是readme

```
#### ⚠ 关于.gitignore：
json或者shp文件等，在本地下载保存可以加快代码运行，但如果要上传git请在这个文件中加忽略，如果出现已经上传了commit但是文件过大而无法push，可能会造成不可逆的污染（呃呃呃我之前吃过这个亏然后fix了很久）


### 先写到这。没啥过于特别的，多了一个Quarto的渲染和网站部署，其他按照正常的git推送走。