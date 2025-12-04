# agame7k.github.io
my website for agame.works

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
