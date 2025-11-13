#!/usr/bin/env node

/**
 * JavaScript Syntax Validation Script
 * Validates all .js files for common syntax errors
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const errors = [];
const warnings = [];
let filesChecked = 0;

// Directories to skip
const SKIP_DIRS = ['node_modules', 'coverage', 'dist', '.git', 'yaya_starchild_website'];

// Get all JS files
function getAllJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!SKIP_DIRS.includes(file)) {
        getAllJsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Check for syntax errors using Node
function checkSyntax(filePath) {
  try {
    execSync(`node -c "${filePath}"`, { stdio: 'pipe' });
    return null;
  } catch (error) {
    return error.message;
  }
}

// Check for common issues
function checkCommonIssues(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Check for mixed && and || without parentheses
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Pattern: && followed by || or vice versa without proper grouping
    if (/\&\&[^&]*\|\||!.*\&\&[^&]*\|\|/.test(line) && 
        !/\([^)]*\&\&[^)]*\|\|[^)]*\)/.test(line)) {
      issues.push({
        line: lineNum,
        type: 'warning',
        message: 'Mixed && and || operators may need parentheses',
        snippet: line.trim()
      });
    }
    
    // Check for unbalanced quotes (basic check)
    const singleQuotes = (line.match(/'/g) || []).length;
    const doubleQuotes = (line.match(/"/g) || []).length;
    const backticks = (line.match(/`/g) || []).length;
    
    if (singleQuotes % 2 !== 0 && !line.includes('//') && !line.includes('/*')) {
      issues.push({
        line: lineNum,
        type: 'error',
        message: 'Unbalanced single quotes',
        snippet: line.trim()
      });
    }
    
    if (doubleQuotes % 2 !== 0 && !line.includes('//') && !line.includes('/*')) {
      issues.push({
        line: lineNum,
        type: 'error',
        message: 'Unbalanced double quotes',
        snippet: line.trim()
      });
    }
    
    // Check for missing semicolons in certain contexts
    if (/^\s*(const|let|var)\s+\w+\s*=\s*[^;{]*$/.test(line) && 
        !line.includes('//') && 
        index < lines.length - 1 &&
        lines[index + 1].trim() !== '') {
      issues.push({
        line: lineNum,
        type: 'warning',
        message: 'Variable declaration may be missing semicolon',
        snippet: line.trim()
      });
    }
  });
  
  return issues;
}

// Main validation
console.log('🔍 JavaScript Syntax Validation\n');

const jsFiles = getAllJsFiles(process.cwd());
console.log(`Found ${jsFiles.length} JavaScript files\n`);

jsFiles.forEach(filePath => {
  const relativePath = path.relative(process.cwd(), filePath);
  filesChecked++;
  
  // Check syntax
  const syntaxError = checkSyntax(filePath);
  if (syntaxError) {
    errors.push({
      file: relativePath,
      error: syntaxError
    });
    console.log(`❌ ${relativePath}: Syntax Error`);
    return;
  }
  
  // Check common issues
  const issues = checkCommonIssues(filePath);
  if (issues.length > 0) {
    issues.forEach(issue => {
      const record = {
        file: relativePath,
        line: issue.line,
        message: issue.message,
        snippet: issue.snippet
      };
      
      if (issue.type === 'error') {
        errors.push(record);
        console.log(`❌ ${relativePath}:${issue.line} - ${issue.message}`);
      } else {
        warnings.push(record);
        console.log(`⚠️  ${relativePath}:${issue.line} - ${issue.message}`);
      }
    });
  } else {
    console.log(`✅ ${relativePath}`);
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 VALIDATION SUMMARY');
console.log('='.repeat(60));
console.log(`Files checked: ${filesChecked}`);
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);

if (errors.length === 0 && warnings.length === 0) {
  console.log('\n✅ All files passed validation!');
  process.exit(0);
} else {
  if (errors.length > 0) {
    console.log('\n❌ ERRORS FOUND:');
    errors.forEach(err => {
      console.log(`\n  ${err.file}${err.line ? ':' + err.line : ''}`);
      console.log(`  ${err.message || err.error}`);
      if (err.snippet) console.log(`  > ${err.snippet}`);
    });
  }
  
  if (warnings.length > 0 && warnings.length <= 10) {
    console.log('\n⚠️  WARNINGS:');
    warnings.slice(0, 10).forEach(warn => {
      console.log(`  ${warn.file}:${warn.line} - ${warn.message}`);
    });
  }
  
  process.exit(errors.length > 0 ? 1 : 0);
}
