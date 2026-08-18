# Case Bulk Upload — Complete Data Entry Helper

This guide explains **every column** in `case-bulk-upload-sample.csv`.  
Read it fully before entering data.

**One CSV row = one case.**  
Do **not** rename, delete, or reorder header columns.

---

## 1. Quick rules


| Rule                 | Detail                                                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **File format**      | CSV, UTF-8 (Excel: *File → Save As → CSV UTF-8*)                                                                                                                                           |
| **Dates**            | `YYYY-MM-DD` only (example: `2026-01-15`). Blank if unknown.                                                                                                                               |
| **Booleans**         | Only `true` or `false` (lowercase).                                                                                                                                                        |
| **Enums**            | Copy values **exactly** — spelling, spaces, and capitals matter.                                                                                                                           |
| **Empty cells**      | Leave blank. Do **not** write `N/A`, `-`, `null`, or `nil` (except where `N/A` is a listed enum for PM report).                                                                            |
| **Unique key**       | `caseNo` + `policeStation` + `year` must be unique across all rows and existing cases.                                                                                                     |
| **Repeating blocks** | Template allows up to **5 accused**, **5 diaries**, **5 SP reports**, **5 DSP reports**, **3 FSL**, **3 prosecution sanctions**. Fill slot 1 first, then 2, etc. Leave unused slots blank. |
| **Files / PDFs**     | Binary attachments are **not** stored in this CSV. After cases are imported, upload files in the app via **Edit Case**.                                                                    |
| **Admin masters**    | `crimeHead`, `investigatingOfficer`, and each `reasonForPendency` value must already exist under **Admin** in the live system.                                                             |


---



## 2. Required fields (every row)


| Column               | Example               | Notes                                      |
| -------------------- | --------------------- | ------------------------------------------ |
| `caseNo`             | `101/2026`            | Station case number                        |
| `year`               | `2026`                | Numeric year                               |
| `policeStation`      | `Ramgarh`             | Must match police station list (Section 5) |
| `crimeHead`          | `Theft`               | Must match Admin → Crime Heads             |
| `crimeSection`       | `379 IPC`             | Free text                                  |
| `punishmentCategory` | `≤7 yrs`              | Enum (Section 4)                           |
| `caseStatus`         | `Under investigation` | Enum (Section 4)                           |


If you fill an accused name in a slot, that slot’s **status** is also required.  
If you fill a prosecution sanction type in a slot, that slot is treated as an entry (type required).

---



## 3. Recommended defaults


| Column                        | Value    |
| ----------------------------- | -------- |
| `priority`                    | `Normal` |
| `chargesheetDeadlineType`     | `60`     |
| `isPropertyProfessionalCrime` | `false`  |
| `isPendingForCharge`          | `false`  |
| `petition`                    | `false`  |
| `finalChargesheetSubmitted`   | `false`  |
| `chargeSheet.submitted`       | `false`  |


---



## 4. Complete enum reference

Use **only** these values.

### `punishmentCategory` (required)


| Value    | Meaning                                  |
| -------- | ---------------------------------------- |
| `≤7 yrs` | Punishment up to 7 years (preferred)     |
| `>7 yrs` | Punishment more than 7 years (preferred) |
| `≤7"`    | Legacy alias — avoid for new data        |
| `>7`     | Legacy alias — avoid for new data        |


> The character `≤` is **less-than-or-equal**, not `<`.



### `caseStatus` (required)


| Value                 |
| --------------------- |
| `Under investigation` |
| `Disposed`            |




### `investigationStatus` (optional)


| Value        |
| ------------ |
| `Detected`   |
| `Undetected` |
| *(blank)*    |




### `srNsr` (optional)


| Value     |
| --------- |
| `SR`      |
| `NSR`     |
| *(blank)* |




### `priority` (optional)


| Value              |
| ------------------ |
| `Normal`           |
| `Under monitoring` |




### `caseDecisionStatus` (optional)


| Value               |
| ------------------- |
| `True`              |
| `False`             |
| `Partial Pendency`  |
| `Complete Pendency` |
| *(blank)*           |




### `chargesheetDeadlineType` (optional; default `60`)


| Value |
| ----- |
| `60`  |
| `90`  |




### `accused_N_status` (required if that accused name is filled)


