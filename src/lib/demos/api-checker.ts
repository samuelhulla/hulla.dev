import ts from 'typescript'
import snapshot from './api-types.json'
import { apiProject, type ApiSources, type ApiDiagnostic } from './api-project'

// The same compiler host is used by the worker and the regression tests.
export function createApiChecker(libraries: Record<string, string>) {
  let project = apiProject('name', 'name')
  let revision = 0
  const files: Record<string, string> = { ...snapshot.files, ...libraries }
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    lib: ['lib.es2022.full.d.ts'],
  }
  const read = (file: string) =>
    project[file as keyof typeof project] ?? files[file]
  const host: ts.LanguageServiceHost = {
    getScriptFileNames: () => Object.keys(project),
    getScriptVersion: (file) => (file in project ? String(revision) : '0'),
    getScriptSnapshot: (file) => {
      const content = read(file)
      return content === undefined
        ? undefined
        : ts.ScriptSnapshot.fromString(content)
    },
    getCompilationSettings: () => options,
    getCurrentDirectory: () => '/',
    getDefaultLibFileName: () => '/lib/lib.es2022.full.d.ts',
    fileExists: (file) => read(file) !== undefined,
    readFile: read,
    directoryExists: (directory) =>
      directory === '/' ||
      Object.keys(files).some((file) => file.startsWith(`${directory}/`)),
    readDirectory: () => [],
  }
  const service = ts.createLanguageService(host)
  return (sources: ApiSources): ApiDiagnostic[] => {
    project = { ...sources }
    revision++
    return [
      ...service.getCompilerOptionsDiagnostics(),
      ...Object.keys(project).flatMap((file) => [
        ...service.getSyntacticDiagnostics(file),
        ...service.getSemanticDiagnostics(file),
      ]),
    ].map((diagnostic) => ({
      file: diagnostic.file?.fileName.slice(1) ?? 'project',
      line:
        diagnostic.file && diagnostic.start !== undefined
          ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
              .line + 1
          : 1,
      start: diagnostic.start ?? 0,
      length: diagnostic.length ?? 1,
      code: diagnostic.code,
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
    }))
  }
}
