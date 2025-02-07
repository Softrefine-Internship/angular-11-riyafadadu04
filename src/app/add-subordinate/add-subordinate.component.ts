import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EmployeeService } from '../employee.service';
import { Employee } from '../employee.model';

@Component({
  selector: 'app-add-subordinate',
  templateUrl: './add-subordinate.component.html',
  styleUrls: ['./add-subordinate.component.scss'],
})
export class AddSubordinateComponent implements OnInit {
  employeeForm!: FormGroup;
  employees: Employee[] = [];
  employeeLength: number = 0;

  constructor(
    private employeeService: EmployeeService,
    public dialogRef: MatDialogRef<AddSubordinateComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: Employee | undefined
  ) {}

  ngOnInit(): void {
    this.employeeService.getEmployees().subscribe((employees) => {
      this.employeeLength = employees.length;
    });

    this.employeeForm = new FormGroup({
      name: new FormControl('Employee-', [Validators.required]),
      imageUrl: new FormControl('https://t4.ftcdn.net/jpg/00/65/77/27/240_F_65772719_A1UV5kLi5nCEWI0BNLLiFaBPEkUbv5Fv.jpg', [Validators.required]),
      email: new FormControl('employee@example.com', [Validators.required, Validators.email]),
      designation: new FormControl('Employee', [Validators.required]),
    });
  }

  onSave() {
    if (this.employeeForm.invalid) return;
    console.log(this.employeeForm.value);

    const newEmployee: Employee = {
      id: this.employeeLength + 1,
      name: this.employeeForm.value.name,
      imageUrl: this.employeeForm.value.imageUrl,
      email: this.employeeForm.value.email,
      designation: this.employeeForm.value.designation,
      managerId: this.dialogData?.id ?? null,
      subordinates: [],
      isExpanded: false,
    };

    console.log(newEmployee);

    this.employeeService.addEmployee(newEmployee);
    this.dialogRef.close(newEmployee);
  }
}
