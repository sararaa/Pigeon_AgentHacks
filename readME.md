# PIGEON!


## Setup

### 1. Clone the repository

> ⚠️ **Important:** This repo uses **Git LFS** for `.csv` files. You must install it *before cloning* to avoid corrupt data files.

```bash
# Install Git LFS if not already installed
brew install git-lfs        # macOS
# or
sudo apt install git-lfs    # Debian/Ubuntu
# or download from https://git-lfs.com
# I personally found it easiest to do just use homebrew installation

# Setup Git LFS (one time)
git lfs install

# Now clone the repo
git clone https://github.com/sararaa/Pigeon_AgentHacks.git
cd Pigeon_AgentHacks
```
- Make sure .gitattributes is inside your repo, and it's contents are simply
- *.csv filter=lfs diff=lfs merge=lfs -text
- IF YOU DO NOT HAVE THIS .gitattributes file, please run `git lfs track "*.csv"` in the root directory of this github repository on your machine.

### 2. Run the backend server
- This is done to expose the LLM service as a local API so that it can be accessed by the frontend.
- 
```bash
cd backend
pip install -r requirements.txt
uvicorn app.scripts.traffic_predictorAPI:app --reload --port 8001 # this is the specific line that runs it as a backend api service
```
### 3. Run the frontend
```bash
cd frontend
npm install # to install all dependencies
npm run dev # to start the frontend instance
```
