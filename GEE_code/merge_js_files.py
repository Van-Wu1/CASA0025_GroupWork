# merge_js_files.py

from datetime import datetime
import getpass

# 模块顺序【可随时调整】
file_order = [
    'style.js', # 常量与调色板，最先加载供后面引用
    'data.js ', # 数据加载与预处理函数 
    'layer.js', # 依赖 data.js，负责把数据转为图层
    'panel.js', # 构建 UI 控件面板（调用 updateLayer 等）
    'draw.js',  # 绘图工具查询模块
    'main.js'   # 控制入口，调用 initMapLayout、addControlPanel 等
]

# Get current time and username
timestamp = datetime.now().strftime("%Y%m%d_%H%M")
username = getpass.getuser()  # 系统登录用户名
output_filename = f'combined_{timestamp}_by_{username}.js'

# combine files
with open(output_filename, 'w', encoding='utf-8') as outfile:
    outfile.write('// ===== Combined GEE Script =====\n')
    outfile.write(f'// Created: {timestamp}\n')
    outfile.write(f'// Author: {username}\n')
    outfile.write('// Modules: ' + ', '.join(file_order) + '\n\n')
    
    for fname in file_order:
        with open(fname, 'r', encoding='utf-8') as infile:
            outfile.write(f'\n// ===== {fname} =====\n')
            outfile.write(infile.read())

print(f"Combine Complete！Output file: {output_filename}")
