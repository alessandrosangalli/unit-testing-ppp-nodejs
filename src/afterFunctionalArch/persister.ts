import { FileContent, FileUpdate } from './audit-manager';
import * as fsPromises from 'fs/promises';
import * as path from 'path';

// Camada mais externa com efeitos colaterais
export class Persister {
  public async readDirectory(directoryName: string): Promise<FileContent[]> {
    const files = await fsPromises.readdir(directoryName);
    const fileContent: FileContent[] = [];

    for (const file of files) {
      const fileName = file;
      const lines = (await fsPromises.readFile(fileName))
        .toString()
        .split('\n');

      fileContent.push({
        fileName,
        lines,
      });
    }

    return fileContent;
  }

  public async applyUpdate(directoryName: string, update: FileUpdate) {
    const filePath = path.join(directoryName, update.fileName);
    await fsPromises.writeFile(filePath, update.newContent);
  }
}
