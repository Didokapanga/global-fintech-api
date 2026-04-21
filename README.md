# 🚀 Global Fintech API

API backend pour la gestion des opérations financières :

* Transfert client
* Retrait
* Transfert de caisse
* Mouvement de caisse
* Validation transfert
* Validation mouvement 
* Clôture de caisse
* Ledger & audit

---

# 📦 Stack technique

* Node.js + Express
* TypeScript
* PostgreSQL
* JWT Authentication
* Swagger (documentation API)

---

# 🔐 Authentification

L’API utilise **JWT (Bearer Token)**.

### Header requis

```
Authorization: Bearer <token>
```

---

# 🧠 Règles métier globales

## 💰 Principe fondamental

Le système reflète la **réalité de la caisse physique**.

| Action                   | Impact caisse            |
| ------------------------ | ------------------------ |
| Envoi (transfert client) | + montant                |
| Retrait                  | - montant                |
| Transfert caisse         | source - / destination + |

---

# 💸 1. Transfert Client

Permet d’envoyer de l’argent d’un client à un autre.

## 🔁 Workflow

```
INITIE → VALIDE → RETRAIT
```

## 📊 Impact

* Envoi → + montant (cash reçu)
* Validation → aucun impact
* Retrait → - montant

---

## 📥 Endpoint

```
POST /api/transfert-client
```

## 📤 Body

```json
{
  "caisse_id": "uuid",
  "agence_exp": "uuid",
  "agence_dest": "uuid",
  "client_exp": "uuid",
  "client_dest": "uuid",
  "montant": 200,
  "devise": "USD",
  "type_piece": "ID",
  "numero_piece": "123456"
}
```

## 📥 Response

```json
{
  "success": true,
  "data": {
    "transfert": {},
    "code_secret": "123456"
  }
}
```

---

# 💰 2. Retrait

Permet au bénéficiaire de retirer l’argent avec un code secret.

## 📥 Endpoint

```
POST /api/retraits
```

## 📤 Body

```json
{
  "code_reference": "REF123",
  "code_secret": "123456",
  "caisse_id": "uuid"
}
```

## ⚠️ Règles

* Le transfert doit être **VALIDE**
* Le code secret doit être correct
* La caisse doit être ouverte

---

# 🏦 3. Transfert de Caisse

Transfert interne entre caisses.

## 🔁 Workflow

```
INITIE → VALIDE → EXECUTE
```

## 📊 Impact

* EXECUTE uniquement :

  * source → - montant
  * destination → + montant

---

## 📥 Endpoint

```
POST /api/transfert-caisse
```

---

# 📊 4. Ledger

Journal de toutes les opérations financières.

## 🎯 Objectif

* traçabilité complète
* audit financier
* historique des flux

---

## 📌 Types

* TRANSFERT_CLIENT
* RETRAIT
* TRANSFERT_CAISSE
* MOUVEMENT_CAISSE

---

## 📌 Sens

* ENTREE
* SORTIE

---

# 🧾 5. Mouvements de caisse

Opérations manuelles sur caisse.

## Types possibles

* APPROVISIONNEMENT
* RETRAIT_SORTIE
* TRANSFERT_SORTIE

---

## 📥 Endpoint

```
POST /api/mouvements
```

---

# 🔐 6. Validation

Système de validation multi-niveaux.

## 📥 Endpoint

```
POST /api/validations
```

## 📤 Body

```json
{
  "operation_type": "TRANSFERT_CLIENT",
  "reference_id": "uuid",
  "decision": "APPROUVE",
  "niveau": "N1"
}
```

---

# 🏁 7. Clôture de caisse

Permet de fermer une caisse avec contrôle.

## 📥 Endpoint

```
POST /api/clotures
```

## 📤 Body

```json
{
  "caisse_id": "uuid",
  "solde_physique": 1000
}
```

---

# 📊 8. Audit Log

Trace toutes les actions sensibles :

* CREATE
* VALIDATE
* EXECUTE

---

# ❌ Gestion des erreurs

Exemples :

```json
{
  "success": false,
  "message": "Solde insuffisant"
}
```

### Cas fréquents

* Caisse non ouverte
* Code secret invalide
* Transfert déjà utilisé
* Accès refusé

---

# ⚙️ Variables d’environnement

```
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
NODE_ENV=production
```

---

# 🚀 Lancer le projet

## Dev

```
npm run dev
```

## Build

```
npm run build
npm start
```

---

# 📚 Documentation API

Swagger disponible :

```
/api-docs
```

---

# 🔒 Sécurité

* JWT obligatoire
* Role-based access (ADMIN, N+1, N+2)
* Audit logs
* Transactions DB (ACID)

---

# 📈 État du projet

✔ API fonctionnelle
✔ Sécurité de base
✔ Ledger intégré
✔ Audit activé

---

# 🚀 Roadmap

* [ ] Notifications (SMS / Email)
* [ ] Multi-devise avancée
* [ ] Dashboard analytics
* [ ] Monitoring (logs, alerts)
* [ ] Docker + CI/CD

---

# 👨‍💻 Auteur

Projet développé dans un contexte fintech avec architecture scalable.

---
