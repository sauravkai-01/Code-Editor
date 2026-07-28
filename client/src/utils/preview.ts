import type { FileNode } from '../types';

export function buildPreviewHtml(files: FileNode[]): string {
  const htmlFile = files.find((f) => f.language === 'html') ?? files.find((f) => f.name.endsWith('.html'));
  if (!htmlFile) return '<p style="font-family:sans-serif;padding:2rem;color:#888">No HTML file found in project.</p>';

  let html = htmlFile.content;

  const cssFiles = files.filter((f) => f.language === 'css');
  if (cssFiles.length > 0) {
    const styles = cssFiles.map((f) => `<style data-file="${f.name}">\n${f.content}\n</style>`).join('\n');
    if (html.includes('</head>')) {
      html = html.replace('</head>', `${styles}\n</head>`);
    } else {
      html = styles + html;
    }
  }

  return html;
}
