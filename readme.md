# Project Description
## Project Title: 
GlacierShift: An APP to Map Glacier-Affected Regions，Exploring Glacier Change and Conservation Planning across the Qinghai-Tibet Plateau

## Project Background:
As global warming intensifies, glaciers on the Tibetan Plateau are retreating rapidly, greatly affecting regional ecological stability and spatial patterns of human activities. As an important freshwater resource, glaciers support downstream water supply, agriculture, ecosystems and even urban construction. However, there is a lack of systematic consideration of the dynamics of glacier change in the existing territorial spatial planning system.

## Project Objective:
Based on the Law on Ecological Protection of the Tibetan Plateau (to be implemented in 2023) and the policy framework of ‘dual evaluation’, this project studies the impacts of glacier changes on regional ecological and spatial planning, and develops an interactive application based on Google Earth Engine (GEE), GlacierShift. An interactive application based on Google Earth Engine (GEE), GlacierShift, was developed to dynamically identify glacier-affected areas and assist in territorial spatial planning decision-making.

## Project Results:

1. A thematic dataset covering glacier changes on the Tibetan Plateau for the period 2000-2020 was produced.
2. Quantified the impacts of glacier changes on the suitability of ecological reserves, agricultural production, and urban construction.
3. Built a GEE interactive application to support users to browse glacier changes, query impact areas, and assist spatial adaptation analyses.

## Application Implications:
GlacierShift aims to provide scientific support to policy makers, spatial planners and researchers, to promote land use optimisation and ecological protection in the context of dynamic environmental change, and to enhance the resilience and foresight of territorial spatial governance.

---
# Description of the project structure
```bash
CASA0025_GroupWork/
│
├── .quarto/               # Quarto internal index file, automatically generated, can be ignored
│   ├── idx/               # Rendering index files
│   └── xref/              # Cross-reference file
│
├── .vscode/               # VSCode Project Configuration
│
├── docs/                  # The static web page output after rendering (for GitHub Pages deployment)
│   ├── images/            # Pictures on the website (rendered version)
│   ├── site_libs/         # Library files (CSS/JS, etc.) required for the website
│   ├── index.html         # website homepage
│   └── Other auxiliary documents      # such as search.json、readme.html etc.
│
├── GEE_code/              # Google Earth Engine scripts and auxiliary files
│   ├── *.js               # The GEE JavaScript file written in blocks
│   ├── *.md               # GEE project documents or notes
│   ├── merge_js_files.py  # small tools for merging scripts
│
├── images/                # Original image resources (for web pages and reports)
│
├── .DS_Store              # The macOS system automatically generates files, which can be ignored
├── .gitignore             # Git ignores rule configuration
├── favicon.ico            # The small icon of the website tag
├── index.qmd              # The main document of the project (including content and code)
├── index.log              # The log file generated during rendering
├── index.tex              # The intermediate TeX file generated during the rendering of PDF
├── logo.png               # Project Logo picture
├── monokai.theme          # Code block color theme file (supporting dark/light theme switching)
├── readme.md              # Current project description document
├── _quarto.yml            # Quarto main configuration file (including website appearance, navigation bar,etc.)


```
## reminders
1. The .quarto/ folder is usually auto-generated during the rendering process and does not require manual editing.

2. The contents of the docs/ folder are the output files for deployment. Please do not modify them directly. Instead, update the index.qmd file and run quarto render to regenerate.

3. The GEE_code/ folder contains a large number of Google Earth Engine scripts written by team members. It is an important part of the project and should be properly organized and maintained.

4. Before pushing to GitHub, make sure that unnecessary large files (such as .DS_Store) are properly ignored by configuring the .gitignore file.

#### ⚠ About .gitignore：
Downloading and storing files such as .json or .shp locally can improve code performance. However, before uploading the project to Git, these files must be listed in .gitignore.
Otherwise, committing large files may lead to irreversible repository issues and could cause push failures.


# update_note_20250328

1. Target to local location, clone this repository

```bash
cd ...
git clone https://github.com/Van-Wu1/CASA0025_GroupWork.git
```
2. download and install [quarto](https://quarto.org/docs/download/)
3. The content is edited in the 'index.qmd' file
4. After editing, input in the terminal to complete the pdf rendering
```bash
Quarto render
```
5. upload to Github

### Debugging completed, Website deployed in [OurWeb](https://van-wu1.github.io/CASA0025_GroupWork/).