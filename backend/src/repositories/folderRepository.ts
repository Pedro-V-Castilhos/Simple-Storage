import { IsNull, Repository } from "typeorm";
import { AppDataSource } from "../database/appDataSource";
import { Folder } from "../entities";

export class FolderRepository {
  private folderRepository: Repository<Folder>;

  constructor() {
    this.folderRepository = AppDataSource.getRepository(Folder);
  }

  public async save(folder: Partial<Folder>): Promise<Folder> {
    return this.folderRepository.save(folder);
  }

  public async findByUserIdAndParent(
    userId: number,
    parentFolderId: number | null,
  ): Promise<Folder[]> {
    return this.folderRepository.findBy({
      userId,
      parentFolderId: parentFolderId ?? IsNull(),
    });
  }

  public async findById(id: number): Promise<Folder | null> {
    return this.folderRepository.findOneBy({ id });
  }
}
