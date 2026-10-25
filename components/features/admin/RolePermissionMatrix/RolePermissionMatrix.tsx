"use client";

import { useCallback } from "react";
import type { ReactNode } from "react";
import { Check, Minus, Shield } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import type {
  RoleDefinition,
  ResourceDefinition,
  PermissionDefinition,
  PermissionCell,
  PermissionValue,
  PermissionChange,
} from "@/components/features/admin/types";
import styles from "./RolePermissionMatrix.module.scss";

export interface RolePermissionMatrixProps {
  roles: RoleDefinition[];
  resources: ResourceDefinition[];
  permissions: PermissionDefinition[];
  /** Grid of permission cells keyed by role+resource+permission. */
  cells: PermissionCell[];
  /**
   * Optional callback emitted when the user proposes a permission change.
   * The parent decides whether to apply it. This component never modifies
   * privileges internally.
   */
  onPermissionChange?: (change: PermissionChange) => void;
  /** When true, permission cells are interactive (toggle on click). */
  editable?: boolean;
  className?: string;
}

function cellValue(
  cells: PermissionCell[],
  roleId: string,
  resourceId: string,
  permissionId: string,
): PermissionValue {
  const found = cells.find(
    (c) =>
      c.roleId === roleId &&
      c.resourceId === resourceId &&
      c.permissionId === permissionId,
  );
  if (found) return found.value;
  return false;
}

function valueToVisual(value: PermissionValue): {
  icon: ReactNode;
  label: string;
  variant: "success" | "neutral" | "warning";
} {
  if (value === true || value === "allowed") {
    return {
      icon: <Check aria-hidden="true" />,
      label: "Allowed",
      variant: "success",
    };
  }
  if (value === "inherit") {
    return {
      icon: <Minus aria-hidden="true" />,
      label: "Inherit",
      variant: "warning",
    };
  }
  return {
    icon: <Minus aria-hidden="true" />,
    label: "Denied",
    variant: "neutral",
  };
}

function toggleValue(value: PermissionValue): PermissionValue {
  if (value === true || value === "allowed") return false;
  return true;
}

export function RolePermissionMatrix({
  roles,
  resources,
  permissions,
  cells,
  onPermissionChange,
  editable = false,
  className,
}: RolePermissionMatrixProps) {
  const handleCellClick = useCallback(
    (roleId: string, resourceId: string, permissionId: string) => {
      if (!editable || !onPermissionChange) return;
      const current = cellValue(cells, roleId, resourceId, permissionId);
      const next = toggleValue(current);
      onPermissionChange({
        roleId,
        resourceId,
        permissionId,
        previousValue: current,
        nextValue: next,
      });
    },
    [cells, editable, onPermissionChange],
  );

  if (roles.length === 0 || resources.length === 0 || permissions.length === 0) {
    return (
      <Card className={clsx(styles.container, className)}>
        <EmptyState
          icon={<Shield aria-hidden="true" />}
          title="No permission data"
          description="Roles, resources, and permissions are required to display the matrix."
        />
      </Card>
    );
  }

  return (
    <Card
      padded={false}
      className={clsx(styles.container, className)}
    >
      <div className={styles.scrollWrapper} role="region" aria-label="Permission matrix" tabIndex={0}>
        <table className={styles.matrix}>
          <thead>
            <tr>
              <th scope="col" className={styles.resourceHeader}>
                Resource
              </th>
              <th scope="col" className={styles.roleHeader}>
                Permission
              </th>
              {roles.map((role) => (
                <th
                  key={role.id}
                  scope="col"
                  className={styles.roleHeader}
                >
                  {role.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) =>
              permissions.map((permission, permIdx) => (
                <tr
                  key={`${resource.id}-${permission.id}`}
                  className={styles.row}
                >
                  {permIdx === 0 && (
                    <th
                      scope="row"
                      rowSpan={permissions.length}
                      className={styles.resourceCell}
                    >
                      {resource.label}
                    </th>
                  )}
                  <td className={styles.permissionCell}>
                    {permission.label}
                  </td>
                  {roles.map((role) => {
                    const value = cellValue(
                      cells,
                      role.id,
                      resource.id,
                      permission.id,
                    );
                    const visual = valueToVisual(value);
                    const cellKey = `${role.id}-${resource.id}-${permission.id}`;
                    return (
                      <td key={cellKey} className={styles.valueCell}>
                        <button
                          type="button"
                          className={styles.cellButton}
                          disabled={!editable}
                          onClick={() =>
                            handleCellClick(
                              role.id,
                              resource.id,
                              permission.id,
                            )
                          }
                          aria-label={`${visual.label}: ${role.label} — ${resource.label} — ${permission.label}`}
                          tabIndex={editable ? 0 : -1}
                        >
                          <span
                            className={clsx(
                              styles.cellIcon,
                              styles[visual.variant],
                            )}
                          >
                            {visual.icon}
                          </span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.legend}>
        <Badge variant="success" size="sm">
          <Check size={12} aria-hidden="true" /> Allowed
        </Badge>
        <Badge variant="neutral" size="sm">
          <Minus size={12} aria-hidden="true" /> Denied
        </Badge>
        <Badge variant="warning" size="sm">
          <Minus size={12} aria-hidden="true" /> Inherit
        </Badge>
      </div>
    </Card>
  );
}
