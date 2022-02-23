import * as path from 'path';
import * as fsPromises from 'fs/promises';

export class AuditManager {
  constructor(
    private readonly _maxEntriesPerFile: number,
    private readonly _directoryName: string,
  ) {}

  public async addRecord(visitorName: string, timeOfVisit: Date) {
    const filePaths = await fsPromises.readdir(this._directoryName);
    const newRecord = visitorName + ';' + timeOfVisit.toString();

    if (filePaths.length == 0) {
      const newFile = path.join(this._directoryName, 'audit_1.txt');
      await fsPromises.writeFile(newFile, newRecord);
      return;
    }

    const lastFile = filePaths[filePaths.length - 1];
    const numOfFiles = filePaths.length;

    const lines = (await fsPromises.readFile(lastFile)).toString().split('\n');

    if (lines.length < this._maxEntriesPerFile) {
      lines.push(newRecord);
      const newContent = lines.join('\r\n');
      await fsPromises.writeFile(lastFile, newContent);
    } else {
      const newIndex = numOfFiles + 1;
      const newName = `audit_${newIndex}.txt`;
      const newFile = path.join(this._directoryName, newName);
      await fsPromises.writeFile(newFile, newRecord);
    }
  }
}
