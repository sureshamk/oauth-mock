# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated Docker image building, testing, and deployment.

## Quick Start

1. **Push your code** to the main/master branch
2. **Check the Actions tab** in your GitHub repository
3. **View your packages** in the Packages tab

## Workflow Files

### `test-and-build.yml` (Recommended)
- Runs tests on multiple Node.js versions
- Builds and pushes Docker image only if tests pass
- Includes basic Docker image testing
- **Use this for most development workflows**

### `docker-build.yml`
- Simple build and push workflow
- Good for basic CI/CD needs
- No testing included

### `docker-security.yml`
- Security scanning and vulnerability checks
- Weekly scheduled scans
- Results appear in GitHub Security tab

### `release.yml`
- Multi-platform builds for releases
- Triggered by GitHub releases
- Creates versioned tags

## Setup Checklist

- [ ] Repository has Actions enabled
- [ ] Repository has package write permissions
- [ ] Main branch is set (main or master)
- [ ] Dockerfile exists in root directory
- [ ] package.json has correct name and version

## Customization

### Change Image Name
Update the `IMAGE_NAME` environment variable in workflows:
```yaml
env:
  IMAGE_NAME: your-custom-name
```

### Add Build Arguments
Modify the build-push-action in workflows:
```yaml
build-args: |
  BUILD_VERSION=${{ github.sha }}
  NODE_ENV=production
```

### Change Platforms
Update the `platforms` field:
```yaml
platforms: linux/amd64,linux/arm64,linux/arm/v7
```

## Troubleshooting

### Workflow Not Running
- Check if Actions are enabled in repository settings
- Verify the workflow file is in `.github/workflows/`
- Check branch names match your repository

### Permission Denied
- Ensure repository has package write permissions
- Check workflow permissions section
- Verify GITHUB_TOKEN scope

### Build Failures
- Check Dockerfile syntax
- Verify all dependencies are available
- Check Actions logs for specific errors

## Support

For issues with these workflows:
1. Check the Actions tab for detailed logs
2. Verify your repository settings
3. Ensure all prerequisites are met