| Value                  | Use                                   |
| ---------------------- | ------------------------------------- |
| `Arrested`             | Accused arrested                      |
| `Not arrested`         | Not arrested                          |
| `Decision pending`     | Decision pending (preferred spelling) |
| `Pending Verification` | Pending verification                  |


Also accepted by the system (legacy — prefer the four above):


| Legacy value       |
| ------------------ |
| `Not Arrested`     |
| `Decision Pending` |
| `True`             |
| `False`            |




### `injuryReport.injuryType` (optional)


| Value      |
| ---------- |
| `Minor`    |
| `Moderate` |
| `Serious`  |
| `Grievous` |
| `Fatal`    |
| `Other`    |
| *(blank)*  |




### `pmReport.report` (optional)


| Value     |
| --------- |
| `Yes`     |
| `No`      |
| `N/A`     |
| *(blank)* |




### SP report labels (`reports_spReports_N_label`)


| Value |
| ----- |
| `R1`  |
| `R2`  |
| `R3`  |
| `R4`  |
| `R5`  |




### DSP report labels (`reports_dspReports_N_label`)


| Value |
| ----- |
| `PR1` |
| `PR2` |
| `PR3` |
| `PR4` |
| `PR5` |




### All boolean columns

Use only `true` or `false`:

- `isPropertyProfessionalCrime`
- `isPendingForCharge`
- `petition`
- `finalChargesheetSubmitted`
- `chargeSheet.submitted`
- `injuryReport.report`
- `injuryReport.reportReceived`
- `pmReport.reportReceived`
- `compensationProposal.required`
- `compensationProposal.submitted`
- `accused_N_notice41A_issued`
- `accused_N_warrant_prayed`
- `accused_N_proclamation_prayed`
- `accused_N_attachment_prayed`
- `fsl_N_reportRequired`
- `fsl_N_sampleCollected`
- `fsl_N_reportReceived`

---



## 5. Police stations (exact spelling)

Put **one** of these in `policeStation`:

1. `AHTU Thana`
2. `Other`
3. `SC/ST Thana`
4. `Kujju OP`
5. `Gola`
6. `Patratu`
7. `Barkakana OP`
8. `Barlanga`
9. `Basal`
10. `Bhadani Nagar OP`
11. `Bhurkunda OP`
12. `Mahila Thana`
13. `Mandu`
14. `Rajrappa`
15. `Ramgarh`
16. `West Bokaro OP`
17. `Cyber Thana`

---



## 6. Admin-managed text fields


| Column                 | Source in app                  | Rules                            |
| ---------------------- | ------------------------------ | -------------------------------- |
| `crimeHead`            | Admin → Crime Heads            | Exact name match (required)      |
| `investigatingOfficer` | Admin → Investigating Officers | Optional; blank = not assigned   |
| `reasonForPendency`    | Admin → Reasons for Pendency   | Optional; see multi-value format |




### Multi-value format: `reasonForPendency`

Separate multiple reasons with a pipe `|`:

```text
Await FSL|Witness pending
```

Each part must match an Admin reason name.

---



## 7. Column groups (complete)



### 7.1 Case identity & crime


| Column                 | Required | Type      | Description                                               | Example         |
| ---------------------- | -------- | --------- | --------------------------------------------------------- | --------------- |
| `caseNo`               | Yes      | Text      | Case number                                               | `101/2026`      |
| `year`                 | Yes      | Number    | Registration year                                         | `2026`          |
| `policeStation`        | Yes      | Enum list | Station (Section 5)                                       | `Ramgarh`       |
| `crimeHead`            | Yes      | Master    | Crime head                                                | `Theft`         |
| `investigatingOfficer` | No       | Master    | IO name                                                   | `SI Ravi Kumar` |
| `crimeSection`         | Yes      | Text      | Sections / Acts                                           | `379 IPC`       |
| `section`              | No       | Text      | Legacy alias of section (optional; prefer `crimeSection`) |                 |
| `punishmentCategory`   | Yes      | Enum      | Punishment band                                           | `≤7 yrs`        |
| `caseDate`             | No       | Date      | Case / FIR date                                           | `2026-01-15`    |




### 7.2 Status & flags


