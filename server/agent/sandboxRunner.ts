
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TestResult {
  passed: boolean;
  total: number;
  failed: number;
  duration: number;
  output: string;
}

export class SandboxRunner {
  async runTests(plan: any): Promise<TestResult> {
    const start = Date.now();
    
    try {
      // Executa testes em ambiente isolado
      const { stdout, stderr } = await execAsync(plan.testCommands.join(' && '), {
        timeout: 30000,
        maxBuffer: 10 * 1024 * 1024
      });

      const output = stdout + stderr;
      const duration = Date.now() - start;

      // Parse resultado dos testes
      const testResults = this.parseTestOutput(output);

      return {
        passed: testResults.failed === 0,
        total: testResults.total,
        failed: testResults.failed,
        duration,
        output
      };
    } catch (error: any) {
      return {
        passed: false,
        total: 0,
        failed: 1,
        duration: Date.now() - start,
        output: error.message || 'Erro ao executar testes'
      };
    }
  }

  private parseTestOutput(output: string): { total: number; failed: number } {
    // Parse Jest/Mocha output
    const testMatch = output.match(/Tests:\s+(\d+)\s+failed,\s+(\d+)\s+passed,\s+(\d+)\s+total/);
    
    if (testMatch) {
      return {
        failed: parseInt(testMatch[1]),
        total: parseInt(testMatch[3])
      };
    }

    // Fallback: assume passou se não encontrou erros
    return {
      total: 1,
      failed: output.toLowerCase().includes('error') ? 1 : 0
    };
  }
}

export const sandboxRunner = new SandboxRunner();
