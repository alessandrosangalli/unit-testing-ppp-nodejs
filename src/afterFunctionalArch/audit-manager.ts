import * as fsPromises from 'fs/promises';

export type FileUpdate = {
  fileName: string;
  newContent: string;
};

export type FileContent = {
  fileName: string;
  lines: string[];
};

export class AuditManager {
  constructor(private readonly _maxEntriesPerFile: number) {}

  // Coração do negócio
  public async addRecord(
    files: FileContent[],
    visitorName: string,
    timeOfVisit: Date,
  ): Promise<FileUpdate> {
    const newContent = visitorName + ';' + timeOfVisit.toString();

    if (files.length == 0) {
      return {
        fileName: 'audit_1.txt',
        newContent,
      };
    }

    const lastFile = files[files.length - 1];
    const numOfFiles = files.length;

    // Poderiamos injetar o valor de lines para que esse método fosse puro
    const lines = (await fsPromises.readFile(lastFile.fileName))
      .toString()
      .split('\n');

    if (lines.length < this._maxEntriesPerFile) {
      lines.push(newContent);
      return {
        fileName: lastFile.fileName,
        newContent: lines.join('\r\n'),
      };
    } else {
      const newIndex = numOfFiles + 1;
      const newName = `audit_${newIndex}.txt`;

      return {
        fileName: newName,
        newContent,
      };
    }
  }
}