| Column                        | Required | Type            | Description                   | Example               |
| ----------------------------- | -------- | --------------- | ----------------------------- | --------------------- |
| `caseStatus`                  | Yes      | Enum            | Case status                   | `Under investigation` |
| `investigationStatus`         | No       | Enum            | Detected / Undetected         | `Detected`            |
| `srNsr`                       | No       | Enum            | SR or NSR                     | `SR`                  |
| `priority`                    | No       | Enum            | Monitoring flag               | `Normal`              |
| `caseDecisionStatus`          | No       | Enum            | Decision / pendency           | `True`                |
| `isPropertyProfessionalCrime` | No       | Boolean         | Property / professional crime | `false`               |
| `isPendingForCharge`          | No       | Boolean         | Pending for charge            | `false`               |
| `petition`                    | No       | Boolean         | Public petition exists        | `false`               |
| `reasonForPendency`           | No       | Text / `|` list | Reasons                       | `Await FSL`           |
| `chargesheetDeadlineType`     | No       | Enum            | CS window days                | `60`                  |




### 7.3 Chargesheet (case level)


| Column                           | Required | Type    | Description            | Example      |
| -------------------------------- | -------- | ------- | ---------------------- | ------------ |
| `finalChargesheetSubmitted`      | No       | Boolean | Final CS filed         | `false`      |
| `finalChargesheetSubmissionDate` | No       | Date    | Final CS date          | `2026-03-01` |
| `chargeSheet.submitted`          | No       | Boolean | Charge sheet submitted | `false`      |
| `chargeSheet.submissionDate`     | No       | Date    | Charge sheet date      | `2026-03-01` |


Fill dates only when the related submitted flag is `true`.

### 7.4 Report milestone dates


| Column                     | Required | Type | Description          | Example      |
| -------------------------- | -------- | ---- | -------------------- | ------------ |
| `reports.supervision`      | No       | Date | Supervision date     | `2026-02-10` |
| `reports.fpr`              | No       | Date | FPR date             | `2026-02-12` |
| `reports.finalOrder`       | No       | Date | Final order date     | `2026-03-20` |
| `reports.finalChargesheet` | No       | Date | Final CS report date | `2026-03-25` |




### 7.5 SP reports (slots 1–5)

For each `N` = 1…5:


| Column                      | Required      | Type | Description | Example      |
| --------------------------- | ------------- | ---- | ----------- | ------------ |
| `reports_spReports_N_label` | If using slot | Enum | `R1`–`R5`   | `R1`         |
| `reports_spReports_N_date`  | No            | Date | Report date | `2026-01-25` |


Fill consecutive slots from 1. Do not skip (e.g. do not fill slot 3 while leaving 1–2 blank).

### 7.6 DSP reports (slots 1–5)

For each `N` = 1…5:


| Column                       | Required      | Type | Description | Example      |
| ---------------------------- | ------------- | ---- | ----------- | ------------ |
| `reports_dspReports_N_label` | If using slot | Enum | `PR1`–`PR5` | `PR1`        |
| `reports_dspReports_N_date`  | No            | Date | Report date | `2026-02-09` |




### 7.7 Injury report


| Column                        | Required | Type    | Description               | Example      |
| ----------------------------- | -------- | ------- | ------------------------- | ------------ |
| `injuryReport.report`         | No       | Boolean | Injury report applicable? | `true`       |
| `injuryReport.injuryType`     | No       | Enum    | Type of injury            | `Grievous`   |
| `injuryReport.injuryDate`     | No       | Date    | Injury date               | `2026-02-01` |
| `injuryReport.reportReceived` | No       | Boolean | Report received?          | `false`      |
| `injuryReport.reportDate`     | No       | Date    | Injury report date        | `2026-02-05` |




### 7.8 Post-mortem (PM) report


| Column                    | Required | Type    | Description         | Example      |
| ------------------------- | -------- | ------- | ------------------- | ------------ |
| `pmReport.report`         | No       | Enum    | PM done?            | `Yes`        |
| `pmReport.pmDate`         | No       | Date    | PM date             | `2026-02-02` |
| `pmReport.reportReceived` | No       | Boolean | PM report received? | `false`      |
| `pmReport.reportDate`     | No       | Date    | PM report date      | `2026-02-08` |




### 7.9 Compensation proposal


| Column                                | Required | Type    | Description            | Example      |
| ------------------------------------- | -------- | ------- | ---------------------- | ------------ |
| `compensationProposal.required`       | No       | Boolean | Compensation required? | `true`       |
| `compensationProposal.submitted`      | No       | Boolean | Proposal submitted?    | `false`      |
| `compensationProposal.submissionDate` | No       | Date    | Submission date        | `2026-04-01` |




