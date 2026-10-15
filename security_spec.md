# Security Specification for Hindurubuzima Saving Group

## 1. Data Invariants
1. **Identity & Ownership Integrity**: A user profile document `/users/{userId}` can only be created or updated if `userId == request.auth.uid`. A member cannot alter another member's profile or elevate their own role (`role` field cannot be self-escalated).
2. **Admin Whitelist Primacy**: Admin authorization is strictly evaluated via `exists(/databases/$(database)/documents/admins/$(request.auth.uid))` or matching administrative roles (`super_admin`, `chairperson`, `treasurer`).
3. **Transaction Immutability**: Contribution references, repayment references, and audit logs are write-once append ledgers. Once created, financial ledger records cannot be arbitrarily altered or deleted.
4. **Loan State Machine**: Loans progress sequentially through states: `pending` -> `approved` -> `disbursed` -> `closed` (or `rejected`). A borrower cannot approve their own loan or alter their outstanding balance.
5. **No Negative Balances or Injections**: All currency amounts (contributions, repayments, loans, expenses) must be positive numbers (`amount > 0`) within realistic limits ($100 \text{ RWF} \le \text{amount} \le 50,000,000 \text{ RWF}$).
6. **Strict Field Whitelisting**: Every write must strictly match allowed keys; injection of unapproved "shadow fields" (e.g. `isVerified: true`, `bypassAudit: true`) is blocked.
7. **PII and Data Isolation**: Member personal information (phone numbers, physical addresses) and financial ledgers can only be accessed by authenticated members of the group, with sensitive admin functions isolated to verified group officers.

---

## 2. The "Dirty Dozen" Malicious Payloads

1. **Payload 1 (Privilege Escalation via Self-Assigned Role)**:
   Attempt by a standard member to set `role: "super_admin"` in their own `/users/{uid}` document.
   *Expected Result*: `PERMISSION_DENIED`

2. **Payload 2 (Ghost Field Injection / Shadow Update)**:
   Attempt to insert an unapproved key `{"isVerified": true, "bypassLimits": true}` during contribution creation.
   *Expected Result*: `PERMISSION_DENIED`

3. **Payload 3 (Negative Financial Amount)**:
   Attempt to deposit `-500000` RWF to drain the collective fund or falsify records.
   *Expected Result*: `PERMISSION_DENIED`

4. **Payload 4 (Self-Approving Loan Exploit)**:
   A borrower creates a loan directly with `status: "approved"` and `disbursedAmount: 5000000` without officer consent.
   *Expected Result*: `PERMISSION_DENIED`

5. **Payload 5 (Path Variable ID Poisoning)**:
   Attempt to write to `/members/<1.5kb-long-junk-string-or-null-byte>` to exhaust Firestore index resources.
   *Expected Result*: `PERMISSION_DENIED`

6. **Payload 6 (Unauthorized Deletion of Financial Ledger Entry)**:
   Attempt by a member to delete an existing `/contributions/{id}` or `/loanRepayments/{id}` record.
   *Expected Result*: `PERMISSION_DENIED`

7. **Payload 7 (Unauthenticated Read of Member Directory)**:
   An anonymous user without valid authentication attempting to read `/members`.
   *Expected Result*: `PERMISSION_DENIED`

8. **Payload 8 (Terminal State Tampering)**:
   Attempt to alter a loan with `status: "closed"` back to `disbursed` to siphon repayments.
   *Expected Result*: `PERMISSION_DENIED`

9. **Payload 9 (Audit Log Forgery or Erasure)**:
   Attempt by any non-admin or unauthorized user to tamper with `/auditLogs` or delete log entries.
   *Expected Result*: `PERMISSION_DENIED`

10. **Payload 10 (Spoofed User ID in Contribution Record)**:
    A user posting a contribution with `memberId: "HSG-OTHER-USER"` without treasurer/admin permissions.
    *Expected Result*: `PERMISSION_DENIED`

11. **Payload 11 (Oversized Payload / Denial-of-Wallet)**:
    Attempt to write a meeting minute or note string exceeding 100,000 characters.
    *Expected Result*: `PERMISSION_DENIED`

12. **Payload 12 (Direct Balance Tampering)**:
    A member attempting to write directly to their `/members/{memberId}` document to change `totalSavings` from 10,000 to 10,000,000 RWF.
    *Expected Result*: `PERMISSION_DENIED`
