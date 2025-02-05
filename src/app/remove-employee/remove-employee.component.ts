import { Component, Inject } from '@angular/core';
import { EmployeeService } from '../employee.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Employee } from '../employee.model';

@Component({
  selector: 'app-remove-employee',
  templateUrl: './remove-employee.component.html',
  styleUrls: ['./remove-employee.component.scss'],
})
export class RemoveEmployeeComponent {
  constructor(
    private employeeService: EmployeeService,
    public dialogRef: MatDialogRef<RemoveEmployeeComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: Employee
  ) {}

  onRemove() {
    const removeLevel = this.employeeService.removeEmployee(this.dialogData.id);
    this.dialogRef.close(removeLevel);
  }
}
