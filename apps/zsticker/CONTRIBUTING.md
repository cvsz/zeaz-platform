# Contributing to zsticker

First off, thank you for considering contributing to `zsticker`! It's people like you that make tools great.

## How Can I Contribute?

### Reporting Bugs
- Ensure the bug was not already reported by searching on GitHub under [Issues](https://github.com/cvsz/zsticker/issues).
- If you're unable to find an open issue addressing the problem, open a new one using the **Bug Report** template.

### Suggesting Enhancements
- Open a new issue using the **Feature Request** template.
- Provide a clear and descriptive title and a detailed explanation of the proposed feature.

### Pull Requests
1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests to the `/tests` directory.
3. Ensure the test suite passes by running `make test`.
4. Ensure your code is formatted correctly using `make format` and `make lint`.
5. Open your Pull Request using the provided PR template.

## Development Setup
```bash
python -m venv venv
source venv/bin/activate
make install
```
