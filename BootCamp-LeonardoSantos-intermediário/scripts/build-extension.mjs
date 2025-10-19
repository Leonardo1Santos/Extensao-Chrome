import fs from 'node:fs';
import path from 'node:path';
import archiver from 'archiver';

const dist = 'dist';

// Função principal async para usar await
async function buildExtension() {
  try {
    // Limpa diretório dist
    fs.rmSync(dist, { recursive: true, force: true });
    fs.mkdirSync(dist);

    // Copia arquivos essenciais
    const filesToCopy = ['manifest.json', 'package.json', 'playwright.config.ts'];
    const dirsToCopy = ['src', 'icons', 'tests'];

    filesToCopy.forEach(file => {
      if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(dist, file));
        console.log(`✅ Copiado: ${file}`);
      }
    });

    dirsToCopy.forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.cpSync(dir, path.join(dist, dir), { recursive: true });
        console.log(`✅ Copiado diretório: ${dir}`);
      }
    });

    // Gera ZIP
    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(path.join(dist, 'extension.zip'));
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      output.on('close', () => {
        console.log(`📦 ZIP criado: ${archive.pointer()} bytes`);
        resolve();
      });
      
      archive.on('error', (err) => {
        reject(err);
      });
      
      archive.pipe(output);
      archive.directory(dist, false);
      archive.finalize();
    });

    console.log('✅ Build gerado em dist/ e dist/extension.zip');
    
  } catch (error) {
    console.error('❌ Erro no build:', error);
    process.exit(1);
  }
}

// Executa a função principal
buildExtension();