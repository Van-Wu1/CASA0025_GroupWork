# CASA0025 GEE 小组协作指南

> 更新时间：2025-03-31 22:59  
> 作者：ixxiiris  
> 适用于：需要在本地进行 Earth Engine 模块化开发、上传资产、运行合并脚本的北鼻。

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
- 注：果咩纳塞啊啊啊啊我打错单词了
- 评论1：没事哒没事哒没人会觉得你是文盲哒（20250401_01:04_Van）插播一条，自己库里看不到repo，直接fork（习：你也是文盲，这是fork）（我改）解决，后期都是同步的

```bash
earthengine set_project casa0025geeappglaicier
```

---

### 1.5 注册项目到 Earth Engine（只需做一次,我已经做了所以不用做了,大家忽略）

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
- 请完成上传 + 设置权限两步，否则GEE会默认上传的资产为上传者私有
  ```bash
  earthengine upload table ./boundary.geojson \
  --asset_id=projects/casa0025geeappglaicier/assets/group_assets/glacier_2000
  ```

  ```bash
  earthengine acl set --all_users_read \
  projects/casa0025geeappglaicier/assets/group_assets/glacier_2000
  ```

---

## 3️ 运行本地合并脚本 `merge_js_files.py`

- 用于将多个模块化 `.js` 文件合并为可直接在 Earth Engine Code Editor 中运行的 `combined_xxx.js`

### 3.1 确保文件结构如下（已在.py中设置好，可忽略）：

```
GEE_code/
├── style.js
├── panel.js
├── layer.js
├── draw.js
├── main.js
└── merge_js_files.py
```

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

---

## 4️ 模块合并逻辑与各 JS 文件说明

为了实现团队协作与模块化开发，我们将 GEE 脚本拆分为多个 .js 文件。合并脚本 `merge_js_files.py` 会按照以下顺序自动合并它们：

###  合并顺序与职责（详见 `merge_js_files.py` 中 file_order）

1. **style.js**  
   定义全局样式常量，如调色板、边界颜色等，供后续图层渲染使用。

2. **data.js**  
   统一管理 GEE 数据源加载、筛选、按年选择、区域过滤等预处理函数。

3. **layer.js**  
   负责调用 data.js 中的函数，将数据封装为可添加到地图的图层。  
   提供 `getLayer(type, year)` 接口供 UI 控件调用。

4. **panel.js**  
   管理 UI 控件与地图布局，包括左/右图选择器、时间滑块、Draw Polygon 按钮等。  
   所有控件被分别放置于地图的左下、右下、顶部等位置。

5. **draw.js**  
   当前为占位文件，后续将扩展用户绘制 polygon 并查询图层值的功能。

6. **main.js**  
   作为主入口，只负责执行 `initMapLayout()` 与 `addControlPanel()` 两个初始化方法。

---

> 提示：

- 如果需要添加新的图层类型或数据集，请在 `data.js` 中封装函数，并在 `layer.js` 中拓展 `getLayer()`。
- 所有面板交互逻辑请放入 `panel.js`，不要直接写在 `main.js`。
- 多人协作时，每人可以只负责一个模块，提高合并效率和代码清晰度。
- 建议每位组员在自己写的函数或代码块前后添加统一风格的注释块，并带上自己的姓名或昵称，便于区分作者和功能区域。
示例格式： 
``` javascript 
// ===== [Xinyi Zeng] Begin: 自定义 NDVI 年份平均值函数 =====
function getNDVIMeanByYear(year) {
  return modisNDVI
    .filter(ee.Filter.calendarRange(year, year, 'year'))
    .mean();
}
// ===== [Xinyi Zeng] End =====
```


### 补一点内容，适用于GEE在线资产调用（20250401_1732_Van）
如果数据不需要资产上传，只是调用GEE的在线数据，操作如下：

1. 如需调整图层可视化的颜色，转到`style.js`中新增或者修改样式；
2. `data.js`中两个地方需要修改，一个部分是在线资产调用，如：
```bash
  var waterbody = ee.ImageCollection("JRC/GSW1_4/YearlyHistory")
  .filterBounds(defaultRegion)
  .select("WaterBody");
  ```
另一部分是function的编写，如：
```bash
function getWaterbodyByYear(year) {
  var image = ee.ImageCollection("JRC/GSW1_4/YearlyHistory")
    .filter(ee.Filter.eq('year', year))
    .mosaic()
    .clip(defaultRegion);
  return image.gte(2).selfMask();}
```
3. `layer.js`需调整 `function getLayer(type, year)`，将在线资产挂载进对应图层；
4.  此外注意图层变量名与大小写一致，图层变量名存在于`data.js`，`layer.js`，`panel.js`三个文件；

EG. 以及统一风格的姓名注释块有一个bug，如果不是新增而是修改部分代码，用以调试，那么我们的姓名备注会出现嵌套，而在视觉上很混乱

