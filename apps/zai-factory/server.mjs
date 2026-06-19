import express from 'express';
import { Command } from 'commander';

const program = new Command();
program
  .option('--host <host>', 'Host to bind', '127.0.0.1')
  .option('--port <port>', 'Port to bind', '4191')
  .parse();

const options = program.opts();
const app = express();

app.get('/', (req, res) => {
  res.send('ZAI Factory is running');
});

app.listen(options.port, options.host, () => {
  console.log(`ZAI Factory server running at http://${options.host}:${options.port}`);
});
