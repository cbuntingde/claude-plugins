#!/usr/bin/env node
/**
 * Pattern Suggestion Script
 * Recommends design patterns based on problem descriptions
 *
 * SECURITY: All inputs are validated against strict allow-lists.
 * No external file system access - purely in-memory operation.
 */

'use strict';

// ============================================================================
// Error Types
// ============================================================================

/**
 * Base error class for plugin errors
 */
class PatternSuggestorError extends Error {
  constructor(message, code, details) {
    super(message);
    this.name = 'PatternSuggestorError';
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, PatternSuggestorError);
  }
}

/**
 * Validation error for invalid inputs
 */
class InputValidationError extends PatternSuggestorError {
  constructor(message, details) {
    super(message, 'INPUT_VALIDATION_ERROR', details);
    this.name = 'InputValidationError';
  }
}

// ============================================================================
// Structured Logger
// ============================================================================

/**
 * Structured logger with consistent output format
 */
const Logger = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  FATAL: 'FATAL',

  /**
   * Log an entry with structured format
   */
  log(level, message, metadata = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      service: 'architecture-advisor-pattern-suggestor',
      message,
      ...metadata,
    };
    console.log(JSON.stringify(entry));
  },

  debug(message, metadata) {
    this.log(this.DEBUG, message, metadata);
  },

  info(message, metadata) {
    this.log(this.INFO, message, metadata);
  },

  warn(message, metadata) {
    this.log(this.WARN, message, metadata);
  },

  error(message, metadata) {
    this.log(this.ERROR, message, metadata);
  },
};

// ============================================================================
// Validated Input Constants
// ============================================================================

/**
 * Allowed language values (whitelist validation)
 */
const ALLOWED_LANGUAGES = ['typescript', 'javascript', 'python', 'java'];

/**
 * Allowed complexity levels (whitelist validation)
 */
const ALLOWED_COMPLEXITIES = ['simple', 'moderate', 'complex'];

// ============================================================================
// Pattern Suggestion Engine
// ============================================================================

/**
 * Pattern Suggestion Engine
 * Recommends design patterns based on problem descriptions
 */
