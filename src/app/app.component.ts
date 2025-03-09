import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AgGridModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  private gridApi!: GridApi;
  private lastId = 1;
  columnDefs: ColDef[] = [];
  rowData: any[] = [];
  ruleForm!: FormGroup;
  editMode = false;
  selectedRows: any[] = [];
  typeOptions = ['Match', 'Custom', 'Monitor'];
  yesNoOptions = ['Y', 'N'];
  gridOptions!: GridOptions;

  defaultColDef: ColDef = {
    filter: true,
    editable: true,
  };

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
    this.setupColumnDefs();
    this.loadInitialData();
  }

  initializeForm() {
    this.ruleForm = this.formBuilder.group({
      id: [null],
      ruleName: ['', Validators.required],
      active: ['Y', Validators.required],
      type: ['Match', Validators.required],
      favourite: ['N', Validators.required],
      scheduled: ['N', Validators.required],
      alert: ['N', Validators.required],
    });
  }

  setupColumnDefs() {
    this.columnDefs = [
      {
        checkboxSelection: true,
        width: 50,
      },

      {
        field: 'ruleName',
        headerName: 'Rule Name',
        sortable: true,
        filter: true,
      },
      {
        field: 'active',
        headerName: 'Active Status',
        sortable: true,
        filter: true,
      },
      {
        field: 'type',
        headerName: 'Rule Type',
        sortable: true,
        filter: true,
      },
      {
        field: 'favourite',
        headerName: 'Favorite',
        sortable: true,
        filter: true,
      },
      {
        field: 'scheduled',
        headerName: 'Scheduled',
        sortable: true,
        filter: true,
      },
      {
        field: 'cratedDate',
        headerName: 'Created Date',
        sortable: true,
        filter: true,
      },
      {
        field: 'alert',
        headerName: 'Alert',
        sortable: true,
        filter: true,
      },
      {
        headerName: 'Actions',
        field: 'actions',
        cellRenderer: this.actionsRenderer.bind(this),
        width: 100,
      },
    ];
  }

  loadInitialData() {
    this.rowData = [
      {
        id: 1,
        ruleName: '2DS - Trace Changes',
        active: 'Y',
        type: 'Match',
        favourite: 'N',
        scheduled: 'Y',
        cratedDate: '01-May-2024 01:15 PM',
        alert: 'Y',
      },
    ];
    this.lastId = Math.max(...this.rowData.map((row) => row.id || 0), 0);
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  onSelectionChanged() {
    this.selectedRows = this.gridApi.getSelectedRows();
    console.log('Selected rows:', this.selectedRows);
  }

  submitForm() {
    if (this.ruleForm.invalid) {
      return;
    }

    const formData = { ...this.ruleForm.value };

    if (this.editMode) {
      const index = this.rowData.findIndex((row) => row.id === formData.id);
      if (index !== -1) {
        this.rowData[index] = {
          ...this.rowData[index],
          ...formData,
        };
        this.gridApi?.setGridOption('rowData', [...this.rowData]);
        this.resetForm();
      }
    } else {
      const newRow = {
        ...formData,
        id: ++this.lastId,
        cratedDate: this.formatDate(new Date()),
      };

      this.rowData = [...this.rowData, newRow];
      this.gridApi?.setGridOption('rowData', this.rowData);
      this.resetForm();
    }
  }

  onEditRow(row: any) {
    this.editMode = true;
    this.ruleForm.patchValue(row);
  }

  onDeleteRows() {
    if (this.selectedRows.length === 0) {
      return;
    }

    const selectedIds = this.selectedRows.map((row) => row.id);
    this.rowData = this.rowData.filter((row) => !selectedIds.includes(row.id));
    this.gridApi?.setGridOption('rowData', this.rowData);
    this.gridApi?.deselectAll();
  }

  resetForm() {
    this.editMode = false;
    this.ruleForm.reset({
      id: null,
      active: 'Y',
      type: 'Match',
      favourite: 'N',
      scheduled: 'N',
      alert: 'N',
    });
  }

  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');

    return `${day}-${month}-${year} ${formattedHours}:${minutes} ${ampm}`;
  }

  actionsRenderer(params: any) {
    const div = document.createElement('div');
    const editButton = document.createElement('button');
    editButton.innerHTML = 'Edit';
    editButton.className = 'btn btn-sm btn-primary';
    editButton.addEventListener('click', () => {
      this.onEditRow(params.data);
    });
    div.appendChild(editButton);
    return div;
  }
}
