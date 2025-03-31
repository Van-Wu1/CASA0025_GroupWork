# merge_js_files.py

from datetime import datetime

# 模块顺序
file_order = [
    'style.js',
    'panel.js',
    'layer.js',
    'draw.js',
    'main.js'
]

# 动态生成输出文件名
timestamp = datetime.now().strftime("%Y%m%d_%H%M")
output_filename = f'combined_{timestamp}.js'

# 合并内容
with open(output_filename, 'w', encoding='utf-8') as outfile:
    outfile.write('// ===== Combined GEE Script =====\n')
    outfile.write(f'// Created: {timestamp}\n')
    outfile.write('// Modules: ' + ', '.join(file_order) + '\n\n')
    
    for fname in file_order:
        with open(fname, 'r', encoding='utf-8') as infile:
            outfile.write(f'\n// ===== {fname} =====\n')
            outfile.write(infile.read())

print(f"合并完成！输出文件: {output_filename}")
