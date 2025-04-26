# CASA0025 GEE Glacier Project

本项目使用 Google Earth Engine (GEE) 管理和分析青藏高原地区的 NDVI、温度和地理边界数据，以研究冰川变化对生态和水资源的潜在影响。

## GEE 资源路径

项目数据存储于 GEE Cloud Assets 路径下（就是有拼写错误，不用管，这个项目ID改不了，哈哈，我是文盲）：  
`projects/casa0025geeappglaicier/assets/`

结构如下：

---

### NDVI (2000–2020)

路径前缀：  
`projects/casa0025geeappglaicier/assets/NDVI/`

每年一个图像资产：
- `NDVI_2000`
- `NDVI_2001`
- ...
- `NDVI_2020`

---

### Temperature (2000–2020)

路径前缀：  
`projects/casa0025geeappglaicier/assets/temperature/`

每年一个图像资产：
- `temp_2000`
- `temp_2001`
- ...
- `temp_2020`

---

### Boundary 区域边界

路径前缀：  
`projects/casa0025geeappglaicier/assets/boundary/`

包含以下几个矢量边界文件：
- `gongga`（不用了）
- `main_area`（不用了）
- `sanjiangyuan`（不用了）
- `zhufeng`（不用了）
- `zone_clip`

---

### dual_evaluation

路径前缀：  
`users/ixizroiesxi/`

包含以下指标图层：
- `SIr_clip`（农业）
- `SIu_clip`（城镇）
- `Slefixed`（生态）
（有拼写问题但是可以用）

---

### glacier

路径：  
`users/ixizroiesxi/glacier/`  

包含以下指标图层：
- `glacier_changes_20XX_3band`（X值为00-20）
这里只使用波段1

---

