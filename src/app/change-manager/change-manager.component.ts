import { Component, Inject, OnInit } from '@angular/core';
import { EmployeeService } from '../employee.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Employee } from '../employee.model';
import { FormControl, Validators } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';

interface OptionData {
  id: number;
  name: string;
}
@Component({
  selector: 'app-change-manager',
  templateUrl: './change-manager.component.html',
  styleUrls: ['./change-manager.component.scss'],
})
export class ChangeManagerComponent implements OnInit {
  manager = new FormControl<OptionData | string>('', Validators.required);
  filteredOptions!: Observable<OptionData[]>;
  optionData!: OptionData[];

  constructor(
    private employeeService: EmployeeService,
    public dialogRef: MatDialogRef<ChangeManagerComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: Employee
  ) {}

  ngOnInit(): void {
    this.employeeService.getEmployees().subscribe((employees) => {
      this.optionData = employees
        .filter((e) => e.id !== this.dialogData.id)
        .map((e) => ({ id: e.id, name: `${e.name} ( ${e.email} )` }));

      this.filteredOptions = this.manager.valueChanges.pipe(
        startWith(''),
        map((value) => (typeof value === 'string' ? value : value?.name)),
        map((name) => (name ? this._filter(name) : this.optionData.slice()))
      );
    });
  }

  onSave(): void {
    if (!this.manager.value) return;
    const selectedManager = this.manager.value as OptionData;
    this.employeeService.changeManager(this.dialogData.id, selectedManager.id);
    this.dialogRef.close();
  }

  displayOption(option: OptionData): string {
    return option ? option.name : '';
  }

  private _filter(value: string): OptionData[] {
    const filterValue = value.toLowerCase();
    return this.optionData.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }
}
