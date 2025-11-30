# How to Pull Only Client Folder from Teammate's Branch

## 🎯 Goal
Pull just the `client` folder from a teammate's branch without overwriting your `server` folder or other files.

---

## Method 1: Using `git checkout` (Recommended - Safest)

### Step 1: Check Available Branches
```bash
# See all branches (local and remote)
git branch -a

# Or see just remote branches
git branch -r
```

### Step 2: Fetch the Remote Branch
```bash
# Fetch all remote branches
git fetch origin

# Or fetch specific branch
git fetch origin teammate-branch-name
```

### Step 3: Checkout Only the Client Folder
```bash
# Checkout just the client folder from teammate's branch
git checkout origin/teammate-branch-name -- client/

# Or if it's a local branch
git checkout teammate-branch-name -- client/
```

### Step 4: Review Changes
```bash
# See what files changed
git status

# Review the changes
git diff --cached
```

### Step 5: Commit the Changes
```bash
# If everything looks good, commit
git add client/
git commit -m "Pull client folder from teammate's branch"
```

---

## Method 2: Using `git show` (Alternative)

### Step 1: Fetch the Branch
```bash
git fetch origin teammate-branch-name
```

### Step 2: Extract Client Folder
```bash
# Create a temporary directory
mkdir temp_client

# Extract client folder from that branch
git show origin/teammate-branch-name:client/ > temp_client.tar

# Or extract specific files
git show origin/teammate-branch-name:client/package.json > client/package.json
```

---

## Method 3: Using `git sparse-checkout` (Advanced)

### Step 1: Enable Sparse Checkout
```bash
git config core.sparseCheckout true
```

### Step 2: Specify What to Checkout
```bash
# Create sparse-checkout file
echo "client/*" > .git/info/sparse-checkout

# Checkout the branch
git checkout origin/teammate-branch-name
```

### Step 3: Disable Sparse Checkout (After Done)
```bash
git config core.sparseCheckout false
rm .git/info/sparse-checkout
```

---

## Method 4: Manual Merge (Safest for Conflicts)

### Step 1: Create a Backup Branch
```bash
# Create backup of your current work
git branch backup-before-merge

# Make sure you're on your main branch
git checkout your-branch-name
```

### Step 2: Fetch and Merge Only Client Folder
```bash
# Fetch the remote branch
git fetch origin teammate-branch-name

# Merge only specific paths
git merge origin/teammate-branch-name --no-commit --no-ff

# Unstage everything
git reset HEAD

# Stage only client folder
git add client/

# Review what will be committed
git status

# If good, commit
git commit -m "Merge client folder from teammate's branch"
```

---

## 🛡️ Safety Checklist

Before pulling:

1. **Commit your current work:**
   ```bash
   git status
   git add .
   git commit -m "Save current work before pulling client folder"
   ```

2. **Create a backup branch:**
   ```bash
   git branch backup-$(date +%Y%m%d)
   ```

3. **Check what will change:**
   ```bash
   # See differences
   git diff your-branch origin/teammate-branch-name -- client/
   ```

---

## 🔍 Verify After Pulling

### Check What Changed
```bash
# See modified files
git status

# See detailed changes
git diff HEAD~1 client/
```

### Test Your Server Still Works
```bash
# Make sure server folder is untouched
git status server/

# Should show "nothing to commit" if untouched
```

---

## ⚠️ If Something Goes Wrong

### Undo the Changes
```bash
# Undo the checkout (before committing)
git restore --staged client/
git restore client/

# Or reset to previous commit
git reset --hard HEAD~1
```

### Restore from Backup
```bash
# Switch to backup branch
git checkout backup-branch-name

# Or restore specific folder
git checkout backup-branch-name -- client/
```

---

## 📋 Quick Command Reference

```bash
# 1. Fetch remote branch
git fetch origin teammate-branch-name

# 2. Pull only client folder
git checkout origin/teammate-branch-name -- client/

# 3. Review changes
git status

# 4. Commit if good
git add client/
git commit -m "Update client folder from teammate"
```

---

## 💡 Pro Tips

1. **Always commit your work first** - Don't pull on uncommitted changes
2. **Use `git status` frequently** - Check what's changing
3. **Review diffs before committing** - `git diff --cached`
4. **Test after pulling** - Make sure server still works
5. **Communicate with teammate** - Let them know you're pulling their changes

---

## 🎯 Recommended Workflow

```bash
# Step 1: Save your work
git add .
git commit -m "Save current work"

# Step 2: Fetch teammate's branch
git fetch origin teammate-branch-name

# Step 3: Preview changes
git diff your-branch origin/teammate-branch-name -- client/

# Step 4: Pull client folder
git checkout origin/teammate-branch-name -- client/

# Step 5: Review
git status
git diff --cached

# Step 6: Commit
git add client/
git commit -m "Pull client folder from teammate's branch"

# Step 7: Verify server untouched
git status server/
```

---

**This method ensures your server folder and other files remain completely untouched!** ✅

