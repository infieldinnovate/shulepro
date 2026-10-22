import type { ReactNode } from "react";
import { Bus, Clock, MapPin, User } from "lucide-react";
import clsx from "clsx";
import { RecordSummaryCard } from "../../../shared/RecordSummaryCard";
import { StatusBadge } from "../../../shared/StatusBadge";
import type { StatusBadgeMap } from "../../../shared/StatusBadge";
import { Spinner } from "../../../ui/Spinner";
import { EmptyState } from "../../../ui/EmptyState";
import { Alert } from "../../../ui/Alert";
import { Card } from "../../../ui/Card";
import type { TransportRoute, TransportRouteStatus } from "../types";
import styles from "./TransportRouteCard.module.scss";

export type RouteStatusBadgeMap = StatusBadgeMap<TransportRouteStatus>;

export interface TransportRouteCardProps {
  route?: TransportRoute | null;
  statusBadgeMap: RouteStatusBadgeMap;
  actions?: ReactNode;
  onClick?: () => void;
  onView?: () => void;
  ariaLabel?: string;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  className?: string;
}

export function TransportRouteCard({
  route,
  statusBadgeMap,
  actions,
  onClick,
  onView,
  ariaLabel,
  loading = false,
  error,
  empty = false,
  className,
}: TransportRouteCardProps) {
  if (loading) {
    return (
      <Card padded className={clsx(styles.loadingCard, className)}>
        <Spinner size="md" label="Loading route" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padded className={className}>
        <Alert variant="error" title="Unable to load route" description={error} />
      </Card>
    );
  }

  if (empty || !route) {
    return (
      <Card padded className={clsx(styles.emptyCard, className)}>
        <EmptyState
          icon={<Bus aria-hidden="true" />}
          title="No route"
          description="There is no transport route to display."
        />
      </Card>
    );
  }

  const meta: ReactNode[] = [];

  if (route.stops && route.stops.length > 0) {
    meta.push(
      <span key="stops" className={styles.metaEntry}>
        <MapPin className={styles.metaIcon} aria-hidden="true" />
        <span className={styles.metaText}>
          <span className={styles.metaLabel}>Stops</span>
          <span className={styles.metaValue}>{route.stops.join(" → ")}</span>
        </span>
      </span>,
    );
  }

  if (route.vehicleLabel) {
    meta.push(
      <span key="vehicle" className={styles.metaEntry}>
        <Bus className={styles.metaIcon} aria-hidden="true" />
        <span className={styles.metaText}>
          <span className={styles.metaLabel}>Vehicle</span>
          <span className={styles.metaValue}>{route.vehicleLabel}</span>
        </span>
      </span>,
    );
  }

  if (route.driverName) {
    meta.push(
      <span key="driver" className={styles.metaEntry}>
        <User className={styles.metaIcon} aria-hidden="true" />
        <span className={styles.metaText}>
          <span className={styles.metaLabel}>Driver</span>
          <span className={styles.metaValue}>{route.driverName}</span>
        </span>
      </span>,
    );
  }

  if (route.capacity != null) {
    meta.push(
      <span key="capacity" className={styles.metaEntry}>
        <span className={styles.metaText}>
          <span className={styles.metaLabel}>Capacity</span>
          <span className={styles.metaValue}>{route.capacity} seats</span>
        </span>
      </span>,
    );
  }

  if (route.departureTime) {
    meta.push(
      <span key="departure" className={styles.metaEntry}>
        <Clock className={styles.metaIcon} aria-hidden="true" />
        <span className={styles.metaText}>
          <span className={styles.metaLabel}>Departs</span>
          <span className={styles.metaValue}>{route.departureTime}</span>
        </span>
      </span>,
    );
  }

  const handleClick = onClick ?? onView ?? undefined;

  return (
    <RecordSummaryCard
      avatar={
        <span className={styles.iconWrap}>
          <Bus aria-hidden="true" />
        </span>
      }
      title={route.name}
      subtitle={route.code}
      meta={meta.length > 0 ? meta : undefined}
      status={
        route.status ? (
          <StatusBadge
            status={route.status}
            statusMap={statusBadgeMap}
            size="sm"
          />
        ) : undefined
      }
      actions={actions}
      onClick={handleClick}
      ariaLabel={ariaLabel ?? `View route ${route.name}`}
      className={className}
    />
  );
}
