/**
 * 代码质量检查工具
 * 用于：清理console.log、添加JSDoc、代码规范检查
 */

import { envConfig } from '../config/env.config';

// 代码质量配置
const CODE_QUALITY_CONFIG = {
  // 环境配置
  removeConsoleInProd: true,
  keepConsoleError: true,
  keepConsoleWarn: true,
  
  // JSDoc配置
  requireJSDocFor: ['function', 'class', 'method'],
  jsdocTemplate: {
    function: `/**
 * {description}
 * @param {Object} params - 参数说明
 * @returns {Promise} 返回结果
 */`,
    class: `/**
 * {description}
 */`,
    method: `/**
 * {description}
 * @param {Object} params - 参数说明
 * @returns {any} 返回结果
 */`
  },
  
  // 代码规范
  maxLineLength: 120,
  maxFunctionLength: 50,
  maxFileLength: 500,
  
  // 命名规范
  namingConventions: {
    variable: /^[a-z][a-zA-Z0-9]*$/,
    constant: /^[A-Z][A-Z0-9_]*$/,
    function: /^[a-z][a-zA-Z0-9]*$/,
    class: /^[A-Z][a-zA-Z0-9]*$/
  }
};

/**
 * 代码质量检查器类
 */
export class CodeQualityChecker {
  /**
   * 清理代码中的console.log
   * @param {string} code - 源代码
   * @param {Object} options - 配置选项
   * @returns {string} 清理后的代码
   */
  static cleanConsoleLog(code, options = {}) {
    const config = { ...CODE_QUALITY_CONFIG, ...options };
    
    if (!config.removeConsoleInProd || !envConfig.isProd) {
      return code;
    }
    
    // 保留console.error和console.warn
    let cleanedCode = code;
    
    // 移除console.log
    cleanedCode = cleanedCode.replace(
      /console\.log\([^)]*\);?/g,
      config.keepConsoleError ? '' : '// console.log removed'
    );
    