class PatternSuggestor {
  constructor() {
    this.patterns = {
      creational: {
        Singleton: {
          problem: ['only one instance', 'single instance', 'global access', 'shared state'],
          solution: 'Ensure a class has only one instance and provide a global point of access to it.',
          example: `class Database {
  private static instance: Database;
  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}`,
        },
        Factory: {
          problem: ['create objects', 'instantiation', 'different types', 'factory pattern'],
          solution: 'Define an interface for creating an object, but let subclasses decide which class to instantiate.',
          example: `interface Product {
  operation(): string;
}

class ConcreteProductA implements Product {
  operation() { return 'Product A'; }
}

class ConcreteProductB implements Product {
  operation() { return 'Product B'; }
}

class Factory {
  createProduct(type: string): Product {
    switch(type) {
      case 'A': return new ConcreteProductA();
      case 'B': return new ConcreteProductB();
    }
  }
}`,
        },
        Builder: {
          problem: ['many parameters', 'complex construction', 'optional parameters', 'telescoping constructor'],
          solution: 'Separate the construction of a complex object from its representation.',
          example: `class User {
  private name: string;
  private email?: string;
  private age?: number;

  private constructor(builder: UserBuilder) {
    this.name = builder.name;
    this.email = builder.email;
    this.age = builder.age;
  }

  static builder(name: string) {
    return new UserBuilder(name);
  }
}

class UserBuilder {
  name: string;
  email?: string;
  age?: number;

  constructor(name: string) {
    this.name = name;
  }

  email(email: string) { this.email = email; return this; }
  age(age: number) { this.age = age; return this; }
  build() { return new User(this); }
}`,
        },
        Prototype: {
          problem: ['clone', 'copy', 'duplicate objects', 'expensive creation'],
          solution: 'Create new objects by copying an existing object (prototype).',
          example: `interface Prototype {
  clone(): Prototype;
}

class ConcretePrototype implements Prototype {
  private field: string;
  private nested: object;

  constructor(field: string, nested: object) {
    this.field = field;
    this.nested = nested;
  }

  clone(): ConcretePrototype {
    return new ConcretePrototype(
      this.field,
      { ...this.nested }
    );
  }
}`,
        },
      },
      structural: {
        Adapter: {
          problem: ['incompatible interfaces', 'legacy code', 'third-party', 'interface mismatch'],
          solution: 'Convert the interface of a class into another interface clients expect.',
          example: `interface Target {
  request(): string;
}

class Adaptee {
  specificRequest() {
    return 'Specific request';
  }
}

class Adapter implements Target {
  private adaptee: Adaptee;

  constructor(adaptee: Adaptee) {
    this.adaptee = adaptee;
  }

  request() {
    return this.adaptee.specificRequest();
  }
}`,
        },
        Decorator: {
          problem: ['add behavior', 'responsibilities', 'dynamic behavior', 'wrapper'],
          solution: 'Attach additional responsibilities to an object dynamically.',
          example: `interface Coffee {
  cost(): number;
  description(): string;
}

class Espresso implements Coffee {
  cost() { return 5; }
  description() { return 'Espresso'; }
}

class CoffeeDecorator implements Coffee {
  protected coffee: Coffee;

  constructor(coffee: Coffee) {
    this.coffee = coffee;
  }

  cost() { return this.coffee.cost(); }
  description() { return this.coffee.description(); }
}

class MilkDecorator extends CoffeeDecorator {
  cost() { return this.coffee.cost() + 2; }
  description() { return this.coffee.description() + ', Milk'; }
}`,
        },
        Facade: {
          problem: ['complex system', 'subsystems', 'simplify', 'unified interface'],
          solution: 'Provide a unified interface to a set of interfaces in a subsystem.',
          example: `class SubsystemA {
  operation1() { return 'Subsystem A: Ready!'; }
}

class SubsystemB {
  operation2() { return 'Subsystem B: Go!'; }
}

class SubsystemC {
  operation3() { return 'Subsystem C: Finished!'; }
}

class Facade {
  private a = new SubsystemA();
  private b = new SubsystemB();
  private c = new SubsystemC();

  operation() {
    return \`\${this.a.operation1()} \${this.b.operation2()} \${this.c.operation3()}\`;
  }
}`,
        },
        Proxy: {
          problem: ['lazy loading', 'caching', 'access control', 'virtual proxy'],
          solution: 'Provide a surrogate or placeholder for another object to control access.',
          example: `interface Service {
  request(): string;
}

class RealService implements Service {
  request() {
    return 'Real request processing';
  }
}

class ProxyService implements Service {
  private realService: RealService | null = null;

  request(): string {
    if (!this.realService) {
      this.realService = new RealService();
    }
    return 'Proxy: ' + this.realService.request();
  }
}`,
        },
        Composite: {
          problem: ['tree structure', 'part-whole', 'hierarchical', 'groups of objects'],
          solution: 'Compose objects into tree structures to represent part-whole hierarchies.',
          example: `interface Component {
  operation(): string;
}

class Leaf implements Component {
  constructor(private name: string) {}

  operation() {
    return \`Leaf: \${this.name}\`;
  }
}

class Composite implements Component {
  private children: Component[] = [];

  add(component: Component) {
    this.children.push(component);
  }

  remove(component: Component) {
    const index = this.children.indexOf(component);
    if (index > -1) this.children.splice(index, 1);
  }

  operation() {
    const childrenOps = this.children.map(c => c.operation()).join(', ');
    return \`Composite (\${childrenOps})\`;
  }
}`,
        },
      },
      behavioral: {
        Strategy: {
          problem: ['algorithm', 'interchangeable', 'different behaviors', 'select algorithm'],
          solution: 'Define a family of algorithms, encapsulate each one, and make them interchangeable.',
          example: `interface Strategy {
  execute(a: number, b: number): number;
}

class AddStrategy implements Strategy {
  execute(a: number, b: number) { return a + b; }
}

class SubtractStrategy implements Strategy {
  execute(a: number, b: number) { return a - b; }
}

class Context {
  private strategy: Strategy;

  setStrategy(strategy: Strategy) {
    this.strategy = strategy;
  }

  executeStrategy(a: number, b: number) {
    return this.strategy.execute(a, b);
  }
}`,
        },
        Observer: {
          problem: ['notify', 'subscribe', 'events', 'state change', 'publish-subscribe'],
          solution: 'Define a one-to-many dependency between objects so that when one object changes state, all its dependents are notified.',
          example: `class Subject {
  private observers: Observer[] = [];

  attach(observer: Observer) {
    this.observers.push(observer);
  }

  detach(observer: Observer) {
    this.observers = this.observers.filter(o => o !== observer);
  }

  notify() {
    this.observers.forEach(o => o.update());
  }
}

interface Observer {
  update(): void;
}`,
        },
        Command: {
          problem: ['execute action', 'undo', 'queue', 'action object'],
          solution: 'Encapsulate a request as an object, thereby letting you parameterize clients with different requests.',
          example: `interface Command {
  execute(): void;
  undo(): void;
}

class ConcreteCommand implements Command {
  private receiver: Receiver;
  private state: string;

  constructor(receiver: Receiver, state: string) {
    this.receiver = receiver;
    this.state = state;
  }

  execute() {
    this.receiver.action(this.state);
  }

  undo() {
    this.receiver.action(\`Undid: \${this.state}\`);
  }
}

class Invoker {
  private commands: Command[] = [];

  execute(command: Command) {
    this.commands.push(command);
    command.execute();
  }

  undo() {
    const command = this.commands.pop();
    command?.undo();
  }
}`,
        },
        State: {
          problem: ['state machine', 'behavior changes', 'state transition', 'finite state'],
          solution: 'Allow an object to alter its behavior when its internal state changes.',
          example: `interface State {
  handle(context: Context): void;
}

class StateA implements State {
  handle(context: Context) {
    context.state = new StateB();
  }
}

class StateB implements State {
  handle(context: Context) {
    context.state = new StateA();
  }
}

class Context {
  state: State;

  constructor() {
    this.state = new StateA();
  }

  request() {
    this.state.handle(this);
  }
}`,
        },
        TemplateMethod: {
          problem: ['algorithm skeleton', 'steps', 'override parts', 'algorithm structure'],
          solution: 'Define the skeleton of an algorithm in an operation, deferring some steps to subclasses.',
          example: `abstract class AbstractClass {
  templateMethod() {
    this.step1();
    this.step2();
    this.hook();
  }

  step1() {}
  step2() {}
  hook() {}
}

class ConcreteClass extends AbstractClass {
  step1() { console.log('Step 1 implemented'); }
  step2() { console.log('Step 2 implemented'); }
}`,
        },
        Mediator: {
          problem: ['communication', 'colleagues', 'centralized', 'chat'],
          solution: 'Define an object that encapsulates how a set of objects interact.',
          example: `class ChatMediator {
  private users: User[] = [];

  addUser(user: User) {
    this.users.push(user);
  }

  sendMessage(msg: string, from: User) {
    this.users.forEach(u => {
      if (u !== from) u.receive(msg);
    });
  }
}

class User {
  constructor(private name: string, private mediator: ChatMediator) {}

  send(msg: string) {
    this.mediator.sendMessage(msg, this);
  }

  receive(msg: string) {
    console.log(\`\${this.name} received: \${msg}\`);
  }
}`,
        },
      },
    };

    Logger.info('PatternSuggestor initialized', {
      patternCategories: Object.keys(this.patterns),
    });
  }

