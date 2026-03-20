export class CreateFolderRequestDto {
  name: string;
  userId: number;
  parentFolderId: number | null;
}
