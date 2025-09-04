# Docker CI/CD with GitHub Actions

This project uses GitHub Actions to automatically build and push Docker images to GitHub Container Registry (ghcr.io).

## Workflows

### 1. Build and Push (`docker-build.yml`)
- **Triggers**: Push to main/master branch, pull requests, and version tags
- **Actions**: Builds multi-architecture Docker image and pushes to ghcr.io
- **Features**: 
  - Multi-architecture support (AMD64, ARM64)
  - Automatic tagging based on branch, PR, and semantic versions
  - GitHub Actions cache for faster builds
  - Only pushes on actual pushes (not PRs)

### 2. Security Scan (`docker-security.yml`)
- **Triggers**: Push to main/master branch, pull requests, and weekly schedule
- **Actions**: 
  - Trivy vulnerability scanning
  - npm audit checks
  - Snyk security scanning (optional)
- **Features**: Results uploaded to GitHub Security tab

### 3. **Multi-Architecture Build (`multi-arch-build.yml`)**
- **Triggers**: Push to main/master branch, pull requests, and manual dispatch
- **Actions**: Comprehensive multi-architecture Docker builds with testing
- **Features**: 
  - AMD64 and ARM64 support with QEMU emulation
  - Platform-specific testing
  - Manual workflow dispatch with custom platform selection
  - Build arguments for version and date tracking

### 4. Release (`release.yml`)
- **Triggers**: GitHub releases published
- **Actions**: Multi-platform Docker builds and releases
- **Features**: 
  - Supports linux/amd64, linux/arm64, linux/arm/v7
  - Creates latest, major, minor, and version tags

## Setup Requirements

### 1. Repository Settings
Ensure your repository has the following enabled:
- **Settings → Actions → General**: Allow all actions and reusable workflows
- **Settings → Actions → General**: Read and write permissions for packages

### 2. Secrets (Optional)
- `SNYK_TOKEN`: For Snyk security scanning (optional)

### 3. Package Visibility
- **Settings → Packages**: Ensure packages are visible as desired (public/private)

## Usage

### Automatic Builds
Images are automatically built and pushed on:
- Every push to main/master branch
- Every pull request (build only, no push)
- Every version tag (e.g., v1.0.0)

### Manual Triggers
You can manually trigger workflows from the Actions tab in GitHub.

### Image Tags
Images are tagged with:
- `latest`: Latest commit on main/master
- `main` or `master`: Branch-specific tags
- `v1.0.0`: Semantic version tags
- `1.0`: Major.minor version tags
- `1`: Major version tags
- `main-abc123`: Branch with commit SHA

## Pulling Images

```bash
# Latest version
docker pull ghcr.io/yourusername/oauth-mock:latest

# Specific version
docker pull ghcr.io/yourusername/oauth-mock:v1.0.0

# Specific branch
docker pull ghcr.io/yourusername/oauth-mock:main
```

## Running the Container

```bash
# Run with default port 9000
docker run -p 9000:9000 ghcr.io/yourusername/oauth-mock:latest

# Run with custom port
docker run -p 8080:9000 ghcr.io/yourusername/oauth-mock:latest

# Run with environment variables
docker run -p 9000:9000 \
  -e NODE_ENV=production \
  ghcr.io/yourusername/oauth-mock:latest
```

## Multi-platform Support

All workflows now support multi-architecture builds:

### Primary Architectures (All Workflows)
- **linux/amd64**: Intel/AMD 64-bit processors
- **linux/arm64**: ARM 64-bit processors (Apple Silicon, ARM servers)

### Extended Support (Release Workflow)
- **linux/arm/v7**: ARM 32-bit processors (Raspberry Pi, etc.)

### Key Features
- **QEMU Emulation**: Enables building ARM images on AMD64 runners
- **Platform Testing**: Each architecture is tested independently
- **Manual Dispatch**: Custom platform selection via workflow dispatch
- **Build Arguments**: Version and timestamp tracking in images

## Security Features

- **Vulnerability Scanning**: Trivy scans for known CVEs
- **Dependency Checks**: npm audit for Node.js vulnerabilities
- **Container Security**: Regular security scans on schedule
- **Results Integration**: Security findings appear in GitHub Security tab

## Troubleshooting

### Build Failures
1. Check Actions tab for detailed error logs
2. Verify Dockerfile syntax
3. Ensure all dependencies are properly specified

### Permission Issues
1. Verify repository has package write permissions
2. Check if GITHUB_TOKEN has sufficient scope
3. Ensure workflows have correct permissions section

### Image Not Found
1. Verify image was built successfully
2. Check package visibility settings
3. Ensure correct image name and tag

## Customization

### Adding New Platforms
Edit the `release.yml` workflow and modify the `platforms` field:
```yaml
platforms: linux/amd64,linux/arm64,linux/arm/v7,linux/ppc64le
```

### Changing Build Context
Modify the `context` field in workflows to build from different directories.

### Adding Build Arguments
Use the `build-args` field in the build-push-action:
```yaml
build-args: |
  BUILD_VERSION=${{ github.sha }}
  NODE_ENV=production
```

## Best Practices

1. **Tag Strategy**: Use semantic versioning for releases
2. **Security**: Regularly update base images and dependencies
3. **Caching**: Leverage GitHub Actions cache for faster builds
4. **Testing**: Run tests before building images
5. **Documentation**: Keep this guide updated with any changes
