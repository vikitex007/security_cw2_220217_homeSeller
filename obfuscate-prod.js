import JavaScriptObfuscator from 'javascript-obfuscator';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Obfuscation options for production
const obfuscationOptions = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  debugProtection: true,
  debugProtectionInterval: 2000,
  disableConsoleOutput: true,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false,
  selfDefending: true,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 10,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.75,
  transformObjectKeys: true,
  unicodeEscapeSequence: false
};

// Function to obfuscate a file
function obfuscateFile(filePath) {
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, obfuscationOptions).getObfuscatedCode();
    
    // Create obfuscated version
    const obfuscatedPath = filePath.replace('.js', '.obf.js');
    fs.writeFileSync(obfuscatedPath, obfuscatedCode);
    console.log(`✅ Obfuscated: ${filePath} -> ${obfuscatedPath}`);
  } catch (error) {
    console.log(`❌ Failed to obfuscate ${filePath}:`, error.message);
  }
}

// Function to recursively find and obfuscate JS files in dist
function obfuscateDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`❌ Directory not found: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      obfuscateDirectory(filePath);
    } else if (file.endsWith('.js')) {
      // Skip already obfuscated files
      if (!file.includes('.obf.')) {
        obfuscateFile(filePath);
      }
    }
  });
}

console.log('🔒 Starting production code obfuscation...');
console.log('📁 Obfuscating built files in client/dist...');

// Obfuscate built files
obfuscateDirectory('./client/dist');

console.log('✅ Production obfuscation completed!');
console.log('📝 Obfuscated files have .obf.js extension');
console.log('🚀 Replace .js files with .obf.js files in your production deployment'); 