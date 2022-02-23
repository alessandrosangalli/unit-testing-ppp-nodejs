import * as path from 'path';
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

export class Persister {
  public async readDirectory(directoryName: string): Promise<FileContent[]> {
    const files = await fsPromises.readdir(directoryName);
    const fileContent: FileContent[] = [];

    for (const file of files) {
      const fileName = file;
      const lines = await fsPromises.readFile(fileName).toString().split('\n');

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

export class ApplicationService {
  private readonly _auditManager: AuditManager;
  private readonly _persister: Persister;

  constructor(
    private readonly _directoryName: string,
    private readonly _maxEntriesPerFile: number,
  ) {
    this._auditManager = new AuditManager(this._maxEntriesPerFile);
    this._persister = new Persister();
  }

  public async addRecord(visitorName: string, timeOfVisit: Date) {
    const files = await this._persister.readDirectory(this._directoryName);
    const update = await this._auditManager.addRecord(
      files,
      visitorName,
      timeOfVisit,
    );

    await this._persister.applyUpdate(this._directoryName, update);
  }
}
