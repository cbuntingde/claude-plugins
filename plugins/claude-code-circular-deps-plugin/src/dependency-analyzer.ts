import * as fs from 'fs';
import * as path from 'path';
import { Project, SyntaxKind } from 'ts-morph';

// Security constants
const MAX_FILES = 10000; // Maximum files to analyze
const ALLOWED_BASE_DIRS = ['node_modules', 'dist', 'build']; // Directories to exclude

export interface DependencyNode {
  file: string;
  imports: string[];
}

export interface CircularDependency {
  cycle: string[];
  type: 'direct' | 'indirect';
  description: string;
}

/**
 * Validate directory path to prevent path traversal
 */
function validateDirectory(dirPath: string, baseDir: string): string {
  const resolved = path.resolve(baseDir, dirPath);
  const baseResolved = path.resolve(baseDir);

  // Prevent traversal outside base directory
  if (!resolved.startsWith(baseResolved)) {
    throw new Error('Access denied: directory path is outside allowed scope');
  }

  // Normalize and return the validated path
  return path.normalize(resolved);
}

export class DependencyAnalyzer {
  private project: Project;

  constructor(projectPath: string) {
    // Validate project path before use
    const validatedPath = validateDirectory(projectPath, process.cwd());

    this.project = new Project({
      tsConfigFilePath: path.join(validatedPath, 'tsconfig.json'),
      skipAddingFilesFromTsConfig: true,
    });
  }

  /**
   * Analyzes a directory for circular dependencies
   */
  public async analyzeDirectory(
    dirPath: string,
    options: {
      filePattern?: string;
      excludePatterns?: string[];
    } = {}
  ): Promise<CircularDependency[]> {
    const { filePattern = '**/*.{ts,tsx,js,jsx}', excludePatterns = ['node_modules', 'dist', 'build'] } = options;

    // Create a new graph for this analysis to prevent race conditions
    const analysisGraph = new Map<string, Set<string>>();
    const fileCount = 0;

    // Find all matching files
    const files = this.findFiles(dirPath, filePattern, excludePatterns, analysisGraph, fileCount);

    // Build dependency graph
    for (const file of files) {
      await this.analyzeFile(file, analysisGraph);
    }

    // Detect cycles using the analysis graph
    return this.detectCycles(analysisGraph);
  }

  /**
   * Recursively finds files matching the pattern
   */
  private findFiles(
    dir: string,
    pattern: string,
    excludePatterns: string[],
    graph: Map<string, Set<string>>,
    fileCountRef: { count: number }
  ): string[] {
    const files: string[] = [];

    const walk = (currentPath: string) => {
      // Check file count limit
      if (fileCountRef.count >= MAX_FILES) {
        console.debug('Max file count reached, stopping traversal');
        return;
      }

      // Check exclusions using proper path comparison (not substring matching)
      const relativePath = path.relative(dir, currentPath);
      // Use exact path segment matching to prevent bypass via "node_modules-backdoor"
      const pathSegments = relativePath.split(path.sep);
      const hasExcludedSegment = pathSegments.some(segment =>
        excludePatterns.some(excl => segment === excl)
      );
      if (hasExcludedSegment) {
        return;
      }

      const stats = fs.statSync(currentPath);

      if (stats.isDirectory()) {
        const entries = fs.readdirSync(currentPath);
        for (const entry of entries) {
          walk(path.join(currentPath, entry));
        }
      } else if (stats.isFile()) {
        // Simple pattern matching
        if (this.matchesPattern(currentPath, pattern)) {
          files.push(currentPath);
          fileCountRef.count++;
        }
      }
    };

    walk(dir);
    return files;
  }

  private matchesPattern(filePath: string, pattern: string): boolean {
    const ext = path.extname(filePath);
    const patternExts = pattern.match(/\.(ts|tsx|js|jsx)/g);
    return patternExts?.some(pe => ext === pe.substring(1)) ?? false;
  }

