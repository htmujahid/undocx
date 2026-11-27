import { createCommand } from "lexical";

export const DOCUMENT_RESTORED_COMMAND = createCommand<{ version: number }>("DOCUMENT_RESTORED_COMMAND");
