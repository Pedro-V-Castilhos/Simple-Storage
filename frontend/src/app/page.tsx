"use client";

import { getConstants } from "@/constants";
import { makeLinkRedirect } from "@/helper/makeLinkRedirect";
import { truncateString } from "@/helper/truncateString";
import { getAllFilesService } from "@/services/getAllFilesService";
import { createFolderService } from "@/services/createFolderService";
import { getFoldersService } from "@/services/getFoldersService";
import { uploadFiles } from "@/services/uploadFiles";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type FolderType = {
  id: number;
  name: string;
  parentFolderId: number | null;
};

type FileType = {
  fileName: string;
  folderId: number | null;
};

export default function Home() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileType[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [folderPath, setFolderPath] = useState<FolderType[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedExtension, setSelectedExtension] = useState("");

  const currentFolderId = folderPath.length > 0
    ? folderPath[folderPath.length - 1].id
    : null;

  const extensions = useMemo(() => {
    const exts: string[] = uploadedFiles
      .map((file: FileType) => {
        const name = file.fileName || "";
        const dotIndex = name.lastIndexOf(".");
        return dotIndex !== -1 ? name.slice(dotIndex).toLowerCase() : "";
      })
      .filter(Boolean);
    return Array.from(new Set(exts)).sort();
  }, [uploadedFiles]);

  const filteredFiles = useMemo(() => {
    if (!selectedExtension) return uploadedFiles;
    return uploadedFiles.filter((file: FileType) => {
      const name = file.fileName || "";
      return name.toLowerCase().endsWith(selectedExtension);
    });
  }, [uploadedFiles, selectedExtension]);

  const loadFolderContents = useCallback(async (folderId: number | null) => {
    try {
      const [filesResponse, foldersResponse] = await Promise.all([
        getAllFilesService(folderId),
        getFoldersService(folderId),
      ]);
      setUploadedFiles(filesResponse);
      setFolders(foldersResponse);
    } catch (error) {
      console.error("Failed to load contents:", error);
      router.push("/login");
    }
  }, [router]);

  const handleNavigateToFolder = (folder: FolderType) => {
    setSelectedExtension("");
    setFolderPath((prev) => [...prev, folder]);
    loadFolderContents(folder.id);
  };

  const handleNavigateBack = () => {
    setSelectedExtension("");
    const newPath = folderPath.slice(0, -1);
    setFolderPath(newPath);
    const parentId = newPath.length > 0 ? newPath[newPath.length - 1].id : null;
    loadFolderContents(parentId);
  };

  const handleNavigateToBreadcrumb = (index: number) => {
    setSelectedExtension("");
    if (index === -1) {
      setFolderPath([]);
      loadFolderContents(null);
    } else {
      const newPath = folderPath.slice(0, index + 1);
      setFolderPath(newPath);
      loadFolderContents(newPath[newPath.length - 1].id);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const folder = await createFolderService(newFolderName.trim(), currentFolderId);
      setFolders((prev) => [...prev, folder]);
      setNewFolderName("");
      setIsCreatingFolder(false);
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      const selectedFiles = event.target.files;
      if (!selectedFiles || selectedFiles.length === 0) return;

      setFiles(Array.from(selectedFiles));

      if (selectedFiles[0].size > 5 * 1024 * 1024) {
        setFiles([]);
        alert("O arquivo selecionado é muito grande. O limite é de 5MB.");
        return;
      }

      const response = await uploadFiles(selectedFiles[0], currentFolderId);
      setUploadedFiles((prev) => [...prev, response]);
      setFiles([]);
    } catch (error) {
      console.error("Upload failed:", error);
      router.push("/login");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(getConstants().LOCAL_STORAGE_TOKEN);
    router.push("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem(getConstants().LOCAL_STORAGE_TOKEN);
    if (!token) {
      router.push("/login");
      return;
    }

    loadFolderContents(null);
  }, [router, loadFolderContents]);

  return (
    <main className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-500 to-amber-600 w-full h-16 flex items-center justify-between px-6 shadow-md">
        <div className="flex items-center">
          <h1 className="font-bold text-2xl text-white">📁 Simple Storage</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-white text-sm">Bem-vindo!</span>
          <button
            onClick={handleLogout}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 mb-4 text-sm">
            <button
              onClick={() => handleNavigateToBreadcrumb(-1)}
              className="text-amber-600 hover:text-amber-700 font-medium hover:underline"
            >
              Raiz
            </button>
            {folderPath.map((folder, index) => (
              <span key={folder.id} className="flex items-center gap-2">
                <span className="text-gray-400">/</span>
                <button
                  onClick={() => handleNavigateToBreadcrumb(index)}
                  className="text-amber-600 hover:text-amber-700 font-medium hover:underline"
                >
                  {folder.name}
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              {folderPath.length > 0
                ? folderPath[folderPath.length - 1].name
                : "Meus Arquivos"}{" "}
              ({uploadedFiles.length})
            </h2>

            <button
              onClick={() => setIsCreatingFolder(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium"
            >
              + Nova Pasta
            </button>
          </div>

          {/* Create Folder Input */}
          {isCreatingFolder && (
            <div className="flex items-center gap-3 mb-6">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                placeholder="Nome da pasta"
                className="border border-amber-300 rounded-md px-3 py-2 text-sm text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200"
                autoFocus
              />
              <button
                onClick={handleCreateFolder}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
              >
                Criar
              </button>
              <button
                onClick={() => {
                  setIsCreatingFolder(false);
                  setNewFolderName("");
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
              >
                Cancelar
              </button>
            </div>
          )}

          {extensions.length > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <label
                htmlFor="extension-filter"
                className="text-sm font-medium text-gray-700"
              >
                Exibir somente arquivos:
              </label>
              <select
                id="extension-filter"
                value={selectedExtension}
                onChange={(e) => setSelectedExtension(e.target.value)}
                className="border border-amber-300 rounded-md px-3 py-2 text-sm text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200"
              >
                <option value="">Todos</option>
                {extensions.map((ext) => (
                  <option key={ext} value={ext}>
                    {ext}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {/* Botão Voltar */}
            {folderPath.length > 0 && (
              <div
                onClick={handleNavigateBack}
                className="bg-white border-2 border-gray-300 hover:border-gray-400 rounded-lg p-4 flex flex-col items-center justify-center h-40 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="text-gray-500 text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">⬅️</div>
                <p className="text-sm text-center text-gray-700 font-medium">Voltar</p>
              </div>
            )}

            {/* Pastas */}
            {folders.map((folder) => (
              <div
                key={`folder-${folder.id}`}
                onClick={() => handleNavigateToFolder(folder)}
                className="bg-white border-2 border-amber-300 hover:border-amber-400 rounded-lg p-4 flex flex-col items-center justify-center h-40 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="text-amber-500 text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">📁</div>
                <p className="text-sm text-center text-gray-700 font-medium">
                  {truncateString(folder.name, 20)}
                </p>
                <p className="text-xs text-amber-600 mt-1">Abrir pasta</p>
              </div>
            ))}

            {/* Upload em progresso */}
            {files.map((file) => (
              <div
                key={file.name}
                className="bg-white border-2 border-blue-300 rounded-lg p-4 flex flex-col items-center justify-center h-40 shadow-sm animate-pulse"
              >
                <div className="text-blue-500 text-3xl mb-2">⏳</div>
                <p className="text-sm text-center text-gray-600 mb-2">
                  {truncateString(file.name, 20)}
                </p>
                <p className="text-xs text-blue-500">Carregando...</p>
              </div>
            ))}

            {/* Arquivos carregados */}
            {filteredFiles.map((file: FileType) => (
              <div
                key={file.fileName}
                onClick={() =>
                  window.open(makeLinkRedirect(file.fileName), "_blank")
                }
                className="bg-white border-2 border-green-300 hover:border-green-400 rounded-lg p-4 flex flex-col items-center justify-center h-40 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="text-green-500 text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">📄</div>
                <p className="text-sm text-center text-gray-700 font-medium">
                  {truncateString(file.fileName?.split("_")[2] || file.fileName, 20)}
                </p>
                <p className="text-xs text-green-600 mt-1">Clique para abrir</p>
              </div>
            ))}

            {/* Área de upload */}
            <div className="bg-white border-2 border-dashed border-amber-400 hover:border-amber-500 rounded-lg p-4 flex flex-col items-center justify-center h-40 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:bg-amber-50 group">
              <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                {isUploading ? (
                  <>
                    <div className="text-amber-500 text-3xl mb-2 animate-spin">⚙️</div>
                    <p className="text-sm text-center text-amber-600 font-medium">
                      Enviando arquivo...
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-amber-500 text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">📤</div>
                    <p className="text-sm text-center text-gray-600 font-medium mb-1">
                      Adicionar arquivo
                    </p>
                    <p className="text-xs text-center text-gray-500">
                      Clique para selecionar
                    </p>
                  </>
                )}
                <input
                  type="file"
                  name="file"
                  className="hidden"
                  onChange={handleChange}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

          {filteredFiles.length === 0 && folders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl text-gray-300 mb-4">📁</div>
              <p className="text-xl text-gray-500 mb-2">Nenhum arquivo encontrado</p>
              <p className="text-gray-400">Comece fazendo upload do seu primeiro arquivo!</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
