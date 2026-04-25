import { query } from '../database/db.js';

/**
 * =========================================
 * 📊 DASHBOARD OVERVIEW
 *
 * KPI :
 * - total transfert client
 * - total retrait
 * - total transfert en attente de validation
 * - total retrait en attente de validation
 *
 * filtres :
 * - date_operation (optionnel)
 * =========================================
 */
export async function getDashboardOverview(
  date_operation?: string
) {
  /**
   * =========================================
   * FILTRE DATE
   * =========================================
   */
  let dateFilterTransfert = '';
  let dateFilterRetrait = '';
  const params: any[] = [];

  if (date_operation) {
    params.push(date_operation);

    dateFilterTransfert = `
      AND date_operation = $1
    `;

    /**
     * 🔥 ici on utilise date_operation
     * car retrait possède maintenant cette colonne
     */
    dateFilterRetrait = `
      AND date_operation = $1
    `;
  }

  /**
   * =========================================
   * 1. TRANSFERT CLIENT
   * =========================================
   */
  const transfertClientRes = await query(
    `
    SELECT
      COALESCE(SUM(montant), 0) AS total_volume,
      COUNT(*) AS total_count
    FROM transfert_client
    WHERE 1=1
    ${dateFilterTransfert}
    `,
    params
  );

  /**
   * =========================================
   * 2. RETRAIT
   * =========================================
   */
  const retraitRes = await query(
    `
    SELECT
      COALESCE(SUM(montant), 0) AS total_volume,
      COUNT(*) AS total_count
    FROM retrait
    WHERE 1=1
    ${dateFilterRetrait}
    `,
    params
  );

  /**
   * =========================================
   * 3. TRANSFERT EN ATTENTE VALIDATION
   *
   * statut = INITIE
   * =========================================
   */
  const pendingTransfertValidationRes = await query(
    `
    SELECT
      COALESCE(SUM(montant), 0) AS total_volume,
      COUNT(*) AS total_count
    FROM transfert_client
    WHERE statut = 'INITIE'
    ${dateFilterTransfert}
    `,
    params
  );

  /**
   * =========================================
   * 4. RETRAIT EN ATTENTE VALIDATION
   *
   * statut = INITIE
   * =========================================
   */
  const pendingRetraitValidationRes = await query(
    `
    SELECT
      COALESCE(SUM(montant), 0) AS total_volume,
      COUNT(*) AS total_count
    FROM retrait
    WHERE statut = 'INITIE'
    ${dateFilterRetrait}
    `,
    params
  );

  return {
    transfert_client: {
      total_volume: Number(
        transfertClientRes[0]?.total_volume || 0
      ),
      total_count: Number(
        transfertClientRes[0]?.total_count || 0
      )
    },

    retrait: {
      total_volume: Number(
        retraitRes[0]?.total_volume || 0
      ),
      total_count: Number(
        retraitRes[0]?.total_count || 0
      )
    },

    transfert_en_attente_validation: {
      total_volume: Number(
        pendingTransfertValidationRes[0]?.total_volume || 0
      ),
      total_count: Number(
        pendingTransfertValidationRes[0]?.total_count || 0
      )
    },

    retrait_en_attente_validation: {
      total_volume: Number(
        pendingRetraitValidationRes[0]?.total_volume || 0
      ),
      total_count: Number(
        pendingRetraitValidationRes[0]?.total_count || 0
      )
    }
  };
}