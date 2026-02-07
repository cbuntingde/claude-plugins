#!/usr/bin/env node
/**
 * Pattern Suggestion Script
 * Recommends design patterns based on problem descriptions
 */

const fs = require('fs');

/**
 * Pattern Suggestion Engine
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
}`
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
}`
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
}`
        }
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
}`
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
}`
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
}`
        }
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
}`
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
}`
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
}`
        }
      }
    };
  }

  /**
   * Suggest patterns based on problem description
   */
  suggest(problem, options = {}) {
    const language = options.language || 'typescript';
    const complexity = options.complexity || 'moderate';

    // Find matching patterns
    const matches = [];

    for (const [category, patterns] of Object.entries(this.patterns)) {
      for (const [name, info] of Object.entries(patterns)) {
        for (const keyword of info.problem) {
          if (problem.toLowerCase().includes(keyword)) {
            matches.push({ name, category, ...info });
            break;
          }
        }
      }
    }

    // If no matches, suggest common patterns based on context
    if (matches.length === 0) {
      matches.push(
        { name: 'Strategy', category: 'behavioral', ...this.patterns.behavioral.Strategy },
        { name: 'Factory', category: 'creational', ...this.patterns.creational.Factory }
      );
    }

    // Generate report
    this.printSuggestions(matches, language, complexity);
    return matches;
  }

  /**
   * Print pattern suggestions
   */
  printSuggestions(matches, language, complexity) {
    console.log('\n' + '='.repeat(60));
    console.log('DESIGN PATTERN RECOMMENDATIONS');
    console.log('='.repeat(60));

    console.log(`\nLanguage: ${language}`);
    console.log(`Complexity: ${complexity}\n`);

    for (const match of matches) {
      console.log(`\n### ${match.name} (${match.category})\n`);
      console.log(`**Problem:** ${match.problem.slice(0, 2).join(' OR ')}`);
      console.log(`\n**Solution:**\n${match.solution}`);
      console.log(`\n**Example (${language}):**\n\`\`\`${this.getLangExt(language)}\n${match.example}\n\`\`\``);
    }

    console.log('\n' + '='.repeat(60));
    console.log('Consider your specific requirements and choose the pattern that best fits your architecture.');
    console.log('='.repeat(60));
  }

  /**
   * Get language extension
   */
  getLangExt(language) {
    const map = { typescript: 'typescript', javascript: 'javascript', python: 'python', java: 'java' };
    return map[language] || 'typescript';
  }
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);
  const suggestor = new PatternSuggestor();

  let problem = null;
  let options = { language: 'typescript', complexity: 'moderate' };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--language' || arg === '-l') {
      options.language = args[++i];
    } else if (arg === '--complexity' || arg === '-c') {
      options.complexity = args[++i];
    } else if (!arg.startsWith('--')) {
      problem = args.slice(i).join(' ');
      break;
    }
  }

  if (!problem) {
    console.log('Usage: node pattern-suggest.js "problem description" [--language <typescript>]');
    console.log('');
    console.log('Examples:');
    console.log('  node pattern-suggest.js "I need to handle multiple payment methods"');
    console.log('  node pattern-suggest.js "Object creation is complex" --language python');
    process.exit(1);
  }

  suggestor.suggest(problem, options);
}

if (require.main === module) {
  main();
}

module.exports = PatternSuggestor;