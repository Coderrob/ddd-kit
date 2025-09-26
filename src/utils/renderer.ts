import path from 'path';

import type { IResolvedRef } from '../interfaces/ITask';
import type { IRenderer } from '../interfaces/IRenderer';

import { FileManager } from './file-manager';
import { isNonEmptyString, isNullOrUndefined } from './type-guards';

export class Renderer implements IRenderer {
  private readonly targetPath: string;

  constructor(targetPath: string) {
    this.targetPath = targetPath;
  }

  render(
    taskId: string,
    resolvedRefs: IResolvedRef[],
    provenance: { dddKit: string; actionRunId: string },
  ): void {
    const featureDir = path.join(this.targetPath, '.development', `feature-${taskId}`);
    FileManager.mkdirSync(featureDir, { recursive: true });

    // For each ref, create a file or append to existing
    // For simplicity, create implementation-notes.md with all guidance

    const notesPath = path.join(featureDir, 'implementation-notes.md');
    let content = `<!--
generated-by: dddctl@1.0.0
source-ddd-kit: ${provenance.dddKit}
resolved-uids:
${resolvedRefs.map((r) => `  - ${r.uid}@sha256:...`).join('\n')}
action-run-id: ${provenance.actionRunId}
managed-block: begin
-->
# Implementation Notes for ${taskId}

`;

    for (const ref of resolvedRefs) {
      content += `<!-- dddctl-managed:start:key=${ref.uid} -->
## Guidance from ${ref.uid}

${this.extractSection(ref.content, ref.section)}
<!-- dddctl-managed:end:key=${ref.uid} -->

`;
    }

    FileManager.writeFileSync(notesPath, content);
  }

  private extractSection(content: string, section?: string): string {
    // Strip front-matter
    const stripped = content.replace(/^---\n[\s\S]*?\n---\n/, '');
    if (isNullOrUndefined(section)) return stripped;
    // Simple extraction, assume ## section
    const lines = stripped.split('\n');
    const start = lines.findIndex((l) => l.startsWith(`## ${section}`));
    if (start === -1) return stripped;
    let end = lines.length;
    for (let i = start + 1; i < lines.length; i++) {
      // eslint-disable-next-line security/detect-object-injection
      const line = lines[i];
      if (isNonEmptyString(line) && line.startsWith('## ')) {
        end = i;
        break;
      }
    }
    return lines.slice(start, end).join('\n');
  }
}
