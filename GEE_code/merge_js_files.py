# merge_js_files.py

from datetime import datetime
import getpass

# 模块顺序
file_order = [
    'style.js',
    'panel.js',
    'layer.js',
    'draw.js',
    'main.js'
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