### 7.10 Diaries (slots 1–5)

For each `N` = 1…5:


| Column              | Required | Type | Description  | Example      |
| ------------------- | -------- | ---- | ------------ | ------------ |
| `diary_N_diaryNo`   | No       | Text | Diary number | `CD-1`       |
| `diary_N_diaryDate` | No       | Date | Diary date   | `2026-01-20` |


A slot counts if `diaryNo` or `diaryDate` is filled. Prefer filling both together.

### 7.11 Accused (slots 1–5) — full detail

For each `N` = 1…5, all columns below exist.

#### Identity


| Column                    | Required       | Type | Example             |
| ------------------------- | -------------- | ---- | ------------------- |
| `accused_N_name`          | If using slot  | Text | `Ramesh Kumar`      |
| `accused_N_status`        | If name filled | Enum | `Arrested`          |
| `accused_N_address`       | No             | Text | `Ward No 3 Ramgarh` |
| `accused_N_mobileNumber`  | No             | Text | `9876543210`        |
| `accused_N_aadhaarNumber` | No             | Text | `123456789012`      |
| `accused_N_state`         | No             | Text | `Jharkhand`         |
| `accused_N_district`      | No             | Text | `Ramgarh`           |
| `accused_N_arrestedDate`  | No             | Date | `2026-01-18`        |
| `accused_N_arrestedOn`    | No             | Date | `2026-01-18`        |




#### Notice 41A


| Column                            | Required | Type    | Example      |
| --------------------------------- | -------- | ------- | ------------ |
| `accused_N_notice41A_issued`      | No       | Boolean | `true`       |
| `accused_N_notice41A_notice1Date` | No       | Date    | `2026-02-05` |
| `accused_N_notice41A_notice2Date` | No       | Date    | `2026-02-12` |
| `accused_N_notice41A_notice3Date` | No       | Date    | `2026-02-19` |




#### Warrant


| Column                            | Required | Type    | Example      |
| --------------------------------- | -------- | ------- | ------------ |
| `accused_N_warrant_prayed`        | No       | Boolean | `true`       |
| `accused_N_warrant_prayerDate`    | No       | Date    | `2026-02-10` |
| `accused_N_warrant_receiptDate`   | No       | Date    | `2026-02-12` |
| `accused_N_warrant_executionDate` | No       | Date    | `2026-02-20` |
| `accused_N_warrant_returnDate`    | No       | Date    | `2026-02-25` |




#### Proclamation


| Column                                 | Required | Type    | Example |
| -------------------------------------- | -------- | ------- | ------- |
| `accused_N_proclamation_prayed`        | No       | Boolean | `false` |
| `accused_N_proclamation_prayerDate`    | No       | Date    |         |
| `accused_N_proclamation_receiptDate`   | No       | Date    |         |
| `accused_N_proclamation_executionDate` | No       | Date    |         |
| `accused_N_proclamation_returnDate`    | No       | Date    |         |




#### Attachment


| Column                               | Required | Type    | Example |
| ------------------------------------ | -------- | ------- | ------- |
| `accused_N_attachment_prayed`        | No       | Boolean | `false` |
| `accused_N_attachment_prayerDate`    | No       | Date    |         |
| `accused_N_attachment_receiptDate`   | No       | Date    |         |
| `accused_N_attachment_executionDate` | No       | Date    |         |
| `accused_N_attachment_returnDate`    | No       | Date    |         |




#### Accused-level chargesheet date


| Column                       | Required | Type | Example      |
| ---------------------------- | -------- | ---- | ------------ |
| `accused_N_chargesheet_date` | No       | Date | `2026-03-10` |


**Accused tips**

- Fill slots in order: 1, then 2, then 3…
- If `accused_N_name` is blank, leave **all** other `accused_N_`* cells blank for that N.
- Prefer `Arrested` when arrest dates are filled.
- Need more than 5 accused? Add extra rows is **not** supported for the same case — use slots 1–5, or enter extras later in Edit Case after import.



### 7.12 FSL / forensic (slots 1–3)

For each `N` = 1…3:


