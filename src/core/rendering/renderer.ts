import * as path from 'path';

import { IRenderer, IResolvedRef } from '../../types';
import { isNonEmptyString } from '../helpers/type.helper';
import { FileManager } from '../storage/file-manager';

export class Renderer implements IRenderer {
  private readonly targetPath: string;

  constructor(targetPath: string) {
    this.targetPath = targetPath;
  }

  /**
   * Renders resolved references into the target repository.
   * Creates/updates files under .development/feature-<taskId>/implementation-notes.md
   * @param taskId The ID of the task being processed.
   * @param resolvedRefs The array of resolved references to render.
   * @param provenance Information about the source of the references.
   */
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

  /**
   * Extracts the relevant section from the content if specified.
   * If no section is specified, returns the full content without front-matter.
   * @param content The full markdown content.
   * @param section Optional section to extract.
   * @returns The extracted section or full content without front-matter.
   */
  private extractSection(content: string, section?: string): string {
    const strippedContent = this.stripFrontMatter(content);
    if (section == null) return strippedContent;

    return this.extractSpecificSection(strippedContent, section);
  }

  /**
   * Strips front-matter from markdown content.
   * @param content The markdown content.
   * @returns Content without front-matter.
   */
  private stripFrontMatter(content: string): string {
    return content.replace(/^---\n[\s\S]*?\n---\n/, '');
  }

  /**
   * Extracts a specific section from content.
   * @param content The markdown content.
   * @param section The section to extract (e.g., "Implementation Notes").
   * @returns The content of the specified section or the full content if not found.
   */
  private extractSpecificSection(content: string, section: string): string {
    const lines = content.split('\n');
    const sectionStart = this.findSectionStart(lines, section);

    if (sectionStart === -1) return content;

    const sectionEnd = this.findSectionEnd(lines, sectionStart);
    return lines.slice(sectionStart, sectionEnd).join('\n');
  }

  /**
   * Finds the starting line index of a section.
   * @param lines The lines of the content.
   * @param section The section to find (e.g., "Implementation Notes").
   * @returns The index of the section start or -1 if not found.
   */
  private findSectionStart(lines: string[], section: string): number {
    return lines.findIndex((line) => line.startsWith(`## ${section}`));
  }

  /**
   * Finds the ending line index of a section.
   * @param lines The lines of the content.
   * @param startIndex The starting index of the section.
   * @returns The index of the section end or the length of lines if not found.
   */
  private findSectionEnd(lines: string[], startIndex: number): number {
    for (let i = startIndex + 1; i < lines.length; i++) {
      // eslint-disable-next-line security/detect-object-injection
      const line = lines[i];
      if (isNonEmptyString(line) && line.startsWith('## ')) {
        return i;
      }
    }
    return lines.length;
  }
}
