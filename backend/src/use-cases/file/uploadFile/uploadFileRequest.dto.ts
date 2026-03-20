export class UploadFileRequestDto {
  fileName: string;
  userId: number;
  folderId?: number | null;
}
