# agame7k.github.io
my website for agame.works

## Development Testing

This repository has a dev testing setup that allows you to preview changes before pushing to production.

### How it works:

1. **Production site**: `https://agame.works` - served from the `main` branch
2. **Dev site**: `https://agame.works/dev` - automatically deployed from the `dev` branch

### Workflow:

1. Create a `dev` branch if it doesn't exist:
   ```bash
   git checkout -b dev
   ```

2. Make your changes on the `dev` branch and push:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin dev
   ```

3. The GitHub Action will automatically copy the dev branch files to `/dev` on main

4. Visit `https://agame.works/dev` to preview your changes (look for the orange DEV MODE banner)

5. When you're happy with the changes, merge `dev` into `main`:
   ```bash
   git checkout main
   git merge dev
   git push origin main
   ```

### Note:
The dev site will show an orange "DEV MODE" banner at the top to clearly distinguish it from production.
