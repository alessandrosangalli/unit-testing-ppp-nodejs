import { FileUpdate } from './audit-manager';
import { Persister } from './persister';
import * as fsPromises from 'fs/promises';

jest.mock('fs/promises', () => ({
  writeFile: jest.fn(),
  readdir: jest.fn().mockResolvedValue(['audit_1.txt']),
  readFile: jest.fn().mockResolvedValue(
    `Peter;2019-04-06T16:30:00
Jane;2019-04-06T16:40:00
Jack;2019-04-06T17:00:00`,
  ),
}));

test('Deve retornar os arquivos presentes em um diretório', async () => {
  const persister = new Persister();

  const files = await persister.readDirectory('my-directory');
  expect(files.length).toBe(1);
  expect(files[0].fileName).toBe('audit_1.txt');
  expect(files[0].lines).toEqual([
    'Peter;2019-04-06T16:30:00',
    'Jane;2019-04-06T16:40:00',
    'Jack;2019-04-06T17:00:00',
  ]);
});

test('Deve aplicar uma atualização', async () => {
  const writeFileSpy = jest.spyOn(fsPromises, 'writeFile');
  const fileUpdate: FileUpdate = {
    fileName: 'my-file.txt',
    newContent: 'my-content',
  };
  const persister = new Persister();

  await persister.applyUpdate('/my-directory', fileUpdate);

  expect(writeFileSpy).toBeCalledWith(
    '/my-directory/my-file.txt',
    'my-content',
  );
});
