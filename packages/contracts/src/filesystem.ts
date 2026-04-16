import { Schema } from "effect";
import { NonNegativeInt, TrimmedNonEmptyString } from "./baseSchemas";

const FILESYSTEM_PATH_MAX_LENGTH = 512;

export const FilesystemBrowseInput = Schema.Struct({
  partialPath: TrimmedNonEmptyString.check(Schema.isMaxLength(FILESYSTEM_PATH_MAX_LENGTH)),
  cwd: Schema.optional(TrimmedNonEmptyString.check(Schema.isMaxLength(FILESYSTEM_PATH_MAX_LENGTH))),
});
export type FilesystemBrowseInput = typeof FilesystemBrowseInput.Type;

export const FilesystemBrowseEntry = Schema.Struct({
  name: TrimmedNonEmptyString,
  fullPath: TrimmedNonEmptyString,
});
export type FilesystemBrowseEntry = typeof FilesystemBrowseEntry.Type;

export const FilesystemBrowseResult = Schema.Struct({
  parentPath: TrimmedNonEmptyString,
  entries: Schema.Array(FilesystemBrowseEntry),
});
export type FilesystemBrowseResult = typeof FilesystemBrowseResult.Type;

export class FilesystemBrowseError extends Schema.TaggedErrorClass<FilesystemBrowseError>()(
  "FilesystemBrowseError",
  {
    message: TrimmedNonEmptyString,
    cause: Schema.optional(Schema.Defect),
  },
) {}

export const FileReadInput = Schema.Struct({
  path: TrimmedNonEmptyString.check(Schema.isMaxLength(FILESYSTEM_PATH_MAX_LENGTH)),
  cwd: Schema.optional(TrimmedNonEmptyString.check(Schema.isMaxLength(FILESYSTEM_PATH_MAX_LENGTH))),
});
export type FileReadInput = typeof FileReadInput.Type;

export const FileReadResult = Schema.Struct({
  content: Schema.String,
  mimeType: Schema.String,
  size: NonNegativeInt,
});
export type FileReadResult = typeof FileReadResult.Type;

export class FileReadError extends Schema.TaggedErrorClass<FileReadError>()(
  "FileReadError",
  {
    message: TrimmedNonEmptyString,
    cause: Schema.optional(Schema.Defect),
  },
) {}
