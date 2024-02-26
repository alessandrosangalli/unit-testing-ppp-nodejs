import { AuditManager } from './audit-manager';
import { Persister } from './persister';

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

  // Código trivial, sem estruturas de tomada de decisão -> não precisa de testes
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
