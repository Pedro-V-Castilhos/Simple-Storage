import { FileRepository } from "../../../repositories/fileRepository";
import { File } from "../../../entities";

export class RetriveFileUseCase {
  constructor(private readonly fileRepository: FileRepository) {}

  public async execute(
    userId: number,
    folderId?: number | null,
  ): Promise<File[]> {
    try {
      if (folderId !== undefined) {
        return this.fileRepository.findByUserIdAndFolder(userId, folderId);
      }
      return this.fileRepository.findByUserId(userId);
    } catch (error) {
      return [];
    }
  }
}
