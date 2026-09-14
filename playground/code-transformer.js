/**
 * Smart code transformer that strips initialization code while preserving user logic.
 * Works with any variable names and patterns.
 *
 * Ported from thorvg.web's playground/lib/code-transformer.ts (logic unchanged,
 * TypeScript types stripped).
 */

export function transformCodeForExecution(code) {
  let result = code;

  // 1. Remove import statements (any import from any module)
  result = result.replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '');

  // 2. Remove export statements
  result = result.replace(/^export\s+.*$/gm, '');

  // 3. Remove await init() calls with any variable name
  // Matches: const/let/var VARNAME = await init({...});
  result = result.replace(
    /^(const|let|var)\s+\w+\s*=\s*await\s+init\s*\(\s*\{[\s\S]*?\}\s*\)\s*;?\s*$/gm,
    ''
  );

  // 4. Remove new Canvas() instantiation with any variable names
  // Matches: const/let/var VARNAME = new ANYTHING.Canvas('#canvas', {...});
  result = result.replace(
    /^(const|let|var)\s+\w+\s*=\s*new\s+\w+\.Canvas\s*\(\s*['"]#?canvas['"],?\s*\{[\s\S]*?\}\s*\)\s*;?\s*$/gm,
    ''
  );

  // 5. Remove single-line comments that are explanatory (not code)
  // Keep commented-out code, remove only standalone comment lines
  result = result.replace(/^\/\/(?!.*:).*$/gm, '');

  // 6. Remove multi-line comments and JSDoc
  result = result.replace(/\/\*[\s\S]*?\*\//g, '');

  // 7. Clean up excessive blank lines (more than 2 consecutive)
  result = result.replace(/\n{3,}/g, '\n\n');

  // 8. Trim leading/trailing whitespace
  result = result.trim();

  return result;
}

/**
 * Extract the initialization config from code for reference
 * (renderer + canvas size, parsed from the original snippet before stripping).
 */
export function extractInitConfig(code) {
  const config = {};

  const rendererMatch = code.match(/renderer:\s*['"](\w+)['"]/);
  if (rendererMatch) {
    config.renderer = rendererMatch[1];
  }

  const widthMatch = code.match(/width:\s*(\d+)/);
  const heightMatch = code.match(/height:\s*(\d+)/);
  if (widthMatch && heightMatch) {
    config.canvasSize = {
      width: parseInt(widthMatch[1], 10),
      height: parseInt(heightMatch[1], 10),
    };
  }

  return config;
}
