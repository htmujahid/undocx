import { useMemo } from "react";

import { useEditorContext } from "@/components/editor/context/editor-context";

export type AccessLevel = "edit" | "comment" | "view" | "none";

export interface DocumentAccess {
  canEdit: boolean;
  canComment: boolean;
  canView: boolean;
  accessLevel: AccessLevel;
}

/**
 * Access level hierarchy (higher levels include lower level permissions)
 * edit > comment > view > none
 */
const ACCESS_HIERARCHY: Record<AccessLevel, number> = {
  edit: 3,
  comment: 2,
  view: 1,
  none: 0,
};

/**
 * Custom hook to check user's access permissions for the current document
 *
 * Access hierarchy (higher levels inherit lower permissions):
 * - 'edit': Can edit the document, comment, and view
 * - 'comment': Can comment and view (but not edit)
 * - 'view': Can only view (no editing or commenting)
 * - 'none': No access to the document
 *
 * @returns Object with access flags and current access level
 *
 * @example
 * const { canEdit, canComment, canView, accessLevel } = useDocumentAccess();
 *
 * if (canEdit) {
 *   // Allow editing operations
 * } else if (canComment) {
 *   // Allow commenting only
 * } else if (canView) {
 *   // Allow viewing only
 * }
 */
export function useDocumentAccess(): DocumentAccess {
  const { document, user, collaborators } = useEditorContext();

  return useMemo(() => {
    // Document owner has all permissions
    if (document.user_id === user?.id) {
      return {
        canEdit: true,
        canComment: true,
        canView: true,
        accessLevel: "edit" as AccessLevel,
      };
    }

    // Find user's collaboration record
    const accountCollaborator = collaborators.find(
      (c) => c.user_id === user?.id,
    );

    // No collaboration record means no access
    if (!accountCollaborator) {
      return {
        canEdit: false,
        canComment: false,
        canView: false,
        accessLevel: "none" as AccessLevel,
      };
    }

    // Get user's access level
    const accountAccessLevel = accountCollaborator.access_level as AccessLevel;
    const accountAccessRank = ACCESS_HIERARCHY[accountAccessLevel] || 0;

    // Calculate permissions based on hierarchy
    return {
      canEdit: accountAccessRank >= ACCESS_HIERARCHY.edit,
      canComment: accountAccessRank >= ACCESS_HIERARCHY.comment,
      canView: accountAccessRank >= ACCESS_HIERARCHY.view,
      accessLevel: accountAccessLevel,
    };
  }, [document.user_id, user?.id, collaborators]);
}
