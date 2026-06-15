---
name: zai-ai
description: Comprehensive guide to Artificial Intelligence basics, including LLMs, Machine Learning, and Generative AI principles.
---

# AI Fundamentals Skill

## ZeaZ Platform & apps/* Monorepo Rules
When implementing tasks on the `zeaz-platform` repository, you MUST strictly enforce these architecture and workflow rules:
1. **Monorepo Architecture (apps/*)**: The platform is a unified monorepo. ALL applications, microservices, frontends, and AI toolings (e.g., zLinebot, zwallet, zdash) reside inside the `apps/` directory. Do not create top-level directories for apps. When refactoring or adding features, always scope your work to the specific `apps/<app-name>/` folder.
2. **Environment Variables**: Avoid scattering `.env` files. Consolidate environment variables into a central `.env.example` inside the respective app folder. Canonical Cloudflare variables (e.g. `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`) MUST be used instead of legacy `CF_` variants.
3. **Commit Workflow**: NEVER use `git commit` or `git push` directly. ALWAYS stage your intended files with `git add` and commit using `make gpg-finalize COMMIT_MSG="..."` from the repository root to ensure all GitOps and DevSecOps checks pass.
4. **Security**: NEVER commit or generate real secrets. Unsafe placeholders like `replace-me`, `changeme`, `dummy-secret` are FORBIDDEN.
5. **Language**: Code, documentation, and technical definitions MUST be in English.

## 1. Overview
Artificial Intelligence (AI) encompasses various domains including Machine Learning (ML), Deep Learning (DL), and Generative AI. Understanding these fundamentals is crucial for leveraging AI effectively in business and engineering.

## 2. Core Concepts
* **Machine Learning (ML)**: Algorithms that learn patterns from data rather than being explicitly programmed.
* **Deep Learning (DL)**: A subset of ML using multi-layered artificial neural networks.
* **Generative AI**: Systems capable of generating text, images, or other media in response to prompts (e.g., LLMs, Diffusion models).
* **Large Language Models (LLMs)**: Massive neural networks trained on vast amounts of text to understand and generate human language.

## 3. Best Practices
* **Understand Limitations**: Always account for AI hallucinations and bias. AI models predict the most likely next token, they do not "know" facts inherently.
* **Data Quality**: The output quality of any AI model is strictly bounded by the quality of its training or context data ("Garbage in, garbage out").
* **Iterative Refinement**: AI integration is an iterative process. Start with simple models/prompts and add complexity only when necessary.

## 4. Key Terminology
* **Token**: The basic unit of data processed by an LLM (roughly 3/4 of a word).
* **Context Window**: The maximum number of tokens an LLM can process in a single request.
* **Parameters**: The internal variables learned by the model during training.
