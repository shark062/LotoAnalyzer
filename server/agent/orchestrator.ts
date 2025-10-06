
import { iaAdapter } from '../services/iaAdapter';
import { fusionEngine } from '../services/fusionEngine';
import { planner } from './planner';
import { sandboxRunner } from './sandboxRunner';
import { executor } from './executor';
import { auditor } from './auditor';

interface Incident {
  id: string;
  type: 'test_fail' | 'runtime_error' | 'performance' | 'security';
  timestamp: Date;
  stackTrace?: string;
  failingTests?: string[];
  affectedFiles?: string[];
  context?: any;
}

interface FixResult {
  status: 'applied' | 'pr_created' | 'tests_failed' | 'rejected';
  patch?: any;
  testResult?: any;
  pr?: any;
  message: string;
}

export class AgentOrchestrator {
  async handleIncident(incident: Incident): Promise<FixResult> {
    console.log(`🤖 Agent: processando incidente ${incident.id}`);

    // 1. Construir prompt para diagnóstico
    const prompt = this.buildDiagnosticPrompt(incident);

    // 2. Consultar todas as IAs
    const iaResponses = await iaAdapter.callAllIAs(prompt, { temperature: 0.7 });

    // 3. Fundir respostas
    const fusion = await fusionEngine.fuse(iaResponses);

    console.log(`🧠 Fusion confidence: ${fusion.confidence.toFixed(2)}, risk: ${fusion.riskScore.toFixed(2)}`);

    // 4. Gerar plano de correção
    const plan = await planner.createPlan(fusion, incident);

    // 5. Auditar antes de executar
    await auditor.log({
      incidentId: incident.id,
      iaResponses,
      fusion,
      plan,
      timestamp: new Date()
    });

    // 6. Testar em sandbox
    const testResult = await sandboxRunner.runTests(plan);

    if (!testResult.passed) {
      await auditor.log({
        incidentId: incident.id,
        action: 'tests_failed',
        testResult
      });

      return {
        status: 'tests_failed',
        testResult,
        message: '❌ Testes falharam no sandbox'
      };
    }

    // 7. Decidir aplicação baseado em configuração e risco
    const autoApply = process.env.AGENT_AUTO_APPLY === 'true';
    const lowRisk = fusion.riskScore < 0.4;
    const highConfidence = fusion.confidence > 0.7;

    if (autoApply && lowRisk && highConfidence) {
      // Aplicação automática
      const applyResult = await executor.applyPatch(plan.patch, {
        autoMerge: true,
        createBranch: true
      });

      await auditor.log({
        incidentId: incident.id,
        action: 'applied',
        applyResult,
        testResult
      });

      return {
        status: 'applied',
        patch: plan.patch,
        testResult,
        message: `✅ Correção aplicada automaticamente! Testes: ${testResult.passed}/${testResult.total}`
      };
    } else {
      // Criar PR para revisão
      const pr = await executor.createPullRequest(plan.patch, {
        title: `🤖 Agent Fix: ${incident.type}`,
        description: this.buildPRDescription(incident, fusion, testResult)
      });

      await auditor.log({
        incidentId: incident.id,
        action: 'pr_created',
        pr,
        testResult
      });

      return {
        status: 'pr_created',
        pr,
        testResult,
        message: `📝 PR criado para revisão. Confiança: ${(fusion.confidence * 100).toFixed(0)}%`
      };
    }
  }

  private buildDiagnosticPrompt(incident: Incident): string {
    return `Você é um engenheiro sênior especializado em debugging e correções automáticas.

**Incidente:**
- Tipo: ${incident.type}
- Timestamp: ${incident.timestamp}
- Stack Trace: ${incident.stackTrace || 'N/A'}
- Testes Falhando: ${incident.failingTests?.join(', ') || 'N/A'}
- Arquivos Afetados: ${incident.affectedFiles?.join(', ') || 'N/A'}

**Tarefa:**
1. Analise a causa raiz do problema
2. Sugira um patch em formato diff unificado
3. Escreva testes unitários que validem a correção
4. Estime sua confiança (0-1)

**Retorne JSON:**
{
  "hypothesis": "explicação da causa",
  "patch": "diff unificado",
  "tests": ["comandos de teste"],
  "confidence": 0.85,
  "explain": "explicação da solução"
}`;
  }

  private buildPRDescription(incident: Incident, fusion: any, testResult: any): string {
    return `## 🤖 Correção Automática pelo Agent

**Incidente:** ${incident.type}
**Confiança:** ${(fusion.confidence * 100).toFixed(0)}%
**Risco:** ${(fusion.riskScore * 100).toFixed(0)}%

### Diagnóstico
${fusion.consensusResponse}

### Testes
- ✅ Passou: ${testResult.passed}
- ❌ Falhou: ${testResult.failed}
- ⏱️ Tempo: ${testResult.duration}ms

### Providers Consultados
${fusion.providers.join(', ')}

---
*Gerado automaticamente pelo Shark Agent*`;
  }
}

export const orchestrator = new AgentOrchestrator();
