import { Request, Response } from "express";
import { CreateFolderUseCase } from "../use-cases/folder/create/createFolderUseCase";
import { ListFolderContentsUseCase } from "../use-cases/folder/list/listFolderContentsUseCase";
import { FolderRepository } from "../repositories/folderRepository";

class FolderController {
  constructor(
    private readonly createFolderUseCase: CreateFolderUseCase,
    private readonly listFolderContentsUseCase: ListFolderContentsUseCase,
  ) {}

  public async create(req: Request, res: Response) {
    try {
      const { name, parentFolderId } = req.body;

      const folder = await this.createFolderUseCase.execute({
        name,
        userId: Number(req.headers.user),
        parentFolderId: parentFolderId ?? null,
      });

      res.status(201).send({ folder });
    } catch (error) {
      res.status(500).send({ message: error });
    }
  }

  public async list(req: Request, res: Response) {
    try {
      const parentFolderId = req.query.parentFolderId;
      const parsedParentFolderId =
        parentFolderId === undefined || parentFolderId === "null"
          ? null
          : Number(parentFolderId);

      const folders = await this.listFolderContentsUseCase.execute(
        Number(req.headers.user),
        parsedParentFolderId,
      );

      res.status(200).send({ folders });
    } catch (error) {
      res.status(500).send({ message: error });
    }
  }
}

export const folderController = new FolderController(
  new CreateFolderUseCase(new FolderRepository()),
  new ListFolderContentsUseCase(new FolderRepository()),
);