  /**
   * Analyzes a single file for imports
   */
  private async analyzeFile(filePath: string, graph: Map<string, Set<string>>): Promise<void> {
    try {
      const sourceFile = this.project.addSourceFileAtPath(filePath);

      if (!graph.has(filePath)) {
        graph.set(filePath, new Set());
      }

      const imports = graph.get(filePath)!;

      // Get all import declarations
      sourceFile.getImportDeclarations().forEach(importDecl => {
        const moduleSpecifier = importDecl.getModuleSpecifierValue();

        // Resolve the imported file path
        const resolvedPath = this.resolveImportPath(filePath, moduleSpecifier);
        if (resolvedPath && fs.existsSync(resolvedPath)) {
          imports.add(resolvedPath);
        }
      });

      // Also check for dynamic imports
      sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(callExpr => {
        if (callExpr.getExpression().getText() === 'import') {
          const args = callExpr.getArguments();
          if (args.length > 0) {
            const moduleSpecifier = args[0].getText().replace(/['"]/g, '');
            const resolvedPath = this.resolveImportPath(filePath, moduleSpecifier);
            if (resolvedPath && fs.existsSync(resolvedPath)) {
              imports.add(resolvedPath);
            }
          }
        }
      });
    } catch (error) {
      // Skip files that can't be parsed
      console.debug(`Skipping file ${filePath}:`, error);
    }
  }

  /**
   * Resolves an import path to an absolute file path
   */
  private resolveImportPath(fromFile: string, importPath: string): string | null {
    if (importPath.startsWith('.') || importPath.startsWith('..')) {
      // Relative import
      const dir = path.dirname(fromFile);
      const resolved = path.resolve(dir, importPath);

      // Try different extensions
      const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
      for (const ext of extensions) {
        const fullPath = resolved + ext;
        if (fs.existsSync(fullPath)) {
          return fullPath;
        }
      }

      return resolved;
    }

    // For non-relative imports (node_modules), we'd need package resolution
    // For simplicity, skip these in circular dependency detection
    return null;
  }

  /**
   * Detects cycles using depth-first search
   */
  private detectCycles(graph: Map<string, Set<string>>): CircularDependency[] {
    const cycles: CircularDependency[] = [];
    const visited: Set<string> = new Set();
    const recursionStack: Set<string> = new Set();
    const pathStack: string[] = [];

    const dfs = (node: string): void => {
      visited.add(node);
      recursionStack.add(node);
      pathStack.push(node);

      const dependencies = graph.get(node) || new Set();

      for (const dep of dependencies) {
        // Only check files in our graph
        if (!graph.has(dep)) continue;

        if (!visited.has(dep)) {
          dfs(dep);
        } else if (recursionStack.has(dep)) {
          // Found a cycle
          const cycleStart = pathStack.indexOf(dep);
          const cycle = [...pathStack.slice(cycleStart), dep];

          cycles.push({
            cycle: cycle,
            type: cycle.length === 2 ? 'direct' : 'indirect',
            description: this.formatCycleDescription(cycle),
          });
        }
      }

      pathStack.pop();
      recursionStack.delete(node);
    };

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    return cycles;
  }

  /**
   * Formats a cycle into a human-readable description
   */
  private formatCycleDescription(cycle: string[]): string {
    if (cycle.length === 2) {
      return `Direct circular dependency: ${cycle[0]} ⇄ ${cycle[1]}`;
    }

    const formatted = cycle.map((file, i) => {
      const fileName = path.basename(file);
      return i === cycle.length - 1
        ? `↶ ${fileName}`
        : `${i === 0 ? '' : '→ '}${fileName}`;
    }).join(' ');

    return `Circular dependency chain: ${formatted}`;
  }

  /**
   * Suggests fixes for detected circular dependencies
   */
  public suggestFixes(cycles: CircularDependency[]): string[] {
    const suggestions: string[] = [];

    if (cycles.length === 0) {
      suggestions.push('No circular dependencies found!');
      return suggestions;
    }

    suggestions.push(`Found ${cycles.length} circular dependency issue(s):\n`);

    cycles.forEach((cycle, index) => {
      suggestions.push(`\n${index + 1}. ${cycle.description}`);

      // Suggest fixes based on cycle type
      if (cycle.type === 'direct') {
        suggestions.push('\n   💡 Suggested fixes for direct circular dependency:');
        suggestions.push('   • Extract shared logic to a third module');
        suggestions.push('   • Use dependency injection or inversion of control');
        suggestions.push('   • Move one direction of dependency to use events/observers');
        suggestions.push('   • Consider lazy loading with dynamic imports');
      } else {
        suggestions.push('\n   💡 Suggested fixes for indirect circular dependency:');
        suggestions.push('   • Introduce an abstraction layer (interfaces, types)');
        suggestions.push('   • Apply the Dependency Inversion Principle');
        suggestions.push('   • Restructure into layers with clear boundaries');
        suggestions.push('   • Move shared types/utilities to a common module');
      }

      // Show files involved
      suggestions.push('\n   📁 Files involved:');
      cycle.cycle.forEach((file, i) => {
        const indent = i === cycle.cycle.length - 1 ? '   └─' : '   ├─';
        suggestions.push(`${indent} ${file}`);
      });
    });

    return suggestions;
  }

  /**
   * Exports the dependency graph as JSON for visualization
   */
  public exportGraph(_graph?: Map<string, Set<string>>): Record<string, string[]> {
    const graph = _graph || new Map<string, Set<string>>();
    const result: Record<string, string[]> = {};

    for (const [file, deps] of graph.entries()) {
      result[file] = Array.from(deps);
    }

    return result;
  }
}
