
import simpleGit, { SimpleGit } from 'simple-git';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export class Executor {
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit();
  }

  async applyPatch(patch: string, options: any = {}): Promise<any> {
    try {
      const branchName = `agent/fix-${Date.now()}`;

      if (options.createBranch) {
        await this.git.checkoutLocalBranch(branchName);
      }

      // Salvar patch em arquivo temporário
      const patchFile = join('/tmp', `${branchName}.patch`);
      await writeFile(patchFile, patch);

      // Aplicar patch
      await this.git.raw(['apply', patchFile]);

      // Commit
      await this.git.add('./*');
      await this.git.commit(`🤖 Agent: auto-fix aplicado`, {
        '--author': `"${process.env.GIT_USER_NAME || 'SharkAgent'} <${process.env.GIT_USER_EMAIL || 'agent@shark.bot'}>"`
      });

      if (options.autoMerge) {
        await this.git.checkout('main');
        await this.git.merge([branchName]);
      }

      return {
        success: true,
        branch: branchName,
        merged: options.autoMerge
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createPullRequest(patch: string, options: any): Promise<any> {
    const branchName = `agent/fix-${Date.now()}`;

    await this.git.checkoutLocalBranch(branchName);

    // Aplicar patch
    const patchFile = join('/tmp', `${branchName}.patch`);
    await writeFile(patchFile, patch);
    await this.git.raw(['apply', patchFile]);

    // Commit e push
    await this.git.add('./*');
    await this.git.commit(options.title);
    await this.git.push('origin', branchName);

    return {
      branch: branchName,
      title: options.title,
      description: options.description
    };
  }

  async rollback(branchName: string): Promise<void> {
    await this.git.checkout('main');
    await this.git.deleteLocalBranch(branchName, true);
  }
}

export const executor = new Executor();