  /**
   * Validate and sanitize input parameters
   * @param {string} problem - Problem description
   * @param {Object} options - Options object
   * @throws {InputValidationError} - If validation fails
   */
  validateInput(problem, options = {}) {
    // Validate problem
    if (!problem || typeof problem !== 'string') {
      throw new InputValidationError('Problem description must be a non-empty string', {
        problem,
      });
    }

    // Limit problem length to prevent DoS
    if (problem.length > 10000) {
      throw new InputValidationError('Problem description exceeds maximum length', {
        maxLength: 10000,
        actualLength: problem.length,
      });
    }

    // Validate language (whitelist)
    const language = options.language || 'typescript';
    if (!ALLOWED_LANGUAGES.includes(language)) {
      throw new InputValidationError('Invalid language specified', {
        language,
        allowedLanguages: ALLOWED_LANGUAGES,
      });
    }

    // Validate complexity (whitelist)
    const complexity = options.complexity || 'moderate';
    if (!ALLOWED_COMPLEXITIES.includes(complexity)) {
      throw new InputValidationError('Invalid complexity level', {
        complexity,
        allowedComplexities: ALLOWED_COMPLEXITIES,
      });
    }

    return { language, complexity };
  }

  /**
   * Suggest patterns based on problem description
   * @param {string} problem - Problem description
   * @param {Object} options - Options (language, complexity)
   * @returns {Object[]} - Array of suggested patterns
   */
  suggest(problem, options = {}) {
    const requestId = generateRequestId();
    Logger.info('Generating pattern suggestions', { requestId, problemLength: problem.length });

    // Validate inputs
    const validatedOptions = this.validateInput(problem, options);

    const language = validatedOptions.language;
    const complexity = validatedOptions.complexity;

    // Find matching patterns
    const matches = this.findMatchingPatterns(problem);

    // If no matches, suggest common patterns based on context
    const results = matches.length === 0
      ? this.getDefaultPatterns()
      : matches;

    // Generate report
    this.printSuggestions(results, language, complexity);

    Logger.info('Pattern suggestions generated', {
      requestId,
      matchCount: results.length,
    });

    return results;
  }

