# ZAI Factory

ZAI Factory is the local-first AI system for the ZeaZ Platform.

## Usage

### CLI
You can use `zaictl` to run factory commands:

```bash
./scripts/zaictl.sh factory --help
```
(Command uses `zai-factory` internally)

### Dashboard
The local dashboard can be accessed via:

```bash
cd apps/zai-factory
npm run dev
```

## Safety
This system follows the strict safety guidelines defined in the ZEAZ Platform operating guide (no secret committing, etc.).

## Components
- Registry: App, Agent, Skill, Plugin, etc.
- CLI: `ai-factory.js`
- Engine: `factory-engine.js`
- Dashboard: `public/index.html`
