import { Component, OnInit } from '@angular/core';
import { Employee } from './employee.model';
import { EmployeeService } from './employee.service';
import { MatDialog } from '@angular/material/dialog';
import { AddSubordinateComponent } from './add-subordinate/add-subordinate.component';
import { RemoveEmployeeComponent } from './remove-employee/remove-employee.component';
import { ChangeManagerComponent } from './change-manager/change-manager.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  employees: Employee[] = [];
  hierarchy: Employee[] = [];
  treeLevels: number[][] = [];

  constructor(
    private employeeService: EmployeeService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.employeeService.getEmployees().subscribe((data) => {
      this.employees = data;
      const manager = this.employees.find((e) => !e.managerId);
      if (manager) {
        this.treeLevels.push([manager.id]);
        this.hierarchy = this.buildHierarchy(manager.id);
      }
    });
  }

  buildHierarchy(managerId: number | null): Employee[] {
    return this.employees.filter((emp) => emp.managerId === managerId);
  }

  getSubordinates(managerId: number): Employee[] {
    return this.employees.filter((emp) => emp.managerId === managerId);
  }

  toggleSubordinates(empId: number): void {
    const employee = this.getEmployeeDetails(empId);
    if (employee) {
      const subordinates = this.getSubordinates(employee.id);
      employee.isExpanded = !employee.isExpanded;
      if (employee.isExpanded) {
        this.treeLevels.push(subordinates.map((sub) => sub.id));
        console.log(this.treeLevels);
      } else {
        const index = this.treeLevels.findIndex((level) =>
          level.includes(empId)
        );
        this.treeLevels.splice(index + 1, this.treeLevels.length);
        console.log(this.treeLevels);
      }
    }
  }

  getEmployeeDetails(empId: number): Employee | undefined {
    return this.employees.find((emp) => emp.id === empId);
  }

  openAddSubordinateDialog(managerId: number, event: MouseEvent) {
    event.stopPropagation();
    const manager = this.getEmployeeDetails(managerId);
    if (!manager || manager.subordinates?.length === 5) return;
    this.dialog.open(AddSubordinateComponent, { data: manager });
  }

  openRemoveDialog(employeeId: number, event: MouseEvent) {
    event.stopPropagation();
    const employee = this.getEmployeeDetails(employeeId);
    if (!employee) return;
    if (employee.subordinates) return;

    const dialogRef = this.dialog.open(RemoveEmployeeComponent, {
      data: employee,
      disableClose: false,
    });
  }

  openChangeManagerDialog(managerId: number, event: MouseEvent) {
    event.stopPropagation();
    const manager = this.getEmployeeDetails(managerId);
    this.dialog.open(ChangeManagerComponent, {
      data: manager,
    });
  }
}
