
interface Plan {
  patch: string;
  testCommands: string[];
  riskScore: number;
  title: string;
  description: string;
}

export class Planner {
  async createPlan(fusion: any, incident: any): Promise<Plan> {
    const patches = this.extractPatches(fusion);
    const unifiedPatch = this.unifyPatches(patches);
    const testCommands = this.generateTestCommands(fusion, incident);

    return {
      patch: unifiedPatch,
      testCommands,
      riskScore: fusion.riskScore,
      title: `Fix ${incident.type}: ${incident.id}`,
      description: fusion.consensusResponse
    };
  }

  private extractPatches(fusion: any): string[] {
    const patches: string[] = [];

    if (fusion.metadata?.consensus?.patch) {
      patches.push(fusion.metadata.consensus.patch);
    }

    return patches;
  }

  private unifyPatches(patches: string[]): string {
    if (patches.length === 0) return '';
    if (patches.length === 1) return patches[0];

    // Combina patches únicos
    const uniqueLines = new Set<string>();
    patches.forEach(patch => {
      patch.split('\n').forEach(line => uniqueLines.add(line));
    });

    return Array.from(uniqueLines).join('\n');
  }

  private generateTestCommands(fusion: any, incident: any): string[] {
    const commands: string[] = ['npm test'];

    if (incident.failingTests && incident.failingTests.length > 0) {
      incident.failingTests.forEach((test: string) => {
        commands.push(`npm test -- ${test}`);
      });
    }

    return commands;
  }
}

export const planner = new Planner();
