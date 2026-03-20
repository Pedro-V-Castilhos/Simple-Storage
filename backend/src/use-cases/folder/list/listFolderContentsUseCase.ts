import { Folder } from "../../../entities";
import { FolderRepository } from "../../../repositories/folderRepository";

export class ListFolderContentsUseCase {
  constructor(private readonly folderRepository: FolderRepository) {}

  public async execute(
    userId: number,
    parentFolderId: number | null,
  ): Promise<Folder[]> {
    return this.folderRepository.findByUserIdAndParent(userId, parentFolderId);
  }
}
