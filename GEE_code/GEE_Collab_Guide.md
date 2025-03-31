# CASA0025 GEE 小组协作指南

> 更新时间：2025-03-31 22:59  
> 作者：ixxiiris  
> 适用于：需要在本地进行 Earth Engine 模块化开发、上传资产、运行合并脚本的组员。

---

## 1️ Earth Engine 环境配置（每位组员都必须）

### 1.1 注册 Earth Engine 账号

前往官网注册（使用 Google 账号）：

https://signup.earthengine.google.com/

---

### 1.2 安装依赖

```bash
pip install earthengine-api
```

---

### 1.3 授权登录 Earth Engine

```bash
earthengine authenticate
```

授权过程中浏览器会打开页面，登录 Google 账号并复制授权码回终端。

---

### 1.4 设置 GCP 项目（使用组内共享项目）

```bash
earthengine set_project casa0025geeappglaicier
```

---

### 1.5 注册项目到 Earth Engine（只需做一次,我已经做了所以不用做了）

https://code.earthengine.google.com/register?project=casa0025geeappglaicier

---

## 2️ 上传资产（shp / GeoTIFF / CSV）

### 2.1 上传矢量数据（如 shp、GeoJSON）

```bash
earthengine upload table path/to/your_boundary.geojson \
  --asset_id=projects/casa0025geeappglaicier/assets/group_assets/glacier_boundary
```

### 2.2 上传栅格数据（如 GeoTIFF）

```bash
earthengine upload image path/to/your_raster.tif \
  --asset_id=projects/casa0025geeappglaicier/assets/group_assets/ndvi_2005
```

### 2.3 设置公开或共享权限
- 注：Google Earth Engine 的权限控制（ACL）目前并不支持设置“所有人可写（编辑）”：

- 所有人可读：
  ```bash
  earthengine acl set --all_users_read \
projects/casa0025geeappglaicier/assets/group_assets/asset_name
  ```

- 指定组员可写：
  ```bash
 earthengine acl set \
  --writers=teammate1@gmail.com,teammate2@gmail.com \
  projects/casa0025geeappglaicier/assets/group_assets/asset_name
  ```


### 2.4 为保证所有人均可读上传的资产
- 请完成上传 + 设置权限两步，否则GEE会默认上传的资产为私有的
  ```bash
  earthengine upload table ./boundary.geojson \
  --asset_id=projects/casa0025geeappglaicier/assets/group_assets/glacier_2000
  earthengine acl set --all_users_read \
  projects/casa0025geeappglaicier/assets/group_assets/glacier_2000
  ```

---

## 3️ 运行本地合并脚本 `merge_js_files.py`

> 用于将多个模块化 `.js` 文件合并为可直接在 Earth Engine Code Editor 中运行的 `combined_xxx.js`

### 3.1 确保文件结构如下（已在.py中设置好，可忽略）：

```
GEE_code/
├── style.js
├── panel.js
├── layer.js
├── draw.js
├── main.js
├── file_order.txt
└── merge_js_files.py
```

文件内容顺序在 `file_order.txt` 中定义：

```text
style.js
panel.js
layer.js
draw.js
main.js
```

---

### 3.2 运行脚本

- 进入项目目录 
```bash
cd GEE_code
```
- 运行：
```bash
python merge_js_files.py
```

执行成功后将生成如下文件（带时间和作者标记）：

```
combined_20250401_1043_by_ixxiiris.js
```

---

### 3.3 打开 GEE 编辑器运行
- 建议自己建一个project，并新建一个javascript文件

1. 访问 https://code.earthengine.google.com
2. 创建新脚本，命名如 `group_demo_script`
3. 打开 `combined_*.js`，全选复制粘贴到 GEE 编辑器
4. 点击运行按钮

---

##  附加建议

- 所有组员统一使用项目 ID：`casa0025geeappglaicier`
- 上传资产前建议先用 QGIS 检查数据格式
- 多人合并脚本时将自动添加作者名与时间戳，避免覆盖

---

