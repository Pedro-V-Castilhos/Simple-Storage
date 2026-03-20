import { getConstants } from "../../../constants";
import { Folder } from "../../../entities";
import { ApplicationError } from "../../../errors/applicationError";
import { FolderRepository } from "../../../repositories/folderRepository";
import { CreateFolderRequestDto } from "./createFolderRequest.dto";

export class CreateFolderUseCase {
  constructor(private readonly folderRepository: FolderRepository) {}

  public async execute(data: CreateFolderRequestDto): Promise<Folder> {
    if (!data.name) {
      throw new ApplicationError("Folder name is required");
    }

    if (data.parentFolderId) {
      const parentFolder = await this.folderRepository.findById(
        data.parentFolderId,
      );
      if (!parentFolder) {
        throw new ApplicationError("Parent folder not found");
      }
    }

    return this.folderRepository.save({
      name: data.name,
      userId: data.userId,
      parentFolderId: data.parentFolderId ?? null,
    });
  }
}