| Column                       | Required | Type    | Example        |
| ---------------------------- | -------- | ------- | -------------- |
| `fsl_N_reportRequired`       | No       | Boolean | `true`         |
| `fsl_N_sampleToBeCollected`  | No       | Text    | `Blood sample` |
| `fsl_N_sampleCollected`      | No       | Boolean | `false`        |
| `fsl_N_sampleCollectionDate` | No       | Date    | `2026-02-05`   |
| `fsl_N_sampleSendingDate`    | No       | Date    | `2026-02-06`   |
| `fsl_N_reportReceived`       | No       | Boolean | `false`        |
| `fsl_N_reportReceivedDate`   | No       | Date    | `2026-03-01`   |
| `fsl_N_reportDate`           | No       | Date    | `2026-02-28`   |




### 7.13 Prosecution sanction (slots 1–3)

For each `N` = 1…3:


| Column                                 | Required      | Type | Example      |
| -------------------------------------- | ------------- | ---- | ------------ |
| `prosecutionSanction_N_type`           | If using slot | Text | `Arms Act`   |
| `prosecutionSanction_N_submissionDate` | No            | Date | `2026-02-18` |
| `prosecutionSanction_N_receiptDate`    | No            | Date | `2026-02-28` |


---



## 8. Files (not in CSV)

These exist in the application but **cannot** be filled via CSV cells (they are uploaded files):

- Public petition file
- Combined reports file
- Charge sheet file
- Per SP / DSP report files
- Per accused chargesheet file
- FSL / injury / PM / prosecution sanction files

**How to handle:** enter all text/date/boolean data in CSV → import → open each case in **Edit Case** → upload attachments there.

---



## 9. Sample rows in the CSV



### Row 1 — simple case (`101/2026`, Ramgarh)

- Theft / `379 IPC` / `≤7 yrs`
- Under investigation, Detected, SR, Normal
- One SP report R1, one diary, one arrested accused
- Most other slots blank (correct)



### Row 2 — detailed case (`102/2026`, Patratu)

- Murder / `302 IPC` / `>7 yrs` / Under monitoring
- Two diaries, two accused, SP R1+R2, DSP PR1
- Notice 41A + warrant dates on accused 1
- Injury + PM + FSL + prosecution sanction started
- Pendency reasons: `Await FSL|Witness pending`

Change case numbers before importing into a live database.

---



## 10. Slot capacity summary


| Entity               | Max slots in this template | Column prefix                    |
| -------------------- | -------------------------- | -------------------------------- |
| Accused              | 5                          | `accused_1_` … `accused_5_`      |
| Diary                | 5                          | `diary_1_` … `diary_5_`          |
| SP reports           | 5                          | `reports_spReports_1_` … `_5_`   |
| DSP reports          | 5                          | `reports_dspReports_1_` … `_5_`  |
| FSL                  | 3                          | `fsl_1_` … `fsl_3_`              |
| Prosecution sanction | 3                          | `prosecutionSanction_1_` … `_3_` |


If a live case needs more than these slot counts, enter the overflow in **Edit Case** after import.

---



## 11. Pre-submit checklist

1. Header row unchanged
2. Every row has all **required** fields
3. Enums match Section 4 exactly
4. Dates are `YYYY-MM-DD`
5. Booleans are only `true` / `false`
6. `policeStation` is from Section 5
7. Crime heads / IOs / reasons exist in Admin
8. No duplicate `caseNo` + `policeStation` + `year`
9. Accused slots: name + status together; unused slots fully blank
10. SP/DSP labels only from R1–R5 / PR1–PR5
11. File saved as **CSV UTF-8**
12. Dummy sample case numbers changed if importing for real use

---



## 12. Full column order

The CSV header includes columns in this order:

1. Case identity & crime (`caseNo` … `caseDate`)
2. Status & flags
3. Case-level chargesheet
4. Report milestone dates
5. SP reports 1–5 (label + date)
6. DSP reports 1–5 (label + date)
7. Injury report
8. PM report
9. Compensation
10. Diaries 1–5
11. Accused 1–5 (full nested fields including notice / warrant / proclamation / attachment dates)
12. FSL 1–3
13. Prosecution sanction 1–3

Open `case-bulk-upload-sample.csv` in Excel and freeze the top row for easier scrolling.

---

*Companion files:* `case-bulk-upload-sample.csv` · `helper.md`  
*System:* Ramgarh Police Case Management