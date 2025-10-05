
/**
 * 🔒 AUDITORIA DE SEGURANÇA AUTOMATIZADA
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';

interface SecurityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  location?: string;
}

class SecurityAuditor {
  private issues: SecurityIssue[] = [];

  async runAudit(): Promise<void> {
    console.log('🔒 Iniciando auditoria de segurança...\n');

    this.checkDependencies();
    this.checkEnvironmentVariables();
    this.checkSecretsInCode();
    this.checkInputValidation();
    this.checkRateLimiting();

    this.printReport();
  }

  private checkDependencies(): void {
    console.log('📦 Verificando dependências...');
    
    try {
      const audit = execSync('npm audit --json', { encoding: 'utf-8' });
      const result = JSON.parse(audit);

      if (result.metadata?.vulnerabilities) {
        const vulns = result.metadata.vulnerabilities;
        
        if (vulns.critical > 0) {
          this.issues.push({
            severity: 'critical',
            category: 'Dependencies',
            description: `${vulns.critical} vulnerabilidades críticas encontradas`
          });
        }
        
        if (vulns.high > 0) {
          this.issues.push({
            severity: 'high',
            category: 'Dependencies',
            description: `${vulns.high} vulnerabilidades altas encontradas`
          });
        }
      }
    } catch (error) {
      console.log('⚠️  npm audit falhou, continuando...');
    }
  }

  private checkEnvironmentVariables(): void {
    console.log('🔐 Verificando variáveis de ambiente...');

    const requiredVars = ['DATABASE_URL'];
    const sensitivePatterns = [
      /API[_-]?KEY/i,
      /SECRET/i,
      /PASSWORD/i,
      /TOKEN/i
    ];

    // Verificar se .env.example existe
    if (!existsSync('.env.example')) {
      this.issues.push({
        severity: 'medium',
        category: 'Environment',
        description: 'Arquivo .env.example não encontrado'
      });
    }

    // Verificar gitignore
    if (existsSync('.gitignore')) {
      const gitignore = readFileSync('.gitignore', 'utf-8');
      if (!gitignore.includes('.env')) {
        this.issues.push({
          severity: 'critical',
          category: 'Environment',
          description: '.env não está no .gitignore - RISCO DE VAZAMENTO!'
        });
      }
    }
  }

  private checkSecretsInCode(): void {
    console.log('🔍 Procurando segredos no código...');

    const patterns = [
      { regex: /api[_-]?key\s*=\s*['"][^'"]+['"]/gi, name: 'API Key' },
      { regex: /password\s*=\s*['"][^'"]+['"]/gi, name: 'Password' },
      { regex: /secret\s*=\s*['"][^'"]+['"]/gi, name: 'Secret' },
      { regex: /token\s*=\s*['"][^'"]+['"]/gi, name: 'Token' },
    ];

    try {
      const files = execSync('find . -type f \\( -name "*.ts" -o -name "*.js" -o -name "*.tsx" \\) -not -path "./node_modules/*"', { encoding: 'utf-8' });
      
      files.split('\n').forEach(file => {
        if (!file) return;
        
        try {
          const content = readFileSync(file, 'utf-8');
          
          patterns.forEach(pattern => {
            if (pattern.regex.test(content)) {
              this.issues.push({
                severity: 'high',
                category: 'Secrets',
                description: `Possível ${pattern.name} hardcoded`,
                location: file
              });
            }
          });
        } catch (err) {
          // Ignorar erros de leitura de arquivo
        }
      });
    } catch (error) {
      console.log('⚠️  Verificação de segredos falhou');
    }
  }

  private checkInputValidation(): void {
    console.log('✅ Verificando validação de entrada...');

    if (!existsSync('server/middleware/security.ts')) {
      this.issues.push({
        severity: 'high',
        category: 'Input Validation',
        description: 'Middleware de segurança não encontrado'
      });
    }

    if (!existsSync('shared/dataValidation.ts')) {
      this.issues.push({
        severity: 'medium',
        category: 'Input Validation',
        description: 'Sistema de validação de dados não encontrado'
      });
    }
  }

  private checkRateLimiting(): void {
    console.log('🚦 Verificando rate limiting...');

    try {
      const indexFile = readFileSync('server/index.ts', 'utf-8');
      
      if (!indexFile.includes('rateLimiter')) {
        this.issues.push({
          severity: 'high',
          category: 'Rate Limiting',
          description: 'Rate limiting não implementado'
        });
      }
    } catch (error) {
      this.issues.push({
        severity: 'medium',
        category: 'Rate Limiting',
        description: 'Não foi possível verificar rate limiting'
      });
    }
  }

  private printReport(): void {
    console.log('\n📋 RELATÓRIO DE SEGURANÇA\n');
    console.log('='.repeat(60));

    const grouped = {
      critical: this.issues.filter(i => i.severity === 'critical'),
      high: this.issues.filter(i => i.severity === 'high'),
      medium: this.issues.filter(i => i.severity === 'medium'),
      low: this.issues.filter(i => i.severity === 'low')
    };

    if (this.issues.length === 0) {
      console.log('✅ Nenhum problema de segurança encontrado!\n');
      return;
    }

    Object.entries(grouped).forEach(([severity, issues]) => {
      if (issues.length === 0) return;

      const icon = severity === 'critical' ? '🔴' : severity === 'high' ? '🟠' : severity === 'medium' ? '🟡' : '🔵';
      console.log(`\n${icon} ${severity.toUpperCase()} (${issues.length}):`);
      
      issues.forEach(issue => {
        console.log(`   • [${issue.category}] ${issue.description}`);
        if (issue.location) {
          console.log(`     📍 ${issue.location}`);
        }
      });
    });

    console.log('\n' + '='.repeat(60));
    console.log(`\nTotal: ${this.issues.length} problema(s) encontrado(s)\n`);

    // Exit code baseado na severidade
    if (grouped.critical.length > 0) {
      process.exit(1);
    }
  }
}

// Executar auditoria
const auditor = new SecurityAuditor();
auditor.runAudit().catch(console.error);
