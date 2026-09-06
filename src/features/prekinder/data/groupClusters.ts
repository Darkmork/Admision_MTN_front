import type { GroupCluster } from "../services/api";

export const CLUSTER_MIN_GROUPS = 2;

export function isActiveCluster(cluster: GroupCluster): boolean {
  return cluster.status !== "CANCELLED";
}

export function clusterErrorMessage(code: string | undefined, fallback: string): string {
  switch (code) {
    case "CLUSTER_MIN_GROUPS":
      return `Una agrupación necesita al menos ${CLUSTER_MIN_GROUPS} grupos.`;
    case "CLUSTER_NAME_TAKEN":
      return "Ya existe una agrupación con ese nombre en esta jornada.";
    case "CLUSTER_NOT_EDITABLE":
      return "Esta agrupación ya no se puede modificar.";
    case "CLUSTER_GROUPS_DIFFERENT_DAY":
      return "Solo puedes agrupar grupos de la misma jornada.";
    case "CLUSTER_GROUP_SCHEDULE_OVERLAP":
      return "Uno de los grupos ya pertenece a otra agrupación en ese horario.";
    case "CLUSTER_GROUP_DAY_MISMATCH":
      return "Quita el grupo de su agrupación antes de moverlo a otra jornada.";
    case "CLUSTER_SCHEDULE_CONFLICT":
      return "El nuevo horario cruza con otro bloque.";
    case "CLUSTER_NOT_READY":
      return "Faltan integrantes, evaluadores o rúbrica en algunos grupos.";
    case "MEMBER_NOT_ASSIGNED":
      return "El grupo ya no pertenece a esta agrupación.";
    case "VERSION_CONFLICT":
      return "Otro coordinador modificó esta agrupación. Actualiza la página e intenta de nuevo.";
    case "VALIDATION_ERROR":
      return "Revisa el nombre y los grupos seleccionados.";
    default:
      return fallback;
  }
}
