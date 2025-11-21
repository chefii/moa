import * as fs from 'fs';
import * as path from 'path';

/**
 * console.log/error/warn을 logger로 일괄 교체하는 스크립트
 */

interface FileChange {
  file: string;
  changes: number;
}

const results: FileChange[] = [];

function getAllTsFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // scripts, prisma, node_modules, dist 폴더 제외
      if (!['scripts', 'node_modules', 'dist'].includes(file)) {
        getAllTsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') && !file.endsWith('.spec.ts') && !file.endsWith('.test.ts')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

async function replaceConsoleInFile(filePath: string): Promise<number> {
  const content = fs.readFileSync(filePath, 'utf-8');
  let newContent = content;
  let changes = 0;

  // logger import 확인
  const hasLoggerImport = /import\s+.*logger.*from\s+['"].*logger.*['"]/.test(content);
  const hasLoggerRequire = /const\s+.*logger.*=\s+require\(['"].*logger.*['"]\)/.test(content);

  // console.error → logger.error
  const errorMatches = content.match(/console\.error\(/g);
  if (errorMatches) {
    newContent = newContent.replace(/console\.error\(/g, 'logger.error(');
    changes += errorMatches.length;
  }

  // console.warn → logger.warn
  const warnMatches = content.match(/console\.warn\(/g);
  if (warnMatches) {
    newContent = newContent.replace(/console\.warn\(/g, 'logger.warn(');
    changes += warnMatches.length;
  }

  // console.log → logger.info
  const logMatches = content.match(/console\.log\(/g);
  if (logMatches) {
    newContent = newContent.replace(/console\.log\(/g, 'logger.info(');
    changes += logMatches.length;
  }

  // console.debug → logger.debug
  const debugMatches = content.match(/console\.debug\(/g);
  if (debugMatches) {
    newContent = newContent.replace(/console\.debug\(/g, 'logger.debug(');
    changes += debugMatches.length;
  }

  // 변경사항이 있고 logger import가 없으면 추가
  if (changes > 0 && !hasLoggerImport && !hasLoggerRequire) {
    // 상대 경로 계산 (src/ 기준)
    const relativePath = path.relative(path.dirname(filePath), path.join(__dirname, '../config/logger'));
    const importPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;

    // 첫 번째 import 문 찾기
    const importMatch = newContent.match(/^import\s+/m);
    if (importMatch && importMatch.index !== undefined) {
      // 첫 번째 import 앞에 logger import 추가
      newContent =
        newContent.slice(0, importMatch.index) +
        `import logger from '${importPath}';\n` +
        newContent.slice(importMatch.index);
    } else {
      // import 문이 없으면 파일 맨 위에 추가
      newContent = `import logger from '${importPath}';\n\n${newContent}`;
    }
  }

  if (changes > 0) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
  }

  return changes;
}

async function main() {
  console.log('🔍 console.* 사용 파일 검색 중...\n');

  const srcDir = path.join(__dirname, '..');
  const files = getAllTsFiles(srcDir);

  console.log(`📁 총 ${files.length}개 파일 검사 중...\n`);

  for (const file of files) {
    const changes = await replaceConsoleInFile(file);
    if (changes > 0) {
      const relativePath = path.relative(path.join(__dirname, '../..'), file);
      results.push({ file: relativePath, changes });
      console.log(`✅ ${relativePath}: ${changes}개 변경`);
    }
  }

  console.log('\n📊 작업 완료!\n');
  console.log(`총 ${results.length}개 파일 수정`);
  console.log(`총 ${results.reduce((sum, r) => sum + r.changes, 0)}개 console.* → logger.* 변경\n`);

  if (results.length > 0) {
    console.log('변경된 파일 목록:');
    results.forEach((r) => {
      console.log(`  - ${r.file} (${r.changes}개)`);
    });
  }
}

main().catch(console.error);
