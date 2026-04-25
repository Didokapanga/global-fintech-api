import {
  getDashboardOverview
} from '../repositories/dashboard.repository.js';

/**
 * =========================================
 * 📊 DASHBOARD OVERVIEW SERVICE
 *
 * KPI :
 * - total transfert client
 * - total retrait
 * - total transfert en attente validation
 * - total retrait en attente validation
 *
 * filtre :
 * - date_operation (optionnel)
 * =========================================
 */
export async function getDashboardOverviewService(
  data: any
) {
  const {
    date_operation
  } = data;

  /**
   * =========================================
   * VALIDATION DATE
   * =========================================
   *
   * format attendu :
   * YYYY-MM-DD
   */
  if (
    date_operation &&
    !/^\d{4}-\d{2}-\d{2}$/.test(
      date_operation
    )
  ) {
    throw new Error(
      'Format date_operation invalide (YYYY-MM-DD attendu)'
    );
  }

  /**
   * =========================================
   * REPOSITORY
   * =========================================
   */
  const dashboard =
    await getDashboardOverview(
      date_operation
    );

  return dashboard;
}