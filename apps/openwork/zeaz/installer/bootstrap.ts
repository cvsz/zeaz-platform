import { ZeazOmega } from '../index'
import { registerDefaultWorkflows } from '../workflows/definitions'

interface BootstrapOptions {
  autoStart?: boolean
  registerWorkflows?: boolean
  verbose?: boolean
}

export async function bootstrap(options: BootstrapOptions = {}): Promise<ZeazOmega> {
  const {
    autoStart = true,
    registerWorkflows = true,
    verbose = false,
  } = options

  const log = verbose ? console.log : () => {}

  log('[ZEAZ] Initializing Omega...')

  const zeaz = new ZeazOmega()

  if (registerWorkflows) {
    registerDefaultWorkflows(zeaz.getOrchestrator().workflows)
    log('[ZEAZ] Registered default workflows')
  }

  if (autoStart) {
    await zeaz.init()
    log('[ZEAZ] Omega initialized and running')
  }

  return zeaz
}

export async function start(): Promise<void> {
  console.log('')
  console.log('╔══════════════════════════════════════════╗')
  console.log('║     ZEAZ Omega — AI OS for OpenWork      ║')
  console.log('╚══════════════════════════════════════════╝')
  console.log('')

  const zeaz = await bootstrap({ verbose: true })

  const status = zeaz.getOrchestrator().getStatus()
  console.log('')
  console.log('Status:')
  console.log(`  Agents:       ${status.agents} registered`)
  console.log(`  LLM Providers: ${(status.llmProviders as Array<unknown>).length} available`)
  console.log(`  MCP Providers: ${status.mcpProviders} registered`)
  console.log(`  Workflows:    ${status.workflows} defined`)
  console.log(`  Memory:       ${status.memorySize} entries`)
  console.log(`  Runtime:      ${status.runtimeConnected ? 'connected' : 'disconnected'}`)
  console.log('')
  console.log('ZEAZ Omega is ready.')
  console.log('')

  process.on('SIGINT', async () => {
    console.log('\n[ZEAZ] Shutting down...')
    await zeaz.shutdown()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    console.log('\n[ZEAZ] Shutting down...')
    await zeaz.shutdown()
    process.exit(0)
  })
}

if (import.meta.url === `file://${process.argv[1]}`) {
  start().catch(console.error)
}
