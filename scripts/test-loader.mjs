// Execute the real TypeScript utility/service source in Node's test runner.
// No application endpoints or fake data are installed by this loader.
import { readFile, access } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve as resolvePath } from 'node:path';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const root = pathToFileURL(resolvePath(process.cwd()) + '/');

async function resolveTs(url) {
  for (const suffix of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
    const candidate = new URL(url.href + suffix);
    try {
      await access(candidate);
      if (/\.tsx?$/.test(candidate.pathname)) return candidate;
    } catch { /* Try the next extension. */ }
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const candidate = await resolveTs(new URL(specifier.slice(2), root));
    if (candidate) return { url: candidate.href, shortCircuit: true };
  }
  if (specifier.startsWith('.') && context.parentURL) {
    const candidate = await resolveTs(new URL(specifier, context.parentURL));
    if (candidate) return { url: candidate.href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (/\.tsx?$/.test(new URL(url).pathname)) {
    const source = await readFile(new URL(url), 'utf8');
    const result = ts.transpileModule(source, {
      fileName: new URL(url).pathname,
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
    });
    return { format: 'module', source: result.outputText, shortCircuit: true };
  }
  return nextLoad(url, context);
}
