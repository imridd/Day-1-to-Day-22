
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";

import DataTable from "./DataTable";
import DynamicForm from "./DynamicForm";
import RecordDrawer from "./RecordDrawer";

import useCRMData from "../hooks/useCRMData";
import "./ModuleCRUDManager.css";
import { get } from "../lib/api";

/* =========================================
   HELPER FUNCTIONS
========================================= */

function extractRecords(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.value)) return response.value;
  return [];
}

const singularTitles = {
  leads: "Lead",
  contacts: "Contact",
  accounts: "Account",
  opportunities: "Opportunity",
  tasks: "Task",
  cases: "Case"
};

function getRecordLabel(moduleConfig) {
  return (
    singularTitles[moduleConfig.id] ||
    moduleConfig.title.replace(/s$/i, "")
  );
}

/* =========================================
   MODULE CRUD MANAGER
========================================= */

export default function ModuleCRUDManager({
  moduleConfig,
  currentUser,
  can,
  permissionLoading = false
}) {
  /* -----------------------------------------
     CRM DATA
  ----------------------------------------- */

  const {
    records,
    loading,
    saving,
    error,
    refresh,
    createRecord,
    updateRecord,
    deleteRecord
  } = useCRMData(moduleConfig.endpoint);

  /* -----------------------------------------
     LOCAL STATE
  ----------------------------------------- */

  const [formMode, setFormMode] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [formError, setFormError] = useState("");

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  const [auxiliaryOptions, setAuxiliaryOptions] = useState({
    accountOptions: [],
    contactOptions: [],
    userOptions: []
  });

  /* -----------------------------------------
     MODULE CONFIGURATION
  ----------------------------------------- */

  const objectName = moduleConfig.id;
  const recordLabel = getRecordLabel(moduleConfig);

  const canCreate = can(objectName, "C");
  const canRead = can(objectName, "R");
  const canUpdate = can(objectName, "U");
  const canDelete = can(objectName, "D");

  const canAssignRecords = [
    "Administrator",
    "Sales Manager"
  ].includes(currentUser?.Role);

  /* -----------------------------------------
     LOAD AUXILIARY DROPDOWN OPTIONS
  ----------------------------------------- */

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      try {
        const [
          metadata,
          accountsResponse,
          contactsResponse
        ] = await Promise.all([
          get("/metadata"),
          get("/accounts"),
          get("/contacts")
        ]);

        if (!active) return;

        setAuxiliaryOptions({
          accountOptions: extractRecords(accountsResponse).map((item) => ({
            label: item.Name,
            value: item.Id
          })),

          contactOptions: extractRecords(contactsResponse).map((item) => ({
            label: `${item.FirstName || ""} ${item.LastName || ""}`.trim(),
            value: item.Id
          })),

          userOptions: (metadata?.users || []).map((item) => ({
            label: item.Name,
            value: item.Id
          }))
        });
      } catch (err) {
        console.error("Unable to load form options:", err);
      }
    }

    loadOptions();

    return () => {
      active = false;
    };
  }, []);

  /* -----------------------------------------
     FORM SECTIONS
  ----------------------------------------- */

  const formSections = useMemo(() => {
    const taskAllowedFields = [
      "Subject",
      "Status",
      "Priority",
      "ActivityDate",
      "RelatedToId",
      "OwnerId"
    ];

    return (moduleConfig.formSections || []).map((section) => ({
      ...section,

      fields: (section.fields || [])
        .filter((field) => {
          if (moduleConfig.id === "tasks") {
            return taskAllowedFields.includes(field.name);
          }

          return true;
        })
        .map((field) => {
          let options = field.options;

          if (options?.$context) {
            options = auxiliaryOptions[options.$context] || [];
          }

          if (field.name === "OwnerId" && !canAssignRecords) {
            return {
              ...field,
              hidden: true,
              options
            };
          }

          return {
            ...field,
            options
          };
        })
    }));
  }, [
    moduleConfig.id,
    moduleConfig.formSections,
    auxiliaryOptions,
    canAssignRecords
  ]);

  /* -----------------------------------------
     CLOSE FORM
  ----------------------------------------- */

  const closeForm = useCallback(() => {
    setFormMode(null);
    setFormValues({});
    setFormError("");
  }, []);

  /* -----------------------------------------
     CREATE RECORD
  ----------------------------------------- */

  function openCreateForm() {
    if (!canCreate) return;

    setSelectedRecord(null);

    setFormValues({
      ...moduleConfig.defaultValues,
      OwnerId: currentUser?.Id || ""
    });

    setFormError("");
    setFormMode("create");
  }

  /* -----------------------------------------
     EDIT RECORD
  ----------------------------------------- */

  function openEditForm(record) {
    if (!canUpdate) return;

    setSelectedRecord(record);

    setFormValues({
      ...moduleConfig.defaultValues,
      ...record
    });

    setFormError("");
    setViewOpen(false);
    setFormMode("edit");
  }

  /* -----------------------------------------
     VIEW RECORD
  ----------------------------------------- */

  function openView(record) {
    if (!canRead) return;

    setSelectedRecord(record);
    setViewOpen(true);
  }

  /* -----------------------------------------
     FORM INPUT CHANGE
  ----------------------------------------- */

  function handleFormChange(name, value) {
    setFormValues((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  /* -----------------------------------------
     CREATE / UPDATE SUBMISSION
  ----------------------------------------- */

  async function handleSubmit(event) {
    event?.preventDefault?.();

    setFormError("");

    const allowedFields = Object.keys(
      moduleConfig.defaultValues || {}
    );

    const payload = Object.fromEntries(
      allowedFields.map((field) => [
        field,
        formValues[field] ?? ""
      ])
    );

    if (!canAssignRecords) {
      payload.OwnerId = currentUser?.Id || "";
    }

    try {
      if (formMode === "create") {
        await createRecord(payload);
      } else if (formMode === "edit" && selectedRecord?.Id) {
        await updateRecord(selectedRecord.Id, payload);
      }

      closeForm();
    } catch (err) {
      setFormError(
        err.message || "Unable to save this record."
      );
    }
  }

  /* -----------------------------------------
     DELETE RECORD
  ----------------------------------------- */

  async function handleDelete(record) {
    if (!canDelete || !record?.Id) return;

    const label =
      record.Subject ||
      record.Name ||
      `${record.FirstName || ""} ${record.LastName || ""}`.trim() ||
      "this record";

    if (
      !window.confirm(
        `Delete "${label}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteRecord(record.Id);
    } catch (err) {
      window.alert(
        err.message || "Unable to delete this record."
      );
    }
  }

  /* -----------------------------------------
     PERMISSION STATES
  ----------------------------------------- */

  if (permissionLoading) {
    return (
      <div className="module-state">
        Checking permissions...
      </div>
    );
  }

  if (!canRead) {
    return (
      <div className="module-state module-access-denied">
        <h2>Access restricted</h2>
        <p>
          You don't have permission to view {moduleConfig.title}.
        </p>
      </div>
    );
  }

  /* =========================================
     MAIN RENDER
  ========================================= */

  return (
    <main className="module-crud-page">

      {/* MODULE HEADER */}

      <header className="module-page-header">

        <div className="module-page-heading">
          <h1>{moduleConfig.title}</h1>

          {moduleConfig.description && (
            <p>{moduleConfig.description}</p>
          )}
        </div>

        <div className="module-page-actions">

          {/* REFRESH BUTTON */}

          <button
            type="button"
            className="module-refresh-btn"
            onClick={() => refresh().catch(() => {})}
            disabled={loading}
          >
            <RefreshCw
              size={15}
              className={
                loading ? "module-refresh-spin" : ""
              }
            />

            <span>Refresh</span>
          </button>

          {/* CREATE BUTTON */}

          {canCreate && (
            <button
              type="button"
              className="module-new-btn"
              onClick={openCreateForm}
            >
              <Plus size={16} />

              <span>New {recordLabel}</span>
            </button>
          )}

        </div>
      </header>

      {/* RECORD TABLE */}

      <section className="module-table-container">

        <DataTable
          columns={moduleConfig.columns || []}
          data={records}
          loading={loading}
          error={error}
          searchPlaceholder={`Search ${moduleConfig.title.toLowerCase()}...`}
          onView={canRead ? openView : undefined}
          onEdit={canUpdate ? openEditForm : undefined}
          onDelete={canDelete ? handleDelete : undefined}
        />

      </section>

      {/* CREATE / EDIT MODAL */}

      {formMode && (
        <div className="module-modal-backdrop">

          <div
            className="module-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${formMode === "create" ? "Create" : "Edit"} ${recordLabel}`}
          >
            <DynamicForm
              title={
                formMode === "create"
                  ? `Create ${recordLabel}`
                  : `Edit ${recordLabel}`
              }
              subtitle={moduleConfig.description}
              sections={formSections}
              values={formValues}
              error={formError}
              saving={saving}
              submitLabel={
                formMode === "create"
                  ? "Create record"
                  : "Save changes"
              }
              onChange={handleFormChange}
              onSubmit={handleSubmit}
              onCancel={closeForm}
            />
          </div>

        </div>
      )}

      {/* RECORD DETAILS DRAWER */}

      <RecordDrawer
        open={viewOpen}
        mode="view"
        title={
          selectedRecord?.Subject ||
          selectedRecord?.Name ||
          "Record details"
        }
        subtitle={moduleConfig.title}
        record={selectedRecord || {}}
        fields={formSections}
        onClose={() => setViewOpen(false)}
        onEdit={canUpdate ? openEditForm : undefined}
      />

    </main>
  );
}
