# agame7k.github.io
my website for agame.works

## Features

- **Dark, cozy theme** - A warm, homely design with comfortable colors
- **Projects showcase** - Automatically pulls from GitHub repositories  
- **Blog system** - Write and sync blog posts from your TrueNAS server
- **User authentication** - Simple login/signup functionality
- **Responsive design** - Works on desktop and mobile

## Development Environment

### Branch Structure
- **main**: Production branch - deployed to https://agame.works
- **dev**: Development branch - deployed to https://agame.works/dev

### How the Dev Environment Works

1. **Automatic Deployment**: When you push to the `dev` branch, a GitHub Actions workflow automatically:
   - Copies files from the `dev` branch to a `/dev` folder on the main branch
   - Adds a dev banner to all HTML pages to clearly indicate you're viewing the development version
   - Adds `[DEV]` prefix to page titles

2. **Accessing the Dev Site**: 
   - Production: https://agame.works
   - Development: https://agame.works/dev

3. **Manual Trigger**: You can also manually run the deploy workflow from the GitHub Actions tab

### Setting Up Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/Agame7k/agame7k.github.io.git
   cd agame7k.github.io
   ```

2. Switch to the dev branch:
   ```bash
   git checkout dev
   ```

3. Make your changes and test locally (you can use a simple HTTP server):
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Or using Node.js
   npx serve
   ```

4. Push to the dev branch to trigger deployment:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin dev
   ```

5. View your changes at https://agame.works/dev

### Dev Banner

The development site automatically includes an orange banner at the top indicating "DEV MODE" with a link back to the production site.

---

## Blog System & TrueNAS Sync

The blog system is designed to sync posts from your TrueNAS server. Here's how to set it up:

### Blog Post Format

Blog posts are stored in `data/blog-posts.json`. Each post should have this structure:

```json
{
    "id": "unique-post-id",
    "title": "Post Title",
    "date": "2024-01-15",
    "author": "Your Name",
    "excerpt": "A short summary of the post...",
    "content": "The full content of your blog post...",
    "tags": ["tag1", "tag2"],
    "image": "optional-image-url.jpg"
}
```

### Setting Up TrueNAS Sync

To automatically sync blog posts from your TrueNAS server to this GitHub Pages site:

#### 1. Create a Blog Posts Directory on TrueNAS

Create a directory on your TrueNAS server to store blog posts:
```bash
mkdir -p /mnt/pool/blog/posts
```

#### 2. Create a Sync Script on TrueNAS

Create a script at `/mnt/pool/blog/sync-blog.sh`:

```bash
#!/bin/bash

# Configuration - Use environment variables for security
# Set these in your environment or a secure .env file
BLOG_DIR="/mnt/pool/blog/posts"
GITHUB_REPO="${GITHUB_REPO:-Agame7k/agame7k.github.io}"
GITHUB_TOKEN="${GITHUB_TOKEN}"  # Set via environment variable
OUTPUT_FILE="/tmp/blog-posts.json"

# Check if token is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_TOKEN environment variable is not set"
    exit 1
fi

# Combine all JSON posts into one file
echo "[" > $OUTPUT_FILE
first=true

for file in $BLOG_DIR/*.json; do
    if [ -f "$file" ]; then
        if [ "$first" = true ]; then
            first=false
        else
            echo "," >> $OUTPUT_FILE
        fi
        cat "$file" >> $OUTPUT_FILE
    fi
done

echo "]" >> $OUTPUT_FILE

# Get current content SHA from GitHub
SHA=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$GITHUB_REPO/contents/data/blog-posts.json" \
    | jq -r '.sha // empty')

# Encode content as base64
CONTENT=$(base64 -w 0 $OUTPUT_FILE)

# Prepare commit message
MESSAGE="Update blog posts from TrueNAS - $(date '+%Y-%m-%d %H:%M')"

# Build API request body
if [ -n "$SHA" ]; then
    BODY="{\"message\":\"$MESSAGE\",\"content\":\"$CONTENT\",\"sha\":\"$SHA\"}"
else
    BODY="{\"message\":\"$MESSAGE\",\"content\":\"$CONTENT\"}"
fi

# Push to GitHub
curl -X PUT -H "Authorization: token $GITHUB_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$BODY" \
    "https://api.github.com/repos/$GITHUB_REPO/contents/data/blog-posts.json"

echo "Blog posts synced successfully!"
```

#### 3. Set Up Environment Variables

Create a secure environment file at `/mnt/pool/blog/.env`:

```bash
# /mnt/pool/blog/.env - Keep this file secure!
export GITHUB_TOKEN="your_github_personal_access_token_here"
export GITHUB_REPO="Agame7k/agame7k.github.io"
```

**Important**: Set restrictive permissions on the env file:
```bash
chmod 600 /mnt/pool/blog/.env
```

#### 4. Set Up a Cron Job

Add a cron job on TrueNAS to run the sync script periodically:

```bash
# Edit crontab
crontab -e

# Add this line to sync every hour (loads env vars before running)
0 * * * * . /mnt/pool/blog/.env && /mnt/pool/blog/sync-blog.sh >> /var/log/blog-sync.log 2>&1
```

#### 5. Create a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with `repo` permissions
3. Copy the token and add it to your `/mnt/pool/blog/.env` file

#### 6. Writing Blog Posts

Create individual JSON files in your TrueNAS blog directory:

```bash
# Example: /mnt/pool/blog/posts/my-new-post.json
{
    "id": "my-new-post",
    "title": "My New Blog Post",
    "date": "2024-02-01",
    "author": "Agame7k",
    "excerpt": "This is my latest post about...",
    "content": "Full content of the post goes here...",
    "tags": ["tech", "homelab"],
    "image": null
}
```

### User Data Sync (Future)

For syncing user data, you could set up a similar process, but this would require:
- A backend API running on TrueNAS
- Secure authentication between the website and TrueNAS
- Database storage on TrueNAS for user accounts

**Note**: The current authentication system uses localStorage for demo purposes. For production use with TrueNAS sync, you would need to implement a proper backend API.

---

## File Structure

```
agame7k.github.io/
├── index.html          # Home page
├── projects.html       # GitHub projects showcase
├── blog.html           # Blog listing page
├── blog-post.html      # Individual blog post viewer
├── about.html          # About page
├── contact.html        # Contact form
├── login.html          # User login
├── signup.html         # User registration
├── admin.html          # Admin panel
├── css/
│   └── styles.css      # Main stylesheet
├── js/
│   ├── auth.js         # Authentication logic
│   └── blog.js         # Blog functionality
├── data/
│   └── blog-posts.json # Blog posts data
└── README.md           # This file
```