  /**
   * Find patterns matching the problem description
   * @param {string} problem - Problem description
   * @returns {Object[]} - Matching patterns
   */
  findMatchingPatterns(problem) {
    const matches = [];
    const problemLower = problem.toLowerCase();

    for (const [category, patterns] of Object.entries(this.patterns)) {
      for (const [name, info] of Object.entries(patterns)) {
        let matchCount = 0;
        const matchedKeywords = [];

        for (const keyword of info.problem) {
          if (problemLower.includes(keyword.toLowerCase())) {
            matchCount++;
            matchedKeywords.push(keyword);
          }
        }

        if (matchCount > 0) {
          matches.push({
            name,
            category,
            matchScore: matchCount,
            matchedKeywords,
            ...info,
          });
        }
      }
    }

    // Sort by match score (higher first)
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Get default patterns when no matches found
   * @returns {Object[]} - Default pattern suggestions
   */
  getDefaultPatterns() {
    return [
      { name: 'Strategy', category: 'behavioral', ...this.patterns.behavioral.Strategy },
      { name: 'Factory', category: 'creational', ...this.patterns.creational.Factory },
    ];
  }

  /**
   * Print pattern suggestions to console
   * @param {Object[]} matches - Pattern matches
   * @param {string} language - Target language
   * @param {string} complexity - Complexity level
   */
  printSuggestions(matches, language, complexity) {
    console.log('\n' + '='.repeat(60));
    console.log('DESIGN PATTERN RECOMMENDATIONS');
    console.log('='.repeat(60));

    console.log(`\nLanguage: ${language}`);
    console.log(`Complexity: ${complexity}\n`);

    for (const match of matches) {
      console.log(`\n### ${match.name} (${match.category})\n`);
      console.log(`**Problem Keywords:** ${(match.matchedKeywords || match.problem.slice(0, 2)).join(' OR ')}`);
      console.log(`\n**Solution:**\n${match.solution}`);
      console.log(`\n**Example (${language}):**\n\`\`\`${this.getLangExt(language)}\n${match.example}\n\`\`\``);
    }

    console.log('\n' + '='.repeat(60));
    console.log('Consider your specific requirements and choose the pattern that best fits your architecture.');
    console.log('='.repeat(60));
  }

  /**
   * Get language file extension for code examples
   * @param {string} language - Programming language
   * @returns {string} - File extension
   */
  getLangExt(language) {
    const map = {
      typescript: 'typescript',
      javascript: 'javascript',
      python: 'python',
      java: 'java',
    };
    return map[language] || 'typescript';
  }
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Generate a unique request ID for tracing
 * @returns {string} - UUID v4 format request ID
 */
function generateRequestId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ============================================================================
// CLI
// ============================================================================

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const suggestor = new PatternSuggestor();

  let problem = null;
  let options = { language: 'typescript', complexity: 'moderate' };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--language' || arg === '-l') {
      const value = args[++i];
      options.language = value;
    } else if (arg === '--complexity' || arg === '-c') {
      const value = args[++i];
      options.complexity = value;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Pattern Suggestor - Design Pattern Recommendations

Usage: node pattern-suggest.js "problem description" [options]

Arguments:
  problem         Description of the architectural problem

Options:
  -l, --language <lang>   Output language (default: typescript)
                          Valid: typescript, javascript, python, java

  -c, --complexity <lvl>  Complexity level (default: moderate)
                          Valid: simple, moderate, complex

  -h, --help             Show this help message

Examples:
  node pattern-suggest.js "I need to handle multiple payment methods"
  node pattern-suggest.js "Object creation is complex" --language python
  node pattern-suggest.js "I want to add behavior dynamically" --complexity simple

Pattern Categories:
  - Creational: Singleton, Factory, Builder, Prototype
  - Structural: Adapter, Decorator, Facade, Proxy, Composite
  - Behavioral: Strategy, Observer, Command, State, Template Method, Mediator
`);
      process.exit(0);
    } else if (!arg.startsWith('--')) {
      problem = args.slice(i).join(' ');
      break;
    }
  }

  if (!problem) {
    console.error('Error: Problem description is required');
    console.error('Usage: node pattern-suggest.js "problem description" [options]');
    console.error('\nExamples:');
    console.error('  node pattern-suggest.js "I need to handle multiple payment methods"');
    console.error('  node pattern-suggest.js "Object creation is complex" --language python');
    process.exit(1);
  }

  try {
    suggestor.suggest(problem, options);
  } catch (error) {
    Logger.error('Pattern suggestion failed', { error: error.message, code: error.code });

    if (error instanceof InputValidationError) {
      console.error(`\nValidation Error: ${error.message}`);
      if (error.details) {
        console.error('Details:', JSON.stringify(error.details, null, 2));
      }
    } else {
      console.error(`\nError: ${error.message}`);
    }
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { PatternSuggestor, PatternSuggestorError, InputValidationError, Logger };