    // 移除console.info
    cleanedCode = cleanedCode.replace(
      /console\.info\([^)]*\);?/g,
      config.keepConsoleError ? '' : '// console.info removed'
    );
    
    // 保留console.error和console.warn
    if (!config.keepConsoleError) {
      cleanedCode = cleanedCode.replace(
        /console\.error\([^)]*\);?/g,
        '// console.error removed'
      );
    }
    
    if (!config.keepConsoleWarn) {
      cleanedCode = cleanedCode.replace(
        /console\.warn\([^)]*\);?/g,
        '// console.warn removed'
      );
    }
    
    return cleanedCode;
  }
  
  /**
   * 添加JSDoc注释
   * @param {string} code - 源代码
   * @param {Object} options - 配置选项
   * @returns {string} 添加JSDoc后的代码
   */
  static addJSDocComments(code, options = {}) {
    const config = { ...CODE_QUALITY_CONFIG, ...options };
    
    if (!config.requireJSDocFor.includes('function')) {
      return code;
    }
    
    let processedCode = code;
    
    // 为函数添加JSDoc
    processedCode = this.addFunctionJSDoc(processedCode, config);
    
    // 为类添加JSDoc
    if (config.requireJSDocFor.includes('class')) {
      processedCode = this.addClassJSDoc(processedCode, config);
    }
    
    // 为方法添加JSDoc
    if (config.requireJSDocFor.includes('method')) {
      processedCode = this.addMethodJSDoc(processedCode, config);
    }
    
    return processedCode;
  }
  
  /**
   * 为函数添加JSDoc
   */
  static addFunctionJSDoc(code, config) {
    // 匹配函数声明
    const functionRegex = /(export\s+)?(async\s+)?function\s+(\w+)\s*\(([^)]*)\)\s*{/g;
    
    return code.replace(functionRegex, (match, exportKeyword, asyncKeyword, functionName, params) => {
      // 检查是否已有JSDoc
      const linesBefore = code.substring(0, code.indexOf(match)).split('\n');
      const lineBeforeMatch = linesBefore[linesBefore.length - 1];
      
      if (lineBeforeMatch.trim().startsWith('/**')) {
        return match; // 已有JSDoc，跳过
      }
      
      // 生成JSDoc
      const jsdoc = this.generateFunctionJSDoc(functionName, params, asyncKeyword, config);
      
      return `${exportKeyword || ''}${asyncKeyword || ''}${jsdoc}\nfunction ${functionName}(${params}) {`;
    });
  }
  
  /**
   * 为类添加JSDoc
   */
  static addClassJSDoc(code, config) {
    // 匹配类声明
    const classRegex = /(export\s+)?class\s+(\w+)(?:\s+extends\s+\w+)?\s*{/g;
    
    return code.replace(classRegex, (match, exportKeyword, className) => {
      // 检查是否已有JSDoc
      const linesBefore = code.substring(0, code.indexOf(match)).split('\n');
      const lineBeforeMatch = linesBefore[linesBefore.length - 1];
      
      if (lineBeforeMatch.trim().startsWith('/**')) {
        return match; // 已有JSDoc，跳过
      }
      
      // 生成JSDoc
      const jsdoc = this.generateClassJSDoc(className, config);
      
      return `${exportKeyword || ''}${jsdoc}\nclass ${className} {`;
    });
  }
  
  /**
   * 为方法添加JSDoc
   */
  static addMethodJSDoc(code, config) {
    // 匹配类方法
    const methodRegex = /(\s+)(\w+)\s*\(([^)]*)\)\s*{/g;
    
    return code.replace(methodRegex, (match, indent, methodName, params) => {
      // 检查是否在类内部
      const context = this.getContext(code, code.indexOf(match));
      
      if (context !== 'class') {
        return match; // 不在类内部，跳过
      }
      
      // 检查是否已有JSDoc
      const linesBefore = code.substring(0, code.indexOf(match)).split('\n');
      const lineBeforeMatch = linesBefore[linesBefore.length - 1];
      
      if (lineBeforeMatch.trim().startsWith('/**')) {
        return match; // 已有JSDoc，跳过
      }
      
      // 生成JSDoc
      const jsdoc = this.generateMethodJSDoc(methodName, params, config);
      
      return `${indent}${jsdoc}\n${indent}${methodName}(${params}) {`;
    });
  }
  
  /**
   * 生成函数JSDoc
   */
  static generateFunctionJSDoc(functionName, params, asyncKeyword, config) {
    const description = this.getFunctionDescription(functionName);
    const paramDocs = this.generateParamDocs(params);
    const returnType = asyncKeyword ? 'Promise<any>' : 'any';
    
    return `/**
 * ${description}
${paramDocs}
 * @returns {${returnType}} 返回结果
 */`;
  }
  
  /**
   * 生成类JSDoc
   */
  static generateClassJSDoc(className, config) {
    const description = this.getClassDescription(className);
    
    return `/**
 * ${description}
 */`;
  }
  
  /**
   * 生成方法JSDoc
   */
  static generateMethodJSDoc(methodName, params, config) {
    const description = this.getMethodDescription(methodName);
    const paramDocs = this.generateParamDocs(params);
    
    return `/**
 * ${description}
${paramDocs}
 * @returns {any} 返回结果
 */`;
  }
  
  /**
   * 生成参数文档
   */
  static generateParamDocs(params) {
    if (!params.trim()) {
      return '';
    }
    
    const paramList = params.split(',').map(param => param.trim());
    return paramList.map(param => {
      const [paramName, defaultValue] = param.split('=').map(p => p.trim());
      const type = this.inferParamType(paramName);
      const optional = defaultValue ? ' (可选)' : '';
      
      return ` * @param {${type}} ${paramName} - 参数说明${optional}`;
    }).join('\n');
  }
  
  /**
   * 推断参数类型
   */
  static inferParamType(paramName) {
    // 根据参数名推断类型
    const typeHints = {
      'id': 'string|number',
      'name': 'string',
      'age': 'number',
      'data': 'Object',
      'list': 'Array',
      'callback': 'Function',
      'options': 'Object',
      'params': 'Object',
      'config': 'Object'
    };
    
    return typeHints[paramName] || 'any';
  }
  
  /**
   * 获取函数描述
   */
  static getFunctionDescription(functionName) {
    const descriptions = {
      'fetch': '获取数据',
      'get': '获取',
      'post': '提交数据',
      'put': '更新数据',
      'delete': '删除数据',
      'create': '创建',
      'update': '更新',
      'remove': '删除',
      'find': '查找',
      'search': '搜索',
      'validate': '验证',
      'format': '格式化',
      'parse': '解析',
      'transform': '转换',
      'handle': '处理',
      'init': '初始化',
      'load': '加载',
      'save': '保存',
      'clear': '清空',
      'reset': '重置'
    };
    
    for (const [key, desc] of Object.entries(descriptions)) {
      if (functionName.toLowerCase().includes(key)) {
        return desc;
      }
    }
    
    return '功能描述';
  }
  
  /**
   * 获取类描述
   */
  static getClassDescription(className) {
    const descriptions = {
      'Manager': '管理器',
      'Service': '服务',
      'Controller': '控制器',
      'Handler': '处理器',
      'Validator': '验证器',
      'Formatter': '格式化器',
      'Parser': '解析器',
      'Transformer': '转换器',
      'Loader': '加载器',
      'Saver': '保存器',
      'Checker': '检查器'
    };
    
    for (const [suffix, desc] of Object.entries(descriptions)) {
      if (className.endsWith(suffix)) {
        return `${className.replace(suffix, '')}${desc}`;
      }
    }
    
    return `${className} 类`;
  }
  
  /**
   * 获取方法描述
   */
  static getMethodDescription(methodName) {
    return this.getFunctionDescription(methodName);
  }
  
  /**
   * 获取代码上下文
   */
  static getContext(code, position) {
    const beforeCode = code.substring(0, position);
    
    // 检查是否在类内部
    const lastClassIndex = beforeCode.lastIndexOf('class ');
    const lastFunctionIndex = beforeCode.lastIndexOf('function ');
    
    if (lastClassIndex > lastFunctionIndex) {
      // 检查类是否已结束
      const afterClass = code.substring(lastClassIndex);
      const classBody = afterClass.substring(0, afterClass.indexOf('}'));
      
      if (classBody.includes('{') && classBody.indexOf('{') < position - lastClassIndex) {
        return 'class';
      }
    }
    
    return 'global';
  }
  
  /**
   * 检查代码规范
   * @param {string} code - 源代码
   * @param {string} filePath - 文件路径
   * @returns {Array} 规范问题列表
   */
  static checkCodeStyle(code, filePath) {
    const issues = [];
    const lines = code.split('\n');
    
    // 检查行长度
    lines.forEach((line, index) => {
      if (line.length > CODE_QUALITY_CONFIG.maxLineLength) {
        issues.push({
          type: 'line-too-long',
          line: index + 1,
          message: `行长度超过${CODE_QUALITY_CONFIG.maxLineLength}个字符`,
          severity: 'warning'
        });
      }
    });
    
    // 检查文件长度
    if (lines.length > CODE_QUALITY_CONFIG.maxFileLength) {
      issues.push({
        type: 'file-too-long',
        line: 0,
        message: `文件超过${CODE_QUALITY_CONFIG.maxFileLength}行，建议拆分`,
        severity: 'warning'
      });
    }
    
    // 检查命名规范
    this.checkNamingConventions(code, issues);
    
    // 检查函数长度
    this.checkFunctionLength(code, issues);
    
    return issues;
  }
  
  /**
   * 检查命名规范
   */
  static checkNamingConventions(code, issues) {
    // 检查变量命名
    const variableRegex = /(?:let|const|var)\s+(\w+)\s*=/g;
    let match;
    
    while ((match = variableRegex.exec(code)) !== null) {
      const variableName = match[1];
      
      if (!CODE_QUALITY_CONFIG.namingConventions.variable.test(variableName)) {
        const line = this.getLineNumber(code, match.index);
        issues.push({
          type: 'naming-convention',
          line,
          message: `变量名 "${variableName}" 不符合命名规范`,
          severity: 'warning'
        });
      }
    }
    
    // 检查常量命名
    const constantRegex = /const\s+(\w+)\s*=\s*(?:[^;]+);/g;
    
    while ((match = constantRegex.exec(code)) !== null) {
      const constantName = match[1];
      
      if (!CODE_QUALITY_CONFIG.namingConventions.constant.test(constantName)) {
        const line = this.getLineNumber(code, match.index);
        issues.push({
          type: 'naming-convention',
          line,
          message: `常量名 "${constantName}" 应使用大写字母和下划线`,
          severity: 'warning'
        });
      }
    }
    
    // 检查函数命名
    const functionRegex = /function\s+(\w+)\s*\(/g;
    
    while ((match = functionRegex.exec(code)) !== null) {
      const functionName = match[1];
      
      if (!CODE_QUALITY_CONFIG.namingConventions.function.test(functionName)) {
        const line = this.getLineNumber(code, match.index);
        issues.push({
          type: 'naming-convention',
          line,
          message: `函数名 "${functionName}" 不符合命名规范`,
          severity: 'warning'
        });
      }
    }
    
    // 检查类命名
    const classRegex = /class\s+(\w+)/g;
    
    while ((match = classRegex.exec(code)) !== null) {
      const className = match[1];
      
      if (!CODE_QUALITY_CONFIG.namingConventions.class.test(className)) {
        const line = this.getLineNumber(code, match.index);
        issues.push({
          type: 'naming-convention',
          line,
          message: `类名 "${className}" 应以大写字母开头`,
          severity: 'warning'
        });
      }
    }
  }
  
  /**
   * 检查函数长度
   */
  static checkFunctionLength(code, issues) {
    const functionRegex = /function\s+\w+\s*\([^)]*\)\s*{/g;
    
    while ((match = functionRegex.exec(code)) !== null) {
      const functionStart = match.index;
      const functionBody = this.getFunctionBody(code, functionStart);
      
      if (functionBody) {
        const lineCount = functionBody.split('\n').length;
        
        if (lineCount > CODE_QUALITY_CONFIG.maxFunctionLength) {
          const line = this.getLineNumber(code, functionStart);
          issues.push({
            type: 'function-too-long',
            line,
            message: `函数超过${CODE_QUALITY_CONFIG.maxFunctionLength}行，建议拆分`,
            severity: 'warning'
          });
        }
      }
    }
  }
  
  /**
   * 获取函数体
   */
  static getFunctionBody(code, startIndex) {
    let braceCount = 0;
    let inString = false;
    let stringChar = '';
    
    for (let i = startIndex; i < code.length; i++) {
      const char = code[i];
      const prevChar = i > 0 ? code[i - 1] : '';
      
      // 处理字符串
      if (!inString && (char === '"' || char === "'" || char === '`')) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar && prevChar !== '\\') {
        inString = false;
      }
      
      // 统计大括号
      if (!inString) {
        if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          
          if (braceCount === 0) {
            return code.substring(startIndex, i + 1);
          }
        }
      }
    }
    
    return null;
  }
  
  /**
   * 获取行号
   */
  static getLineNumber(code, position) {
    return code.substring(0, position).split('\n').length;
  }
  
  /**
   * 生成代码质量报告
   * @param {string} code - 源代码
   * @param {string} filePath - 文件路径
   * @returns {Object} 质量报告
   */
  static generateReport(code, filePath) {
    const issues = this.checkCodeStyle(code, filePath);
    
    const report = {
      filePath,
      timestamp: new Date().toISOString(),
      issues,
      summary: {
        totalIssues: issues.length,
        errors: issues.filter(i => i.severity === 'error').length,
        warnings: issues.filter(i => i.severity === 'warning').length,
        suggestions: issues.filter(i => i.severity === 'suggestion').length
      },
      metrics: {
        linesOfCode: code.split('\n').length,
        functions: (code.match(/function\s+\w+\s*\(/g) || []).length,
        classes: (code.match(/class\s+\w+/g) || []).length,
        consoleLogs: (code.match(/console\.log/g) || []).length
      }
    };
    
    return report;
  }
  
  /**
   * 自动修复代码问题
   * @param {string} code - 源代码
   * @param {Object} options - 配置选项
   * @returns {string} 修复后的代码
   */
  static autoFix(code, options = {}) {
    let fixedCode = code;
    
    // 清理console.log
    fixedCode = this.cleanConsoleLog(fixedCode, options);
    
    // 添加JSDoc
    fixedCode = this.addJSDocComments(fixedCode, options);
    
    return fixedCode;
  }
}

// 快捷方法
export function cleanCode(code, options = {}) {
  return CodeQualityChecker.cleanConsoleLog(code, options);
}

export function addJSDoc(code, options = {}) {
  return CodeQualityChecker.addJSDocComments(code, options);
}

export function checkStyle(code, filePath) {
  return CodeQualityChecker.checkCodeStyle(code, filePath);
}

export function generateQualityReport(code, filePath) {
  return CodeQualityChecker.generateReport(code, filePath);
}

export function fixCode(code, options = {}) {
  return CodeQualityChecker.autoFix(code, options);
}

// 默认导出
export default CodeQualityChecker;