import { AuditManager } from './audit-manager';
import * as fsPromises from 'fs/promises';
import { Dirent } from 'fs';

jest.mock('fs/promises', () => ({
  readdir: jest.fn(),
  writeFile: jest.fn(),
  readFile: jest.fn(),
}));

test('A new file is created for the first entry', async () => {
  jest.spyOn(fsPromises, 'readdir').mockResolvedValueOnce([]);
  const writeFileSpy = jest.spyOn(fsPromises, 'writeFile');

  const defaultPath = 'any_path';
  const defaultDate = new Date('2019-04-09');
  const defaultUser = 'Peter';
  const auditManager = new AuditManager(1, defaultPath);

  await auditManager.addRecord(defaultUser, defaultDate);

  expect(writeFileSpy).toHaveBeenCalledWith(
    `${defaultPath}/audit_1.txt`,
    `${defaultUser};${defaultDate.toString()}`,
  );
});

test('A new file is created when the current file overflows', async () => {
  jest
    .spyOn(fsPromises, 'readdir')
    .mockResolvedValueOnce([
      'audit_1.txt' as unknown as Dirent,
      'audit_2.txt' as unknown as Dirent,
    ]);

  jest.spyOn(fsPromises, 'readFile').mockResolvedValueOnce(
    `Peter;2019-04-06T16:30:00
     Jane;2019-04-06T16:40:00
     Jack;2019-04-06T17:00:00`,
  );

  const writeFileSpy = jest.spyOn(fsPromises, 'writeFile');

  const defaultPath = 'any_path';
  const defaultDate = new Date('2019-04-09');
  const defaultUser = 'Peter';
  const auditManager = new AuditManager(3, defaultPath);

  await auditManager.addRecord(defaultUser, defaultDate);

  expect(writeFileSpy).toHaveBeenCalledWith(
    `${defaultPath}/audit_3.txt`,
    `${defaultUser};${defaultDate.toString()}`,
  );
});
