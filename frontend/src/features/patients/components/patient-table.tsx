"use client";

import { useRouter } from "next/navigation";
import { Users } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useTableState } from "@/hooks/use-table-state";

import { usePatients } from "../hooks/use-patients";
import { PATIENT_SORT_FIELDS, type PatientSortField } from "../schema";
import { PatientSearch } from "./patient-search";
import { patientColumns } from "./patient-table-columns";
import styles from "./patient-table.module.css";

export function PatientTable() {
  const router = useRouter();
  const { state, setState, toggleSort } = useTableState<PatientSortField>({
    defaultSort: "createdAt",
    defaultDir: "desc",
    allowedSortFields: PATIENT_SORT_FIELDS,
  });

  const query = usePatients(state);
  const isFiltered = state.q.trim().length > 0;
  const result = query.data;

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <PatientSearch initialValue={state.q} onChange={(q) => setState({ q })} />
      </div>

      <DataTable
        getRowId={(row) => row.id}
        columns={patientColumns}
        rows={result?.items}
        page={state.page}
        pageSize={state.pageSize}
        total={result?.total ?? 0}
        totalPages={result?.totalPages ?? 1}
        sort={state.sort}
        direction={state.dir}
        isLoading={query.isPending}
        isFetching={query.isFetching && !query.isPending}
        error={query.isError ? query.error : null}
        onPageChange={(page) => setState({ page })}
        onPageSizeChange={(pageSize) => setState({ pageSize })}
        onSortChange={toggleSort}
        onRetry={() => query.refetch()}
        onRowClick={(row) => router.push(routes.admin.patients.detail(row.id))}
        emptyState={
          isFiltered ? (
            <EmptyState
              icon={Users}
              title="No patients match your search"
              description={`No results for "${state.q}". Try a different name or email.`}
              action={
                <Button variant="outline" onClick={() => setState({ q: "" })}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Users}
              title="No patients yet"
              description="Patients added to the EMR will appear here."
              action={
                <Button asChild>
                  <a href={routes.admin.patients.new}>Add the first patient</a>
                </Button>
              }
            />
          )
        }
      />
    </div>
  );
}
