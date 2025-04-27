# APP link
https://casa0025-xswlgroup.projects.earthengine.app/view/glaciershift

# Project website
https://van-wu1.github.io/CASA0025_GroupWork/

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
├── .quarto/                  # Quarto-generated indexing and cross-referencing data (auto-generated, no need to modify)
│   ├── idx/                  # Rendering index files
│   └── xref/                 # Cross-document reference files
│
├── .vscode/                   # Local VS Code configuration files (editor settings)
│
├── docs/                      # Rendered website output (for GitHub Pages deployment)
│   ├── images/                # Images used in the website
│   ├── site_libs/             # Website dependency libraries (CSS/JS, auto-generated)
│   ├── index.html             # Rendered website homepage
│   ├── readme.html            # Rendered version of README
│   ├── search.json            # Search index for the website
│   ├── flowmap.png, etc.      # Images for online display
│
├── GEE_code/                  # Google Earth Engine related scripts and preprocessing
│   ├── 1style.js ~ 7main.js    # Core application modules (style, data, layers, panel, click events, queries, main entry)
│   ├── combined_*.js           # Combined functional scripts
│   ├── agri_and_urban_*.js     # Agricultural and urban suitability scripts
│   ├── eco_significant.js, etc.# Scripts for ecological importance evaluation
│   ├── NDVIpreprocess.js       # NDVI preprocessing scripts
│   ├── TEMPpreprocess.js       # Temperature data preprocessing
│   ├── main_area_glacier_pre_processing.ipynb  # Glacier area preprocessing notebook
│   ├── GEE_Collab_Guide_v2.md  # GEE collaboration guidelines
│   ├── merge_js_files.py       # Script merging tool
│   ├── path.md and other notes
│
├── images/                    # Original image resources (for reports or website)
│   ├── logo3.png / logo4.png    # Project logos
│   ├── sketch.png / sketch.jpg  # Sketch diagrams
│   ├── ui.png / ui.jpg          # UI screenshots
│   ├── flowmap.png / glacier_loss_00.jpg, etc.  # Analytical maps
│
├── .DS_Store                  # macOS system auto-generated file (can be ignored)
├── .gitignore                 # Git ignore rules (to exclude unnecessary large/cache files)
├── favicon.ico                # Website tab icon
├── GlacierShift.js            # Final integrated GEE application script
├── index.qmd                  # Main Quarto document (for website and PDF generation)
├── index.log                  # Rendering log file
├── index.tex                  # Intermediate LaTeX file from rendering
├── logo.png                   # Additional project logo
├── monokai.theme              # Syntax highlighting theme (supporting dark/light modes)
├── readme.md                  # Project description and instructions
├── _quarto.yml                # Quarto configuration file (controls website layout, theme, and structure)

```
