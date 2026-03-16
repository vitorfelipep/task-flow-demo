#!/usr/bin/env node

/**
 * Performance measurement script for build time and cold start
 * Usage:
 *   node scripts/measure-perf.mjs build   # Measure build time
 *   node scripts/measure-perf.mjs start   # Measure cold start time
 */

import { spawn } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { performance } from 'perf_hooks';

const METRICS_FILE = 'perf-metrics.json';

function loadMetrics() {
  if (existsSync(METRICS_FILE)) {
    return JSON.parse(readFileSync(METRICS_FILE, 'utf-8'));
  }
  return { builds: [], coldStarts: [] };
}

function saveMetrics(metrics) {
  writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));
  console.log(`\nMetrics saved to ${METRICS_FILE}`);
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  const mins = Math.floor(ms / 60000);
  const secs = ((ms % 60000) / 1000).toFixed(1);
  return `${mins}m ${secs}s`;
}

async function measureBuild() {
  console.log('📦 Starting build measurement...\n');
  
  const startTime = performance.now();
  
  return new Promise((resolve, reject) => {
    const proc = spawn('npm', ['run', 'build'], {
      stdio: 'inherit',
      shell: true,
    });

    proc.on('close', (code) => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (code === 0) {
        const metrics = loadMetrics();
        const entry = {
          timestamp: new Date().toISOString(),
          duration,
          durationFormatted: formatDuration(duration),
        };
        metrics.builds.push(entry);
        
        // Keep last 50 entries
        if (metrics.builds.length > 50) {
          metrics.builds = metrics.builds.slice(-50);
        }
        
        saveMetrics(metrics);
        
        console.log('\n' + '='.repeat(50));
        console.log('📊 BUILD METRICS');
        console.log('='.repeat(50));
        console.log(`Duration: ${formatDuration(duration)}`);
        console.log(`Timestamp: ${entry.timestamp}`);
        
        // Calculate averages
        const avgDuration = metrics.builds.reduce((a, b) => a + b.duration, 0) / metrics.builds.length;
        console.log(`Average (last ${metrics.builds.length} builds): ${formatDuration(avgDuration)}`);
        console.log('='.repeat(50));
        
        resolve(duration);
      } else {
        reject(new Error(`Build failed with code ${code}`));
      }
    });
  });
}

async function measureColdStart() {
  console.log('🚀 Starting cold start measurement...\n');
  console.log('Note: Waiting for server to be ready on port 3001\n');

  const startTime = performance.now();
  
  return new Promise((resolve, reject) => {
    const proc = spawn('npm', ['run', 'start', '--filter=@taskflow/api'], {
      stdio: 'pipe',
      shell: true,
    });

    let output = '';
    let resolved = false;

    const checkReady = (data) => {
      output += data.toString();
      
      // Look for "Server running" or similar messages
      if (!resolved && (
        output.includes('Server running') ||
        output.includes('listening on') ||
        output.includes('ready on')
      )) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        resolved = true;

        const metrics = loadMetrics();
        const entry = {
          timestamp: new Date().toISOString(),
          duration,
          durationFormatted: formatDuration(duration),
        };
        metrics.coldStarts.push(entry);
        
        if (metrics.coldStarts.length > 50) {
          metrics.coldStarts = metrics.coldStarts.slice(-50);
        }
        
        saveMetrics(metrics);

        console.log('\n' + '='.repeat(50));
        console.log('📊 COLD START METRICS');
        console.log('='.repeat(50));
        console.log(`Duration: ${formatDuration(duration)}`);
        console.log(`Timestamp: ${entry.timestamp}`);
        
        const avgDuration = metrics.coldStarts.reduce((a, b) => a + b.duration, 0) / metrics.coldStarts.length;
        console.log(`Average (last ${metrics.coldStarts.length} starts): ${formatDuration(avgDuration)}`);
        console.log('='.repeat(50));

        // Kill the process after measuring
        proc.kill('SIGTERM');
        resolve(duration);
      }
    };

    proc.stdout.on('data', checkReady);
    proc.stderr.on('data', checkReady);

    // Timeout after 60 seconds
    setTimeout(() => {
      if (!resolved) {
        proc.kill('SIGTERM');
        reject(new Error('Timeout waiting for server to start'));
      }
    }, 60000);

    proc.on('error', reject);
  });
}

async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'build':
        await measureBuild();
        break;
      case 'start':
        await measureColdStart();
        break;
      default:
        console.log('Usage: node scripts/measure-perf.mjs [build|start]');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
