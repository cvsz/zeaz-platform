#!/usr/bin/env node
import { Command } from 'commander';
import { runTask } from '../src/factory-engine.js';
import fs from 'node:fs';
import path from 'node:path';

const program = new Command();

program
  .name('zai-factory')
  .description('CLI for ZEAZ Platform AI Factory')
  .version('0.1.0');

program.command('validate')
  .description('Validate factory integrity')
  .action(() => {
    console.log('Validating AI Factory integrity...');
  });

program.command('app:create')
  .description('Create a new app')
  .argument('<name>', 'App name')
  .action(async (name) => {
    try { await runTask('app:create', { name }); console.log(`App ${name} created.`); } 
    catch (error) { console.error(error.message); }
  });

program.command('agent:create')
  .description('Create a new agent')
  .argument('<name>', 'Agent name')
  .action(async (name) => {
    try { await runTask('agent:create', { name }); console.log(`Agent ${name} created.`); } 
    catch (error) { console.error(error.message); }
  });

program.command('skill:create')
  .description('Create a new skill')
  .argument('<name>', 'Skill name')
  .action(async (name) => {
    try { await runTask('skill:create', { name }); console.log(`Skill ${name} created.`); } 
    catch (error) { console.error(error.message); }
  });

program.parse();
